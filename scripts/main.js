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
    for (const Monitor of [ActorMonitor, ItemMonitor, EffectMonitor]) {
        try {
            new Monitor()
        } catch (err) {
            console.error(`${MODULE_ID} | Failed to start ${Monitor.name}`, err)
        }
    }
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
