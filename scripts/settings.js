import { MODULE_ID } from './config.js'
import { capitalize } from './utils.js'

export function registerSettings() {
    const booleanSettings = [
        { key: 'monitorHP' },
        { key: 'monitorXP' },
        { key: 'monitorLevel' },
        { key: 'monitorSpellPrep' },
        { key: 'monitorSpellSlots' },
        { key: 'monitorAC' },
        { key: 'monitorAbility' },
        { key: 'monitorSkillProficiency' },
        { key: 'monitorSaveProficiency' },
        { key: 'monitorToolProficiency' },
        { key: 'monitorCurrency' },
        { key: 'monitorEffects', default: false },
        { key: 'monitorItemQuantity' },
        { key: 'monitorItemNameDesc', default: false },
        { key: 'monitorItemEquip' },
        { key: 'monitorItemAttune' },
        { key: 'monitorItemIdentify' },
        { key: 'monitorItemCharges' },
        { key: 'monitorSheetMode' },
        { key: 'monitorInspiration', default: false },
        { key: 'monitorDeathSave', default: false },
    ]

    for (const setting of booleanSettings) {
        const translationKey = capitalize(setting.key)

        game.settings.register(MODULE_ID, setting.key, {
            name: `${MODULE_ID}.Settings.${translationKey}.Name`,
            hint: `${MODULE_ID}.Settings.${translationKey}.Hint`,
            scope: 'world',
            type: Boolean,
            default: setting.default ?? true,
            config: true,
        })
    }
}
