import { BaseMonitor } from './base.js'
import { Logger } from '../logger.js'
import { numeric, state, transition } from '../entries.js'
import { isMonitorEnabled, revalueMap, truncateName, will } from '../utils.js'
import { MODULE_ID, SETTING } from '../config.js'

export class ActorMonitor extends BaseMonitor {
    init() {
        Hooks.on('preUpdateActor', this._onPreUpdate.bind(this))
        Hooks.on('updateActor', this._onUpdate.bind(this))

        if (game.modules.get('lib-wrapper')?.active) {
            const monitor = this
            for (const name of ['CharacterActorSheet', 'NPCActorSheet']) {
                libWrapper.register(
                    MODULE_ID,
                    `game.dnd5e.applications.actor.${name}.prototype.changeMode`,
                    function (wrapped, ...args) {
                        return monitor.monitorSheetMode(this, wrapped, ...args)
                    },
                    'WRAPPER',
                )
            }
        }
    }

    async monitorSheetMode(sheet, wrapped, ...args) {
        const prevMode = sheet._mode
        const result = await wrapped(...args)
        if (!isMonitorEnabled(SETTING.MONITOR_SHEET_MODE)) return result
        if (!this._isValidActorType(sheet.actor)) return result
        if (sheet._mode === prevMode) return result

        const editing = sheet._mode === sheet.constructor.MODES?.EDIT
        const word = _loc(editing ? 'DND5E.SheetModeEdit' : 'DND5E.SheetModePlay')
        Logger.log(
            sheet.actor,
            SETTING.MONITOR_SHEET_MODE,
            state('sheetMode', `sheet:${sheet.actor.uuid}`, _loc(`${MODULE_ID}.ChatMessage.SheetMode`), word, {
                on: editing,
            }),
        )
        return result
    }

    isRelevantEntity(entity, update, options) {
        return !('isAdvancement' in options)
    }

    extractStash(actor, update) {
        const stash = {}
        const sys = actor.system

        if (isMonitorEnabled(SETTING.MONITOR_HP) && will(update, 'system.attributes.hp')) {
            stash.hp = foundry.utils.deepClone(sys.attributes.hp)
        }

        if (isMonitorEnabled(SETTING.MONITOR_AC) && will(update, 'system.attributes.ac')) {
            stash.ac = {
                value: sys.attributes.ac.value,
            }
        }

        if (isMonitorEnabled(SETTING.MONITOR_XP) && will(update, 'system.details.xp.value')) {
            stash.xp = sys.details.xp.value
        }

        if (isMonitorEnabled(SETTING.MONITOR_ABILITY) && will(update, 'system.abilities')) {
            stash.abilities = revalueMap(sys.abilities, (v) => v.value)
        }

        if (isMonitorEnabled(SETTING.MONITOR_CURRENCY) && will(update, 'system.currency')) {
            stash.currency = foundry.utils.deepClone(sys.currency)
        }

        if (isMonitorEnabled(SETTING.MONITOR_SPELL_SLOTS) && will(update, 'system.spells')) {
            stash.spells = foundry.utils.deepClone(sys.spells)
        }

        if (isMonitorEnabled(SETTING.MONITOR_SAVE_PROF) && will(update, 'system.abilities')) {
            stash.saves = revalueMap(sys.abilities, (v) => v.proficient)
        }

        if (isMonitorEnabled(SETTING.MONITOR_SKILL_PROF) && will(update, 'system.skills')) {
            stash.skills = revalueMap(sys.skills, (v) => v.value)
        }

        if (isMonitorEnabled(SETTING.MONITOR_TOOL_PROF) && will(update, 'system.tools')) {
            stash.tools = revalueMap(sys.tools, (v) => v.value ?? 0)
        }

        if (
            actor.type === 'group' &&
            isMonitorEnabled(SETTING.MONITOR_PARTY_MEMBERS) &&
            will(update, 'system.members')
        ) {
            stash.members = this._getMembers(sys.members)
        }

        if (isMonitorEnabled(SETTING.MONITOR_INSPIRATION) && will(update, 'system.attributes.inspiration')) {
            stash.inspiration = sys.attributes.inspiration
        }

        if (isMonitorEnabled(SETTING.MONITOR_DEATH_SAVE) && will(update, 'system.attributes.death')) {
            stash.death = {
                success: sys.attributes.death.success,
                failure: sys.attributes.death.failure,
            }
        }

        return stash
    }

