import { registerSettings } from './settings.js'
import { SocketHandler } from './socket.js'
import { ActorMonitor } from './monitors/actor.js'
import { MODULE_ID } from './config.js'
import { ItemMonitor } from './monitors/item.js'
import { EffectMonitor } from './monitors/effect.js'

Hooks.once('init', async () => {
    registerSettings()
    // eslint-disable-next-line no-console
    console.log(`[${MODULE_ID}] initialized.`)
})

Hooks.once('ready', () => {
    new ActorMonitor()
    new ItemMonitor()
    new EffectMonitor()
})

SocketHandler.init()

Hooks.on('renderChatMessageHTML', (msg, html, appData) => {
    if (!msg.flags[MODULE_ID] || !html) return
    html.classList.add('scm-msg')
    const cls = msg.getFlag(MODULE_ID, 'cls')
    if (cls) {
        html.classList.add(cls)
    }
})
