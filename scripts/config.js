export const MODULE_ID = 'simraki-character-monitor'
export const MAX_NAME_CHARS = 20
export const DEBOUNCE_MS = 300

export const DEFAULT_BATCH_MS = 600
export const MAX_BATCH_MS = 5000

export const SHORT_NAME_CHARS = 10

export const BIG_DELTA = 10000

export const SETTING = {
    // Actor
    MONITOR_HP: 'monitorHP',
    MONITOR_AC: 'monitorAC',
    MONITOR_XP: 'monitorXP',
    MONITOR_LEVEL: 'monitorLevel',
    MONITOR_ABILITY: 'monitorAbility',
    MONITOR_SPELL_SLOTS: 'monitorSpellSlots',
    MONITOR_SAVE_PROF: 'monitorSaveProficiency',
    MONITOR_SKILL_PROF: 'monitorSkillProficiency',
    MONITOR_TOOL_PROF: 'monitorToolProficiency',
    MONITOR_INSPIRATION: 'monitorInspiration',
    MONITOR_DEATH_SAVE: 'monitorDeathSave',
    MONITOR_SHEET_MODE: 'monitorSheetMode',

    // Item
    MONITOR_ITEM_QUANTITY: 'monitorItemQuantity',
    MONITOR_ITEM_EQUIP: 'monitorItemEquip',
    MONITOR_ITEM_ATTUNE: 'monitorItemAttune',
    MONITOR_SPELL_PREP: 'monitorSpellPrep',
    MONITOR_ITEM_CHARGES: 'monitorItemCharges',
    MONITOR_ITEM_IDENTIFY: 'monitorItemIdentify',
    MONITOR_ITEM_NAME_DESC: 'monitorItemNameDesc',
    MONITOR_HIT_DICE: 'monitorHitDice',
    MONITOR_ITEM_CONTAINER: 'monitorItemContainer',

    // Party (group) sheet
    MONITOR_PARTY_MEMBERS: 'monitorPartyMembers',

    // Item & Actor
    MONITOR_CURRENCY: 'monitorCurrency',

    // Effect
    MONITOR_EFFECTS: 'monitorEffects',

    // Mode / display
    NPC_MONITOR_MODE: 'npcMonitorMode',
    PARTY_MONITOR: 'partyMonitor',

    // Other
    SHOW_AUTHOR_MARK: 'showAuthorMark',
    BATCH_MS: 'batchMs',
    HIDE_OWN: 'hideOwnChanges',
}

/**
 * Settings that configure the module itself rather than the visibility of a specific kind of message.
 * They are not valid targets for a log message (see LOGGABLE_SETTINGS).
 */
export const MODE_SETTINGS = new Set([
    SETTING.NPC_MONITOR_MODE,
    SETTING.PARTY_MONITOR,
    SETTING.SHOW_AUTHOR_MARK,
    SETTING.BATCH_MS,
    SETTING.HIDE_OWN,
])

/**
 * Settings that control whether something is monitored, as opposed to the per-parameter
 * visibility settings. Only the latter are valid targets for a log message.
 */
export const LOGGABLE_SETTINGS = Object.values(SETTING).filter((key) => !MODE_SETTINGS.has(key))

export const NPC_MONITOR_MODE = {
    DISABLED: 'DISABLED',
    OWNED: 'OWNED',
    ALL: 'ALL',
}

export const VISIBILITY_MODE = {
    DISABLED: 'DISABLED',
    GM: 'GM',
    OWNER: 'OWNER',
    ALL: 'ALL',
}

export const LIMITS = {
    KEY: 120,
    LABEL: 160,
    TEXT: 120,
}

/**
 * Every message describes one change of one of these kinds. The kind decides the icon, the way the change is drawn
 * (`type`), the color category of the left zone (`cat`) and which visibility setting it belongs to.
 * `pool`: shown as fractions (`1/2 → 2/3`). `inv`: going up is bad (death save failures), the delta color flips.
 * The GM rejects entries whose kind does not belong to the setting they were sent under.
 */
