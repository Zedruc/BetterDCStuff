/**
 * @name AvatarUtil
 * @author Zedruc
 * @version 1.0.0
 * @description Rightclick on a user's avatar on the profile to get different options for it
 */

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
            temp += "512";
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

module.exports = class AvatarUtil {
    start() {
        if (!window.ZeresPluginLibrary) {
            BdApi.shoConfiramtionModal('Missing Library', [
                'To make AvatarUtil work please install ',
                BdApi.React.createElement('a', { href: 'https://betterdiscord.app/plugin/ZeresPluginLibrary', target: "_blank" }, 'Zere\'s Plugin Library'),
            ]);
            return;
        }

        document.addEventListener('contextmenu', this.handle);
    }
    stop() { document.removeEventListener('contextmenu', this.handle); }

    handle(event) {
        if (!event.target.classList[0]) return;
        if (event.target.classList[0].startsWith('avatar-')) ctxMenu(event, event.target);
        else if (event.target.parentElement.parentElement?.classList[0].startsWith('avatar-')) ctxMenu(event, event.target.parentElement.parentElement);
    }
}