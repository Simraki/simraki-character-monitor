import { BaseMonitor } from './base.js';
import { Settings } from '../settings.js';
import { Logger } from '../logger.js';
import { getActorLink } from '../utils.js';
import { classes, DEBOUNCE_MS, icons, MODULE_ID } from '../config.js';


export class EffectMonitor extends BaseMonitor {
    EFFECT_QUEUE = new Map();

    init() {
        Hooks.on('preUpdateActiveEffect', this.onPreUpdate.bind(this));
        Hooks.on('updateActiveEffect', this.onUpdate.bind(this));
        Hooks.on('createActiveEffect', this.onCreate.bind(this));
        Hooks.on('deleteActiveEffect', this.onDelete.bind(this));
    }

    async onPreUpdate(effect, update, options, userId) {
        const actor = effect.parent;
        if (!actor || actor.type !== 'character') return;

        const stash = options[MODULE_ID] ??= {};
        if (Settings.getBool('monitorEffects') && 'disabled' in update) {
            stash.disabled = effect.disabled ?? false;
        }

        options[MODULE_ID] = stash;
    }

    async onUpdate(effect, update, options, userId) {
        if (userId !== game.user.id || !effect.parent || !options?.[MODULE_ID]) return;

        const actor = effect.parent;
        if (!actor || actor.type !== 'character') return;

        const uuid = effect.uuid;
        const stash = options[MODULE_ID];

        // TODO || Setting toggle for effect

        const pending = this.EFFECT_QUEUE.get(uuid) ?? { old: {}, timer: null };

        if (pending.timer) clearTimeout(pending.timer);
        if (stash.disabled !== undefined && pending.old.disabled === undefined) pending.old.disabled = stash.disabled;

        pending.timer = setTimeout(() => {
            this.process(effect, pending.old);
            this.EFFECT_QUEUE.delete(uuid);
        }, DEBOUNCE_MS);

        this.EFFECT_QUEUE.set(uuid, pending);
    }

    async process(effect, old) {
        const actorLink = getActorLink(effect.parent);
        const effectName = effect.name;

        if (old.disabled !== undefined && effect.disabled !== old.disabled) {
            const enabled = !effect.disabled;
            const text = `${effectName} ${game.i18n.localize(enabled ? 'characterMonitor.chatMessage.enabled' : 'characterMonitor.chatMessage.disabled')}`;
            await Logger.logWithSpoiler(actorLink, text, game.i18n.localize('characterMonitor.chatMessage.description'), effect.description, classes.effect, icons.effect);
        }
    }

    async onCreate(effect, options, userId) {
        const actor = effect.parent;
        if (!actor || !(actor instanceof Actor) || actor.type !== 'character') return;
        if (!Settings.getBool('monitorEffects')) return;
        if (userId !== game.user.id) return;

        const text = `${effect.name} ${game.i18n.localize('characterMonitor.chatMessage.added')}`;
        await Logger.logWithSpoiler(getActorLink(actor), text, game.i18n.localize('characterMonitor.chatMessage.description'), effect.description, classes.effect, icons.effect);
    }

    async onDelete(effect, options, userId) {
        const actor = effect.parent;
        if (!actor || !(actor instanceof Actor) || actor.type !== 'character') return;
        if (!Settings.getBool('monitorEffects')) return;
        if (userId !== game.user.id) return;

        const text = `${effect.name} ${game.i18n.localize('characterMonitor.chatMessage.deleted')}`;
        await Logger.logWithSpoiler(getActorLink(actor), text, game.i18n.localize('characterMonitor.chatMessage.description'), effect.description, classes.effect, icons.effect);
    }
}
