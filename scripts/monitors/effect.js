import { BaseMonitor } from './base.js'
import { Logger } from '../logger.js'
import { state } from '../entries.js'
import { isMonitorEnabled, truncateName } from '../utils.js'
import { MODULE_ID, SETTING } from '../config.js'

export class EffectMonitor extends BaseMonitor {
    init() {
        Hooks.on('preUpdateActiveEffect', this._onPreUpdate.bind(this))
        Hooks.on('updateActiveEffect', this._onUpdate.bind(this))
        Hooks.on('createActiveEffect', this._onCreate.bind(this))
        Hooks.on('deleteActiveEffect', this._onDelete.bind(this))
    }

    _hasRelevantKeys(update) {
        return 'disabled' in update
    }

    extractStash(effect, update) {
        const stash = {}
        if (!isMonitorEnabled(SETTING.MONITOR_EFFECTS)) return stash

        if ('disabled' in update) {
            stash.disabled = effect.disabled ?? false
        }
        return stash
    }

    /** @param {'Enabled'|'Disabled'|'Added'|'Deleted'} action */
    _log(effect, actor, action) {
        const on = action === 'Enabled' || action === 'Added'
        const ref = action === 'Deleted' ? undefined : effect.uuid
        Logger.log(
            actor,
            SETTING.MONITOR_EFFECTS,
            state(
                'effect',
                `ae:${effect.uuid}`,
                truncateName(effect.name),
                _loc(`${MODULE_ID}.ChatMessage.${action}`),
                { on, ref },
            ),
        )
    }

    async processChanges(effect, old) {
        if (old.disabled !== undefined && effect.disabled !== old.disabled) {
            const actor = this._getEntityActor(effect)
            this._log(effect, actor, effect.disabled ? 'Disabled' : 'Enabled')
        }
    }

    async onCreateEntity(effect, actor) {
        if (!isMonitorEnabled(SETTING.MONITOR_EFFECTS)) return
        this._log(effect, actor, 'Added')
    }

    async onDeleteEntity(effect, actor) {
        if (!isMonitorEnabled(SETTING.MONITOR_EFFECTS)) return
        this._log(effect, actor, 'Deleted')
    }
}
