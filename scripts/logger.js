import { icons, MODULE_ID } from './config.js';
import { SocketHandler } from './socket.js';


export class Logger {
    static async logFlat(actorLink, text, cls, icon) {
        const defIcon = icons.def;
        const template = `<div class="cm-line">${icon ?? defIcon} ${actorLink} ${text}</div>`;

        const flags = { [MODULE_ID]: { cls } };

        const whisper = game.users.filter(u => u.isGM).map(u => u.id);

        await SocketHandler.executeAsGM('createMonitorMessage', flags, template, whisper);
    }

    static async logWithSpoiler(actorLink, text, summaryText, detailsText, cls, icon) {
        const defIcon = icons.def;
        const template = `
                        <div>
                            <div class="cm-line">${icon ?? defIcon} ${actorLink} ${text}</div>
                            <details class="cm-spoiler">
                              <summary>${summaryText}</summary>
                              <div class="spoiler-content">${detailsText}</div>
                            </details>
                        </div>
                        `;

        const flags = { [MODULE_ID]: { cls } };

        const whisper = game.users.filter(u => u.isGM).map(u => u.id);

        await SocketHandler.executeAsGM('createMonitorMessage', flags, template, whisper);
    }
}
