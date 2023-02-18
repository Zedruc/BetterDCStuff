/**
 * @name QuickNotes
 * @author Zedruc
 * @version 1.0.0
 * @description An easy way to quickly take notes without leaving Discord
 * @source https://github.com/Zedruc/BetterDCStuff
 */

// BdApi
const {
  showConfirmationModal,
  Webpack,
  Webpack: { Filters },
  React,
  setData,
  loadData,
} = BdApi;
const KeyCodeConverter = Webpack.getModule(Filters.byProps('isEventKey')); // keyEvent to keyName or keyCode

const config = {
  info: {
    name: 'QuickNotes',
    authors: [
      {
        name: 'Zedruc',
        discord_id: '568729687291985930',
      },
    ],
    version: '1.0.0',
    description: 'An easy way to quickly take notes without leaving Discord',
    github: 'https://github.com/Zedruc/BetterDCStuff',
    github_raw:
      'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/main/QuickNotes/QuickNotes.plugin.js',
  },
  changelog: [
    {
      title: 'Release',
      type: 'added',
      items: ['Version 1.0.0 of this plugin'],
    },
  ],
  settings: {
    hotkeyCodes: loadData('QuickNotes', 'hotkeyCodes') || [
      [0, 17],
      [0, 81],
    ],
    saveNotepadContent: loadData('QuickNotes', 'saveNotepadContent') || true,
    notepadContent: loadData('QuickNotes', 'notepadContent') || '',
  },
};

module.exports = !global.ZeresPluginLibrary
  ? class {
      load() {
        BdApi.showConfirmationModal(
          'Library plugin is needed',
          `The library plugin needed for ${config.info.name} is missing. Please click Download Now to install it.`,
          {
            confirmText: 'Download',
            cancelText: 'Cancel',
            onConfirm: () => {
              request.get(
                'https://rauenzi.github.io/BDPluginLibrary/release/0PluginLibrary.plugin.js',
                (error, response, body) => {
                  if (error)
                    return electron.shell.openExternal('https://betterdiscord.app/Download?id=9');
                  fs.writeFileSync(
                    path.join(BdApi.Plugins.folder, '0PluginLibrary.plugin.js'),
                    body
                  );
                }
              );
            },
          }
        );
      }
      start() {
        this.load();
      }
      stop() {}
    }
  : (([Plugin, Library]) => {
      const { Settings } = Library;
      const { Keybind, Switch, SettingPanel } = Settings;
      return class QuickNotes extends Plugin {
        onStart() {
          this.listeners = [];
          this.activeKeys = [];
          this.notePadIsOpened = false;
          this.addListener('keyup', this.keyUp);
          this.addListener('keydown', this.keyDown);
        }

        onStop() {
          this.removeListeners();
          for (const [key, value] of Object.entries(config.settings)) {
            this.saveSetting(key, value);
          }
        }

        removeListeners() {
          for (let i = 0; i < this.listeners.length; i++) {
            const { name, target, functionRef } = this.listeners[i];
            target.removeEventListener(name, functionRef);
          }
          this.listeners = [];
        }

        addListener(event, callback, target = window) {
          callback = callback.bind(this);
          target.addEventListener(event, callback);
          this.listeners.push({ name: event, functionRef: callback, target: target });
        }

        getSettingsPanel() {
          // return this.recorder;
          const panel = new SettingPanel(
            this.settingsChange,
            new Keybind(
              'Hotkey',
              'Hotkey to open your notepad',
              this.keyCodesToKeyNames(config.settings.hotkeyCodes),
              codes => {
                this.keyEventsToKeyCodes(codes);
              }
            ).getElement(),
            new Switch(
              'Save content',
              'Saves notepad content if enabled',
              config.settings.saveNotepadContent,
              v => {
                config.settings.notepadContent = v;
                this.saveSetting('saveNotepadContent', v);
              }
            ).getElement()
          ).getElement();
          return panel;
        }

        keyUp(event) {
          this.removeActiveKey(event.keyCode);
        }

        keyDown(event) {
          // esc to close notepad
          if (event.keyCode == 27) this.closeNotepad();
          if (this.activeKeys.includes(event.keyCode)) return;
          this.activeKeys.push(event.keyCode);
          if (this.checkHotkey()) this.openNotepad();
        }

        openNotepad() {
          if (this.notePadIsOpened) return;
          this.notePadIsOpened = true;

          // Textbox component
          /**
           *
           * @param {object} props
           * @param {string} props.placeholder
           * @param {string} props.value
           * @param {function} props.onChange
           * @returns
           */
          const Textbox = props => {
            return (
              <>
                <textarea
                  type="text"
                  placeholder={props.placeholder}
                  // value={props.value}
                  onChange={props.onChange}
                  style={{
                    backgroundColor: '#00000001',
                    border: 'var(--accent-hsl)',
                    color: 'var(--accent-hsl)',
                    outline: 'none',
                    height: '550px',
                    width: '100%',
                    resize: 'none',
                    color: 'white',
                  }}
                >
                  {props.value}
                </textarea>
              </>
            );
          };

          /**
           * editor={{}}
           * channelId={undefined}
           * guildId={undefined}
           */
          let int = Math.random();
          showConfirmationModal(
            `${int > 0.94 ? '🗿' : 'Notepad'} `,
            <Textbox
              placeholder="Start taking notes..."
              value={config.settings.notepadContent}
              onChange={v => {
                if (config.settings.saveNotepadContent) {
                  config.settings.notepadContent = v.target.value;
                  this.saveSetting('notepadContent', v.target.value);
                }
              }}
            />,
            {
              confirmText: 'Done',
              cancelText: 'Close',
              onConfirm: v => {
                this.closeNotepad();
              },
              onCancel: () => {
                this.closeNotepad();
              },
            }
          );
        }

        closeNotepad() {
          this.notePadIsOpened = false;
        }

        checkHotkey() {
          let active = this.activeKeys.sort().toString();
          let hotkey = config.settings.hotkeyCodes.sort().toString();
          return active === hotkey;
        }

        keyCodesToKeyNames(codes) {
          let names = [];
          for (let i = 0; i < codes.length; i++) {
            const code = codes[i];
            names.push(KeyCodeConverter(code));
          }
          return names;
        }

        removeActiveKey(keyCode) {
          if (this.activeKeys.includes(undefined))
            this.activeKeys.splice(this.activeKeys.indexOf(undefined), 1);
          this.activeKeys.splice(this.activeKeys.indexOf(keyCode), 1);
        }

        saveSetting(key, value) {
          setData(config.info.name, key, value);
        }

        keyEventsToKeyCodes(events) {
          let specialKeys = {
            ctrl: false,
            shift: false,
            alt: false,
            meta: false,
          };

          let map = {
            ctrl: 17,
            shift: 16,
            alt: 18,
            meta: 91,
          };
          let keyCodes = [];

          for (let i = 0; i < events.length; i++) {
            const event = events[i];
            for (const key in specialKeys) {
              console.log(key);
              if (!specialKeys[key] && event[`${key}Key`]) keyCodes.push(map[key]);
            }
            keyCodes.push(event.keyCode);
          }

          config.settings.hotkeyCodes = keyCodes;
          this.saveSetting('hotkeyCodes', config.settings.hotkeyCodes);
          return keyCodes;
        }
      };
    })(global.ZeresPluginLibrary.buildPlugin(config));
