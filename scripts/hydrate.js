import { MODULE_ID, SETTING } from './config.js'
import { escapeHtml, getSetting } from './utils.js'

export function hydrateMessage(message, element) {
    const flags = message.flags?.[MODULE_ID]
    if (!element || !flags?.entry || typeof flags.entry !== 'object') return
    element.classList.add('scm-msg')
    decorate(element, flags)
}

function tooltipHtml(flags, author) {
    const lines = [flags.name]
    if (author) {
        const name = author.isGM ? `${author.name} (${_loc(`${MODULE_ID}.ChatMessage.GM`)})` : author.name
        lines.push(_loc(`${MODULE_ID}.ChatMessage.ChangedBy`, { name }))
    }
    if (flags.entry.ts) {
        lines.push(new Date(flags.entry.ts).toLocaleString(game.i18n.lang, { dateStyle: 'short', timeStyle: 'short' }))
    }
    return lines
        .filter(Boolean)
        .map((line) => escapeHtml(line))
        .join('<br>')
}

function setTooltip(element, html) {
    element.dataset.tooltipHtml = html
    element.dataset.tooltipDirection = 'DOWN'
}

function decorate(element, flags) {
    const card = element.querySelector('.scm-card')
    const zone = card?.querySelector('.scm-zone')
    if (!zone) return
    const doc = element.ownerDocument
    const { entry } = flags
    const author = game.users.get(entry.by)

    card.querySelectorAll('.scm-by, .scm-tog').forEach((node) => node.remove())

    element.classList.toggle('scm-own-hidden', !!author?.isSelf && getSetting(SETTING.HIDE_OWN) === true)

    // tooltip
    setTooltip(zone, tooltipHtml(flags, author))

    // actor link
    const link = zone.querySelector('.scm-name a')
    if (link && flags.name) setTooltip(link, escapeHtml(flags.name))

    // someone's else changes icon
    if (author && !author.isSelf && getSetting(SETTING.SHOW_AUTHOR_MARK)) {
        const mark = doc.createElement('span')
        mark.className = 'scm-by'
        mark.setAttribute('aria-hidden', 'true')
        mark.innerHTML = `<i class="fa-solid ${author.isGM ? 'fa-crown' : 'fa-user-pen'}"></i>`
        zone.append(mark)
    }

    const spoil = card.querySelector('.scm-spoil')
    const main = card.querySelector('.scm-main')
    if (!spoil || !main) return

    const open = card.classList.contains('is-open')
    const toggle = doc.createElement('button')
    toggle.type = 'button'
    toggle.className = 'scm-tog'
    toggle.setAttribute('aria-expanded', String(open))
    toggle.setAttribute('aria-label', _loc(`${MODULE_ID}.ChatMessage.DescriptionChanged`))
    toggle.innerHTML = '<i class="fa-solid fa-chevron-down" aria-hidden="true"></i>'
    toggle.addEventListener('click', (event) => {
        event.preventDefault()
        event.stopPropagation()

        const next = card.classList.toggle('is-open')
        toggle.setAttribute('aria-expanded', String(next))
        if (!next) spoil.classList.remove('is-full')
    })
    main.append(toggle)

    const reveal = (event) => {
        if (!event.target.closest('.scm-gap')) return
        if (event.type === 'keydown' && event.key !== 'Enter' && event.key !== ' ') return
        event.preventDefault()
        event.stopPropagation()
        spoil.classList.add('is-full')
    }
    spoil.addEventListener('click', reveal)
    spoil.addEventListener('keydown', reveal)
}
