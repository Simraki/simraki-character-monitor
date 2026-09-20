import { BaseMonitor } from './base.js'
import { Logger } from '../logger.js'
import { _loc, capitalize, getDeltaText, isMonitorEnabled, truncateName, uuidLink, will } from '../utils.js'
import { classes, icons, MODULE_ID, SETTING, VALID_TYPES } from '../config.js'

export class ItemMonitor extends BaseMonitor {
    init() {
        Hooks.on('preUpdateItem', this._onPreUpdate.bind(this))
        Hooks.on('updateItem', this._onUpdate.bind(this))
        Hooks.on('createItem', this._onCreate.bind(this))
        Hooks.on('deleteItem', this._onDelete.bind(this))
    }

    isRelevantEntity(entity, update, options) {
        if (!('isAdvancement' in options)) return true
        return entity.type === 'class' && will(update, 'system.levels')
    }

    extractStash(item, update, options = {}) {
        const stash = {}
        const sys = item.system

        if (item.type === 'class' && isMonitorEnabled(SETTING.MONITOR_LEVEL) && will(update, 'system.levels')) {
            stash.classLevels = sys.levels
        }

        if ('isAdvancement' in options) return stash

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_QUANTITY) && will(update, 'system.quantity')) {
            stash.quantity = sys.quantity
        }

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_EQUIP) && will(update, 'system.equipped')) {
            stash.equipped = sys.equipped
        }

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_CONTAINER) && will(update, 'system.container')) {
            stash.container = sys.container ?? null
        }

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_ATTUNE) && will(update, 'system.attuned')) {
            stash.attuned = sys.attuned
        }

        if (isMonitorEnabled(SETTING.MONITOR_SPELL_PREP) && item.type === 'spell' && will(update, 'system.prepared')) {
            stash.prepared = Boolean(sys.prepared)
        }

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_CHARGES) && sys.uses && will(update, 'system.uses')) {
            stash.uses = foundry.utils.duplicate(sys.uses)
        }

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_IDENTIFY) && will(update, 'system.identified')) {
            stash.identified = sys.identified
            stash.identifiedName = item.name
        }

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_NAME_DESC)) {
            if (will(update, 'system.description.value')) {
                stash.description = sys.description?.value ?? ''
            }
            if (will(update, 'name')) {
                stash.name = item.name
            }
        }

        if (isMonitorEnabled(SETTING.MONITOR_CURRENCY) && will(update, 'system.currency')) {
            stash.currency = foundry.utils.duplicate(sys.currency)
        }

        if (isMonitorEnabled(SETTING.MONITOR_HIT_DICE) && item.type === 'class' && will(update, 'system.hd.spent')) {
            stash.hitDiceSpent = sys.hd.spent
        }

        return stash
    }

    async processChanges(item, old, userId) {
        const logPromises = []

        const actor = this._getEntityActor(item)
        const sys = item.system
        const itemName = truncateName(item.name)

        const log = (text, cls, icon, settingKey) => {
            logPromises.push(Logger.log(actor, text, cls, icon, settingKey))
        }

        const spoilerLog = (summaryText, detailsText, cls, icon, settingKey) => {
            logPromises.push(Logger.spoilerLog(actor, itemName, summaryText, detailsText, cls, icon, settingKey))
        }

        /* Level */
        if (old.classLevels !== undefined && sys.levels !== old.classLevels) {
            const curr = sys.levels
            const prev = old.classLevels
            const text = `${_loc('DND5E.Level')} (${itemName}): ${getDeltaText(curr, prev)}`
            log(text, classes.level, icons.level, SETTING.MONITOR_LEVEL)
        }

        /* Quantity */
        if (old.quantity !== undefined && sys.quantity !== old.quantity) {
            const deltaText = getDeltaText(sys.quantity, old.quantity)
            const text = `${itemName}: ${deltaText}`
            log(
                text,
                sys.quantity > old.quantity ? classes.itemPlus : classes.itemMinus,
                icons.itemQty,
                SETTING.MONITOR_ITEM_QUANTITY,
            )
        }

        /* Equip */
        if (old.equipped !== undefined && sys.equipped !== old.equipped) {
            const preText = _loc(
                sys.equipped ? `${MODULE_ID}.ChatMessage.Equipped` : `${MODULE_ID}.ChatMessage.Unequipped`,
            )
            const text = `${preText} ${itemName}`
            log(
                text,
                sys.equipped ? classes.itemEquip : classes.itemUnequip,
                icons.itemEquip,
                SETTING.MONITOR_ITEM_EQUIP,
            )
        }

        /* Container (move item) */
        if (old.container !== undefined) {
            const curr = sys.container ?? null
            if (curr !== old.container) {
                const containerLabel = (id) => {
                    const container = id ? actor?.items.get(id) : null
                    return container
                        ? uuidLink(container.uuid, container.name)
                        : _loc(`${MODULE_ID}.ChatMessage.Inventory`)
                }
                const text = `${itemName}: ${getDeltaText(containerLabel(curr), containerLabel(old.container))}`
                log(text, classes.itemContainer, icons.itemContainer, SETTING.MONITOR_ITEM_CONTAINER)
            }
        }

        /* Attunement */
        if (old.attuned !== undefined && sys.attuned !== old.attuned) {
            const preText = _loc(
                sys.attuned ? `${MODULE_ID}.ChatMessage.AttunesTo` : `${MODULE_ID}.ChatMessage.BreaksAttune`,
            )
            const text = `${preText} ${itemName}`
            log(text, classes.itemAttune, icons.itemAttune, SETTING.MONITOR_ITEM_ATTUNE)
        }

        /* Spell Prepared */
        if (old.prepared !== undefined && Boolean(sys.prepared) !== old.prepared) {
            const preText = _loc(
                sys.prepared ? `${MODULE_ID}.ChatMessage.Prepared` : `${MODULE_ID}.ChatMessage.Unprepared`,
            )
            const lvlText = sys.level === undefined ? '' : CONFIG.DND5E.spellLevels[sys.level]
            const text = `${preText} ${itemName}${lvlText}`
            log(text, classes.spellPrep, icons.spellPrep, SETTING.MONITOR_SPELL_PREP)
        }

        /* Uses / Charges */
        if (old.uses) {
            const prev = old.uses
            const curr = sys.uses
            if (curr && (curr.value !== prev.value || curr.max !== prev.max)) {
                const usesText = capitalize(_loc('DND5E.CONSUMPTION.Type.Use.other'))
                const deltaText = getDeltaText(`${curr.value}/${curr.max}`, `${prev.value}/${prev.max}`)
                const text = `${itemName}: ${usesText}: ${deltaText}`
                log(text, classes.itemCharges, icons.itemCharges, SETTING.MONITOR_ITEM_CHARGES)
            }
        }

        /* Rename */
        if (old.name && item.name !== old.name) {
            const text = `${old.name} → ${item.name}`
            log(text, classes.itemNameDesc, icons.itemNameDesc, SETTING.MONITOR_ITEM_NAME_DESC)
        }

        /* Identify */
        if (old.identified !== undefined && Boolean(sys.identified) !== old.identified) {
            const preText = _loc(
                sys.identified ? `${MODULE_ID}.ChatMessage.Identified` : `${MODULE_ID}.ChatMessage.Unidentified`,
            )
            const prevName = truncateName(old.identifiedName)
            const text = `${preText} ${prevName} → ${itemName}`
            log(text, classes.itemIdentify, icons.itemIdentify, SETTING.MONITOR_ITEM_IDENTIFY)
        }

        /* Description */
        if (old.description !== undefined) {
            const curr = sys.description?.value ?? ''
            if (curr !== old.description) {
                const text = `
                          <hr>
                          <strong>${_loc(`${MODULE_ID}.ChatMessage.Old`)}</strong>
                          ${old.description || '<em>—</em>'}
                          <hr>
                          <strong>${_loc(`${MODULE_ID}.ChatMessage.New`)}</strong>
                          ${curr || '<em>—</em>'}
                        `

                spoilerLog(
                    _loc(`${MODULE_ID}.ChatMessage.DescriptionChanged`),
                    text,
                    classes.itemNameDesc,
                    icons.itemNameDesc,
                    SETTING.MONITOR_ITEM_NAME_DESC,
                )
            }
        }

        /* Item Currency */
        if (old.currency !== undefined) {
            const prev = old.currency
            const curr = sys.currency ?? {}

            for (const c in { ...prev, ...curr }) {
                const p = prev[c] ?? 0
                const n = curr[c] ?? 0
                if (p === n) continue

                const label = _loc(`DND5E.CurrencyAbbr${c.toUpperCase()}`)
                const deltaText = getDeltaText(n, p)
                const text = `${itemName}: ${label}: ${deltaText}`

                log(
                    text,
                    n > p ? classes.currencyPlus : classes.currencyMinus,
                    icons.currency,
                    SETTING.MONITOR_CURRENCY,
                )
            }
        }

        /* Hit Dice */
        if (old.hitDiceSpent !== undefined) {
            const prev = old.hitDiceSpent
            const curr = sys.hd?.spent

            if (curr !== undefined && curr !== prev) {
                const prevV = sys.hd.max - prev
                const currV = sys.hd.max - curr
                const deltaText = getDeltaText(currV, prevV)

                const hdText = _loc('DND5E.HITDICE.Abbreviation')

                const text = `${itemName} (${hdText} ${sys.hd.denomination}): ${deltaText}`
                log(text, classes.hitDice, icons.hitDice, SETTING.MONITOR_HIT_DICE)
            }
        }

        await this._settleAll(logPromises)
    }

    async _trackItemQuantity(item, actor, userId, isCreation) {
        if (!isMonitorEnabled(SETTING.MONITOR_ITEM_QUANTITY)) return

        const qty = item.system.quantity ?? 1

        const typeText = VALID_TYPES.includes(item.type) ? ` (${_loc(`TYPES.Item.${item.type}`)})` : ''
        const actionText = isCreation
            ? _loc(`${MODULE_ID}.ChatMessage.Added`)
            : _loc(`${MODULE_ID}.ChatMessage.Deleted`)

        const text = `${actionText} ${truncateName(item.name)} x${qty}${typeText}`

        await Logger.log(
            actor,
            text,
            isCreation ? classes.itemPlus : classes.itemMinus,
            icons.itemQty,
            SETTING.MONITOR_ITEM_QUANTITY,
        )
    }

    async _trackClassLevel(item, actor, isCreation) {
        if (item.type !== 'class' || !isMonitorEnabled(SETTING.MONITOR_LEVEL)) return

        const currLvl = item.system?.levels ?? 0
        if (currLvl === undefined || currLvl === null) return

        const prev = isCreation ? 0 : currLvl
        const curr = isCreation ? currLvl : 0

        const text = `${_loc('DND5E.Level')} (${truncateName(item.name)}): ${getDeltaText(curr, prev)}`

        await Logger.log(actor, text, classes.level, icons.level, SETTING.MONITOR_LEVEL)
    }

    async onCreateEntity(item, actor, userId) {
        await Promise.allSettled([
            this._trackItemQuantity(item, actor, userId, true),
            this._trackClassLevel(item, actor, true),
        ])
    }

    async onDeleteEntity(item, actor, userId) {
        await Promise.allSettled([
            this._trackItemQuantity(item, actor, userId, false),
            this._trackClassLevel(item, actor, false),
        ])
    }
}