    _getMembers(members) {
        const result = []
        for (const member of members ?? []) {
            const ref = member?.actor ?? member
            const id = typeof ref === 'string' ? ref : ref?.id
            if (!id) continue
            const name = (typeof ref === 'string' ? game.actors.get(id)?.name : ref?.name) ?? id
            result.push({ id, name })
        }
        return result
    }

    async processChanges(actor, old) {
        const sys = actor.system
        const log = (settingKey, entry) => Logger.log(actor, settingKey, entry)
        const profName = (value) => String(CONFIG.DND5E.proficiencyLevels?.[value] ?? value ?? '')

        /* HP */
        if (old.hp !== undefined) {
            const hp = sys.attributes.hp
            const kinds = { value: 'hp', max: 'maxHp', temp: 'tempHp', tempmax: 'tempMaxHp' }
            for (const [field, kind] of Object.entries(kinds)) {
                const prev = old.hp[field] ?? 0
                const curr = hp[field] ?? 0
                if (curr === prev) continue
                const label = _loc(`${MODULE_ID}.ChatMessage.HP.${field.charAt(0).toUpperCase()}${field.slice(1)}`)
                log(SETTING.MONITOR_HP, numeric(kind, `hp:${field}`, label, prev, curr))
            }
        }

        /* AC */
        if (old.ac !== undefined) {
            const curr = sys.attributes.ac.value
            if ((curr ?? null) !== (old.ac.value ?? null)) {
                log(SETTING.MONITOR_AC, numeric('ac', 'ac', _loc('DND5E.ArmorClass'), old.ac.value ?? 0, curr ?? 0))
            }
        }

        /* XP */
        if (old.xp !== undefined) {
            const curr = sys.details.xp.value
            if (curr !== old.xp) {
                log(
                    SETTING.MONITOR_XP,
                    numeric('xp', 'xp', _loc('DND5E.ExperiencePoints.Label'), old.xp ?? 0, curr ?? 0),
                )
            }
        }

        /* Abilities */
        if (old.abilities !== undefined) {
            for (const abil in old.abilities) {
                const prev = old.abilities[abil]
                const curr = sys.abilities[abil]?.value
                if (curr === prev || curr === undefined) continue
                const label = CONFIG.DND5E.abilities[abil]?.label ?? abil
                log(SETTING.MONITOR_ABILITY, numeric('ability', `abil:${abil}`, label, prev ?? 0, curr))
            }
        }

        /* Currency */
        if (old.currency !== undefined) {
            for (const c in old.currency) {
                const prev = old.currency[c]
                const curr = sys.currency[c]
                if (curr === prev) continue
                const label = CONFIG.DND5E.currencies[c]?.label ?? c
                log(SETTING.MONITOR_CURRENCY, numeric('currency', `cur:${c}`, label, prev ?? 0, curr ?? 0))
            }
        }

        /* Spell Slots (including pact slots) */
        if (old.spells !== undefined) {
            for (const lvl in old.spells) {
                const prev = old.spells[lvl]
                const curr = sys.spells[lvl]
                if (!prev || !curr) continue
                if (curr.value === prev.value && curr.max === prev.max) continue

                const levelLabel = CONFIG.DND5E.spellLevels?.[curr.level]
                const isPact = lvl === 'pact'
                let label = levelLabel ?? lvl
                if (isPact) {
                    label = _loc('DND5E.SPELLCASTING.METHODS.Pact.Full.label')
                    if (levelLabel) label += ` (${levelLabel})`
                }

                log(
                    SETTING.MONITOR_SPELL_SLOTS,
                    numeric(isPact ? 'pact' : 'slot', `slot:${lvl}`, label, prev.value ?? 0, curr.value ?? 0, {
                        max: curr.max ?? 0,
                        oldMax: prev.max ?? 0,
                    }),
                )
            }
        }

        /* Skill Proficiency */
        if (old.skills !== undefined) {
            for (const skl in old.skills) {
                const prev = old.skills[skl]
                const curr = sys.skills[skl]?.value
                if (curr === prev) continue
                const label = CONFIG.DND5E.skills[skl]?.label ?? skl
                log(
                    SETTING.MONITOR_SKILL_PROF,
                    transition('skill', `skill:${skl}`, label, profName(prev), profName(curr)),
                )
            }
        }

        /* Save Proficiency */
        if (old.saves !== undefined) {
            for (const abil in old.saves) {
                const prev = old.saves[abil]
                const curr = sys.abilities[abil]?.proficient ?? 0
                if (curr === prev) continue
                const label = `${_loc('DND5E.SavingThrow')} ${CONFIG.DND5E.abilities[abil]?.label ?? abil}`
                log(
                    SETTING.MONITOR_SAVE_PROF,
                    transition('save', `save:${abil}`, label, profName(prev), profName(curr)),
                )
            }
        }

        /* Tool Proficiency */
        if (old.tools !== undefined) {
            const prevTools = old.tools
            const currTools = revalueMap(sys.tools, (v) => v.value ?? 0)
            for (const tool in { ...prevTools, ...currTools }) {
                const prev = prevTools[tool] ?? 0
                const curr = currTools[tool] ?? 0

                if (curr === prev) continue
                const toolId = CONFIG.DND5E.tools[tool]?.id
                const label = truncateName(dnd5e.documents.Trait.keyLabel(tool, { trait: 'tool' }) || tool)
                log(
                    SETTING.MONITOR_TOOL_PROF,
                    transition('tool', `tool:${tool}`, label, profName(prev), profName(curr), { ref: toolId }),
                )
            }
        }

        /* Party members */
        if (old.members !== undefined) {
            const prevIds = new Set(old.members.map((m) => m.id))
            const current = this._getMembers(sys.members)
            const currIds = new Set(current.map((m) => m.id))

            const logMember = (member, added) => {
                const memberUuid = game.actors.get(member.id)?.uuid
                log(
                    SETTING.MONITOR_PARTY_MEMBERS,
                    state(
                        'member',
                        `member:${member.id}`,
                        truncateName(member.name),
                        _loc(`${MODULE_ID}.ChatMessage.${added ? 'MemberAdded' : 'MemberRemoved'}`),
                        { on: added, ref: memberUuid },
                    ),
                )
            }
            current.filter((m) => !prevIds.has(m.id)).forEach((m) => logMember(m, true))
            old.members.filter((m) => !currIds.has(m.id)).forEach((m) => logMember(m, false))
        }

        /* Inspiration */
        if (old.inspiration !== undefined) {
            const curr = sys.attributes.inspiration
            if (curr !== old.inspiration) {
                log(
                    SETTING.MONITOR_INSPIRATION,
                    state('inspiration', 'inspiration', _loc('DND5E.Inspiration'), curr ? '+' : '-', {
                        on: curr,
                    }),
                )
            }
        }

        /* Death Saves */
        if (old.death !== undefined) {
            const curr = sys.attributes.death
            if (curr.success !== old.death.success) {
                log(
                    SETTING.MONITOR_DEATH_SAVE,
                    numeric(
                        'deathSuccess',
                        'death:success',
                        _loc('DND5E.DeathSaveSuccessLabel'),
                        old.death.success ?? 0,
                        curr.success ?? 0,
                    ),
                )
            }
            if (curr.failure !== old.death.failure) {
                log(
                    SETTING.MONITOR_DEATH_SAVE,
                    numeric(
                        'deathFailure',
                        'death:failure',
                        _loc('DND5E.DeathSaveFailureLabel'),
                        old.death.failure ?? 0,
                        curr.failure ?? 0,
                    ),
                )
            }
        }
    }
}
