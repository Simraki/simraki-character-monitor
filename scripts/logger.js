import { SCM_CHANGED_BY_HTML_TAG, VISIBILITY_MODE } from './config.js'
import { SocketHandler } from './socket.js'
import { escapeHtml, getActorLink, getSetting } from './utils.js'

export class Logger {
    static async log(actor, text, cls, icon, settingKey) {
        if (!actor) return
        await Logger.#log(actor, settingKey, cls, icon, escapeHtml(text))
    }

    static async spoilerLog(actor, text, summaryText, detailsText, cls, icon, settingKey) {
        if (!actor) return

        let body = escapeHtml(text)
        if (detailsText) {
            body += `<details class="scm-spoiler"><summary>${escapeHtml(summaryText)}</summary><div class="spoiler-content">${detailsText}</div></details>`
        }
        await Logger.#log(actor, settingKey, cls, icon, body)
    }

    static async #log(actor, settingKey, cls, icon, bodyHtml) {
        if (getSetting(settingKey) === VISIBILITY_MODE.DISABLED) return

        const content =
            `<div class="scm-header">${getActorLink(actor)}${SCM_CHANGED_BY_HTML_TAG}</div>` +
            `<div class="scm-body"><span class="scm-icon">${icon}</span><span class="scm-content">${bodyHtml}</span></div>`

        await SocketHandler.sendMessage({ actorUuid: actor.uuid, settingKey, content, cls: cls ?? undefined })
    }
}
