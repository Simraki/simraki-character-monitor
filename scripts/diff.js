export const OP = { SAME: '=', ADD: '+', DEL: '-' }

const MAX_WORD_CELLS = 250_000
const MAX_CHAR_CELLS = 40_000
const MIN_SIMILARITY = 0.5

const words = (text) =>
    String(text ?? '')
        .split(/\s+/)
        .filter(Boolean)

export function htmlToText(html) {
    let text = String(html ?? '')
    if (!text) return ''
    text = text.replace(/<\/(p|div|li|tr|h[1-6]|blockquote)>|<br\s*\/?>/gi, ' ')
    text = new DOMParser().parseFromString(text, 'text/html').body.textContent ?? ''
    return text.replace(/\s+/g, ' ').trim()
}

function lcsOps(a, b, maxCells) {
    const n = a.length
    const m = b.length
    if (n * m > maxCells) return null

    const w = m + 1
    const t = new Uint16Array((n + 1) * w)
    for (let i = n - 1; i >= 0; i--) {
        for (let j = m - 1; j >= 0; j--) {
            t[i * w + j] = a[i] === b[j] ? t[(i + 1) * w + j + 1] + 1 : Math.max(t[(i + 1) * w + j], t[i * w + j + 1])
        }
    }

    const ops = []
    let i = 0
    let j = 0
    while (i < n || j < m) {
        if (i < n && j < m && a[i] === b[j]) {
            ops.push([OP.SAME, a[i++]])
            j++
        } else if (i < n && (j >= m || t[(i + 1) * w + j] >= t[i * w + j + 1])) {
            ops.push([OP.DEL, a[i++]])
        } else {
            ops.push([OP.ADD, b[j++]])
        }
    }
    return ops
}

function refine(before, after) {
    const a = [...before]
    const b = [...after]
    const ops = lcsOps(a, b, MAX_CHAR_CELLS)
    if (!ops) return null
    const same = ops.filter(([op]) => op === OP.SAME).length
    return (2 * same) / (a.length + b.length) >= MIN_SIMILARITY ? ops : null
}

export function diffWords(before, after) {
    const a = words(before)
    const b = words(after)

    let start = 0
    while (start < a.length && start < b.length && a[start] === b[start]) start++
    let endA = a.length
    let endB = b.length
    while (endA > start && endB > start && a[endA - 1] === b[endB - 1]) {
        endA--
        endB--
    }

    const midA = a.slice(start, endA)
    const midB = b.slice(start, endB)
    const mid = lcsOps(midA, midB, MAX_WORD_CELLS) ?? [
        ...midA.map((word) => [OP.DEL, word]),
        ...midB.map((word) => [OP.ADD, word]),
    ]
    const flat = [
        ...a.slice(0, start).map((word) => [OP.SAME, word]),
        ...mid,
        ...a.slice(endA).map((word) => [OP.SAME, word]),
    ]

    const runs = []
    let add = 0
    let del = 0
    for (const [op, word] of flat) {
        if (op === OP.ADD) add++
        if (op === OP.DEL) del++
        const last = runs[runs.length - 1]
        if (last && last[0] === op) last[1] += ` ${word}`
        else runs.push([op, word])
    }

    const ops = []
    const push = (op, text) => {
        if (!text) return
        const last = ops[ops.length - 1]
        if (last && last[0] === op) last[1] += text
        else ops.push([op, text])
    }
    for (let k = 0; k < runs.length; k++) {
        const [op, text] = runs[k]
        if (k) push(OP.SAME, ' ')
        const next = runs[k + 1]
        if (op === OP.DEL && next?.[0] === OP.ADD) {
            const chars = refine(text, next[1])
            if (chars) chars.forEach(([o, t]) => push(o, t))
            else {
                push(OP.DEL, text)
                push(OP.SAME, ' ')
                push(OP.ADD, next[1])
            }
            k++
            continue
        }
        push(op, text)
    }
    return { ops, add, del }
}
