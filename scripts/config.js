export const MODULE_ID = 'simraki-character-monitor';
export const MAX_NAME_CHARS = 25;
export const DEBOUNCE_MS = 300;

export const icons = {
    def: '<i class="fa-solid fa-list"></i>',

    // Health
    hp: '<i class="fa-solid fa-heart"></i>',
    tempHp: '<i class="fa-solid fa-shield-heart"></i>',
    maxHp: '<i class="fa-solid fa-heart-circle-plus"></i>',
    tempMaxHp: '<i class="fa-solid fa-shield-plus"></i>',

    // Progress
    xp: '<i class="fa-solid fa-star"></i>',
    level: '<i class="fa-solid fa-arrow-up-wide-short"></i>',

    // Magic
    spellSlot: '<i class="fa-solid fa-hat-wizard"></i>',
    spellPrep: '<i class="fa-solid fa-book-sparkles"></i>',

    // AC & Proficiency & Ability
    ac: '<i class="fa-solid fa-shield"></i>',
    ability: '<i class="fa-solid fa-dumbbell"></i>',
    skillProf: '<i class="fa-solid fa-list-check"></i>',
    saveProf: '<i class="fa-solid fa-shield"></i>',
    toolProf: '<i class="fa-solid fa-screwdriver-wrench"></i>',

    // Currency
    currency: '<i class="fa-solid fa-coins"></i>',

    // Effects
    effect: '<i class="fa-solid fa-hourglass-half"></i>',

    // Items
    itemQty: '<i class="fa-solid fa-backpack"></i>',
    itemNameDesc: '<i class="fa-solid fa-pen-to-square"></i>',
    itemEquip: '<i class="fa-solid fa-shirt"></i>',
    itemAttune: '<i class="fa-solid fa-wand-magic"></i>',
    itemIdentify: '<i class="fa-solid fa-eye"></i>',
    itemCharges: '<i class="fa-solid fa-battery-half"></i>',

    // Sheet mode
    sheetMode: '<i class="fa-solid fa-toggle-on"></i>',

    // Inspiration
    inspiration: '<i class="fa-solid fa-certificate"></i>',

    // Death save
    deathSuccess: '<i class="fa-solid fa-heart-pulse"></i>',
    deathFailure: '<i class="fa-solid fa-skull"></i>',
};

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
};
