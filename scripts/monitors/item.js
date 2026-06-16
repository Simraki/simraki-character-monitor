import { BaseMonitor } from './base.js'
import { Logger } from '../logger.js'
import { _loc, capitalize, getActorLink, getDeltaText, getSetting, truncateName, will } from '../utils.js'
import { classes, icons, MODULE_ID, SETTING, VALID_TYPES } from '../config.js'

export class ItemMonitor extends BaseMonitor {
    init() {
        Hooks.on('preUpdateItem', this._onPreUpdate.bind(this))
        Hooks.on('updateItem', this._onUpdate.bind(this))
        Hooks.on('createItem', this._onCreate.bind(this))
        Hooks.on('deleteItem', this._onDelete.bind(this))
    }

    isRelevantEntity(entity, update, options) {
        return !('isAdvancement' in options)
    }

    extractStash(item, update) {
        const stash = {}
        const sys = item.system

        if (getSetting(SETTING.MONITOR_ITEM_QUANTITY) && will(update, 'system.quantity')) {
            stash.quantity = sys.quantity
        }

        if (getSetting(SETTING.MONITOR_ITEM_EQUIP) && will(update, 'system.equipped')) {
            stash.equipped = sys.equipped
        }

        if (getSetting(SETTING.MONITOR_ITEM_ATTUNE) && will(update, 'system.attuned')) {
            stash.attuned = sys.attuned
        }

        if (getSetting(SETTING.MONITOR_SPELL_PREP) && item.type === 'spell' && will(update, 'system.prepared')) {
            stash.prepared = Boolean(sys.prepared)
        }

        if (getSetting(SETTING.MONITOR_ITEM_CHARGES) && sys.uses && will(update, 'system.uses')) {
            stash.uses = foundry.utils.duplicate(sys.uses)
        }

        if (getSetting(SETTING.MONITOR_ITEM_IDENTIFY) && will(update, 'system.identified')) {
            stash.identified = sys.identified
            stash.identifiedName = item.name
        }

        if (getSetting(SETTING.MONITOR_ITEM_NAME_DESC)) {
            if (will(update, 'system.description.value')) {
                stash.description = sys.description?.value ?? ''
            }
            if (will(update, 'name')) {
                stash.name = item.name
            }
        }

        if (getSetting(SETTING.MONITOR_CURRENCY) && will(update, 'system.currency')) {
            stash.currency = foundry.utils.duplicate(sys.currency)
        }

        if (getSetting(SETTING.MONITOR_HIT_DICE) && item.type === 'class' && will(update, 'system.hd.spent')) {
            stash.hitDiceSpent = sys.hd.spent
        }

        return stash
    }

    async processChanges(item, old) {
        const logPromises = []

        const actorLink = getActorLink(this._getEntityActor(item))
        const sys = item.system
        const itemName = truncateName(item.name)

        /* Quantity */
        if (old.quantity !== undefined && sys.quantity !== old.quantity) {
            const deltaText = getDeltaText(sys.quantity, old.quantity)
            const text = `${itemName}: ${deltaText}`
            logPromises.push(
                Logger.log(
                    actorLink,
                    text,
                    sys.quantity > old.quantity ? classes.itemPlus : classes.itemMinus,
                    icons.itemQty,
                ),
            )
        }

        /* Equip */
        if (old.equipped !== undefined && sys.equipped !== old.equipped) {
            const preText = _loc(
                sys.equipped ? `${MODULE_ID}.ChatMessage.Equipped` : `${MODULE_ID}.ChatMessage.Unequipped`,
            )
            const text = `${preText} ${itemName}`
            logPromises.push(
                Logger.log(actorLink, text, sys.equipped ? classes.itemEquip : classes.itemUnequip, icons.itemEquip),
            )
        }

        /* Attunement */
        if (old.attuned !== undefined && sys.attuned !== old.attuned) {
            const preText = _loc(
                sys.attuned ? `${MODULE_ID}.ChatMessage.AttunesTo` : `${MODULE_ID}.ChatMessage.BreaksAttune`,
            )
            const text = `${preText} ${itemName}`
            logPromises.push(Logger.log(actorLink, text, classes.itemAttune, icons.itemAttune))
        }

        /* Spell Prepared */
        if (old.prepared !== undefined && Boolean(sys.prepared) !== old.prepared) {
            const preText = _loc(
                sys.prepared ? `${MODULE_ID}.ChatMessage.Prepared` : `${MODULE_ID}.ChatMessage.Unprepared`,
            )
            const lvlText = sys.level === undefined ? '' : ` (${_loc(`DND5E.SPELLCASTING.SLOTS.spell${sys.level}`)})`
            const text = `${preText} ${itemName}${lvlText}`
            logPromises.push(Logger.log(actorLink, text, classes.spellPrep, icons.spellPrep))
        }

        /* Uses / Charges */
        if (old.uses) {
            const prev = old.uses
            const curr = sys.uses
            if (curr && (curr.value !== prev.value || curr.max !== prev.max)) {
                const usesText = capitalize(_loc('DND5E.CONSUMPTION.Type.Use.other'))
                const deltaText = getDeltaText(`${curr.value}/${curr.max}`, `${prev.value}/${prev.max}`)
                const text = `${itemName}: ${usesText}: ${deltaText}`
                logPromises.push(Logger.log(actorLink, text, classes.itemCharges, icons.itemCharges))
            }
        }

        /* Rename */
        if (old.name && item.name !== old.name) {
            const text = `${old.name} → ${item.name}`
            logPromises.push(Logger.log(actorLink, text, classes.itemNameDesc, icons.itemNameDesc))
        }

        /* Identify */
        if (old.identified !== undefined && Boolean(sys.identified) !== old.identified) {
            const preText = _loc(
                sys.identified ? `${MODULE_ID}.ChatMessage.Identified` : `${MODULE_ID}.ChatMessage.Unidentified`,
            )
            const prevName = truncateName(old.identifiedName)
            const text = `${preText} ${prevName} → ${itemName}`
            logPromises.push(Logger.log(actorLink, text, classes.itemIdentify, icons.itemIdentify))
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

                logPromises.push(
                    Logger.spoilerLog(
                        actorLink,
                        itemName,
                        _loc(`${MODULE_ID}.ChatMessage.DescriptionChanged`),
                        text,
                        classes.itemNameDesc,
                        icons.itemNameDesc,
                    ),
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

                logPromises.push(
                    Logger.log(actorLink, text, n > p ? classes.currencyPlus : classes.currencyMinus, icons.currency),
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
                logPromises.push(Logger.log(actorLink, text, classes.hitDice, icons.hitDice))
            }
        }

        await Promise.all(logPromises)
    }

    async _trackItemQuantity(item, actor, isCreation) {
        if (!getSetting(SETTING.MONITOR_ITEM_QUANTITY)) return

        const link = getActorLink(actor)
        const qty = item.system.quantity ?? 1

        const typeText = VALID_TYPES.includes(item.type) ? ` (${_loc(`TYPES.Item.${item.type}`)})` : ''
        const actionText = isCreation
            ? _loc(`${MODULE_ID}.ChatMessage.Added`)
            : _loc(`${MODULE_ID}.ChatMessage.Deleted`)

        const text = `${actionText} ${truncateName(item.name)} x${qty}${typeText}`

        await Logger.log(link, text, isCreation ? classes.itemPlus : classes.itemMinus, icons.itemQty)
    }

    async onCreateEntity(item, actor) {
        return this._trackItemQuantity(item, actor, true)
    }

    async onDeleteEntity(item, actor) {
        return this._trackItemQuantity(item, actor, false)
    }
}
