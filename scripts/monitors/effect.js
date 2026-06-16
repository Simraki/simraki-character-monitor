import { BaseMonitor } from './base.js'
import { Logger } from '../logger.js'
import { _loc, getActorLink, getSetting } from '../utils.js'
import { classes, icons, MODULE_ID, SETTING } from '../config.js'

export class EffectMonitor extends BaseMonitor {
    init() {
        Hooks.on('preUpdateActiveEffect', this._onPreUpdate.bind(this))
        Hooks.on('updateActiveEffect', this._onUpdate.bind(this))
        Hooks.on('createActiveEffect', this._onCreate.bind(this))
        Hooks.on('deleteActiveEffect', this._onDelete.bind(this))
    }

    extractStash(effect, update) {
        const stash = {}
        if (!getSetting(SETTING.MONITOR_EFFECTS)) return stash

        if ('disabled' in update) {
            stash.disabled = effect.disabled ?? false
        }
        return stash
    }

    async processChanges(effect, old) {
        const actorLink = getActorLink(this._getEntityActor(effect))
        const effectName = effect.name

        if (old.disabled !== undefined && effect.disabled !== old.disabled) {
            const enabled = !effect.disabled
            const actionText = _loc(enabled ? `${MODULE_ID}.ChatMessage.Enabled` : `${MODULE_ID}.ChatMessage.Disabled`)
            const text = `${actionText} ${effectName}`
            await Logger.spoilerLog(
                actorLink,
                text,
                _loc(`${MODULE_ID}.ChatMessage.Description`),
                effect.description,
                enabled ? classes.effect : classes.effectLose,
                icons.effect,
            )
        }
    }

    async onCreateEntity(effect, actor) {
        if (!getSetting(SETTING.MONITOR_EFFECTS)) return

        const text = `${_loc(`${MODULE_ID}.ChatMessage.Added`)} ${effect.name}`
        await Logger.spoilerLog(
            getActorLink(actor),
            text,
            _loc(`${MODULE_ID}.ChatMessage.Description`),
            effect.description,
            classes.effect,
            icons.effect,
        )
    }

    async onDeleteEntity(effect, actor) {
        if (!getSetting(SETTING.MONITOR_EFFECTS)) return

        const text = `${_loc(`${MODULE_ID}.ChatMessage.Deleted`)} ${effect.name}`
        await Logger.spoilerLog(
            getActorLink(actor),
            text,
            _loc(`${MODULE_ID}.ChatMessage.Description`),
            effect.description,
            classes.effectLose,
            icons.effect,
        )
    }
}
