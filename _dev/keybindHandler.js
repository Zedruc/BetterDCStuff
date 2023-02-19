/**
 * Only starts listening once `init` was called
 */

class KeybindHandler {
  #_listeners = [];
  #_activeKeys = [];
  #hotkeys = [];
  /**
   * @param {Array.<{name: String, codes: Number[], callback: (hotkeyObject: Object) => {}>=} keybinds Array of objects representing hotkeys
   */
  constructor(keybinds) {
    if (keybinds?.length) {
      for (let i = 0; i < keybinds.length; i++) {
        const keybind = keybinds[i];
        this.addHotkey(keybind.name, keybind.codes, keybind.callback);
      }
    }
  }

  /**
   * @param {string} name Name of the keybind
   * @param {array} codes Array of keycodes
   * @param {function({ codes: Number[], cb: Function, index: Number })} listener Hotkey trigger callback
   * @returns {{name: string, codes: number[], cb: Function, index: number, modifiyHotkey: Function(name: string, codes: number[])}}
   */
  addHotkey(name, codes, listener) {
    if (!codes.length)
      throw new Error('Must provide an array of keyCodes to act as hotkey definition');
    for (let i = 0; i < this.#hotkeys.length; i++) {
      const hotkey = this.#hotkeys[i];
      if (hotkey.name === name) throw new Error(`Hotkey with name "${name}" already exists`);
    }
    const keybind = {
      name: name,
      codes: codes,
      cb: listener,
      index: this.#hotkeys.length,
      modifiyKeycodes: this.#_modifyHotkey.bind(
        Object.assign(this, { index: this.#hotkeys.length })
      ),
    };
    this.#hotkeys.push(keybind);
    return keybind;
  }

  /**
   * The keybind handler only starts listening once it was initialised
   */
  init() {
    this.#_registerListener('keydown', this.#_keyDown);
    this.#_registerListener('keyup', this.#_keyUp);
  }

  /**
   * Searches for a hotkey by name. Returns undefined if none is found
   * @param {string} name - Name of the keybind
   * @returns {(Hotkey|undefined)}
   */
  getKeybindByName(name) {
    for (let i = 0; i < this.#hotkeys.length; i++) {
      const hotkey = this.#hotkeys[i];
      if (hotkey.name === name) return hotkey;
    }
    return null;
  }

  #_keyUp(event) {
    this.#_removeActiveKey(event.keyCode);
  }

  #_keyDown(event) {
    if (this.#_activeKeys.includes(event.keyCode)) return;
    this.#_activeKeys.push(event.keyCode);
    let hotkeyCheck = this.#_checkHotkey();
    if (hotkeyCheck) this.#_emit(hotkeyCheck);
  }

  #_removeActiveKey(keyCode) {
    if (this.#_activeKeys.includes(undefined))
      this.#_activeKeys.splice(this.#_activeKeys.indexOf(undefined), 1);
    this.#_activeKeys.splice(this.#_activeKeys.indexOf(keyCode), 1);
  }

  /**
   * Returns the hotkey which was triggered or false
   */
  #_checkHotkey() {
    for (let i = 0; i < this.#hotkeys.length; i++) {
      const hotkey = this.#hotkeys[i].codes.sort().toString();
      let active = this.#_activeKeys.sort().toString();
      if (active === hotkey) return this.#hotkeys[i];
    }
    return false;
  }

  /**
   * Registers and saves a listener
   * @param {string} eventName
   * @param {function} fn
   */
  #_registerListener(eventName, fn, target = window) {
    fn = fn.bind(this);
    target.addEventListener(eventName, fn);
    this.#_listeners.push({ name: eventName, functionRef: fn, target: target });
  }

  #_emit(hotkey) {
    hotkey.cb(hotkey);
  }

  /**
   * Modifies a hotkey's keycodes
   * @param {number[]} newCodes - New keycodes for the hotkey
   * @returns New hotkey object
   */
  #_modifyHotkey(newCodes) {
    console.log(this);
    let hotkeyToModify = this.#hotkeys[this.index];
    if (!hotkeyToModify) throw new Error(`Hotkey with index ${index} could not be found`);
    if (!newCodes?.length)
      throw new Error('Must define a new array of keycodes to assign to the hotkey');

    hotkeyToModify.codes = newCodes;
    this.#hotkeys[this.index] = hotkeyToModify;
    return this.#hotkeys[this.index];
  }
}

const keybinds = [
  {
    name: 'ctrl+l',
    codes: [17, 76],
    callback: hotkey => {
      console.log('ctrl+l triggered:\n', hotkey);
    },
  },
  {
    name: 'ctrl+k',
    codes: [17, 75],
    callback: hotkey => {
      console.log('ctrl+k triggered:\n', hotkey);
    },
  },
  {
    name: 'ctrl+j',
    codes: [17, 74],
    callback: hotkey => {
      console.log('ctrl+j triggered:\n', hotkey);
    },
  },
  {
    name: 'ctrl+h',
    codes: [17, 72],
    callback: hotkey => {
      console.log('ctrl+h triggered:\n', hotkey);
    },
  },
];

const kbh = new KeybindHandler(keybinds);
kbh.init();
