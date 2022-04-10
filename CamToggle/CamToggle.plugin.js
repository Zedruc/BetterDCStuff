/**
 * @name CamToggle
 * @author Zedruc
 * @version 1.0.1
 * @description Adds a hotkey to toggle your camera
 */

const config = {
    info: {
        name: 'CamToggle',
        authors: [{
            name: 'Zedruc',
            discord_id: '568729687291985930',
        }],
        version: '1.0.0',
        description: 'Adds a hotkey do toggle your camera',
        github: 'https://github.com/Zedruc/BetterDCStuff',
        github_raw: 'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/main/CamToggle/CamToggle.plugin.js',
    }/* ,
     changelog: [{
         title: 'NEW',
         type: 'added',
         items: ['New Feature'],
     }] */
};

module.exports = !global.ZeresPluginLibrary
    ? class {
        constructor() { this._config = config; }
        load() {
            BdApi.showConfirmationModal('Library plugin is needed', `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`, {
                confirmText: 'Download',
                cancelText: 'Cancel',
                onConfirm: () => {
                    request.get('https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js', (error, response, body) => {
                        if (error) return electron.shell.openExternal('https://betterdiscord.app/Download?id=9');
                        fs.writeFileSync(path.join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'), body);
                    });
                }
            });
        }
        start() {
            this.load();
        }
        stop() { }
    }
    : (([Plugin, Library]) => {
        const { PluginUpdater, Settings, DiscordModules } = Library;
        PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.github_raw);

        var enabled;
        var keysPressed = {};
        var keyCombo = BdApi.getData(config.info.name, 'keyCodes') || [162 /* 17 */, 160 /* 16 */, 67];
        const camera = BdApi.findModuleByProps('setVideoEnabled');

        return class CamToggle extends Plugin {
            onStart() {
                document.addEventListener('keydown', this.handleDown);
                document.addEventListener('keyup', this.handleUp);
                enabled = this.getVideoEnabled();
            }
            onStop() {
                camera.setVideoEnabled(false); // make sure it's always off to prevent awkward moments 2
                BdApi.showToast('Toggled camera off', { type: 'info' });
                document.removeEventListener('keydown', this.handleDown);
                document.removeEventListener('keyup', this.handleUp);
            }

            handleDown(e) {
                /* BdApi.findModuleByProps('setVideoEnabled').setVideoEnabled(Boolean) */
                if (e.repeat) return;

                var keyCode = e.keyCode;
                if (keyCode === 16) keyCode = 160;
                if (keyCode === 17) keyCode = 162
                if (keyCode === 18) keyCode = 164;

                keysPressed[keyCode] = true;
                var isRightKeyCombo = true;

                for (let i = 0; i < keyCombo.length; i++) {
                    const keyComboKey = keyCombo[i];
                    if (!keysPressed[keyComboKey]) isRightKeyCombo = false;
                }

                if (isRightKeyCombo) {
                    if (!DiscordModules.SelectedChannelStore.getVoiceChannelId()) {
                        camera.setVideoEnabled(false); // make sure it's always off to prevent awkward moments
                        return BdApi.showToast('You must be in a voice channel to toggle your camera', { type: 'error' });
                    }
                    camera.setVideoEnabled(!enabled);
                    enabled = !enabled;
                    BdApi.showToast(`${enabled ? 'Enabled' : 'Disabled'} the camera`, { type: 'info' });
                }
            }

            handleUp(e) {
                var keyCode = e.keyCode;
                if (keyCode === 16) keyCode = 160;
                if (keyCode === 17) keyCode = 162
                if (keyCode === 18) keyCode = 164;

                delete keysPressed[keyCode];
            }

            getVideoEnabled() {
                return BdApi.findModule(m => m?.default?.isVideoEnabled).default.isVideoEnabled();
            }

            getSettingsPanel() {
                const Keybinder = new Settings.Keybind('Camera Toggle Hotkey', 'Key combination to toggle the camera', keyCombo, (keyCodes) => {
                    keyCombo = keyCodes;
                    console.log(keyCodes);
                    BdApi.setData(config.info.name, 'keyCodes', keyCodes);
                });
                const MainSettingsPanel = new ZeresPluginLibrary.Settings.SettingPanel();
                MainSettingsPanel.append(Keybinder);

                return MainSettingsPanel.getElement();
            }
        }
    })(global.ZeresPluginLibrary.buildPlugin(config));