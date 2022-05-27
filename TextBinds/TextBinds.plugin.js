/**
 * @name TextBinds
 * @author Zedruc
 * @version 1.0.1
 * @description Bind buttons to messages
 */

const config = {
    info: {
        name: 'TextBinds',
        authors: [
            {
                name: 'Zedruc',
                discord_id: '568729687291985930',
            },
        ],
        version: '1.0.0',
        description: 'Bind buttons to messages',
        github: 'https://github.com/Zedruc/BetterDCStuff',
        github_raw:
            'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/main/TextBinds/TextBinds.plugin.js',
    } /* ,
     changelog: [{
         title: 'NEW',
         type: 'added',
         items: ['New Feature'],
     }] */,
};

module.exports = !global.ZeresPluginLibrary
    ? class {
          constructor() {
              this._config = config;
          }
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
                                      return electron.shell.openExternal(
                                          'https://betterdiscord.app/Download?id=9'
                                      );
                                  fs.writeFileSync(
                                      path.join(
                                          BdApi.Plugins.folder,
                                          '0PluginLibrary.plugin.js'
                                      ),
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
          const { Settings, Modals } = Library;

          // fields
          var data = BdApi.getData(config.info.name, 'binds') || {
              binds: [],
          };
          const { ButtonColors, ButtonSizes, ButtonLooks } =
              BdApi.findModuleByProps('ButtonBorderColors');
          return class TextBinds extends Plugin {
              start() {}
              stop() {}
              getSettingsPanel() {
                  for (let i = 0; i < data.length; i++) {
                      const { name, content, keyCodes } = data[i];
                      console.log(name, content, keyCodes);
                  }
                  const MainSettingsPanel = new Settings.SettingPanel();
                  MainSettingsPanel.append(
                      this.createButton('Add Bind', {
                          onClick: () => {
                              Modals.showModal(
                                  'Create Bind',
                                  [
                                      new Settings.Textbox(
                                          'Bind Name',
                                          'Name of the bind',
                                          '',
                                          (txt) => {
                                              window.newBindName = txt;
                                          }
                                      ),
                                      new Settings.Textbox(
                                          'Bind Content',
                                          'This will be sent when you hit your bind',
                                          '',
                                          (txt) => {
                                              window.newBindContent = txt;
                                          }
                                      ),
                                  ],
                                  {
                                      confirmText: 'Save',
                                      cancelText: 'Cancel',
                                      onConfirm: () => {
                                          data.binds.push({
                                              name: window.newBindName,
                                              content: window.newBindContent,
                                          });
                                      },
                                  }
                              );
                          },
                      })
                  );

                  return MainSettingsPanel.getElement();
              }

              createButton(
                  content,
                  {
                      onClick,
                      className = '',
                      color = ButtonColors.BRAND,
                      size = ButtonSizes.MEDIUM,
                      look = ButtonLooks.FILLED,
                  }
              ) {
                  return Object.assign(document.createElement('button'), {
                      className: [color, size, look, className]
                          .filter(Boolean)
                          .join(' '),
                      onclick: onClick,
                      innerText: content,
                  });
              }
          };
      })(global.ZeresPluginLibrary.buildPlugin(config));
