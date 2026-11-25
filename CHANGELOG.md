# Changelog

## 2.1.0 (2026-11-25)

- Verified with D&D5e 6.1.1
- New message layout (dark two-zone card). The left zone has a tooltip
- Reduced the number of color categories
- Numbers read as `old → new` followed by the delta. Hit dice, spell slots, charges and death saves read as
  fractions: `1/2 → 2/3 +1/+1`. Deltas of 10 000 and more are left out
- Item, effect and tool names are now links
- Currency uses full names instead of abbreviations
- "Old / New" spoiler is replaced by a diff
- Active effect messages no longer include the effect description.
- "Show Changed By" setting is removed.
- New client setting "Mark changes made by others"
- New client setting "Hide my changes"
- New world setting "Batch time": changes of one character are collected for this long, counted from the first one,
  and sent to the GM in a single request
- New GM context menu option "Clear monitor messages": deletes all messages of this module
- Fix label of spell preparation
- Switching a spell between prepared and always prepared is logged
- Tool proficiencies without a compendium entry are logged.
- Messages created by earlier versions keep their text but lose the module styling.
- "Nik's DnD5e Tweaks": styles for compatibility with the whisper styling

## 2.0.0 (2026-10-15)

- Support D&D5e 6.x (requires dnd5e 6+ and Foundry 14+, 5.x is no longer supported)
- Added Party (Group) sheet monitoring (new setting)
- Added 'Show Who Changed' setting
- Added 'Monitor Party Members'
- Added item container movement monitoring ('Monitor Item Container' setting)
- Fix spell slot monitoring for Pact Magic slots
- Fix level monitoring: character level changes are tracked through class levels
- Fix Polish localization: settings were not translated (wrong `name` / `hint` key case) and `Monitor Hit Dice` missing
- Item / effect names are HTML-escaped now

## 1.4.0 (2026-07-08)

- Rework settings
- Added support for tracking NPC sheets.
- NPC Filter mode (Disabled, Player-controlled, All)
- Visibility Mode (Disabled, GM Only, GM & Token Owner, Everyone)
- Refactored `BaseMonitor` and `Logger`

## 1.3.1 (2026-06-16)

- Added Polish localization by [Delgar](https://github.com/delgar89)

## 1.3.0 (2026-06-16)

- Hit Dice Monitoring
- Refactor code

## 1.2.0 (2026-04-04)

- Optimization
- Fix container (item) currency monitoring
- Hide 'Description' (spoiler) button if description is empty
- Update to FoundryVTT 14+

## 1.1.3 (2026-04-04)

- Updated to D&D5e 5.3.0
- Remove unnecessary logs during level-up
- Fix HP monitoring on level-up (tracks max HP changes)

## 1.1.2 (2026-01-31)

- Fix module version

## 1.1.1 (2026-01-31)

- Updated Russian localization
- Show item type on create/delete item events
- Replace `duplicate()` → `foundry.utils.duplicate()`
- Improve quantity change detection
- Use `fas` icon classes instead of `fa-solid`
- Minor code style & safety improvements
