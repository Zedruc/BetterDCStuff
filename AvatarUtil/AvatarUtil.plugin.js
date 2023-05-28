/**
 * @name AvatarUtil
 * @author Zedruc
 * @version 1.0.0
 * @description Allows you to download avatars, view them in your browser, and copy avatar links
 * @source https://github.com/Zedruc/BetterDCStuff
 */

const request = require('request');
const fs = require('fs');
const path = require('path');

// webpack modules
var userAvatarClass, avatarImgClass, getUserById;

// BdApi
const {
  Webpack: { Filters },
  findModule,
} = BdApi;

const config = {
  info: {
    name: 'AvatarUtil',
    authors: [
      {
        name: 'Zedruc',
        discord_id: '568729687291985930',
      },
    ],
    version: '1.0.0',
    description: 'Allows you to download avatars, view them in your browser, and copy avatar links',
    github: 'https://github.com/Zedruc/BetterDCStuff',
    github_raw:
      'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/main/AvatarUtil/AvatarUtil.plugin.js',
  },
  changelog: [
    {
      title: 'Release',
      type: 'added',
      items: ['Version 1.0.0 of this plugin'],
    },
  ],
};

const loadModules = async () => {
  userAvatarClass = findModule(Filters.byProps('avatar', 'avatarSize', 'badgeList'));
  avatarImgClass = findModule(
    Filters.byProps('avatarDecorationBorderPosition', 'avatarStack', 'mask')
  );
  getUserById = findModule(Filters.byProps('getCurrentUser', 'getUser')).getUser;
};

const ctxMenu = async (e, target) => {
  // search a second time if they could not be found on start
  if (!userAvatarClass || !avatarImgClass) {
    loadModules();
  }
  if (!userAvatarClass || !avatarImgClass)
    return BdApi.showToast('Could not load modules required to load the avatar', { type: 'error' });
  if (target?.classList?.contains(userAvatarClass.avatar)) {
    var avatarUrl = target.querySelector(`.${avatarImgClass.avatar}`).getAttribute('src');
    var userId = avatarUrl.split('/')[4];
    const user = await getUserById(userId);
    const downloadName = `avatar-${user.username}`;

    // Context Menu with options
    var temp = avatarUrl.split(/(\d+)(?!.*\d)/)[0];
    temp += '512';
    avatarUrl = temp;

    const ctxMenu = ZeresPluginLibrary.ContextMenu.buildMenu([
      {
        id: 'copy',
        label: 'Copy URL to Clipboard',
        action: () => {
          DiscordNative.clipboard.copy(avatarUrl);
          BdApi.showToast('Copied to clipboard', { type: 'info' });
        },
      },
      {
        id: 'open',
        label: 'Open in Browser',
        action: () => {
          require('electron').shell.openExternal(avatarUrl);
        },
      },
      {
        id: 'download',
        label: 'Download Avatar',
        action: () => {
          downloadImage(avatarUrl, downloadName);
        },
      },
    ]);
    ZeresPluginLibrary.ContextMenu.openContextMenu(event, ctxMenu);
  } else {
    BdApi.showToast('Could not find avatar', { type: 'error' });
  }
};

const downloadImage = (url, name) => {
  fetch(url)
    .then(resp => resp.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = Object.assign(document.createElement('a'), {
        href: url,
        style: { display: 'none' },
        download: name,
      });
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      a.remove();
    })
    .catch(e => {
      BdApi.showToast('An error occured trying to download the image', {
        type: 'error',
      });
      console.log(e);
    });
};

const checkForAvatarClass = element => {
  for (const _class of element.classList) {
    if (_class.startsWith('avatar')) return true;
  }
  return false;
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
      return class AvatarUtil extends Plugin {
        onStart() {
          // search webpack modules once
          loadModules();

          document.addEventListener('contextmenu', this.handle);
        }
        onStop() {
          document.removeEventListener('contextmenu', this.handle);
        }

        handle(event) {
          if (checkForAvatarClass(event.target)) {
            ctxMenu(event, event.target);
          } else if (checkForAvatarClass(event.target.parentElement.parentElement)) {
            ctxMenu(event, event.target.parentElement.parentElement);
          }
        }
      };
    })(global.ZeresPluginLibrary.buildPlugin(config));
