import { icons, MODULE_ID } from './config.js'
import { SocketHandler } from './socket.js'

export class Logger {
    static async _log(template, cls) {
        const flags = { [MODULE_ID]: { cls } }
        const whisper = game.users.filter((u) => u.isGM).map((u) => u.id)
        await SocketHandler.executeAsGM('createMonitorMessage', flags, template, whisper)
    }

    static async log(actorLink, text, cls, icon = icons.def) {
        const template = `<div class="scm-line">${icon} ${actorLink} ${text}</div>`
        await Logger._log(template, cls)
    }

    static async spoilerLog(actorLink, text, summaryText, detailsText, cls, icon = icons.def) {
        let template = `<div>`
        template += `<div class="scm-line">${icon} ${actorLink} ${text}</div>`
        if (detailsText) {
            template += `<details class="scm-spoiler"><summary>${summaryText}</summary><div class="spoiler-content">${detailsText}</div></details>`
        }
        template += `</div>`

        await Logger._log(template, cls)
    }
}
