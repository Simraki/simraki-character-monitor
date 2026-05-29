import { DEBOUNCE_MS, MODULE_ID } from '../config.js'

export class BaseMonitor {
    constructor() {
        this._queue = new Map()
        this.debounceMs = DEBOUNCE_MS

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

    init() {}

    isRelevantEntity(entity, update, options) {
        return true
    }

    extractStash(entity, update) {
        return {}
    }
    processChanges(entity, oldValues) {
        return Promise.resolve()
    }

    async _onPreUpdate(entity, update, options, userId) {
        const actor = this._getEntityActor(entity)
        if (!actor || actor.type !== 'character') return
        if (!this.isRelevantEntity(entity, update, options)) return

        const stash = (options[MODULE_ID] ??= {})
        const newStash = this.extractStash(entity, update)
        Object.assign(stash, newStash)
        options[MODULE_ID] = stash
    }

    async _onUpdate(entity, update, options, userId) {
        if (userId !== game.user.id) return
        if (!options?.[MODULE_ID]) return

        const actor = this._getEntityActor(entity)
        if (!actor || actor.type !== 'character') return

        const stash = options[MODULE_ID]
        if (Object.keys(stash).length === 0) return

        const uuid = this._getEntityUUID(entity)
        const pending = this._queue.get(uuid) ?? { old: {}, timer: null }

        if (pending.timer) clearTimeout(pending.timer)

        for (const k in stash) {
            if (pending.old[k] === undefined) pending.old[k] = stash[k]
        }

        pending.timer = setTimeout(() => {
            this.processChanges(entity, pending.old)
            this._queue.delete(uuid)
        }, this.debounceMs)

        this._queue.set(uuid, pending)
    }

    async _onCreate(entity, options, userId) {
        if (userId !== game.user.id) return

        const actor = this._getEntityActor(entity)
        if (!actor || actor.type !== 'character') return

        await this.onCreateEntity(entity, actor)
    }
    async _onDelete(entity, options, userId) {
        if (userId !== game.user.id) return

        const uuid = this._getEntityUUID(entity)
        const pending = this._queue.get(uuid)
        if (pending?.timer) clearTimeout(pending.timer)
        this._queue.delete(uuid)

        const actor = this._getEntityActor(entity)
        if (!actor || actor.type !== 'character') return

        await this.onDeleteEntity(entity, actor)
    }

    async onCreateEntity(entity, actor) {}
    async onDeleteEntity(entity, actor) {}
}
