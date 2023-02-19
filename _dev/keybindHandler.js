/**
 * Omly starts listening once `init` was called
 */

class KeybindHandler {
  /**
   * @param {Array.<{codes: Number[], callback: (hotkeyObject: Object) => {}>} keybinds Array of objects representing hotkeys
   * @param {Array.<{}>=} siis
   */
  constructor(keybinds, siis) {
    this._listeners = [];
    this._activeKeys = [];
    this.hotkeys = [];
  }

  keyUp(event) {
    this.removeActiveKey(event.keyCode);
  }

  keyDown(event) {
    // esc to close notepad
    if (event.keyCode == 27) this.closeNotepad();
    if (this._activeKeys.includes(event.keyCode)) return;
    this._activeKeys.push(event.keyCode);
    let hotkeyCheck = this.checkHotkey();
    if (hotkeyCheck) this._emit(hotkeyCheck);
  }

  removeActiveKey(keyCode) {
    if (this._activeKeys.includes(undefined))
      this._activeKeys.splice(this._activeKeys.indexOf(undefined), 1);
    this._activeKeys.splice(this._activeKeys.indexOf(keyCode), 1);
  }

  /**
   *
   * @param {array} codes Array of keycodes
   * @param {function({ codes: Number[], cb: Function, index: Number })} listener Hotkey trigger callback
   */
  addHotkey(codes, listener) {
    if (!codes.length)
      throw new Error('Must provide an array of keyCodes to act as hotkey definition');
    this.hotkeys.push({ codes: codes, cb: listener, index: this.hotkeys.length });
  }

  /**
   * Returns the hotkey which was triggered or false
   */
  checkHotkey() {
    for (let i = 0; i < this.hotkeys.length; i++) {
      const hotkey = this.hotkeys[i].codes.sort().toString();
      let active = this._activeKeys.sort().toString();
      if (active === hotkey) return this.hotkeys[i];
    }
    return false;
  }

  /**
   * The keybind handler only starts listening once it was initialised
   */
  init() {
    this._registerListener('keydown', this.keyDown);
    this._registerListener('keyup', this.keyUp);
  }

  /**
   * Registers and saves a listener
   * @param {string} eventName
   * @param {function} fn
   */
  _registerListener(eventName, fn, target = window) {
    fn = fn.bind(this);
    target.addEventListener(eventName, fn);
    this._listeners.push({ name: eventName, functionRef: fn, target: target });
  }

  _removeAllListeners() {
    for (let i = 0; i < this._listeners.length; i++) {
      const { name, target, functionRef } = this.listeners[i];
      target.removeEventListener(name, functionRef);
    }
    this._listeners = [];
  }

  _emit(hotkey) {
    hotkey.cb(hotkey);
  }
}

const kbh = new KeybindHandler();
kbh.addHotkey([17, 76], hotkey => {
  console.log('ctrl+l triggered:\n', hotkey);
});
kbh.init();
