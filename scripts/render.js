import { BIG_DELTA, KIND_META, MODULE_ID } from './config.js'
import { OP } from './diff.js'
import { escapeHtml, shortName, uuidLink } from './utils.js'

const CONTEXT_WORDS = 8
const MIN_HIDDEN_WORDS = 4

/*
 * Builds markup of one monitor message: one change of one actor, in two zones
 *   .scm-zone   left: category color, icon, short actor name
 *   .scm-main   right: change itself
 *   .scm-spoil  optional description diff, opened with a toggle that hydrate.js adds
 */

function directionOf(entry) {
    const delta = entry.new - entry.old || (entry.max ?? 0) - (entry.oldMax ?? entry.max ?? 0)
    if (!delta) return ''
    return delta > 0 !== !!KIND_META[entry.kind].inv ? 'up' : 'down'
}

function formatNumber(value) {
    if (!Number.isFinite(value)) return String(value)
    return Math.round(value * 100) / 100
}

function formatDelta(delta) {
    if (!delta) return '0'
    return `${delta > 0 ? '+' : '-'}${formatNumber(Math.abs(delta))}`
}

const link = (ref, label) => escapeHtml(ref ? uuidLink(ref, label) : label)

/**
 * Values and delta of a numeric change.
 *   pools:  `1/2 → 2/2 +1`, `1/2 → 1/3 0/+1`, `1/2 → 2/3 +1/+1`
 */
function numberParts(entry) {
    const pool = !!KIND_META[entry.kind]?.pool && Number.isFinite(entry.max) && (entry.max > 0 || entry.oldMax > 0)
    const oldMax = entry.oldMax ?? entry.max
    const old = pool ? `${formatNumber(entry.old)}/${formatNumber(oldMax)}` : formatNumber(entry.old)
    const now = pool ? `${formatNumber(entry.new)}/${formatNumber(entry.max)}` : formatNumber(entry.new)

    const dv = entry.new - entry.old
    const dm = pool ? entry.max - oldMax : 0

    let delta
    if (Math.abs(dv) >= BIG_DELTA) {
        delta = ''
    } else if (dm) {
        delta = `${formatDelta(dv)}/${formatDelta(dm)}`
    } else {
        delta = formatDelta(dv)
    }
    return { old, now, delta }
}

function transValue(text, ref) {
    return ref ? link(ref, text) : escapeHtml(text || '-')
}

function splitContext(text, head, tail) {
    const parts = text.split(/(\s+)/)
    const wordAt = parts.flatMap((part, index) => (part && !/^\s+$/.test(part) ? [index] : []))
    if (wordAt.length < head + tail + MIN_HIDDEN_WORDS) return null
    const from = head ? wordAt[head - 1] + 1 : 0
    const to = tail ? wordAt[wordAt.length - tail] : parts.length
    return [parts.slice(0, from).join(''), parts.slice(from, to).join(''), parts.slice(to).join('')]
}

function diffHtml(diff) {
    const last = diff.ops.length - 1
    const showFull = `${MODULE_ID}.ChatMessage.ShowFull`
    return diff.ops
        .map(([op, text], index) => {
            if (op === OP.ADD) return `<ins>${escapeHtml(text)}</ins>`
            if (op === OP.DEL) return `<del>${escapeHtml(text)}</del>`

            const head = index === 0 ? 0 : CONTEXT_WORDS
            const tail = index === last ? 0 : CONTEXT_WORDS
            const split = last > 0 && splitContext(text, head, tail)
            if (!split) return escapeHtml(text)

            const [before, hidden, after] = split
            const mark = head && tail ? ' … ' : head ? ' …' : '… '
            return (
                escapeHtml(before) +
                `<span class="scm-gap" tabindex="0" data-tooltip="${showFull}" aria-label="${escapeHtml(_loc(showFull))}">${mark}</span>` +
                `<span class="scm-more">${escapeHtml(hidden)}</span>` +
                escapeHtml(after)
            )
        })
        .join('')
}

function mainHtml(entry) {
    const meta = KIND_META[entry.kind]
    const label = link(entry.ref, entry.label)

    switch (meta.type) {
        case 'num': {
            const { old, now, delta } = numberParts(entry)
            const dir = directionOf(entry)
            return (
                `<span class="scm-text">${label}</span>` +
                `<span class="scm-nums"${dir ? ` data-dir="${dir}"` : ''}>` +
                `<span class="scm-val"><span class="scm-old">${old} →</span> <b class="scm-now">${now}</b></span>` +
                `${delta ? `<b class="scm-delta">${delta}</b>` : ''}</span>`
            )
        }
        case 'trans':
            return (
                `<span class="scm-text">${label}: <span class="scm-old">${transValue(entry.from, entry.fromRef)} →</span> ` +
                `<b class="scm-now">${transValue(entry.to, entry.toRef)}</b></span>`
            )
        case 'state':
            return `<span class="scm-text">${label}</span><span class="scm-nums"><span class="scm-state">${escapeHtml(entry.text)}</span></span>`
        default:
            return `<span class="scm-text">${label} <span class="scm-soft">${_loc(`${MODULE_ID}.ChatMessage.DescriptionChanged`)}</span></span>`
    }
}

export function buildEntryHtml(actorUuid, actorName, entry) {
    const meta = KIND_META[entry.kind]
    const actorLink = escapeHtml(uuidLink(actorUuid, actorName, shortName))
    const zone =
        `<div class="scm-zone"><i class="scm-icon fa-solid ${meta.icon}" aria-hidden="true"></i>` +
        `<span class="scm-name">${actorLink}</span></div>`
    const spoil = meta.type === 'diff' ? `<div class="scm-spoil">${diffHtml(entry.diff)}</div>` : ''
    return (
        `<div class="scm-card" data-cat="${meta.cat}" data-kind="${entry.kind}">` +
        `${zone}<div class="scm-main">${mainHtml(entry)}</div>${spoil}</div>`
    )
}
