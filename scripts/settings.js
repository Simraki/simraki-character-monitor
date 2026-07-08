import { MODULE_ID, NPC_MONITOR_MODE, SETTING, VISIBILITY_MODE } from './config.js'
import { capitalize } from './utils.js'

export function registerSettings() {
    game.settings.register(MODULE_ID, SETTING.NPC_MONITOR_MODE, {
        name: `${MODULE_ID}.Settings.NpcMonitorMode.Name`,
        hint: `${MODULE_ID}.Settings.NpcMonitorMode.Hint`,
        scope: 'world',
        config: true,
        type: String,
        default: NPC_MONITOR_MODE.DISABLED,
        choices: {
            [NPC_MONITOR_MODE.DISABLED]: `${MODULE_ID}.SettingChoices.NpcMonitorMode.Disabled`,
            [NPC_MONITOR_MODE.OWNED]: `${MODULE_ID}.SettingChoices.NpcMonitorMode.Owned`,
            [NPC_MONITOR_MODE.ALL]: `${MODULE_ID}.SettingChoices.NpcMonitorMode.All`,
        },
    })

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
        { key: SETTING.MONITOR_ITEM_NAME_DESC, default: VISIBILITY_MODE.DISABLED },
        { key: SETTING.MONITOR_ITEM_EQUIP },
        { key: SETTING.MONITOR_ITEM_ATTUNE },
        { key: SETTING.MONITOR_ITEM_IDENTIFY },
        { key: SETTING.MONITOR_ITEM_CHARGES },
        { key: SETTING.MONITOR_SHEET_MODE },
        { key: SETTING.MONITOR_INSPIRATION, default: VISIBILITY_MODE.DISABLED },
        { key: SETTING.MONITOR_DEATH_SAVE, default: VISIBILITY_MODE.DISABLED },
        { key: SETTING.MONITOR_EFFECTS, default: VISIBILITY_MODE.DISABLED },
    ]

    for (const setting of booleanSettings) {
        const translationKey = capitalize(setting.key)

        game.settings.register(MODULE_ID, setting.key, {
            name: `${MODULE_ID}.Settings.${translationKey}.Name`,
            hint: `${MODULE_ID}.Settings.${translationKey}.Hint`,
            scope: 'world',
            config: true,
            type: String,
            default: setting.default ?? VISIBILITY_MODE.GM,
            choices: {
                [VISIBILITY_MODE.DISABLED]: `${MODULE_ID}.SettingChoices.VisibilityMode.Disabled`,
                [VISIBILITY_MODE.GM]: `${MODULE_ID}.SettingChoices.VisibilityMode.GM`,
                [VISIBILITY_MODE.OWNER]: `${MODULE_ID}.SettingChoices.VisibilityMode.Owner`,
                [VISIBILITY_MODE.ALL]: `${MODULE_ID}.SettingChoices.VisibilityMode.All`,
            },
        })
    }
}
