import { BaseMonitor } from './base.js';
import { Settings } from '../settings.js';
import { Logger } from '../logger.js';
import { getActorLink, getDeltaText, will } from '../utils.js';
import { classes, DEBOUNCE_MS, icons, MODULE_ID } from '../config.js';


export class ActorMonitor extends BaseMonitor {
    ACTOR_QUEUE = new Map();

    init() {
        Hooks.on('preUpdateActor', this.onPreUpdate.bind(this));
        Hooks.on('updateActor', this.onUpdate.bind(this));

        if (game.modules.get('lib-wrapper')?.active) {
            libWrapper.register(MODULE_ID, 'game.dnd5e.applications.actor.CharacterActorSheet.prototype._onChangeSheetMode', this.monitorSheetMode, 'WRAPPER');
        }
    }

    async monitorSheetMode(wrapped, event) {
        await wrapped(event);
        if (!Settings.getBool('monitorSheetMode')) return;

        const actorLink = getActorLink(this.actor);
        const sheetMode = this._mode === 1 ? game.i18n.localize('DND5E.SheetModePlay') : game.i18n.localize('DND5E.SheetModeEdit');

        const label = game.i18n.localize('characterMonitor.chatMessage.sheetMode');
        const text = `${label}: ${sheetMode}`;

        await Logger.logFlat(actorLink, text, classes.sheetMode, icons.sheetMode);
    }

    async onPreUpdate(actor, update, options, userId) {
        if (actor.type !== 'character') return;
        if (game.system.id === 'dnd5e' && 'isAdvancement' in options) return;

        const stash = options[MODULE_ID] ??= {};

        const sys = actor.system;

        if (Settings.getBool('monitorHP') && will(update, 'system.attributes.hp')) {
            stash.hp = foundry.utils.duplicate(sys.attributes.hp);
        }

        if (Settings.getBool('monitorAC') && will(update, 'system.attributes.ac.flat')) {
            stash.ac = sys.attributes.ac.flat;
        }

        if (Settings.getBool('monitorXP') && will(update, 'system.details.xp.value')) {
            stash.xp = sys.details.xp.value;
        }

        if (Settings.getBool('monitorLevel') && will(update, 'system.details.level')) {
            stash.level = sys.details.level;
        }

        if (Settings.getBool('monitorAbility') && will(update, 'system.abilities')) {
            stash.abilities = Object.fromEntries(Object.entries(sys.abilities).map(([k, v]) => [k, v.value]));
        }

        if (Settings.getBool('monitorCurrency') && will(update, 'system.currency')) {
            stash.currency = foundry.utils.duplicate(sys.currency);
        }

        if (Settings.getBool('monitorSpellSlots') && will(update, 'system.spells')) {
            stash.spells = foundry.utils.duplicate(sys.spells);
        }

        if (Settings.getBool('monitorSaveProficiency') && will(update, 'system.abilities')) {
            stash.saves = Object.fromEntries(Object.entries(sys.abilities).map(([k, v]) => [k, v.proficient ?? 0]));
        }

        if (Settings.getBool('monitorSkillProficiency') && will(update, 'system.skills')) {
            stash.skills = Object.fromEntries(Object.entries(sys.skills).map(([k, v]) => [k, v.value]));
        }

        if (Settings.getBool('monitorToolProficiency') && will(update, 'system.tools')) {
            stash.tools = Object.fromEntries(Object.entries(sys.tools).map(([k, v]) => [k, v.value ?? 0]));
        }

        if (Settings.getBool('monitorInspiration') && will(update, 'system.attributes.inspiration')) {
            stash.inspiration = sys.attributes.inspiration;
        }

        if (Settings.getBool('monitorDeathSave') && will(update, 'system.attributes.death')) {
            stash.death = {
                success: sys.attributes.death.success,
                failure: sys.attributes.death.failure,
            };
        }

        options[MODULE_ID] = stash;
    }

    async onUpdate(actor, update, options, userId) {
        if (userId !== game.user.id || !options?.[MODULE_ID]) return;
        const stash = options[MODULE_ID];
        const uuid = actor.uuid;

        const pending = this.ACTOR_QUEUE.get(uuid) ?? {
            old: {}, timer: null,
        };

        if (pending.timer) clearTimeout(pending.timer);

        for (const [k, v] of Object.entries(stash)) {
            if (pending.old[k] === undefined) pending.old[k] = v;
        }
        pending.timer = setTimeout(() => {
            this.process(actor, pending.old);
            this.ACTOR_QUEUE.delete(uuid);
        }, DEBOUNCE_MS);

        this.ACTOR_QUEUE.set(uuid, pending);
    }

    async process(actor, old) {
        const link = getActorLink(actor);
        const sys = actor.system;

        /* HP */
        if (old.hp !== undefined) {
            for (const kind of ['value', 'max', 'temp', 'tempmax']) {
                const prev = old.hp[kind] ?? 0;
                const curr = sys.attributes.hp[kind] ?? 0;
                if (curr === prev) continue;

                const deltaText = getDeltaText(curr, prev);
                const label = game.i18n.localize(`characterMonitor.chatMessage.hp.${kind}`);
                const text = `${label}: ${deltaText}`;
                let cls = curr > prev ? classes.hpPlus : classes.hpMinus;
                let icon = icons.hp;
                if (kind === 'tempmax') {
                    cls = classes.tempMaxHp;
                    icon = icons.tempMaxHp;
                } else if (kind === 'temp') {
                    cls = classes.tempHp;
                    icon = icons.tempHp;
                } else if (kind === 'max') {
                    cls = classes.maxHp;
                    icon = icons.maxHp;
                }
                await Logger.logFlat(link, text, cls, icon);
            }
        }

        /* AC */
        if (old.ac !== undefined) {
            const curr = sys.attributes.ac.flat;
            if (curr !== old.ac) {
                const label = game.i18n.localize('DND5E.ArmorClass');
                const deltaText = getDeltaText(curr, old.ac);
                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, classes.ac, icons.ac);
            }
        }