export const KIND_META = {
    hp: { icon: 'fa-heart', setting: SETTING.MONITOR_HP, type: 'num', cat: 'health' },
    maxHp: { icon: 'fa-heart-circle-plus', setting: SETTING.MONITOR_HP, type: 'num', cat: 'health' },
    tempHp: { icon: 'fa-shield-heart', setting: SETTING.MONITOR_HP, type: 'num', cat: 'health' },
    tempMaxHp: { icon: 'fa-shield-plus', setting: SETTING.MONITOR_HP, type: 'num', cat: 'health' },
    hitDice: { icon: 'fa-moon', setting: SETTING.MONITOR_HIT_DICE, type: 'num', cat: 'health', pool: true },
    deathSuccess: {
        icon: 'fa-heart-pulse',
        setting: SETTING.MONITOR_DEATH_SAVE,
        type: 'num',
        cat: 'health',
        pool: true,
    },
    deathFailure: {
        icon: 'fa-skull',
        setting: SETTING.MONITOR_DEATH_SAVE,
        type: 'num',
        cat: 'health',
        pool: true,
        inv: true,
    },
    slot: { icon: 'fa-hat-wizard', setting: SETTING.MONITOR_SPELL_SLOTS, type: 'num', cat: 'magic', pool: true },
    pact: { icon: 'fa-gem', setting: SETTING.MONITOR_SPELL_SLOTS, type: 'num', cat: 'magic', pool: true },
    prep: { icon: 'fa-book-sparkles', setting: SETTING.MONITOR_SPELL_PREP, type: 'state', cat: 'magic' },
    ac: { icon: 'fa-shield', setting: SETTING.MONITOR_AC, type: 'num', cat: 'guard' },
    xp: { icon: 'fa-star', setting: SETTING.MONITOR_XP, type: 'num', cat: 'wealth' },
    level: { icon: 'fa-arrow-up-wide-short', setting: SETTING.MONITOR_LEVEL, type: 'num', cat: 'wealth' },
    ability: { icon: 'fa-dumbbell', setting: SETTING.MONITOR_ABILITY, type: 'num', cat: 'skill' },
    skill: { icon: 'fa-list-check', setting: SETTING.MONITOR_SKILL_PROF, type: 'trans', cat: 'skill' },
    save: { icon: 'fa-shield-halved', setting: SETTING.MONITOR_SAVE_PROF, type: 'trans', cat: 'skill' },
    tool: { icon: 'fa-screwdriver-wrench', setting: SETTING.MONITOR_TOOL_PROF, type: 'trans', cat: 'skill' },
    currency: { icon: 'fa-coins', setting: SETTING.MONITOR_CURRENCY, type: 'num', cat: 'wealth' },
    item: { icon: 'fa-backpack', setting: SETTING.MONITOR_ITEM_QUANTITY, type: 'state', cat: 'gear' },
    quantity: { icon: 'fa-backpack', setting: SETTING.MONITOR_ITEM_QUANTITY, type: 'num', cat: 'gear' },
    equip: { icon: 'fa-shirt', setting: SETTING.MONITOR_ITEM_EQUIP, type: 'state', cat: 'gear' },
    attune: { icon: 'fa-wand-magic', setting: SETTING.MONITOR_ITEM_ATTUNE, type: 'state', cat: 'magic' },
    identify: { icon: 'fa-eye', setting: SETTING.MONITOR_ITEM_IDENTIFY, type: 'trans', cat: 'gear' },
    charges: { icon: 'fa-battery-half', setting: SETTING.MONITOR_ITEM_CHARGES, type: 'num', cat: 'magic', pool: true },
    container: { icon: 'fa-box-open', setting: SETTING.MONITOR_ITEM_CONTAINER, type: 'trans', cat: 'gear' },
    rename: { icon: 'fa-pen-to-square', setting: SETTING.MONITOR_ITEM_NAME_DESC, type: 'trans', cat: 'meta' },
    description: { icon: 'fa-file-lines', setting: SETTING.MONITOR_ITEM_NAME_DESC, type: 'diff', cat: 'meta' },
    effect: { icon: 'fa-hourglass-half', setting: SETTING.MONITOR_EFFECTS, type: 'state', cat: 'effect' },
    inspiration: { icon: 'fa-certificate', setting: SETTING.MONITOR_INSPIRATION, type: 'state', cat: 'boon' },
    sheetMode: { icon: 'fa-toggle-on', setting: SETTING.MONITOR_SHEET_MODE, type: 'state', cat: 'meta' },
    member: { icon: 'fa-users', setting: SETTING.MONITOR_PARTY_MEMBERS, type: 'state', cat: 'meta' },
}
