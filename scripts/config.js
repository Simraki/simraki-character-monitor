export const MODULE_ID = 'simraki-character-monitor'
export const MAX_NAME_CHARS = 25
export const DEBOUNCE_MS = 300

export const VALID_TYPES = ['feat', 'spell', 'consumable', 'container', 'equipment', 'loot', 'tool', 'weapon']

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

    // Item & Actor
    MONITOR_CURRENCY: 'monitorCurrency',

    // Effect
    MONITOR_EFFECTS: 'monitorEffects',
}

export const icons = {
    def: '<i class="fas fa-list"></i>',

    // Health
    hp: '<i class="fas fa-heart"></i>',
    tempHp: '<i class="fas fa-shield-heart"></i>',
    maxHp: '<i class="fas fa-heart-circle-plus"></i>',
    tempMaxHp: '<i class="fas fa-shield-plus"></i>',

    // Progress
    xp: '<i class="fas fa-star"></i>',
    level: '<i class="fas fa-arrow-up-wide-short"></i>',

    // Magic
    spellSlot: '<i class="fas fa-hat-wizard"></i>',
    spellPrep: '<i class="fas fa-book-sparkles"></i>',

    // AC & Proficiency & Ability
    ac: '<i class="fas fa-shield"></i>',
    ability: '<i class="fas fa-dumbbell"></i>',
    skillProf: '<i class="fas fa-list-check"></i>',
    saveProf: '<i class="fas fa-shield"></i>',
    toolProf: '<i class="fas fa-screwdriver-wrench"></i>',

    // Currency
    currency: '<i class="fas fa-coins"></i>',

    // Effects
    effect: '<i class="fas fa-hourglass-half"></i>',

    // Items
    itemQty: '<i class="fas fa-backpack"></i>',
    itemNameDesc: '<i class="fas fa-pen-to-square"></i>',
    itemEquip: '<i class="fas fa-shirt"></i>',
    itemAttune: '<i class="fas fa-wand-magic"></i>',
    itemIdentify: '<i class="fas fa-eye"></i>',
    itemCharges: '<i class="fas fa-battery-half"></i>',

    // Sheet mode
    sheetMode: '<i class="fas fa-toggle-on"></i>',

    // Inspiration
    inspiration: '<i class="fas fa-certificate"></i>',

    // Death save
    deathSuccess: '<i class="fas fa-heart-pulse"></i>',
    deathFailure: '<i class="fas fa-skull"></i>',
}

export const classes = {
    // General
    plus: 'scm-plus',
    minus: 'scm-minus',

    // HP
    hpPlus: 'scm-hp-plus',
    hpMinus: 'scm-hp-minus',
    maxHp: 'scm-max-hp',
    tempHp: 'scm-temp-hp',
    tempMaxHp: 'scm-temp-max-hp',

    // XP / Level
    xp: 'scm-xp',
    level: 'scm-level',

    // Currency
    currencyPlus: 'scm-currency-plus',
    currencyMinus: 'scm-currency-minus',

    // Spell slots
    spellSlotPlus: 'scm-spellslot-plus',
    spellSlotMinus: 'scm-spellslot-minus',
    spellPrep: 'scm-spellprep',

    // AC & Proficiency & Ability
    ac: 'scm-ac',
    ability: 'scm-ability',
    skill: 'scm-skill-prof',
    save: 'scm-save-prof',
    tool: 'scm-tool-prof',

    // Items
    itemPlus: 'scm-item-plus',
    itemMinus: 'scm-item-minus',
    itemNameDesc: 'scm-item-name-desc',
    itemEquip: 'scm-item-equip',
    itemUnequip: 'scm-item-unequip',
    itemAttune: 'scm-item-attune',
    itemCharges: 'scm-item-charges',
    itemDescription: 'scm-item-description',
    itemIdentify: 'scm-item-identify',

    // Effects
    effect: 'scm-effect',

    // Sheet Mode
    sheetMode: 'scm-sheet-mode',

    // Inspiration
    inspiration: 'scm-inspiration',
}
