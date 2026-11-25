import { SETTING, VISIBILITY_MODE } from './config.js'
import { SocketHandler } from './socket.js'
import { getSetting } from './utils.js'

export class Logger {
    static #pending = new Map()

    static log(actor, settingKey, entry) {
        if (!actor || !entry) return
        if (getSetting(settingKey) === VISIBILITY_MODE.DISABLED) return

        let batch = Logger.#pending.get(actor.uuid)
        if (!batch) {
            batch = { items: [], timer: setTimeout(() => Logger.#flush(actor.uuid), getSetting(SETTING.BATCH_MS)) }
            Logger.#pending.set(actor.uuid, batch)
        }
        batch.items.push({ settingKey, entry })
    }

    static #flush(actorUuid) {
        const batch = Logger.#pending.get(actorUuid)
        Logger.#pending.delete(actorUuid)
        if (!batch) return

        SocketHandler.send(actorUuid, batch.items)
    }
}
