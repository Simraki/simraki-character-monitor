import { MAX_NAME_CHARS, MODULE_ID } from './config.js'

export function truncateName(name) {
    if (name.length > MAX_NAME_CHARS) {
        return name.substring(0, MAX_NAME_CHARS) + '…'
    } else {
        return name
    }
}

export function getActorLink(actor) {
    const token = actor.token || actor.getActiveTokens()[0]
    const name = token?.name || actor.name
    return `@UUID[${actor.uuid}]{${truncateName(name)}}`
}

export function getDeltaText(newValue, oldValue) {
    if (typeof newValue === 'number' && typeof oldValue === 'number') {
        const delta = Math.abs(newValue - oldValue)
        const sign = newValue - oldValue > 0 ? '+' : '-'
        return `${oldValue} ${sign} ${delta} → ${newValue}`
    }
    return `${oldValue} → ${newValue}`
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

export function _loc(key) {
    return game.i18n.localize(key)
}

export function getSetting(key, Type = Boolean) {
    return Type(game.settings.get(MODULE_ID, key))
}
