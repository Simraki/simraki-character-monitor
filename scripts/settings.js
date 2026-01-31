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
            name: game.i18n.localize('characterMonitor.settings.monitorHP.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorHP.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Progress
        game.settings.register(MODULE_ID, `monitorXP`, {
            name: game.i18n.localize('characterMonitor.settings.monitorXP.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorXP.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorLevel`, {
            name: game.i18n.localize('characterMonitor.settings.monitorLevel.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorLevel.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Magic
        game.settings.register(MODULE_ID, `monitorSpellPrep`, {
            name: game.i18n.localize('characterMonitor.settings.monitorSpellPrep.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorSpellPrep.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorSpellSlots`, {
            name: game.i18n.localize('characterMonitor.settings.monitorSpellSlots.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorSpellSlots.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // AC & Proficiency & Ability
        game.settings.register(MODULE_ID, `monitorAC`, {
            name: game.i18n.localize('characterMonitor.settings.monitorAC.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorAC.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorAbility`, {
            name: game.i18n.localize('characterMonitor.settings.monitorAbility.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorAbility.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorSkillProficiency`, {
            name: game.i18n.localize('characterMonitor.settings.monitorSkillProficiency.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorSkillProficiency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorSaveProficiency`, {
            name: game.i18n.localize('characterMonitor.settings.monitorSaveProficiency.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorSaveProficiency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorToolProficiency`, {
            name: game.i18n.localize('characterMonitor.settings.monitorToolProficiency.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorToolProficiency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Currency
        game.settings.register(MODULE_ID, `monitorCurrency`, {
            name: game.i18n.localize('characterMonitor.settings.monitorCurrency.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorCurrency.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Effects
        game.settings.register(MODULE_ID, `monitorEffects`, {
            name: game.i18n.localize('characterMonitor.settings.monitorEffects.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorEffects.hint'),
            scope: 'world',
            type: Boolean,
            default: false,
            config: true,
        })

        // Items
        game.settings.register(MODULE_ID, `monitorItemQuantity`, {
            name: game.i18n.localize('characterMonitor.settings.monitorItemQuantity.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorItemQuantity.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemNameDesc`, {
            name: game.i18n.localize('characterMonitor.settings.monitorItemNameDesc.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorItemNameDesc.hint'),
            scope: 'world',
            type: Boolean,
            default: false,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemEquip`, {
            name: game.i18n.localize('characterMonitor.settings.monitorItemEquip.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorItemEquip.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemAttune`, {
            name: game.i18n.localize('characterMonitor.settings.monitorItemAttune.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorItemAttune.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemIdentify`, {
            name: game.i18n.localize('characterMonitor.settings.monitorItemIdentify.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorItemIdentify.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        game.settings.register(MODULE_ID, `monitorItemCharges`, {
            name: game.i18n.localize('characterMonitor.settings.monitorItemCharges.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorItemCharges.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Sheet mode
        game.settings.register(MODULE_ID, `monitorSheetMode`, {
            name: game.i18n.localize('characterMonitor.settings.monitorSheetMode.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorSheetMode.hint'),
            scope: 'world',
            type: Boolean,
            default: true,
            config: true,
        })

        // Inspiration
        game.settings.register(MODULE_ID, `monitorInspiration`, {
            name: game.i18n.localize('characterMonitor.settings.monitorInspiration.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorInspiration.hint'),
            scope: 'world',
            type: Boolean,
            default: false,
            config: true,
        })

        // Death save
        game.settings.register(MODULE_ID, `monitorDeathSave`, {
            name: game.i18n.localize('characterMonitor.settings.monitorDeathSave.name'),
            hint: game.i18n.localize('characterMonitor.settings.monitorDeathSave.hint'),
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
