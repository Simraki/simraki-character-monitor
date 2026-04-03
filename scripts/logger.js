import { icons, MODULE_ID } from './config.js'
import { SocketHandler } from './socket.js'

export class Logger {
    static async log(template, cls) {
        const flags = { [MODULE_ID]: { cls } }

        const whisper = game.users.filter((u) => u.isGM).map((u) => u.id)

        await SocketHandler.executeAsGM('createMonitorMessage', flags, template, whisper)
    }

    static async logFlat(actorLink, text, cls, icon = icons.def) {
        const template = `<div class="cm-line">${icon} ${actorLink} ${text}</div>`
        await Logger.log(template, cls)
    }

    static async logWithSpoiler(actorLink, text, summaryText, detailsText, cls, icon = icons.def) {
        let template = `<div><div class="cm-line">${icon} ${actorLink} ${text}</div>`
        if (detailsText) {
            template += `<details class="cm-spoiler"><summary>${summaryText}</summary><div class="spoiler-content">${detailsText}</div></details>`
        }
        template += '</div>'
        await Logger.log(template, cls)
    }
}
