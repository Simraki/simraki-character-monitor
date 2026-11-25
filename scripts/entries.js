import { KIND_META, LIMITS } from './config.js'
import { OP } from './diff.js'

const str = (value, max) => (typeof value === 'string' ? value.slice(0, max) : undefined)
const num = (value) => (Number.isFinite(value) ? value : undefined)

function sanitizeDiff(raw) {
    if (!raw || !Array.isArray(raw.ops)) return null
    const ops = []
    for (const op of raw.ops) {
        if (!Array.isArray(op) || ![OP.SAME, OP.ADD, OP.DEL].includes(op[0]) || typeof op[1] !== 'string') return null
        ops.push(op)
    }
    const count = (value) => (Number.isInteger(value) && value >= 0 && value <= 1e6 ? value : 0)
    return { ops, add: count(raw.add), del: count(raw.del) }
}

/**
 * Validates an entry that came from a client: unknown fields are dropped, limits are enforced.
 * @param {object} raw
 * @param {string} settingKey The visibility setting the entry was sent under.
 * @returns {object|null} A clean entry, or null if it is not acceptable.
 */
export function sanitizeEntry(raw, settingKey) {
    if (!raw || typeof raw !== 'object') return null
    const meta = KIND_META[raw.kind]
    if (!meta || meta.setting !== settingKey) return null

    const label = str(raw.label, LIMITS.LABEL)
    if (!label) return null

    const entry = { kind: raw.kind, key: str(raw.key, LIMITS.KEY) || raw.kind, label }
    for (const field of ['ref', 'fromRef', 'toRef']) {
        const value = typeof raw[field] === 'string' ? raw[field] : undefined
        if (value) entry[field] = raw[field]
    }

    switch (meta.type) {
        case 'num':
            entry.old = num(raw.old)
            entry.new = num(raw.new)
            if (entry.old === undefined || entry.new === undefined) return null
            for (const field of ['max', 'oldMax']) {
                const value = num(raw[field])
                if (value !== undefined) entry[field] = value
            }
            break
        case 'trans':
            entry.from = str(raw.from, LIMITS.TEXT)
            entry.to = str(raw.to, LIMITS.TEXT)
            if (entry.from === undefined || entry.to === undefined) return null
            break
        case 'state':
            entry.text = str(raw.text, LIMITS.TEXT)
            if (!entry.text) return null
            if (typeof raw.on === 'boolean') entry.on = raw.on
            break
        default:
            entry.diff = sanitizeDiff(raw.diff)
            if (!entry.diff) return null
    }
    return entry
}

/* builders used by monitors */
export function numeric(kind, key, label, old, value, extra = {}) {
    return { kind, key, label, old, new: value, ...extra }
}

export function transition(kind, key, label, from, to, extra = {}) {
    return { kind, key, label, from: String(from ?? ''), to: String(to ?? ''), ...extra }
}

export function state(kind, key, label, text, extra = {}) {
    return { kind, key, label, text, ...extra }
}
