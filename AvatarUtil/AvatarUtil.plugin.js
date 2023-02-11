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
var userAvatarClass;
var avatarImgClass;
var getUserById = BdApi.findModuleByProps('getUser').getUser;
const config = {
  info: {
    name: 'AvatarUtil',
    authors: [{
      name: 'Zedruc',
      discord_id: '568729687291985930'
    }],
    version: '1.0.0',
    description: 'Allows you to download avatars, view them in your browser, and copy avatar links',
    github: 'https://github.com/Zedruc/BetterDCStuff',
    github_raw: 'https://raw.githubusercontent.com/Zedruc/BetterDCStuff/main/AvatarUtil/AvatarUtil.plugin.js'
  },
  changelog: [{
    title: 'Release',
    type: 'added',
    items: ['Changed the ways modules were loaded']
  }]
};
const ctxMenu = async (e, target) => {
  if (!userAvatarClass || !avatarImgClass) {
    userAvatarClass = ZeresPluginLibrary.WebpackModules.getByProps('avatar', 'badgeList', 'nameTag');
    avatarImgClass = ZeresPluginLibrary.WebpackModules.getByProps('avatar', 'status', 'svg');
  }
  if (!userAvatarClass || !avatarImgClass) return BdApi.showToast('Could not load modules', {
    type: 'error'
  });
  if (target?.classList?.contains(userAvatarClass.avatar)) {
    var userId = target.getAttribute('data-user-id');
    const user = await getUserById(userId);
    var avatarUrl = target.querySelector(`.${avatarImgClass.avatar}`).getAttribute('src');
    const downloadName = `avatar-${user.username}`;

    // Context Menu with options
    var temp = avatarUrl.split(/(\d+)(?!.*\d)/)[0];
    temp += '512';
    avatarUrl = temp;
    const ctxMenu = ZeresPluginLibrary.ContextMenu.buildMenu([{
      id: 'copy',
      label: 'Copy URL to Clipboard',
      action: () => {
        require('electron').clipboard.writeText(avatarUrl);
      }
    }, {
      id: 'open',
      label: 'Open in Browser',
      action: () => {
        require('electron').shell.openExternal(avatarUrl);
      }
    }, {
      id: 'download',
      label: 'Download Avatar',
      action: () => {
        downloadImage(avatarUrl, downloadName);
      }
    }]);
    ZeresPluginLibrary.ContextMenu.openContextMenu(event, ctxMenu);
  } else return;
};
const downloadImage = (url, name) => {
  fetch(url).then(resp => resp.blob()).then(blob => {
    const url = window.URL.createObjectURL(blob);
    const a = /*#__PURE__*/React.createElement("a", {
      href: url,
      style: {
        display: 'none'
      },
      download: name
    });
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
  }).catch(() => BdApi.showToast('An error occured trying to download the image', {
    type: 'error'
  }));
};
module.exports = !global.ZeresPluginLibrary ? class {
  constructor() {
    this._config = config;
  }
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
  stop() {}
} : (([Plugin, Library]) => {
  const {
    WebpackModules
  } = Library;
  return class AvatarUtil extends Plugin {
    onStart() {
      // search webpack modules once
      userAvatarClass = WebpackModules.getByProps('avatar', 'badgeList', 'nameTag');
      avatarImgClass = WebpackModules.getByProps('avatar', 'status', 'svg');
      ZeresPluginLibrary;
      document.addEventListener('contextmenu', this.handle);
    }
    onStop() {
      document.removeEventListener('contextmenu', this.handle);
    }
    handle(event) {
      if (!event.target.classList[0]) return;
      if (event.target.classList[0].startsWith('avatar-')) ctxMenu(event, event.target);else if (event.target.parentElement.parentElement?.classList[0].startsWith('avatar-')) ctxMenu(event, event.target.parentElement.parentElement);
    }
  };
})(global.ZeresPluginLibrary.buildPlugin(config));