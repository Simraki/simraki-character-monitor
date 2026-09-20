import { DEBOUNCE_MS, MODULE_ID } from '../config.js'
import { isMonitoredActor } from '../utils.js'

const PRE_STASH_TTL_MS = 5000

export class BaseMonitor {
    constructor() {
        this._queue = new Map()
        this.debounceMs = DEBOUNCE_MS

        this._preStash = new Map()

        this.init()
    }

    _getEntityActor(entity) {
        if (entity instanceof Actor) return entity
        if (entity.actor instanceof Actor) return entity.actor
        if (entity.parent instanceof Actor) return entity.parent
        if (entity.parent && entity.parent.parent instanceof Actor) return entity.parent.parent
        if (entity.parent && entity.parent.actor instanceof Actor) return entity.parent.actor
        return null
    }

    _getEntityUUID(entity) {
        if ('uuid' in entity) return entity.uuid
        throw new Error('UUID not found in entity')
    }

    _isValidActorType(actor) {
        return isMonitoredActor(actor)
    }

    async _safe(label, fn) {
        try {
            await fn()
        } catch (err) {
            console.error(`${MODULE_ID} | ${this.constructor.name}: ${label} failed`, err)
        }
    }

    async _settleAll(promises) {
        const results = await Promise.allSettled(promises)
        for (const result of results) {
            if (result.status === 'rejected') {
                console.error(`${MODULE_ID} | ${this.constructor.name}: failed to write a log message`, result.reason)
            }
        }
    }

    init() {}

    isRelevantEntity(entity, update, options) {
        return true
    }

    extractStash(entity, update, options) {
        return {}
    }
    processChanges(entity, oldValues, userId) {
        return Promise.resolve()
    }

    _hasRelevantKeys(update) {
        return 'system' in update || 'name' in update
    }

    _stashOldValues(uuid, stash) {
        const existing = this._preStash.get(uuid)
        if (existing?.timer) clearTimeout(existing.timer)

        const data = { ...existing?.data, ...stash }
        const timer = setTimeout(() => this._preStash.delete(uuid), PRE_STASH_TTL_MS)
        this._preStash.set(uuid, { data, timer })
    }

    _takeOldValues(uuid) {
        const entry = this._preStash.get(uuid)
        if (!entry) return null
        clearTimeout(entry.timer)
        this._preStash.delete(uuid)
        return entry.data
    }

    _onPreUpdate(entity, update, options, userId) {
        return this._safe('preUpdate', async () => {
            if (userId !== game.user.id) return
            if (!this._hasRelevantKeys(update)) return

            const actor = this._getEntityActor(entity)
            if (!this._isValidActorType(actor)) return
            if (!this.isRelevantEntity(entity, update, options)) return

            const stash = this.extractStash(entity, update, options)
            if (!stash || Object.keys(stash).length === 0) return

            this._stashOldValues(this._getEntityUUID(entity), stash)
        })
    }

    _onUpdate(entity, update, options, userId) {
        return this._safe('update', async () => {
            if (userId !== game.user.id) return

            const uuid = this._getEntityUUID(entity)
            const stash = this._takeOldValues(uuid)
            if (!stash) return

            const actor = this._getEntityActor(entity)
            if (!this._isValidActorType(actor)) return

            const pending = this._queue.get(uuid) ?? { old: {}, timer: null, userId }

            if (pending.timer) clearTimeout(pending.timer)

            for (const k in stash) {
                if (pending.old[k] === undefined) pending.old[k] = stash[k]
            }

            pending.timer = setTimeout(() => {
                this._queue.delete(uuid)
                this._safe(`processChanges (${uuid})`, () => this.processChanges(entity, pending.old, pending.userId))
            }, this.debounceMs)

            this._queue.set(uuid, pending)
        })
    }

    _onCreate(entity, options, userId) {
        return this._safe('create', async () => {
            if (userId !== game.user.id) return

            const actor = this._getEntityActor(entity)
            if (!this._isValidActorType(actor)) return

            await this.onCreateEntity(entity, actor, userId)
        })
    }

    _onDelete(entity, options, userId) {
        return this._safe('delete', async () => {
            if (userId !== game.user.id) return

            const uuid = this._getEntityUUID(entity)
            const pending = this._queue.get(uuid)
            if (pending?.timer) clearTimeout(pending.timer)
            this._queue.delete(uuid)
            this._takeOldValues(uuid)

            const actor = this._getEntityActor(entity)
            if (!this._isValidActorType(actor)) return

            await this.onDeleteEntity(entity, actor, userId)
        })
    }

    async onCreateEntity(entity, actor, userId) {}
    async onDeleteEntity(entity, actor, userId) {}
}
