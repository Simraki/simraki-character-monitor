import { BaseMonitor } from './base.js'
import { Logger } from '../logger.js'
import { diffWords, htmlToText } from '../diff.js'
import { numeric, state, transition } from '../entries.js'
import { isMonitorEnabled, truncateName, will } from '../utils.js'
import { MODULE_ID, SETTING } from '../config.js'

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
            stash.prepared = Number(sys.prepared ?? 0)
        }

        if (isMonitorEnabled(SETTING.MONITOR_ITEM_CHARGES) && sys.uses && will(update, 'system.uses')) {
            stash.uses = foundry.utils.deepClone(sys.uses)
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
            stash.currency = foundry.utils.deepClone(sys.currency)
        }

        if (isMonitorEnabled(SETTING.MONITOR_HIT_DICE) && item.type === 'class' && will(update, 'system.hd.spent')) {
            stash.hitDiceSpent = sys.hd.spent
        }

        return stash
    }

    async processChanges(item, old) {
        const actor = this._getEntityActor(item)
        const sys = item.system
        const itemName = truncateName(item.name)
        const ref = item.uuid

        const log = (settingKey, entry) => Logger.log(actor, settingKey, entry)
        const word = (key) => _loc(`${MODULE_ID}.ChatMessage.${key}`)

        /* Level */
        if (old.classLevels !== undefined && sys.levels !== old.classLevels) {
            log(
                SETTING.MONITOR_LEVEL,
                numeric('level', `level:${ref}`, `${_loc('DND5E.Level')} (${itemName})`, old.classLevels, sys.levels, {
                    ref,
                }),
            )
        }

        /* Quantity */
        if (old.quantity !== undefined && sys.quantity !== old.quantity) {
            log(
                SETTING.MONITOR_ITEM_QUANTITY,
                numeric('quantity', `qty:${ref}`, itemName, old.quantity, sys.quantity, {
                    ref,
                }),
            )
        }

        /* Equip */
        if (old.equipped !== undefined && sys.equipped !== old.equipped) {
            log(
                SETTING.MONITOR_ITEM_EQUIP,
                state('equip', `equip:${ref}`, itemName, word(sys.equipped ? 'Equipped' : 'Unequipped'), {
                    ref,
                    on: !!sys.equipped,
                }),
            )
        }

        /* Container (move item) */
        if (old.container !== undefined) {
            const curr = sys.container ?? null
            if (curr !== old.container) {
                const container = (id) => (id ? actor?.items.get(id) : null)
                const containerName = (id) =>
                    container(id) ? truncateName(container(id).name) : _loc('DND5E.Inventory')
                log(
                    SETTING.MONITOR_ITEM_CONTAINER,
                    transition(
                        'container',
                        `cont:${ref}`,
                        itemName,
                        containerName(old.container),
                        containerName(curr),
                        {
                            ref,
                            fromRef: container(old.container)?.uuid,
                            toRef: container(curr)?.uuid,
                        },
                    ),
                )
            }
        }

        /* Attunement */
        if (old.attuned !== undefined && sys.attuned !== old.attuned) {
            log(
                SETTING.MONITOR_ITEM_ATTUNE,
                state('attune', `attune:${ref}`, itemName, word(sys.attuned ? 'Attuned' : 'AttunementBroken'), {
                    ref,
                    on: !!sys.attuned,
                }),
            )
        }

        /* Spell preparation: 0 - unprepared, 1 - prepared, 2 - always prepared */
        if (old.prepared !== undefined) {
            const curr = Number(sys.prepared ?? 0)
            if (curr !== old.prepared) {
                const level = sys.level === undefined ? '' : ` (${CONFIG.DND5E.spellLevels?.[sys.level] ?? sys.level})`
                const spellState = ['Unprepared', 'Prepared', 'AlwaysPrepared'][curr] ?? 'Prepared'
                log(
                    SETTING.MONITOR_SPELL_PREP,
                    state(
                        'prep',
                        `prep:${ref}`,
                        `${itemName}${level}`,
                        _loc(`DND5E.SPELLCASTING.STATES.${spellState}`),
                        {
                            ref,
                            on: curr > 0,
                        },
                    ),
                )
            }
        }

        /* Uses / Charges */
        if (old.uses) {
            const prev = old.uses
            const curr = sys.uses
            if (curr && (curr.value !== prev.value || curr.max !== prev.max)) {
                log(
                    SETTING.MONITOR_ITEM_CHARGES,
                    numeric('charges', `uses:${ref}`, itemName, prev.value ?? 0, curr.value ?? 0, {
                        ref,
                        max: curr.max ?? 0,
                        oldMax: prev.max ?? 0,
                    }),
                )
            }
        }

        /* Rename */
        if (old.name && item.name !== old.name) {
            log(
                SETTING.MONITOR_ITEM_NAME_DESC,
                transition('rename', `name:${ref}`, word('ItemName'), truncateName(old.name), itemName, { toRef: ref }),
            )
        }

        /* Identify */
        if (old.identified !== undefined && Boolean(sys.identified) !== old.identified) {
            log(
                SETTING.MONITOR_ITEM_IDENTIFY,
                transition(
                    'identify',
                    `ident:${ref}`,
                    word(sys.identified ? 'Identified' : 'Unidentified'),
                    truncateName(old.identifiedName),
                    itemName,
                    { toRef: ref },
                ),
            )
        }

        /* Description: a word diff */
        if (old.description !== undefined) {
            const curr = sys.description?.value ?? ''
            if (curr !== old.description) {
                const diff = diffWords(htmlToText(old.description), htmlToText(curr))
                if (diff.add || diff.del) {
                    log(SETTING.MONITOR_ITEM_NAME_DESC, {
                        kind: 'description',
                        key: `desc:${ref}`,
                        label: itemName,
                        ref,
                        diff,
                    })
                }
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
                const label = `${itemName}: ${CONFIG.DND5E.currencies[c]?.label ?? c}`
                log(SETTING.MONITOR_CURRENCY, numeric('currency', `cur:${ref}:${c}`, label, p, n, { ref }))
            }
        }

        /* Hit Dice */
        if (old.hitDiceSpent !== undefined) {
            const curr = sys.hd?.spent
            if (curr !== undefined && curr !== old.hitDiceSpent) {
                const max = sys.hd.max
                const label = `${itemName} (${_loc('DND5E.HITDICE.Abbreviation')} ${sys.hd.denomination})`
                log(
                    SETTING.MONITOR_HIT_DICE,
                    numeric('hitDice', `hd:${ref}`, label, max - old.hitDiceSpent, max - curr, {
                        ref,
                        max,
                        oldMax: max,
                    }),
                )
            }
        }
    }

    _trackItemQuantity(item, actor, isCreation) {
        if (!isMonitorEnabled(SETTING.MONITOR_ITEM_QUANTITY)) return

        const qty = item.system.quantity ?? 1
        const action = _loc(`${MODULE_ID}.ChatMessage.${isCreation ? 'Added' : 'Deleted'}`)

        Logger.log(
            actor,
            SETTING.MONITOR_ITEM_QUANTITY,
            state('item', `item:${item.uuid}`, truncateName(item.name), qty > 1 ? `${action} ×${qty}` : action, {
                on: isCreation,
                ref: isCreation ? item.uuid : undefined,
            }),
        )
    }

    _trackClassLevel(item, actor, isCreation) {
        if (item.type !== 'class' || !isMonitorEnabled(SETTING.MONITOR_LEVEL)) return

        const currLvl = item.system?.levels
        if (currLvl === undefined || currLvl === null) return

        const prev = isCreation ? 0 : currLvl
        const curr = isCreation ? currLvl : 0

        Logger.log(
            actor,
            SETTING.MONITOR_LEVEL,
            numeric('level', `level:${item.uuid}`, `${_loc('DND5E.Level')} (${truncateName(item.name)})`, prev, curr),
        )
    }

    async onCreateEntity(item, actor) {
        this._trackItemQuantity(item, actor, true)
        this._trackClassLevel(item, actor, true)
    }

    async onDeleteEntity(item, actor) {
        this._trackItemQuantity(item, actor, false)
        this._trackClassLevel(item, actor, false)
    }
}
