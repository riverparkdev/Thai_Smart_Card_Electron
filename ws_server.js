/* eslint-disable no-console */
/*
* Thai National ID Card reader Server in NodeJS
*
* Windows
* npm install -g add windows-build-tools
* npm install --dev eslint eslint-config-standard eslint-plugin-import eslint-plugin-node eslint-plugin-promise eslint-plugin-standard
* npm install smartcard legacy-encoding hex2imagebase64
* npm install express http https fs node-js-base64-converter socket.io uuid
* npm install  sleep
*
* OR
* npm install
*
* RUN:-
* node ws_server.js
* open browser http://localhost:8080
*
* Enjoy!
*
* @author Naris Vicha. <naris@riverpark.co.th>
* @since 2021/07/12
* @
*/
var express = require('express');
var app = express();
var server = require('http').Server(app);
var thisIdCard = require('./thai-id-card');
const { v4: uuidv4 } = require('uuid');
const config = { user: 'u001', pin: '123456' };
config.uuid = uuidv4();

var fs = require('fs');
const base64 = require("nodejs-base64-converter");
const { Server } = require("socket.io");

const http = require("http")
// const https = require("https");
const httpPort = 13000;
// const httpsPort = 13000;
const httpServer = http.createServer();
// const httpsServer = https.createServer({
//     "key": fs.readFileSync(__dirname + "/ssl/server.key"),
//     "cert": fs.readFileSync(__dirname + "/ssl/server.crt"),
//     // "ca": fs.readFileSync(__dirname + "/ssl/server.ca")
// });
httpServer.listen(httpPort, function () {
    console.log(`Listening HTTP on ${httpPort}`);
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

app.use(express.static('public'));
app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});


server.listen(8080);
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