import { classes, LOGGABLE_SETTINGS, MODULE_ID, SCM_CHANGED_BY_HTML_TAG, SETTING, VISIBILITY_MODE } from './config.js'
import { getSetting, getWhisperRecipients, isMonitoredActor } from './utils.js'

const HANDLER_NAME = 'createMonitorMessage'

const ALLOWED_CLASSES = new Set(Object.values(classes))
const ALLOWED_SETTINGS = new Set(LOGGABLE_SETTINGS)

const MAX_CONTENT_LENGTH = 100_000
const MAX_UUID_LENGTH = 200

const RATE_LIMIT_WINDOW_MS = 10_000
const RATE_LIMIT_MAX = 100

export class SocketHandler {
    static socket = null

    static #rate = new Map()

    static init() {
        Hooks.once('socketlib.ready', () => {
            this.socket = socketlib.registerModule(MODULE_ID)
            this.socket.register(HANDLER_NAME, function (payload) {
                return SocketHandler.#createMessage(this?.socketdata?.userId, payload)
            })
        })
    }

    static async sendMessage(payload) {
        if (!this.socket) {
            console.error(`${MODULE_ID} | Socket not initialized`)
            return
        }

        try {
            await this.socket.executeAsGM(HANDLER_NAME, payload)
        } catch (err) {
            console.error(`${MODULE_ID} | Could not send monitor message to the GM`, err)
        }
    }

    static async #createMessage(senderId, payload) {
        try {
            const sender = senderId ? game.users.get(senderId) : null
            if (!sender) {
                SocketHandler.#reject('unknown sender', senderId)
                return
            }

            if (!SocketHandler.#allowRate(senderId)) {
                SocketHandler.#reject('rate limit exceeded', senderId)
                return
            }

            if (!payload || typeof payload !== 'object') {
                SocketHandler.#reject('invalid payload', senderId)
                return
            }

            const { actorUuid, settingKey, cls, content } = payload
            if (typeof actorUuid !== 'string' || !actorUuid || actorUuid.length > MAX_UUID_LENGTH) {
                SocketHandler.#reject('invalid actor uuid', senderId)
                return
            }
            if (!ALLOWED_SETTINGS.has(settingKey)) {
                SocketHandler.#reject('invalid setting', senderId)
                return
            }
            if (cls !== undefined && !ALLOWED_CLASSES.has(cls)) {
                SocketHandler.#reject('invalid css class', senderId)
                return
            }
            if (typeof content !== 'string' || !content || content.length > MAX_CONTENT_LENGTH) {
                SocketHandler.#reject('invalid content', senderId)
                return
            }

            let changedByTag = ''
            if (getSetting(SETTING.SHOW_CHANGED_BY)) {
                const text = game.i18n.format(`${MODULE_ID}.ChatMessage.ChangedBy`, { name: sender.name })
                changedByTag = `<span class="scm-changed-by">${text}</span>`
            }
            const transformedContent = content.replace(SCM_CHANGED_BY_HTML_TAG, changedByTag)

            const actor = await fromUuid(actorUuid)
            if (!isMonitoredActor(actor)) {
                SocketHandler.#reject('actor is not monitored', senderId)
                return
            }

            if (!sender.isGM && !actor.testUserPermission(sender, 'OWNER')) {
                SocketHandler.#reject('sender does not own the actor', senderId)
                return
            }

            const mode = getSetting(settingKey)
            if (mode === VISIBILITY_MODE.DISABLED) return
            const whisper = getWhisperRecipients(mode, actor)

            await ChatMessage.create({
                content: foundry.utils.cleanHTML(transformedContent),
                whisper,
                flags: { [MODULE_ID]: { cls } },
            })
        } catch (err) {
            console.error(`${MODULE_ID} | Failed to create monitor message`, err)
        }
    }

    static #allowRate(userId) {
        const now = Date.now()
        const entry = SocketHandler.#rate.get(userId)
        if (!entry || now - entry.start > RATE_LIMIT_WINDOW_MS) {
            SocketHandler.#rate.set(userId, { start: now, count: 1 })
            return true
        }
        entry.count++
        return entry.count <= RATE_LIMIT_MAX
    }

    static #reject(reason, senderId) {
        console.error(`${MODULE_ID} | Rejected monitor message from user "${senderId}": ${reason}`)
    }
}
