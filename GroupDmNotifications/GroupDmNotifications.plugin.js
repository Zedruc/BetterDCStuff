/**
 * @name GroupDmNotification
 * @author Zedruc
 * @version 1.0.0
 * @description Notifies you when you are put into a group dm channel
 * @source https://github.com/Zedruc/BetterDCStuff
 */

const request = require('request');
const fs = require('fs');
const path = require('path');

const config = {
    info: {
        name: 'GroupDmNotification',
        authors: [{
            name: 'Zedruc',
            discord_id: '568729687291985930',
        }],
        version: '1.0.0',
        description: 'Notifies you when you are put into a group dm channel',
        github: 'https://github.com/Zedruc/BetterDCStuff',
        github_raw: 'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/main/GroupDmNotification/GroupDmNotification.plugin.js',
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
        const { PluginUpdater } = Library;
        PluginUpdater.checkForUpdate(config.info.name, config.info.version, config.info.github_raw);

        return class AvatarUtil extends Plugin {
            onStart() {
                BdApi.findModuleByProps('dirtyDispatch').subscribe('CHANNEL_CREATE', this.E_GroupDM);
            }
            onStop() { }

            E_GroupDM(event) {
                console.log(event);
            }
        }
    })(global.ZeresPluginLibrary.buildPlugin(config));