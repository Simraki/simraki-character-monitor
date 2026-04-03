import { MODULE_ID } from './config.js'

export class Settings {
    static init() {
        this.registerSettings()
    }

    static registerSettings() {
        // =========================================================
        // GENERAL
        // =========================================================

        // Health
        game.settings.register(MODULE_ID, `monitorHP`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorHP.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorHP.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Progress
        game.settings.register(MODULE_ID, `monitorXP`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorXP.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorXP.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorLevel`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorLevel.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorLevel.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Magic
        game.settings.register(MODULE_ID, `monitorSpellPrep`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorSpellPrep.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorSpellPrep.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorSpellSlots`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorSpellSlots.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorSpellSlots.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // AC & Proficiency & Ability
        game.settings.register(MODULE_ID, `monitorAC`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorAC.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorAC.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorAbility`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorAbility.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorAbility.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorSkillProficiency`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorSkillProficiency.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorSkillProficiency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorSaveProficiency`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorSaveProficiency.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorSaveProficiency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorToolProficiency`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorToolProficiency.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorToolProficiency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Currency
        game.settings.register(MODULE_ID, `monitorCurrency`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorCurrency.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorCurrency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Effects
        game.settings.register(MODULE_ID, `monitorEffects`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorEffects.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorEffects.hint'),
            scope: 'world',
            type: Boolean,
            default: false,
            config: true,
        })

        // Items
        game.settings.register(MODULE_ID, `monitorItemQuantity`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorItemQuantity.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorItemQuantity.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemNameDesc`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorItemNameDesc.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorItemNameDesc.hint'),
            scope: 'world',
            type: Boolean,
            default: false,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemEquip`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorItemEquip.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorItemEquip.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemAttune`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorItemAttune.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorItemAttune.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemIdentify`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorItemIdentify.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorItemIdentify.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemCharges`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorItemCharges.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorItemCharges.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Sheet mode
        game.settings.register(MODULE_ID, `monitorSheetMode`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorSheetMode.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorSheetMode.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Inspiration
        game.settings.register(MODULE_ID, `monitorInspiration`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorInspiration.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorInspiration.hint'),
            scope: 'world',
            type: Boolean,
            default: false,
            config: true,
        })

        // Death save
        game.settings.register(MODULE_ID, `monitorDeathSave`, {
            name: game.i18n.localize('simraki-character-monitor.settings.monitorDeathSave.name'),
            hint: game.i18n.localize('simraki-character-monitor.settings.monitorDeathSave.hint'),
            scope: 'world',
            type: Boolean,
            default: false,
            config: true,
        })
    }

    static getBool(key) {
        return !!game.settings.get(MODULE_ID, key)
    }
}
