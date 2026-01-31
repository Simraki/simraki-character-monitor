import { MAX_NAME_CHARS } from './config.js'

export const VALID_TYPES = ['feat', 'spell', 'consumable', 'container', 'equipment', 'loot', 'tool', 'weapon']

export function truncateName(name) {
    if (name.length > MAX_NAME_CHARS) {
        return name.substring(0, MAX_NAME_CHARS) + '...'
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

export function will(update, path) {
    return path && foundry.utils.hasProperty(update, path)
}
