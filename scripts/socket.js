import { LOGGABLE_SETTINGS, MODULE_ID, VISIBILITY_MODE } from './config.js'
import { sanitizeEntry } from './entries.js'
import { MessageWriter } from './messages.js'
import { getSetting, isMonitoredActor } from './utils.js'

const HANDLER_NAME = 'appendMonitorEntries'
const ALLOWED_SETTINGS = new Set(LOGGABLE_SETTINGS)

export class SocketHandler {
    static socket = null

    static init() {
        Hooks.once('socketlib.ready', () => {
            this.socket = socketlib.registerModule(MODULE_ID)
            this.socket.register(HANDLER_NAME, function (payload) {
                return SocketHandler.ingest(this?.socketdata?.userId, payload)
            })
        })
    }

    static async send(actorUuid, items) {
        const payload = { actorUuid, items }
        try {
            const activeGM = game.users.activeGM
            if (!activeGM) return
            if (activeGM.id === game.user.id) return await SocketHandler.ingest(game.user.id, payload)
            if (!this.socket) return console.error(`${MODULE_ID} | Socket not initialized`)
            await this.socket.executeAsGM(HANDLER_NAME, payload)
        } catch (err) {
            console.error(`${MODULE_ID} | Could not send monitor entries to the GM`, err)
        }
    }

    static async ingest(senderId, payload) {
        try {
            const sender = senderId ? game.users.get(senderId) : null
            if (!sender) {
                SocketHandler.#reject('unknown sender', senderId)
                return
            }
            if (!payload || typeof payload !== 'object') {
                SocketHandler.#reject('invalid payload', senderId)
                return
            }

            const { actorUuid, items } = payload
            if (typeof actorUuid !== 'string' || !actorUuid) {
                SocketHandler.#reject('invalid actor uuid', senderId)
                return
            }

            if (!Array.isArray(items) || !items.length) {
                SocketHandler.#reject('invalid items', senderId)
                return
            }

            const actor = await foundry.utils.fromUuid(actorUuid)
            if (!isMonitoredActor(actor)) {
                SocketHandler.#reject('actor is not monitored', senderId)
                return
            }
            if (!sender.isGM && !actor.testUserPermission(sender, 'OWNER')) {
                SocketHandler.#reject('sender does not own the actor', senderId)
                return
            }

            const ts = Date.now()
            const entries = []
            for (const item of items) {
                const settingKey = item?.settingKey
                if (!ALLOWED_SETTINGS.has(settingKey)) continue
                if (getSetting(settingKey) === VISIBILITY_MODE.DISABLED) continue

                const entry = sanitizeEntry(item.entry, settingKey)
                if (!entry) {
                    SocketHandler.#reject('invalid entry', senderId)
                    continue
                }
                entry.ts = ts
                entry.by = sender.id
                entries.push(entry)
            }
            if (entries.length) {
                await MessageWriter.post(actor, entries)
            }
        } catch (err) {
            console.error(`${MODULE_ID} | Failed to handle monitor entries`, err)
        }
    }

    static #reject(reason, senderId) {
        console.error(`${MODULE_ID} | Rejected monitor entries from user "${senderId}": ${reason}`)
    }
}
