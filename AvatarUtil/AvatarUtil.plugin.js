/**
 * @name AvatarUtil
 * @author Zedruc
 * @version 1.0.0
 * @description Rightclick on a user's avatar on the profile to get different options for it
 * @source https://github.com/Zedruc/BetterDCStuff
 */

const request = require('request');
const fs = require('fs');
const path = require('path');

const config = {
    info: {
        name: 'AvatarUtil',
        authors: [{
            name: 'Zedruc',
            discord_id: '568729687291985930',
        }],
        version: '1.0.0',
        description: 'Rightclick on a user\'s avatar on the profile to get different options for it',
        github: 'https://github.com/Zedruc/BetterDCStuff',
        github_raw: 'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/AvatarUtil.plugin.js',
    }/* ,
     changelog: [{
         title: 'NEW',
         type: 'added',
         items: ['New Feature'],
     }] */
};

const ctxMenu = (e, target) => {
    const userAvatarClass = ZeresPluginLibrary.WebpackModules.getByProps('avatar', 'badgeList', 'nameTag');
    const avatarImgClass = ZeresPluginLibrary.WebpackModules.getByProps('avatar', 'status', 'svg');
    if (!userAvatarClass || !avatarImgClass) return;
    if (target?.classList?.contains(userAvatarClass.avatar)) {
        var avatarUrl = target.querySelector(`.${avatarImgClass.avatar}`).getAttribute('src');
        if (!avatarUrl) return BdApi.showToast('Something went wrong trying to retrieve the imag', { type: 'error' })
        else {
            // Context Menu with options
            var temp = avatarUrl.split(/(\d+)(?!.*\d)/)[0];
            temp += '512';
            avatarUrl = temp;

            const ctxMenu = ZeresPluginLibrary.ContextMenu.buildMenu([
                {
                    id: 'copy',
                    label: 'Copy URL to Clipboard',
                    action: () => {
                        require('electron').clipboard.writeText(avatarUrl);
                    }
                },
                {
                    id: 'open',
                    label: 'Open in Browser',
                    action: () => {
                        require('electron').shell.openExternal(avatarUrl);
                    }
                },
                {
                    id: 'download',
                    label: 'Download Avatar',
                    action: () => { downloadImage(avatarUrl, 'avatar'); }
                }
            ]);
            ZeresPluginLibrary.ContextMenu.openContextMenu(event, ctxMenu);

        }
    } else return;
}

const downloadImage = (url, name) => {
    fetch(url)
        .then(resp => resp.blob())
        .then(blob => {
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;
            // the filename you want
            a.download = name;
            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
        })
        .catch(() => alert('An error sorry'));
}

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
            }
            );
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
                document.addEventListener('contextmenu', this.handle);
            }
            onStop() { document.removeEventListener('contextmenu', this.handle); }

            handle(event) {
                if (!event.target.classList[0]) return;
                if (event.target.classList[0].startsWith('avatar-')) ctxMenu(event, event.target);
                else if (event.target.parentElement.parentElement?.classList[0].startsWith('avatar-')) ctxMenu(event, event.target.parentElement.parentElement);
            }
        }
    })(global.ZeresPluginLibrary.buildPlugin(config));