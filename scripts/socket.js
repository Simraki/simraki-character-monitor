import { MODULE_ID } from './config.js'

export class SocketHandler {
    static socket = null

    static init() {
        Hooks.once('socketlib.ready', () => {
            this.socket = socketlib.registerModule(MODULE_ID)
            this.socket.register('createMonitorMessage', this.createMessage)
        })
    }

    static createMessage(flags, content, whisper) {
        return ChatMessage.create({ flags, content, whisper })
    }

    static async executeAsGM(handler, ...args) {
        if (!this.socket) {
            console.error(`${MODULE_ID} | Socket not initialized`)
            return
        }
        return await this.socket.executeAsGM(handler, ...args)
    }
}
