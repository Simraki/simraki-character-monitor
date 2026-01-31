export const MODULE_ID = 'simraki-character-monitor'
export const MAX_NAME_CHARS = 25
export const DEBOUNCE_MS = 300

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
    plus: 'cm-plus',
    minus: 'cm-minus',

    // HP
    hpPlus: 'cm-hp-plus',
    hpMinus: 'cm-hp-minus',
    maxHp: 'cm-max-hp',
    tempHp: 'cm-temp-hp',
    tempMaxHp: 'cm-temp-max-hp',

    // XP / Level
    xp: 'cm-xp',
    level: 'cm-level',

    // Currency
    currencyPlus: 'cm-currency-plus',
    currencyMinus: 'cm-currency-minus',

    // Spell slots
    spellSlotPlus: 'cm-spellslot-plus',
    spellSlotMinus: 'cm-spellslot-minus',
    spellPrep: 'cm-spellprep',

    // AC & Proficiency & Ability
    ac: 'cm-ac',
    ability: 'cm-ability',
    skill: 'cm-skill-prof',
    save: 'cm-save-prof',
    tool: 'cm-tool-prof',

    // Items
    itemPlus: 'cm-item-plus',
    itemMinus: 'cm-item-minus',
    itemNameDesc: 'cm-item-name-desc',
    itemEquip: 'cm-item-equip',
    itemUnequip: 'cm-item-unequip',
    itemAttune: 'cm-item-attune',
    itemCharges: 'cm-item-charges',
    itemDescription: 'cm-item-description',
    itemIdentify: 'cm-item-identify',

    // Effects
    effect: 'cm-effect',

    // Sheet Mode
    sheetMode: 'cm-sheet-mode',

    // Inspiration
    inspiration: 'cm-inspiration',
}
