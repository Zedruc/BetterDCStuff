/**
 * @name CamToggle
 * @author Zedruc
 * @version 1.0.0
 * @description Adds a hotkey to toggle your camera
 */

module.exports = class CamToggle {
    start() {
        document.addEventListener('keydown', this.handle);
        this.enabled = false;
    }
    stop() { document.removeEventListener('keydown', this.handle); }

    handle(e) {
        if (e.ctrlKey && e.shiftKey) console.log('ah');
        if (e.ctrlKey && e.shiftKey && e.key == 'C') {
            BdApi.findModuleByProps('setVideoEnabled').setVideoEnabled(!this.enabled);
            this.enabled = !this.enabled;
        }
    }
}