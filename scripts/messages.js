import { KIND_META, MODULE_ID } from './config.js'
import { buildEntryHtml } from './render.js'
import { actorDisplayName, getSetting, getWhisperRecipients } from './utils.js'

export const MessageWriter = {
    async post(actor, entries) {
        if (!entries.length) return []

        const name = actorDisplayName(actor)
        const data = entries.map((entry) => {
            return {
                content: buildEntryHtml(actor.uuid, name, entry),
                whisper: getWhisperRecipients(getSetting(KIND_META[entry.kind].setting), actor),
                flags: { [MODULE_ID]: { name, entry } },
            }
        })
        return foundry.documents.ChatMessage.implementation.createDocuments(data)
    },
}
