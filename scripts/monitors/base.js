import { DEBOUNCE_MS, MODULE_ID, NPC_MONITOR_MODE, SETTING } from '../config.js'
import { getSetting } from '../utils.js'

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

    _isValidActorType(actor) {
        if (!actor) return false

        if (actor.type === 'character') return true

        if (actor.type === 'npc') {
            const filterMode = getSetting(SETTING.NPC_MONITOR_MODE)
            if (filterMode === NPC_MONITOR_MODE.DISABLED) return false
            if (filterMode === NPC_MONITOR_MODE.ALL) return true
            if (filterMode === NPC_MONITOR_MODE.OWNED) {
                return actor.hasPlayerOwner
            }
        }

        return false
    }

    init() {}

    isRelevantEntity(entity, update, options) {
        return true
    }

    extractStash(entity, update) {
        return {}
    }
    processChanges(entity, oldValues, userId) {
        return Promise.resolve()
    }

    async _onPreUpdate(entity, update, options, userId) {
        const actor = this._getEntityActor(entity)
        if (!this._isValidActorType(actor)) return
        if (!this.isRelevantEntity(entity, update, options)) return

        if (!(MODULE_ID in options)) options[MODULE_ID] = {}
        if (!(entity.id in options)) options[MODULE_ID][entity.id] = {}

        const stash = this.extractStash(entity, update)
        options[MODULE_ID][entity.id] = {
            ...options[MODULE_ID][entity.id],
            ...stash,
        }
    }

    async _onUpdate(entity, update, options, userId) {
        if (userId !== game.user.id) return

        const stash = options?.[MODULE_ID]?.[entity.id]
        if (!stash || Object.keys(stash).length === 0) return

        const actor = this._getEntityActor(entity)
        if (!this._isValidActorType(actor)) return

        const uuid = this._getEntityUUID(entity)
        const pending = this._queue.get(uuid) ?? { old: {}, timer: null, userId }

        if (pending.timer) clearTimeout(pending.timer)

        for (const k in stash) {
            if (pending.old[k] === undefined) pending.old[k] = stash[k]
        }

        pending.timer = setTimeout(() => {
            this.processChanges(entity, pending.old, pending.userId)
            this._queue.delete(uuid)
        }, this.debounceMs)

        this._queue.set(uuid, pending)
    }

    async _onCreate(entity, options, userId) {
        if (userId !== game.user.id) return

        const actor = this._getEntityActor(entity)
        if (!this._isValidActorType(actor)) return

        await this.onCreateEntity(entity, actor, userId)
    }

    async _onDelete(entity, options, userId) {
        if (userId !== game.user.id) return

        const uuid = this._getEntityUUID(entity)
        const pending = this._queue.get(uuid)
        if (pending?.timer) clearTimeout(pending.timer)
        this._queue.delete(uuid)

        const actor = this._getEntityActor(entity)
        if (!this._isValidActorType(actor)) return

        await this.onDeleteEntity(entity, actor, userId)
    }

    async onCreateEntity(entity, actor, userId) {}
    async onDeleteEntity(entity, actor, userId) {}
}
