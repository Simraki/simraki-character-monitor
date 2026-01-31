import {BaseMonitor} from './base.js';
import {Settings} from '../settings.js';
import {Logger} from '../logger.js';
import {getActorLink, getDeltaText, truncateName, VALID_TYPES, will} from '../utils.js';
import {classes, DEBOUNCE_MS, icons, MODULE_ID} from '../config.js';


export class ItemMonitor extends BaseMonitor {
    ITEM_QUEUE = new Map();

    init() {
        Hooks.on('preUpdateItem', this.onPreUpdate.bind(this));
        Hooks.on('updateItem', this.onUpdate.bind(this));
        Hooks.on('createItem', this.onCreate.bind(this));
        Hooks.on('deleteItem', this.onDelete.bind(this));
    }

    async onPreUpdate(item, update, options, userId) {
        const actor = item.parent;
        if (!actor || !(item.parent instanceof Actor) || actor.type !== 'character') return;

        const stash = options[MODULE_ID] ??= {};
        const sys = item.system;

        if (Settings.getBool(`monitorItemQuantity`) && will(update, 'system.quantity')) {
            stash.quantity = sys.quantity ?? 0;
        }

        if (Settings.getBool(`monitorItemEquip`) && will(update, 'system.equipped')) {
            stash.equipped = sys.equipped ?? false;
        }

        if (Settings.getBool(`monitorItemAttune`) && will(update, 'system.attuned')) {
            stash.attuned = sys.attuned ?? false;
        }

        if (Settings.getBool(`monitorSpellPrep`) && item.type === 'spell' && (will(update, 'system.prepared') || will(update, 'system.preparation'))) {
            stash.prepared = Boolean(sys.prepared);
        }

        if (Settings.getBool(`monitorItemCharges`) && sys.uses && will(update, 'system.uses')) {
            stash.uses = foundry.utils.duplicate(sys.uses);
        }

        if (Settings.getBool(`monitorItemIdentify`) && will(update, 'system.identified')) {
            stash.identified = sys.identified ?? false;
        }

        if (Settings.getBool(`monitorItemNameDesc`)) {
            if (will(update, 'system.description.value')) {
                stash.description = sys.description?.value ?? '';
            }
            if (will(update, 'name')) {
                stash.name = item.name;
            }
        }

        options[MODULE_ID] = stash;
    }

    async onUpdate(item, update, options, userId) {
        if (userId !== game.user.id || !(item.parent instanceof Actor) || !options?.[MODULE_ID]) return;

        const actor = item.parent;
        if (!actor || actor.type !== 'character') return;

        const uuid = item.uuid;
        const stash = options[MODULE_ID];

        const pending = this.ITEM_QUEUE.get(uuid) ?? {
            old: {},
            timer: null,
        };

        if (pending.timer) clearTimeout(pending.timer);

        for (const [k, v] of Object.entries(stash)) {
            if (pending.old[k] === undefined) pending.old[k] = v;
        }

        pending.timer = setTimeout(() => {
            this.process(item, pending.old);
            this.ITEM_QUEUE.delete(uuid);
        }, DEBOUNCE_MS);

        this.ITEM_QUEUE.set(uuid, pending);
    }

