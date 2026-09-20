# Changelog

## 2.0.0 (2026-09-23)

- Support D&D5e 6.x (requires dnd5e 6+ and Foundry 14+, 5.x is no longer supported)
- Added Party (Group) sheet monitoring (new setting)
- Added 'Show Who Changed' setting
- Added 'Monitor Party Members'
- Added item container movement monitoring ('Monitor Item Container' setting)
- Fix spell slot monitoring for Pact Magic slots
- Fix level monitoring: character level changes are tracked through class levels
- Fix Polish localization: settings were not translated (wrong `name` / `hint` key case) and `Monitor Hit Dice` missing
- Item / effect names are HTML-escaped now
- AC monitoring now also tracks calculation mode

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
