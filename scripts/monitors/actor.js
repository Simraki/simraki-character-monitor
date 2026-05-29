import { BaseMonitor } from './base.js'
import { Logger } from '../logger.js'
import { _loc, capitalize, getActorLink, getDeltaText, getSetting, revalueMap, will } from '../utils.js'
import { classes, icons, MODULE_ID, SETTING } from '../config.js'

export class ActorMonitor extends BaseMonitor {
    init() {
        Hooks.on('preUpdateActor', this._onPreUpdate.bind(this))
        Hooks.on('updateActor', this._onUpdate.bind(this))

        if (game.modules.get('lib-wrapper')?.active) {
            libWrapper.register(
                MODULE_ID,
                'game.dnd5e.applications.actor.CharacterActorSheet.prototype._onChangeSheetMode',
                this.monitorSheetMode,
                'WRAPPER',
            )
        }
    }

    async monitorSheetMode(wrapped, ...args) {
        await wrapped(...args)
        if (!getSetting(SETTING.MONITOR_SHEET_MODE)) return

        const actorLink = getActorLink(this.actor)
        const sheetMode = _loc(this._mode === 1 ? 'DND5E.SheetModePlay' : 'DND5E.SheetModeEdit')

        const label = _loc(`${MODULE_ID}.ChatMessage.SheetMode`)
        const text = `${label}: ${sheetMode}`

        await Logger.log(actorLink, text, classes.sheetMode, icons.sheetMode)
    }

    isRelevantEntity(entity, update, options) {
        return !('isAdvancement' in options)
    }

    extractStash(actor, update) {
        const stash = {}
        const sys = actor.system

        if (getSetting(SETTING.MONITOR_HP) && will(update, 'system.attributes.hp')) {
            stash.hp = foundry.utils.duplicate(sys.attributes.hp)
        }

        if (getSetting(SETTING.MONITOR_AC) && will(update, 'system.attributes.ac.flat')) {
            stash.ac = sys.attributes.ac.flat
        }

        if (getSetting(SETTING.MONITOR_XP) && will(update, 'system.details.xp.value')) {
            stash.xp = sys.details.xp.value
        }

        if (getSetting(SETTING.MONITOR_LEVEL) && will(update, 'system.details.level')) {
            stash.level = sys.details.level
        }

        if (getSetting(SETTING.MONITOR_ABILITY) && will(update, 'system.abilities')) {
            stash.abilities = revalueMap(sys.abilities, (v) => v.value)
        }

        if (getSetting(SETTING.MONITOR_CURRENCY) && will(update, 'system.currency')) {
            stash.currency = foundry.utils.duplicate(sys.currency)
        }

        if (getSetting(SETTING.MONITOR_SPELL_SLOTS) && will(update, 'system.spells')) {
            stash.spells = foundry.utils.duplicate(sys.spells)
        }

        if (getSetting(SETTING.MONITOR_SAVE_PROF) && will(update, 'system.abilities')) {
            stash.saves = revalueMap(sys.abilities, (v) => v.proficient)
        }

        if (getSetting(SETTING.MONITOR_SKILL_PROF) && will(update, 'system.skills')) {
            stash.skills = revalueMap(sys.skills, (v) => v.value)
        }

        if (getSetting(SETTING.MONITOR_TOOL_PROF) && will(update, 'system.tools')) {
            stash.tools = revalueMap(sys.tools, (v) => v.value ?? 0)
        }

        if (getSetting(SETTING.MONITOR_INSPIRATION) && will(update, 'system.attributes.inspiration')) {
            stash.inspiration = sys.attributes.inspiration
        }

        if (getSetting(SETTING.MONITOR_DEATH_SAVE) && will(update, 'system.attributes.death')) {
            stash.death = {
                success: sys.attributes.death.success,
                failure: sys.attributes.death.failure,
            }
        }
        return stash
    }

