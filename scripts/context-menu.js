import { MODULE_ID } from './config.js'

export function addContextOptions(app, menuItems) {
    if (!Array.isArray(menuItems)) return
    menuItems.push({
        label: _loc(`${MODULE_ID}.ContextMenu.Clear`),
        icon: 'fa-solid fa-broom',
        visible: (target) => game.user.isGM && target.classList.contains('scm-msg'),
        onClick: () => clearAll(),
    })
}

async function clearAll() {
    if (!game.user.isGM) return
    const ids = game.messages.contents.filter((message) => message.flags?.[MODULE_ID]).map((message) => message.id)
    if (!ids.length) return
    const confirmed = await foundry.applications.api.DialogV2.confirm({
        window: { title: _loc(`${MODULE_ID}.ContextMenu.Clear`) },
        content: `<p>${_loc(`${MODULE_ID}.ContextMenu.ClearConfirm`, { count: ids.length })}</p>`,
    })
    if (!confirmed) return
    await foundry.documents.ChatMessage.implementation.deleteDocuments(ids)
}
