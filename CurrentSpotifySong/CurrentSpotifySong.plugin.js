/**
 * @name CurrentSpotifySong
 * @author Zedruc
 * @version 1.0.0
 * @description Displays the currently playing Spotify song in Discord's activity panel
 */

const config = {
    info: {
        name: 'CurrentSpotifySong',
        authors: [{
            name: 'Zedruc',
            discord_id: '568729687291985930',
        }],
        version: '1.0.0',
        description: 'Displays the currently playing Spotify song in Discord\'s activity panel',
        github: 'https://github.com/Zedruc/BetterDCStuff',
        github_raw: 'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/CurrentSpotifySong/CurrentSpotifySong.plugin.js',
    }/* ,
      changelog: [{
          title: 'NEW',
          type: 'added',
          items: ['New Feature'],
      }] */
};


const request = BdApi.findModuleByProps('request').request;
var lastSong = '';
var justPaused = false;

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

        return class CamToggle extends Plugin {
            onStart() {
                this._ = setInterval(() => {
                    // Spotify
                    let newSocketDevice = BdApi.findModuleByProps('getActiveSocketAndDevice').getActiveSocketAndDevice();
                    if (!newSocketDevice) {
                        if (document.querySelector('#CSS-Spotify-Panel')) {
                            document.querySelector('#CSS-Spotify-Panel').remove();
                        }
                        return;
                    }
                    if (!newSocketDevice) return;
                    if (newSocketDevice == undefined || newSocketDevice == null) return;
                    let socket = newSocketDevice.socket;
                    let authToken = socket.accessToken;

                    request({
                        url: 'https://api.spotify.com/v1/me/player',
                        method: 'GET',
                        headers: {
                            authorization: `Bearer ${authToken}`
                        }
                    }, async (error, response, result) => {
                        if (error) return;

                        // This is the current playback info
                        const _info = JSON.parse(result);

                        const activityPanelClassWPM = ZeresPluginLibrary.WebpackModules.getAllByProps('activityPanel');
                        if (!activityPanelClassWPM) return BdApi.showToast('[ZedsBDUtilities] Spotify panel could not be loaded 1');
                        const panelClassWPM = ZeresPluginLibrary.WebpackModules.getAllByProps('panels');
                        if (!panelClassWPM) return BdApi.showToast('[ZedsBDUtilities] Spotify panel could not be loaded 2');
                        const panelsClass = panelClassWPM[0].panels;
                        const panelClassWPM2 = ZeresPluginLibrary.WebpackModules.getAllByProps('panel');
                        if (!panelClassWPM2) return BdApi.showToast('[ZedsBDUtilities] Spotify panel could not be loaded 3');
                        const panelClassSINGULAR = panelClassWPM2[0].panel;

                        const activityPanelClass = activityPanelClassWPM[0].activityPanel;

                        var ActivityPanel = document.querySelector(`div.${activityPanelClass}`);
                        if (_info.is_playing == false) {
                            if (document.querySelector('#CSS-Spotify-Panel')) document.querySelector('#CSS-Spotify-Panel').remove();
                            justPaused = true;
                            return;
                        }

                        if (_info.error) {
                            let _authToken = await BdApi.findModuleByProps('getAccessToken', 'pause').getAccessToken(socket.accountId).catch(err => { });
                            authToken = JSON.parse(_authToken.text).access_token;
                            return;
                        }

                        if (_info.item == undefined || _info.item == null) {
                            return;
                        }
                        const { item: { name, artists, album } } = _info;

                        /**
                         * If we try to feed missing values into the HTML
                         * BetterDiscord shits itself and fucking dies
                         */
                        if (!name || !artists || !album) return;

                        if (name == lastSong && !justPaused) {
                            return;
                        }

                        justPaused = false;

                        const toDisplay = `${artists[0].name}<br/>${name}`;

                        const SpotifyHtml = `
                           <div class="body-1FrnJD" id="CSS-Spotify-Panel">
                               <div class="gameWrapper-2TFy7F clickableGameWrapper-1xHQQL">
                                   <div class="gameIconWrapper-zXQ03M">
                                       <div class="gameIcon-1mDo1J desaturate-_Twf3u medium-1vKkpm gameIcon-2BIUJ3" id="CSS-Spotify-Icon"
                                           style="background-image: url("${album.images[0].url}";);">
                                       </div>
                                   </div>
                                   <div class="info-88fTUI">
                                       <div class="size14-3fJ-ot title-338goq">${toDisplay}</div>
                                   </div>
                               </div>
                           </div>`;
                        if (!ActivityPanel) {
                            // <div class="panel-2ZFCRb activityPanel-9icbyU"></div>
                            var el = document.createElement('div');
                            el.classList.add(panelClassSINGULAR, activityPanelClass);
                            document.querySelector(`section.${panelsClass}`).prepend(el);
                            ActivityPanel = document.querySelector(`div.${activityPanelClass}`);
                        }
                        if (!ActivityPanel.querySelector('div#CSS-Spotify-Panel')) {
                            ActivityPanel.innerHTML += SpotifyHtml;
                        }
                        if (ActivityPanel && ActivityPanel.querySelector('div#CSS-Spotify-Panel')) {
                            console.log('Panel and Spotify Panel exist');
                            const Panel = ActivityPanel.querySelector('div#CSS-Spotify-Panel');
                            const Icon = Panel.querySelector('#CSS-Spotify-Icon');
                            if (!Icon) return BdApi.showToast('[ZedsBDUtilities] Spotify module failed to execute properly. Please restart it in the plugin settings');
                            const Wrapper = Panel.querySelector('div.gameWrapper-2TFy7F');
                            if (!Wrapper) return BdApi.showToast('[ZedsBDUtilities] Spotify module failed to execute properly. Please restart it in the plugin settings');
                            const SongTitle = Panel.querySelector('div.gameWrapper-2TFy7F > div.info-88fTUI > div.title-338goq');
                            if (!SongTitle) return BdApi.showToast('[ZedsBDUtilities] Spotify module failed to execute properly. Please restart it in the plugin settings');
                            Icon.remove();


                            const coverURL = `url('${album.images[0].url}');`;
                            if (!album.images[0].url) BdApi.showToast('[Issue?][ZedsBDUtilities] Spotify module failed to execute properly. Please restart it in the plugin settings');


                            var newIcon = ZeresPluginLibrary.DOMTools.createElement(`<div id="CSS-Spotify-Icon" class="gameIcon-1mDo1J desaturate-_Twf3u medium-1vKkpm gameIcon-2BIUJ3" style="background-image: ${coverURL}; margin-top:2px;margin-bottom:2px"></div>`);

                            Wrapper.prepend(newIcon);

                            SongTitle.innerHTML = toDisplay;
                            lastSong = name;
                        } else {
                            BdApi.showToast('[ZedsBDUtilities] Spotify module failed to execute properly. Please restart it in the plugin settings | Activity Panel not found/Spotify Panel not found');
                        }
                    });
                }, 10 * 1000);
            }

            onStop() {
                clearInterval(this._);
                if (document.querySelector('div#CSS-Spotify-Panel')) document.querySelector('div#CSS-Spotify-Panel').remove();
            }
        }
    })(global.ZeresPluginLibrary.buildPlugin(config));