    async process(item, old) {
        const actorLink = getActorLink(item.parent);
        const sys = item.system;
        const itemName = truncateName(item.name);

        /* Quantity */
        if (old.quantity !== undefined) {
            console.log('change quantity', item, old)
            const curr = sys.quantity ?? 0;
            if (curr !== old.quantity) {
                const deltaText = getDeltaText(curr, old.quantity);
                const text = `${itemName}: ${deltaText}`;
                await Logger.logFlat(actorLink, text, curr > old.quantity ? classes.itemPlus : classes.itemMinus, icons.itemQty);
            }
        }

        /* Equip */
        if (old.equipped !== undefined && sys.equipped !== old.equipped) {
            const preText = game.i18n.localize(sys.equipped ? 'characterMonitor.chatMessage.equipped' : 'characterMonitor.chatMessage.unequipped');
            const text = `${preText} ${itemName}`;
            await Logger.logFlat(actorLink, text, sys.equipped ? classes.itemEquip : classes.itemUnequip, icons.itemEquip);
        }

        /* Attunement */
        if (old.attuned !== undefined && sys.attuned !== old.attuned) {
            const preText = game.i18n.localize(sys.attuned ? 'characterMonitor.chatMessage.attunesTo' : 'characterMonitor.chatMessage.breaksAttune');
            const text = `${preText} ${itemName}`;
            await Logger.logFlat(actorLink, text, classes.itemAttune, icons.itemAttune);
        }

        /* Spell Prepared */
        if (old.prepared !== undefined && Boolean(sys.prepared) !== old.prepared) {
            const preText = game.i18n.localize(sys.prepared ? 'characterMonitor.chatMessage.prepared' : 'characterMonitor.chatMessage.unprepared');
            const lvlText = sys.level !== undefined ? ` (${game.i18n.localize(`DND5E.SPELLCASTING.SLOTS.spell${sys.level}`)})` : '';
            const text = `${preText} ${itemName}${lvlText}`;
            await Logger.logFlat(actorLink, text, classes.spellPrep, icons.spellPrep);
        }

        /* Uses / Charges */
        if (old.uses) {
            const prev = old.uses;
            const curr = sys.uses;
            if (curr && (curr.value !== prev.value || curr.max !== prev.max)) {
                const deltaText = getDeltaText(`${curr.value}/${curr.max}`, `${prev.value}/${prev.max}`);
                const text = `${itemName}: ${deltaText}`;
                await Logger.logFlat(actorLink, text, classes.itemCharges, icons.itemCharges);
            }
        }

        /* Rename */
        if (old.name && item.name !== old.name) {
            const text = `${old.name} → ${item.name}`;
            await Logger.logFlat(actorLink, text, classes.itemNameDesc, icons.itemNameDesc);
        }

        /* Identify */
        if (old.identified !== undefined && Boolean(sys.identified) !== old.identified) {
            const preText = game.i18n.localize(sys.identified ? 'characterMonitor.chatMessage.identified' : 'characterMonitor.chatMessage.unidentified');
            const text = `${preText} ${itemName}`;
            await Logger.logFlat(actorLink, text, classes.itemIdentify, icons.itemIdentify);
        }

        /* Description */
        if (old.description !== undefined) {
            const curr = sys.description?.value ?? '';
            if (curr !== old.description) {
                const text = `
                          <hr>
                          <strong>${game.i18n.localize('characterMonitor.chatMessage.old')}</strong>
                          ${old.description || '<em>—</em>'}
                          <hr>
                          <strong>${game.i18n.localize('characterMonitor.chatMessage.new')}</strong>
                          ${curr || '<em>—</em>'}
                        `;

                await Logger.logWithSpoiler(
                    getActorLink(item.parent),
                    `${itemName}`,
                    `${game.i18n.localize('characterMonitor.chatMessage.descriptionChanged')}`,
                    text,
                    classes.itemNameDesc,
                    icons.itemNameDesc,
                );
            }
        }
    }

    async onCreate(item, options, userId) {
        if (userId !== game.user.id || !Settings.getBool(`monitorItemQuantity`)) return;

        const actor = item.parent;
        if (!actor || !(actor instanceof Actor) || actor.type !== 'character') return;

        const link = getActorLink(actor);
        const qty = item.system.quantity ?? 1;

        const typeText = VALID_TYPES.includes(item.type) ? ` (${game.i18n.localize(`TYPES.Item.${item.type}`)})` : '';
        const actionText = game.i18n.localize('characterMonitor.chatMessage.added');

        const text = `${actionText} ${truncateName(item.name)} x${qty}${typeText}`;

        await Logger.logFlat(link, text, classes.itemPlus, icons.itemQty);
    }

    async onDelete(item, options, userId) {
        if (userId !== game.user.id || !Settings.getBool(`monitorItemQuantity`)) return;

        const actor = item.parent;
        if (!actor || !(actor instanceof Actor) || actor.type !== 'character') return;

        const link = getActorLink(actor);

        const typeText = VALID_TYPES.includes(item.type) ? ` (${game.i18n.localize(`TYPES.Item.${item.type}`)})` : '';
        const actionText = game.i18n.localize('characterMonitor.chatMessage.deleted');

        const text = `${actionText} ${truncateName(item.name)}${typeText}`;
        await Logger.logFlat(link, text, classes.itemMinus, icons.itemQty);
    }
}