    async processChanges(actor, old) {
        const logPromises = []

        const link = getActorLink(actor)
        const sys = actor.system

        /* HP */
        if (old.hp !== undefined) {
            for (const kind of ['value', 'max', 'temp', 'tempmax']) {
                const prev = old.hp[kind] ?? 0
                const curr = sys.attributes.hp[kind] ?? 0
                if (curr === prev) continue

                const deltaText = getDeltaText(curr, prev)
                const label = _loc(`${MODULE_ID}.ChatMessage.HP.${capitalize(kind)}`)
                const text = `${label}: ${deltaText}`
                let cls = curr > prev ? classes.hpPlus : classes.hpMinus
                let icon = icons.hp
                if (kind === 'tempmax') {
                    cls = classes.tempMaxHp
                    icon = icons.tempMaxHp
                } else if (kind === 'temp') {
                    cls = classes.tempHp
                    icon = icons.tempHp
                } else if (kind === 'max') {
                    cls = classes.maxHp
                    icon = icons.maxHp
                }
                logPromises.push(Logger.log(link, text, cls, icon))
            }
        }

        /* AC */
        if (old.ac !== undefined) {
            const curr = sys.attributes.ac.flat
            if (curr !== old.ac) {
                const label = _loc('DND5E.ArmorClass')
                const deltaText = getDeltaText(curr, old.ac)
                const text = `${label}: ${deltaText}`
                logPromises.push(Logger.log(link, text, classes.ac, icons.ac))
            }
        }

        /* XP */
        if (old.xp !== undefined) {
            const curr = sys.details.xp.value
            if (curr !== old.xp) {
                const label = _loc('DND5E.ExperiencePoints.Label')
                const deltaText = getDeltaText(curr, old.xp)
                const text = `${label}: ${deltaText}`
                logPromises.push(Logger.log(link, text, classes.xp, icons.xp))
            }
        }

        /* Level */
        if (old.level !== undefined) {
            const curr = sys.details.level
            if (curr !== old.level) {
                const label = _loc('DND5E.Level')
                const deltaText = getDeltaText(curr, old.level)
                const text = `${label}: ${deltaText}`
                logPromises.push(Logger.log(link, text, classes.level, icons.level))
            }
        }

        /* Abilities */
        if (old.abilities !== undefined) {
            for (const abil in old.abilities) {
                const prev = old.abilities[abil]
                const curr = sys.abilities[abil]?.value
                if (curr === prev) continue

                const label = CONFIG.DND5E.abilities[abil].label
                const deltaText = getDeltaText(curr, prev)
                const text = `${label}: ${deltaText}`
                logPromises.push(Logger.log(link, text, classes.ability, icons.ability))
            }
        }

        /* Currency */
        if (old.currency !== undefined) {
            for (const c in old.currency) {
                const prev = old.currency[c]
                const curr = sys.currency[c]
                if (curr === prev) continue

                const label = _loc(`DND5E.CurrencyAbbr${c.toUpperCase()}`)
                const deltaText = getDeltaText(curr, prev)
                const text = `${label}: ${deltaText}`
                logPromises.push(
                    Logger.log(link, text, curr > prev ? classes.currencyPlus : classes.currencyMinus, icons.currency),
                )
            }
        }

        /* Spell Slots */
        if (old.spells !== undefined) {
            for (const lvl in old.spells) {
                const prev = old.spells[lvl]
                const curr = sys.spells[lvl]
                const deltaValue = curr.value - prev.value
                const deltaMax = curr.max - prev.max
                if (!deltaValue && !deltaMax) continue

                const n = Number(lvl.slice(-1))
                const label = CONFIG.DND5E.spellLevels[n]
                const deltaText = getDeltaText(`${curr.value}/${curr.max}`, `${prev.value}/${prev.max}`)
                const text = `${label}: ${deltaText}`
                logPromises.push(
                    Logger.log(
                        link,
                        text,
                        deltaValue > 0 || deltaMax > 0 ? classes.spellSlotPlus : classes.spellSlotMinus,
                        icons.spellSlot,
                    ),
                )
            }
        }

        /* Skill Proficiency */
        if (old.skills !== undefined) {
            for (const skl in old.skills) {
                const prev = old.skills[skl]
                const curr = sys.skills[skl]?.value
                if (curr === prev) continue

                const label = CONFIG.DND5E.skills[skl].label
                const deltaText = getDeltaText(
                    CONFIG.DND5E.proficiencyLevels[curr],
                    CONFIG.DND5E.proficiencyLevels[prev],
                )
                const text = `${label}: ${deltaText}`
                logPromises.push(Logger.log(link, text, classes.skill, icons.skillProf))
            }
        }

        /* Save Proficiency */
        if (old.saves !== undefined) {
            for (const abil in old.saves) {
                const prev = old.saves[abil]
                const curr = sys.abilities[abil]?.proficient ?? 0
                if (curr === prev) continue

                const label = `${_loc('DND5E.SavingThrow')} ${CONFIG.DND5E.abilities[abil].label}`
                const deltaText = getDeltaText(
                    CONFIG.DND5E.proficiencyLevels[curr],
                    CONFIG.DND5E.proficiencyLevels[prev],
                )

                const text = `${label}: ${deltaText}`
                logPromises.push(Logger.log(link, text, classes.save, icons.saveProf))
            }
        }

        /* Tool Proficiency */
        if (old.tools !== undefined) {
            const prevTools = old.tools
            const currTools = revalueMap(sys.tools, (v) => v.value ?? 0)

            for (const tool in { ...prevTools, ...currTools }) {
                const prev = prevTools[tool] ?? 0
                const curr = currTools[tool] ?? 0
                const toolId = CONFIG.DND5E.tools[tool]?.id
                if (!toolId || curr === prev) continue

                const label = (await fromUuid(toolId))?.name
                const deltaText = getDeltaText(
                    CONFIG.DND5E.proficiencyLevels[curr],
                    CONFIG.DND5E.proficiencyLevels[prev],
                )

                const text = `${label}: ${deltaText}`
                logPromises.push(Logger.log(link, text, classes.tool, icons.toolProf))
            }
        }

        /* Inspiration */
        if (old.inspiration !== undefined) {
            const curr = sys.attributes.inspiration
            if (curr !== old.inspiration) {
                const label = _loc('DND5E.Inspiration')
                const text = `${label}: ${curr ? '+' : '−'}`
                logPromises.push(Logger.log(link, text, classes.inspiration, icons.inspiration))
            }
        }

        /* Death Saves */
        if (old.death) {
            const curr = sys.attributes.death
            const generalLabel = _loc('DND5E.DeathSave')

            if (curr.success !== old.death.success) {
                const label = _loc('DND5E.DeathSaveSuccesses')
                const deltaText = getDeltaText(`${curr.success}/3`, `${old.death.success}/3`)
                const text = `${generalLabel} (${label}): ${deltaText}`
                logPromises.push(
                    Logger.log(
                        link,
                        text,
                        curr.success > old.death.success ? classes.plus : classes.minus,
                        icons.deathSuccess,
                    ),
                )
            }

            if (curr.failure !== old.death.failure) {
                const label = _loc('DND5E.DeathSaveFailures')
                const deltaText = getDeltaText(`${curr.failure}/3`, `${old.death.failure}/3`)
                const text = `${generalLabel} (${label}): ${deltaText}`
                logPromises.push(
                    Logger.log(
                        link,
                        text,
                        curr.failure < old.death.failure ? classes.plus : classes.minus,
                        icons.deathFailure,
                    ),
                )
            }
        }

        await Promise.all(logPromises)
    }
}
