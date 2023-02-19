

## _Dev

Some scripts/functionalities I made to copy paste in case they're needed for a plugin

### [`KeybindHandler(keybinds?)`](https://github.com/Zedruc/BetterDCStuff/blob/dev/_dev/keybindHandler.js)

Utility class used to register custom hotkeys

<ins>Methods:</ins>
* `addHotkey(codes[], callback): void`
* `init(): void`

<ins>Notice:</ins>  
Only <ins>AFTER</ins> `#init` has been called, the handler starts listening for hotkeys
