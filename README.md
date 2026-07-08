# Simraki's Character Monitor

![Foundry Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FSimraki%2Fsimraki-character-monitor%2Fmaster%2Fmodule.json&label=Foundry%20Version&query=$.compatibility.verified&colorB=orange&style=for-the-badge)
![System](https://img.shields.io/badge/System-D%26D%205e-red?style=for-the-badge)

![GitHub issues](https://img.shields.io/github/issues-raw/Simraki/simraki-character-monitor?style=for-the-badge)
![Latest Release Download Count](https://img.shields.io/github/downloads/Simraki/simraki-character-monitor/latest/module.zip?color=2b82fc&label=DOWNLOADS&style=for-the-badge)
![Latest Version](https://img.shields.io/badge/dynamic/json.svg?url=https%3A%2F%2Fraw.githubusercontent.com%2FSimraki%2Fsimraki-character-monitor%2Fmaster%2Fmodule.json&label=Latest%20Release&prefix=v&query=$.version&colorB=red&style=for-the-badge)
![GitHub all releases downloads](https://img.shields.io/github/downloads/Simraki/simraki-character-monitor/total?style=for-the-badge)
![License](https://img.shields.io/badge/License-MIT-green?style=for-the-badge)

**Simraki's Character Monitor** is an advanced sheet monitoring module for **D&D5e**.

The module automatically logs critical changes made to character and NPC sheets directly into the chat, allowing the GM
to passively observe progression, inventory management, and tactical updates. It features powerful privacy controls and
filtering options to seamlessly integrate into any table's playstyle.

---

## Key Features

### Advanced Log Visibility

Every single monitored parameter can be independently configured with one of four visibility levels:

- **Disabled**: No logs will be generated for this parameter.
- **GM Only**: Messages are completely hidden from players and whispered directly to the Game Master (default).
- **GM & Token Owner**: Logs are visible to the GM and the specific player(-s) who owns that character.
- **Everyone**: Logs are posted to all players.

### NPC Sheet Monitoring

You can extend monitoring beyond standard Player Characters. The module includes an NPC Filter Mode to help
track:

- **Disabled**: Keeps tracking strictly limited to Player Character sheets.
- **Player-Controlled**: Automatically tracks any NPC that belongs to at least one player (default).
- **All**: Tracks every single NPC on the canvas (warning: may cause chat spam during heavy combat updates).

---

## What Is Monitored

When changes are made through a character sheet, the following parameters can be monitored (can be enabled or disabled):

- Current HP
- Maximum HP
- Temporary HP
- Temporary Maximum HP
- Hit Dice
- Armor Class (only if flat AC)
- XP
- Level
- Ability Scores
- Skill Proficiencies
- Saving Throw Proficiencies
- Tool Proficiencies
- Currency
- Spell Slots
- Spell Preparation
- Item Quantity
- Item Equipment
- Item Attunement
- Item Identification
- Item Charges / Uses
- Item Name Changes
- Item Description Changes (shown with old/new comparison under a spoiler)
- Active Effects (add, remove, enable, disable)
- Inspiration
- Death Save Successes and Failures
- Character Sheet Mode (Play / Edit)

*Spells and features are also included in the "Item"*

All changes are logged in a compact, color-coded format with icons for quick readability.

---

**Player Monitoring**

<img src="/media/player.jpg" />

**Item Monitoring**

<img src="/media/item.jpg" />

**Spell Monitoring**

<img src="/media/spell.jpg" />

**Effect Monitoring**

<img src="/media/effect.jpg" />

**Death Save Monitoring**

<img src="/media/death_save.jpg" />

---

## Acknowledgements

This module is based on ideas and prior work from:

- jessev14 & enso
    - https://github.com/jessev14/dnd5e-character-monitor
- Shr1mps
    - https://github.com/Shr1mps/dnd5e-character-monitor
- nschoenwald
    - https://github.com/nschoenwald/tiny-hp-monitor

---

## License

This package is under an [MIT](LICENSE) license and
the [Foundry Virtual Tabletop Limited License Agreement for module development](https://foundryvtt.com/article/license/).
