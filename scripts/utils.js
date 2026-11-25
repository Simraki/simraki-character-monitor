import { MAX_NAME_CHARS, MODULE_ID, NPC_MONITOR_MODE, SETTING, SHORT_NAME_CHARS, VISIBILITY_MODE } from './config.js'

export function truncateName(name) {
    name = String(name ?? '')
    if (name.length > MAX_NAME_CHARS) {
        return name.substring(0, MAX_NAME_CHARS) + '…'
    } else {
        return name
    }
}

export const escapeHtml = (value) => foundry.utils.escapeHTML(String(value ?? ''))

export function uuidLink(uuid, name, transformName = truncateName) {
    const label = transformName(name).replace(/[[\]{}]/g, '')
    return `@UUID[${uuid}]{${label}}`
}

export function actorDisplayName(actor) {
    return String(actor?.token?.name || actor?.prototypeToken?.name || actor?.name || '').trim()
}

export function shortName(name, limit = SHORT_NAME_CHARS) {
    const words = String(name ?? '')
        .trim()
        .split(/\s+/)
        .filter(Boolean)
    if (!words.length) return ''
    const chars = (text) => [...text].length
    if (chars(words[0]) > limit) return [...words[0]].slice(0, limit - 1).join('') + '…'
    let out = words[0]
    let used = 1
    while (used < words.length && chars(`${out} ${words[used]}`) <= limit) out += ` ${words[used++]}`
    return used < words.length ? `${out}…` : out
}

export function revalueMap(obj, iteratee) {
    const newObj = {}
    for (const k in obj) {
        newObj[k] = iteratee(obj[k])
    }
    return newObj
}

export function will(update, path) {
    return path && foundry.utils.hasProperty(update, path)
}

export function capitalize(str) {
    return str.charAt(0).toUpperCase() + str.slice(1)
}

export function getSetting(key) {
    return game.settings.get(MODULE_ID, key)
}

export function isMonitorEnabled(key) {
    return getSetting(key) !== VISIBILITY_MODE.DISABLED
}

export function isMonitoredActor(actor) {
    if (!actor) return false
    if (!(actor instanceof foundry.documents.Actor)) return false
    if (actor.type === 'character') return true

    if (actor.type === 'npc') {
        const filterMode = getSetting(SETTING.NPC_MONITOR_MODE)
        if (filterMode === NPC_MONITOR_MODE.DISABLED) return false
        if (filterMode === NPC_MONITOR_MODE.ALL) return true
        if (filterMode === NPC_MONITOR_MODE.OWNED) return actor.hasPlayerOwner
    }

    if (actor.type === 'group') {
        return !!getSetting(SETTING.PARTY_MONITOR)
    }

    return false
}

export function getWhisperRecipients(mode, actor) {
    if (mode === VISIBILITY_MODE.ALL) return []

    const whisper = new Set(game.users.filter((u) => u.isGM).map((u) => u.id))

    if (mode === VISIBILITY_MODE.OWNER && actor?.ownership) {
        const defaultOwnership = actor.ownership.default

        if (defaultOwnership === CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) {
            game.users.filter((u) => !u.isGM).forEach((u) => whisper.add(u.id))
        } else {
            Object.entries(actor.ownership).forEach(([userId, level]) => {
                if (userId === 'default' || level !== CONST.DOCUMENT_OWNERSHIP_LEVELS.OWNER) return
                const user = game.users.get(userId)
                if (user && !user.isGM) {
                    whisper.add(userId)
                }
            })
        }
    }

    return Array.from(whisper)
}
