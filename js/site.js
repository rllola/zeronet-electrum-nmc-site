class Site extends ZeroFrame {
    constructor () {
        super()

        this.siteInfo = {}
        this.serverInfo = {}
    }

    log (...args) {
        console.log.apply(console, ['[Site]'].concat(args))
    }

    onRequest (cmd, message) {
        switch(cmd) {
        case 'setSiteInfo':
            this.setSiteInfo(message.params)
            break
        default:
            console.log(`Unknown command: ${cmd}`)
        }
    }

    fetchServerInfo () {
        return this.cmdp('serverInfo', {})
            .then((response) => {
                this.setServerInfo(response)
            })
    }

    fetchSiteInfo () {
        return this.cmdp('siteInfo', {})
            .then((response) => {
                this.setSiteInfo(response)
            })
    }

    needElectrumZip () {
        return this.cmdp('fileNeed', 'ZeronameElectrumNMC/Electrum-NMC-3.3.10.zip')
    }

    hasElectrumZip () {
        return this.cmdp('optionalFileInfo', 'ZeronameElectrumNMC/Electrum-NMC-3.3.10.zip')
    }

    addPluginRequest () {
        return this.cmdp('pluginAddRequest', `ZeronameElectrumNMC`)
    }

    hasElectrumMNCPlugin () {
        if (this.serverInfo.plugins && this.serverInfo.plugins.indexOf('ZeronameElectrumNMC') > 0) {
            return true
        }
        return false
    }

    autoDownload () {
        return this.cmdp('optionalHelp', ['ZeronameElectrumNMC', 'Electrum NMC files'])
    }

    setSiteInfo (info) {
        this.log(info)
        this.siteInfo = info
    }

    setServerInfo (info) {
        this.log(info)
        this.serverInfo = info
    }
}

const site = new Site()

async function install () {
    let result = await site.hasElectrumZip()
    if (result.is_downloaded) {
        result = await site.addPluginRequest()
        if (result == "ok") {
            site.log('Plugin succefully installed')
        }
    } else {
        site.log('Optional files are required for install to be successfull')
    }
}

site.fetchServerInfo()
    .then(async function () {
        const element = document.getElementById("root")
        if (site.hasElectrumMNCPlugin()) {
            // Plugin installed; show version;
            element.innerHTML = "<p>The plugin is installed.</p>"
        } else {
            // Auto Download optional file
            let result = await site.hasElectrumZip()
            if (result.is_downloaded == 0 || result.is_pinned == 0) {
                await site.autoDownload()
            }
            // Plugin not installed; show install button;
            element.innerHTML = "<p>The plugin is not installed.</p>" +
            "<button onClick='install()'>Install plugin</button><br/>" +
            "<p>Make sure that `ZeronameElectrumNMC/Electrum-NMC-3.3.10.zip` optional file is fully downloaded."+
            " You can open the side panel and help distributing optional file."
        }
        element.style.display = "block"
    })