        /* XP */
        if (old.xp !== undefined) {
            const curr = sys.details.xp.value;
            if (curr !== old.xp) {
                const label = game.i18n.localize('DND5E.ExperiencePoints.Label');
                const deltaText = getDeltaText(curr, old.xp);
                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, classes.xp, icons.xp);
            }
        }

        /* Level */
        if (old.level !== undefined) {
            const curr = sys.details.level;
            if (curr !== old.level) {
                const label = game.i18n.localize('DND5E.Level');
                const deltaText = getDeltaText(curr, old.level);
                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, classes.level, icons.level);
            }
        }

        /* Abilities */
        if (old.abilities !== undefined) {
            for (const [abil, prev] of Object.entries(old.abilities)) {
                const curr = sys.abilities[abil]?.value;
                if (curr === prev) continue;

                const label = CONFIG.DND5E.abilities[abil].label;
                const deltaText = getDeltaText(curr, prev);
                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, classes.ability, icons.ability);
            }
        }

        /* Currency */
        if (old.currency !== undefined) {
            for (const [c, prev] of Object.entries(old.currency)) {
                const curr = sys.currency[c];
                if (curr === prev) continue;

                const label = game.i18n.localize(`DND5E.CurrencyAbbr${c.toUpperCase()}`);
                const deltaText = getDeltaText(curr, prev);
                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, curr > prev ? classes.currencyPlus : classes.currencyMinus, icons.currency);
            }
        }

        /* Spell Slots */
        if (old.spells !== undefined) {
            for (const [lvl, prev] of Object.entries(old.spells)) {
                const curr = sys.spells[lvl];
                const deltaValue = curr.value - prev.value;
                const deltaMax = curr.max - prev.max;
                if (!deltaValue && !deltaMax) continue;

                const n = Number(lvl.slice(-1));
                const label = CONFIG.DND5E.spellLevels[n];
                const deltaText = getDeltaText(`${curr.value}/${curr.max}`, `${prev.value}/${prev.max}`);
                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, deltaValue > 0 || deltaMax > 0 ? classes.spellSlotPlus : classes.spellSlotMinus, icons.spellSlot);
            }
        }

        /* Skill Proficiency */
        if (old.skills !== undefined) {
            for (const [skl, prev] of Object.entries(old.skills)) {
                const curr = sys.skills[skl]?.value;
                if (curr === prev) continue;

                const label = CONFIG.DND5E.skills[skl].label;
                const deltaText = getDeltaText(CONFIG.DND5E.proficiencyLevels[curr], CONFIG.DND5E.proficiencyLevels[prev]);
                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, classes.skill, icons.skillProf);
            }
        }

        /* Save Proficiency */
        if (old.saves !== undefined) {
            for (const [abil, prev] of Object.entries(old.saves)) {
                const curr = sys.abilities[abil]?.proficient ?? 0;
                if (curr === prev) continue;

                const label = `${game.i18n.localize('DND5E.SavingThrow')} ${CONFIG.DND5E.abilities[abil].label}`;
                const deltaText = getDeltaText(
                    CONFIG.DND5E.proficiencyLevels[curr],
                    CONFIG.DND5E.proficiencyLevels[prev],
                );

                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, classes.save, icons.saveProf);
            }
        }

        /* Tool Proficiency */
        if (old.tools !== undefined) {
            for (const [tool, prev] of Object.entries(old.tools)) {
                const curr = sys.tools[tool]?.value ?? 0;
                if (curr === prev) continue;

                const label = fromUuidSync(CONFIG.DND5E.tools[tool].id).name;
                const deltaText = getDeltaText(
                    CONFIG.DND5E.proficiencyLevels[curr],
                    CONFIG.DND5E.proficiencyLevels[prev],
                );

                const text = `${label}: ${deltaText}`;
                await Logger.logFlat(link, text, classes.tool, icons.toolProf);
            }
        }

        /* Inspiration */
        if (old.inspiration !== undefined) {
            const curr = sys.attributes.inspiration;
            if (curr !== old.inspiration) {
                const label = game.i18n.localize('DND5E.Inspiration');
                const text = `${label}: ${curr ? '+' : '−'}`;
                await Logger.logFlat(link, text, classes.inspiration, icons.inspiration);
            }
        }

        /* Death Saves */
        if (old.death) {
            const curr = sys.attributes.death;
            const generalLabel = game.i18n.localize('DND5E.DeathSave');

            if (curr.success !== old.death.success) {
                const label = game.i18n.localize('DND5E.DeathSaveSuccesses');
                const deltaText = getDeltaText(`${curr.success}/3`, `${old.death.success}/3`);
                const text = `${generalLabel} (${label}): ${deltaText}`;
                await Logger.logFlat(link, text, curr.success > old.death.success ? classes.plus : classes.minus, icons.deathSuccess);
            }

            if (curr.failure !== old.death.failure) {
                const label = game.i18n.localize('DND5E.DeathSaveFailures');
                const deltaText = getDeltaText(`${curr.failure}/3`, `${old.death.failure}/3`);
                const text = `${generalLabel} (${label}): ${deltaText}`;
                await Logger.logFlat(link, text, curr.failure < old.death.failure ? classes.plus : classes.minus, icons.deathFailure);
            }
        }
    }
}
