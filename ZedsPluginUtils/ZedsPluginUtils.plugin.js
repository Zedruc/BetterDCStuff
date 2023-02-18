/**
 * @name ZedsPluginUtils
 * @author Zedruc
 * @version 1.0.1
 * @description Lib
 */

const config = {
    info: {
        name: 'ZedsPluginUtils',
        authors: [
            {
                name: 'Zedruc',
                discord_id: '568729687291985930',
            },
        ],
        version: '1.0.0',
        description: 'Lib',
        github: 'https://github.com/Zedruc/BetterDCStuff',
        github_raw:
            'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/main/ZedsPluginUtils/ZedsPluginUtils.plugin.js',
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
          return class ZedsPluginUtils extends Plugin {
              onStart() {
                  window.ZPU = {
                      ConnectionStore: {
                          getConnectedAccounts: (filter) => {
                              var accs =
                                  BdApi.findModuleByProps(
                                      'getAccounts'
                                  ).getAccounts();
                              return accs.filter(filter);
                          },
                      },
                      RelationshipStore: {
                          getRelationships: () => {
                              return BdApi.findModuleByProps(
                                  'getRelationships'
                              ).getRelationships();
                          },
                      },
                  };

                  // Sandbox
                  const Patcher = ZeresPluginLibrary.Patcher;
                  const React = BdApi.React;
                  Patcher.after(
                      config.info.name,
                      BdApi.findModuleByProps('isFocused'),
                      'componentWillEnter',
                      (thisObject, _, ret) => {
                          console.log(_);
                      }
                  );
              }

              onStop() {
                  const Patcher = ZeresPluginLibrary.Patcher;
                  Patcher.unpatchAll(config.info.name);
                  delete window.ZPU;
              }
          };
      })(global.ZeresPluginLibrary.buildPlugin(config));
