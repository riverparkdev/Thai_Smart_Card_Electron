# Thai_Smart_Card_Electron


```bash
# Clone this repository
git clone https://github.com/riverparkdev/Thai_Smart_Card_Electron
# Go into the repository
cd Thai_Smart_Card_Electron
# Install dependencies
npm install
# Run the app
npm start
```

If application is error when run npm start please concern the invaid node version in your computer may be difference versions of electron. In this case
you must rebuild the electron by:-

```bash
# Run rebuild electron
npm run link
# Run the app
npm start
```

after program read the personal card, the program will save data into folder data in the installed application directory, for using later when readed.
In this case, the author need to encrypt the readed personal but now i think will promote in the next vesions.

Revised by:-

Naris Vichateerasakul.

Thank for k. Kawin Viriyaprasopsoo. for your github repository. 


## SmartCard ###

/* eslint-disable no-console */
/*
* Thai National ID Card reader in NodeJS
*
* Linux
* apt install libpcsclite-dev libpcsclite1 pcscd build-essential
*
* Windows
* yarn global add windows-build-tools
*
* All OS
* yarn add --dev eslint eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard
* yarn add smartcard legacy-encoding hex2imagebase64
*
* @author Kawin Viriyaprasopsook <kawin.vir@zercle.tech>
* @requires smartcard legacy-encoding hex2imagebase64
* @since 11/06/2019
*
*/

/* 
* @revise&changed by Naris Vichateerasakul <naris@riverpark.co.th>
* @since 2021/07/12
* @changed 
* 1. return the cardInfo when the card is read (status: deviceStatus.dataStatus=1(ready))
* 2. export function getCardInfo to reading the data from card that has been inserted.
* 3. export function start to start capture the device
* 4. export function stop to stop capture the device 
*/



## Electron ###

**Clone and run for a quick way to see Electron in action.**

This is a minimal Electron application based on the [Quick Start Guide](https://electronjs.org/docs/tutorial/quick-start) within the Electron documentation.

**Use this app along with the [Electron API Demos](https://electronjs.org/#get-started) app for API code examples to help you get started.**

A basic Electron application needs just these files:

- `package.json` - Points to the app's main file and lists its details and dependencies.
- `main.js` - Starts the app and creates a browser window to render HTML. This is the app's **main process**.
- `index.html` - A web page to render. This is the app's **renderer process**.

You can learn more about each of these components within the [Quick Start Guide](https://electronjs.org/docs/tutorial/quick-start).

## To Use

To clone and run this repository you'll need [Git](https://git-scm.com) and [Node.js](https://nodejs.org/en/download/) (which comes with [npm](http://npmjs.com)) installed on your computer. From your command line:

```bash
# Clone this repository
git clone https://github.com/electron/electron-quick-start
# Go into the repository
cd electron-quick-start
# Install dependencies
npm install
# Run the app
npm start
```

Note: If you're using Linux Bash for Windows, [see this guide](https://www.howtogeek.com/261575/how-to-run-graphical-linux-desktop-applications-from-windows-10s-bash-shell/) or use `node` from the command prompt.

## Resources for Learning Electron

- [electronjs.org/docs](https://electronjs.org/docs) - all of Electron's documentation
- [electronjs.org/community#boilerplates](https://electronjs.org/community#boilerplates) - sample starter apps created by the community
- [electron/electron-quick-start](https://github.com/electron/electron-quick-start) - a very basic starter Electron app
- [electron/simple-samples](https://github.com/electron/simple-samples) - small applications with ideas for taking them further
- [electron/electron-api-demos](https://github.com/electron/electron-api-demos) - an Electron app that teaches you how to use Electron
- [hokein/electron-sample-apps](https://github.com/hokein/electron-sample-apps) - small demo apps for the various Electron APIs



## License

MIT License (LICENSE.md)
# Thai_Smart_Card_Electron
