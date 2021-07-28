// Modules to control application life and create native browser window
const { app, BrowserWindow } = require('electron')
const path = require('path')

var express = require('express');
var _app = express();
var server = require('http').Server(_app);
var thisIdCard = require('./thai-id-card');
const { v4: uuidv4 } = require('uuid');
const config = { user: 'u001', pin: '123456' };
config.uuid = uuidv4();

var fs = require('fs');
const base64 = require("nodejs-base64-converter");
const { Server } = require("socket.io");
const PORT = 19181

function createWindow() {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    title: 'อ่านบัตรประชาชน',
    useContentSize: true,
    resizable: false,
    webPreferences: {
      devTools: false,
      // preload: path.join(__dirname, 'preload.js')
    }
  })

  // and load the index.html of the app.
  // mainWindow.loadFile('index.html')
  mainWindow.loadURL(`http://localhost:${PORT}`);

  // Open the DevTools.
  // mainWindow.webContents.openDevTools()
  mainWindow.focus();
  // mainWindow.setFullScreen(true);
  mainWindow.setMenu(null);
  // Open the DevTools.
  mainWindow.webContents.openDevTools();

  // Emitted when the window is closed.
  // mainWindow.on("closed", function () {
  //   mainWindow = null;
  // });
}

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', function () {
  if (process.platform !== 'darwin') app.quit()
})

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and require them here.


// ==============
const http = require("http")
// const https = require("https");
const httpPort = 19282;
// const httpsPort = 13000;
const httpServer = http.createServer();
// const httpsServer = https.createServer({
//     "key": fs.readFileSync(__dirname + "/ssl/server.key"),
//     "cert": fs.readFileSync(__dirname + "/ssl/server.crt"),
//     // "ca": fs.readFileSync(__dirname + "/ssl/server.ca")
// });
httpServer.listen(httpPort, function () {
  console.log(`websocket is listening HTTP on ${httpPort}`);
});
// httpsServer.listen(httpsPort, function () {
//     console.log(`Listening HTTPS on ${httpsPort}`);
// });
const io = new Server({
  // path: "/test",
  serveClient: false,
  // below are engine.IO options
  pingInterval: 10000,
  pingTimeout: 5000,
  connectTimeout: 45000,
  cookie: false,
  transports: "websocket"
});
io.attach(httpServer);
// io.attach(httpsServer);

thisIdCard.start(io);

_app.use(express.static('public'));
_app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});


server.listen(PORT);
console.log(`Server is listening HTTP on ${PORT}`);
var readCardSema = false;

io.on("connection", socket => {
  // console.log('connection:' + config.uuid + ", auth:" + socket.handshake.auth.token);
  // let t = socket.handshake.auth;
  // try {
  //     console.log("token=%o", t.token);
  // } catch (e) {
  //     socket.emit("error", 'user/pin is invalid!');
  //     setTimeout(() => { socket.disconnect(); }, 1000);
  //     return;
  // }
  // let x
  // if (t != undefined && t != null && t.token != undefined) {
  //     x = base64.decode(t.token.substring('Basic '.length)).split(":");
  //     if (x.length < 2) {
  //         socket.emit("error", 'user/pin is invalid!');
  //         setTimeout(() => { socket.disconnect(); }, 1000);
  //         return;
  //     }
  // } else {
  //     socket.emit("error", 'user/pin is invalid!');
  //     setTimeout(() => { socket.disconnect(); }, 1000);
  //     return;
  // }
  // console.log("x=%o %o", x[0] == config.user, x[1] == config.pin);
  // if ((x[0] != config.user) || (x[1] != config.pin)) {
  //     console.log("x=%o %o", x[0] == config.user, x[1] == config.pin);
  //     socket.emit("error", 'user/pin is invalid!');
  //     setTimeout(() => { socket.disconnect(); }, 1000);
  //     return;
  // }
  socket.emit("connected", config.uuid);

  // handle the event sent with socket.send()
  socket.on("device-activated", (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on("card-inserted", (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on("card-info", (data) => {
    console.log(data);

  });

  // handle the event sent with socket.emit()
  socket.on("card-info", (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on("card-removed", (data) => {
    console.log(data);
  });

  // handle the event sent with socket.emit()
  socket.on("device-deactivated", (data) => {
    console.log(data);
  });

  socket.on("error", (data) => {
    console.log(data);
  });

  socket.on("disconnect", () => {
    // thisIdCard.stop();
    console.log("disconnect");
  });

  socket.on("read-card", () => {
    thisIdCard.readCard(io);
  });

});