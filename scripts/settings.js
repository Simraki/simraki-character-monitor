import { MODULE_ID, SETTING } from './config.js'
import { capitalize } from './utils.js'

export function registerSettings() {
    const booleanSettings = [
        { key: SETTING.MONITOR_HP },
        { key: SETTING.MONITOR_HIT_DICE },
        { key: SETTING.MONITOR_XP },
        { key: SETTING.MONITOR_LEVEL },
        { key: SETTING.MONITOR_SPELL_PREP },
        { key: SETTING.MONITOR_SPELL_SLOTS },
        { key: SETTING.MONITOR_AC },
        { key: SETTING.MONITOR_ABILITY },
        { key: SETTING.MONITOR_SKILL_PROF },
        { key: SETTING.MONITOR_SAVE_PROF },
        { key: SETTING.MONITOR_TOOL_PROF },
        { key: SETTING.MONITOR_CURRENCY },
        { key: SETTING.MONITOR_ITEM_QUANTITY },
        { key: SETTING.MONITOR_ITEM_NAME_DESC, default: false },
        { key: SETTING.MONITOR_ITEM_EQUIP },
        { key: SETTING.MONITOR_ITEM_ATTUNE },
        { key: SETTING.MONITOR_ITEM_IDENTIFY },
        { key: SETTING.MONITOR_ITEM_CHARGES },
        { key: SETTING.MONITOR_SHEET_MODE },
        { key: SETTING.MONITOR_INSPIRATION, default: false },
        { key: SETTING.MONITOR_DEATH_SAVE, default: false },
        { key: SETTING.MONITOR_EFFECTS, default: false },
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
