import { MODULE_ID, VISIBILITY_MODE } from './config.js'
import { SocketHandler } from './socket.js'
import { getActorLink, getSetting } from './utils.js'

export class Logger {
    static async _log(template, cls, settingKey, actor) {
        const mode = getSetting(settingKey)
        if (mode === VISIBILITY_MODE.DISABLED) return

        const gmIds = game.users.filter((u) => u.isGM).map((u) => u.id)

        const whisper = new Set(gmIds)

        if (mode === VISIBILITY_MODE.OWNER && actor && actor.ownership) {
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

        if (mode === VISIBILITY_MODE.ALL) {
            whisper.clear()
        }

        const flags = { [MODULE_ID]: { cls } }
        await SocketHandler.executeAsGM('createMonitorMessage', flags, template, Array.from(whisper))
    }

    static async log(actor, text, cls, icon, settingKey) {
        const actorLink = getActorLink(actor)
        const template = `<div class="scm-line">${icon} ${actorLink} ${text}</div>`
        await Logger._log(template, cls, settingKey, actor)
    }

    static async spoilerLog(actor, text, summaryText, detailsText, cls, icon, settingKey) {
        const actorLink = getActorLink(actor)

        let template = `<div>`
        template += `<div class="scm-line">${icon} ${actorLink} ${text}</div>`
        if (detailsText) {
            template += `<details class="scm-spoiler"><summary>${summaryText}</summary><div class="spoiler-content">${detailsText}</div></details>`
        }
        template += `</div>`

        await Logger._log(template, cls, settingKey, actor)
    }
}
