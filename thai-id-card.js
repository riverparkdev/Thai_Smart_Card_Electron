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

const smartcard = require('smartcard')
const legacy = require('legacy-encoding')
const hex2imagebase64 = require('hex2imagebase64')
var sleep = require('sleep');
var fs = require('fs')

const Devices = smartcard.Devices
let devices
let socketIo
// let devicesStatus = -1;
let currentDevice

let devicesStatus = {
  status: -2,             // -1: device is not initial,  0: device is initial but card not inserted, 1: device is initial and card is inserted
  dataStatus: 0           // 0: not ready, 1: ready
}

let card
let cmdReq = [0x00, 0xc0, 0x00, 0x00]
const cmdSelectThaiCard = [0x00, 0xa4, 0x04, 0x00, 0x08, 0xa0, 0x00, 0x00, 0x00, 0x54, 0x48, 0x00, 0x01]
const cmdCID = [0x80, 0xb0, 0x00, 0x04, 0x02, 0x00, 0x0d]
const cmdTHFullname = [0x80, 0xb0, 0x00, 0x11, 0x02, 0x00, 0x64]
const cmdENFullname = [0x80, 0xb0, 0x00, 0x75, 0x02, 0x00, 0x64]
const cmdBirth = [0x80, 0xb0, 0x00, 0xd9, 0x02, 0x00, 0x08]
const cmdGender = [0x80, 0xb0, 0x00, 0xe1, 0x02, 0x00, 0x01]
const cmdIssuer = [0x80, 0xb0, 0x00, 0xf6, 0x02, 0x00, 0x64]
const cmdIssueDate = [0x80, 0xb0, 0x01, 0x67, 0x02, 0x00, 0x08]
const cmdExpireDate = [0x80, 0xb0, 0x01, 0x6f, 0x02, 0x00, 0x08]
const cmdAddress = [0x80, 0xb0, 0x15, 0x79, 0x02, 0x00, 0x64]
const cmdPhoto = [
  [0x80, 0xb0, 0x01, 0x7b, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x02, 0x7a, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x03, 0x79, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x04, 0x78, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x05, 0x77, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x06, 0x76, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x07, 0x75, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x08, 0x74, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x09, 0x73, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x0a, 0x72, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x0b, 0x71, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x0c, 0x70, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x0d, 0x6f, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x0e, 0x6e, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x0f, 0x6d, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x10, 0x6c, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x11, 0x6b, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x12, 0x6a, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x13, 0x69, 0x02, 0x00, 0xff],
  [0x80, 0xb0, 0x14, 0x68, 0x02, 0x00, 0xff]
]

class CardInfo {
  cid = '';
  thTitle = '';
  thName = '';
  thSName = '';
  enTitle = '';
  enName = '';
  enSName = '';
  dateOfBirth = '';
  gender = '';              //1: ชาย, 2: หญิง
  issuer = '';
  issueDate = '';
  expireDate = '';
  addrAddress = '';        // บ้านเลขที่
  addrMoo = '';            // หมู่
  addrAlley = '';          // ตรอก
  addrSoi = '';            // ซอย
  addrStreet = '';         // ถนน
  addrDistrictType = 0;     // 0:ตำบล, 1:แขวง
  addrDistrict = '';        // ตำบล/แขวง
  addrZoneType = 0;         // 0:ตำบล, 1:แขวง
  addrZone = '';            // อำเภอ/เขต
  addrProvince = '';        // จังหวัด
  photo = '';               // photo
}

let cardInfo
let captureDeviceStatus = false;  // capture device, false: stop, true: start
let captureDeviceInterval





// exports.stop = function () {
//   captureDeviceStatus = false;
//   try {
//     if (devices != undefined || devices != null) {
//       // delete devices;
//       devices = null;
//     }
//   } catch (err) {
//   }
// }

exports.start = function (socketIo) {
  // try {
  //   if (devices != undefined || devices != null) {
  //     // delete devices;
  //     devices = null;
  //   }
  // } catch (err) {
  //   return false;
  // }
  devices = new Devices();
  devices.on('device-activated', event => {

    const currentDevices = event.devices
    currentDevice = event.device.toString()
    let device = event.device
    console.log(`Device '${currentDevice}' activated, devices: ${currentDevices}`)
    devicesStatus.status = 0;
    // console.log('-->' + device.toString())
    if (socketIo != undefined) {
      socketIo.emit("device-activated", {
        device: currentDevice
      });
    }

    device.on('card-inserted', event => {
      // console.log('device card inserted!')
      sleep.msleep(300);
      readInsertedCard(socketIo, event);
    })

    device.on('card-removed', event => {
      console.log(`Card removed from '${event.name}' `)
      if (cardInfo != undefined && cardInfo != null) {
        cardInfo = null;
      }
      // cardInfo = undefined;
      devicesStatus.status = 0;
      devicesStatus.dataStatus = 0;

      if (socketIo != undefined) {
        socketIo.emit("card-removed", {
          device: event.name
        });
      }

    })

    devices.on('device-deactivated', event => {
      console.log(`Device '${event.device}' deactivated, devices: '${event.devices}'`)
      if (socketIo != undefined) {
        try {
          socketIo.emit("device-deactivated", {
            device: device
          });
        } catch (e) {

        }
      }
    })

  })

  this.socketIo = socketIo;

  // let i = 0;
  // captureDeviceStatus = true;
  // captureDeviceInterval = setInterval(() => {
  //   // console.log('Infinite Loop Test interval n %d: deviceStatus=%o', i++, devicesStatus);
  //   if (captureDeviceStatus == true) {
  //     if (devicesStatus.dataStatus == 1) {
  //       // console.log("data is ready: %o\n", cardInfo);
  //       console.log("...");
  //     } else {
  //       console.log("...");
  //     }
  //   } else {
  //     clearInterval(captureDeviceInterval);
  //     try {
  //       if (devices != undefined || devices != null) {
  //         delete devices;
  //         devices = null;
  //       }
  //     } catch (err) {
  //     }
  //   }
  // }, 2000)
  return true;
}

function readInsertedCard(socketIo, event) {
  _readCard('inserted', socketIo, event);
}


function _readCard(ev, socketIo, event) {
  devicesStatus.dataStatus = 0;
  if (cardInfo != undefined && cardInfo != null) {
    // delete cardInfo;
    cardInfo = null;
  }
  cardInfo = new CardInfo();
  devicesStatus.status = 1;
  if (event != undefined) {
    console.log("ev=%o,ev.dev=%o, cdev=%o", ev, event.device.toString(), currentDevice);
    card = event.card;
    currentDevice = event.device.toString();
  } else {
    console.log("ev=%o,cdev=%o", ev, currentDevice);
  }
  // console.log('1->' + card.getAtr().toString())
  // console.log('2->' + event.device.toString())
  // console.log(`Card '${card.getAtr()}' inserted into '${event.device}'`)

  console.log(`Card '${card.getAtr()}' inserted into '${currentDevice}'`)
  if (socketIo != undefined) {
    socketIo.emit("card-inserted", {
      // device: event.device.toString(),
      device: currentDevice,
      cardAttr: card.getAtr().toString()
    });
  } else {
    console.log('socketIo is undefined!')
  }

  // Check Thai National ID Card Version
  let cardAttr = card.getAtr()
  if (cardAttr.substr(0, 2) === '3b' && cardAttr.substr(2, 2) === '67') {
    cmdReq = [0x00, 0xC0, 0x00, 0x01]
  } else {
    cmdReq = [0x00, 0xC0, 0x00, 0x00]
  }

  // Get data from card
  // sleep.msleep(500);
  card.issueCommand(cmdSelectThaiCard).then((selectResult) => {
    sleep.msleep(50);
    // console.log(selectResult.toString())
    // console.log('Get CID: ')
    return getData(cmdCID, cmdReq)
  }).then((cid) => {
    sleep.msleep(50);
    cardInfo.cid = cid.slice(0, -2).toString();
    // console.log(cid.slice(0, -2).toString())
    // console.log('Get thFullname: ')
    return getData(cmdTHFullname, cmdReq)
  }).then((thFullname) => {
    sleep.msleep(50);
    let t = legacy.decode(thFullname.slice(0, -2), 'iso-8859-11').split('#');
    //console.log(t);
    if (t.length > 0) {
      cardInfo.thTitle = (t.length >= 1 ? t[0].trimEnd() : '');
      cardInfo.thName = (t.length >= 2 ? t[1].trimEnd() : '');
      cardInfo.thSName = (t.length >= 3 ? t[2].trimEnd() : '');
      cardInfo.thSName += (t.length >= 4 ? (t[2] != '' ? ', ' + t[3].trimEnd() : t[3].trimEnd()) : '');
    }
    // console.log(legacy.decode(thFullname.slice(0, -2), 'iso-8859-11'))
    // console.log('Get cmdENFullname: ')
    return getData(cmdENFullname, cmdReq)
  }).then((enFullname) => {
    sleep.msleep(50);
    let t = legacy.decode(enFullname.slice(0, -2), 'iso-8859-11').split('#');
    //console.log(t);
    if (t.length > 0) {
      cardInfo.enTitle = (t.length >= 1 ? t[0].trimEnd() : '');
      cardInfo.enName = (t.length >= 2 ? t[1].trimEnd() : '');
      cardInfo.enSName = (t.length >= 3 ? t[2].trimEnd() : '');
      cardInfo.enSName += (t.length >= 4 ? (t[2] != '' ? ', ' + t[3].trimEnd() : t[3].trimEnd()) : '');
    }
    // cardInfo.enFullName = legacy.decode(enFullname.slice(0, -2), 'iso-8859-11');
    // console.log(legacy.decode(enFullname.slice(0, -2), 'iso-8859-11'))
    // console.log('Get dateOfBirth: ')
    return getData(cmdBirth, cmdReq)
  }).then((dateOfBirth) => {
    sleep.msleep(50);
    let t = legacy.decode(dateOfBirth.slice(0, -2), 'iso-8859-11');
    cardInfo.dateOfBirth = t.substring(6, 8) + "/" + t.substring(4, 6) + '/' + t.substring(0, 4)
    // console.log(legacy.decode(dateOfBirth.slice(0, -2), 'iso-8859-11'))
    // console.log('Get gender: ')
    return getData(cmdGender, cmdReq)
  }).then((gender) => {
    sleep.msleep(50);
    let t = legacy.decode(gender.slice(0, -2), 'iso-8859-11');
    cardInfo.gender = (t == '1' ? 'ชาย' : 'หญิง')
    // console.log(legacy.decode(gender.slice(0, -2), 'iso-8859-11'))
    // console.log('Get issuer: ')
    return getData(cmdIssuer, cmdReq)
  }).then((issuer) => {
    sleep.msleep(50);
    cardInfo.issuer = legacy.decode(issuer.slice(0, -2), 'iso-8859-11').trimEnd();
    // console.log(legacy.decode(issuer.slice(0, -2), 'iso-8859-11'))
    // console.log('Get issueDate: ')
    return getData(cmdIssueDate, cmdReq)
  }).then((issueDate) => {
    sleep.msleep(50);
    let t = legacy.decode(issueDate.slice(0, -2), 'iso-8859-11');
    cardInfo.issueDate = t.substring(6, 8) + "/" + t.substring(4, 6) + '/' + t.substring(0, 4)
    // console.log(legacy.decode(issueDate.slice(0, -2), 'iso-8859-11'))
    // console.log('Get expireDate: ')
    return getData(cmdExpireDate, cmdReq)
  }).then((expireDate) => {
    sleep.msleep(50);
    let t = legacy.decode(expireDate.slice(0, -2), 'iso-8859-11');
    cardInfo.expireDate = t.substring(6, 8) + "/" + t.substring(4, 6) + '/' + t.substring(0, 4)
    // console.log(legacy.decode(expireDate.slice(0, -2), 'iso-8859-11'))
    // console.log('Get address: ')
    return getData(cmdAddress, cmdReq)
  }).then((address) => {
    sleep.msleep(50);
    let t = legacy.decode(address.slice(0, -2), 'iso-8859-11').trimEnd().split('#');
    if (t.length > 0) {
      cardInfo.addrAddress = (t.length >= 1 ? t[0].trimEnd() : '');
      cardInfo.addrMoo = (t.length >= 2 ? t[1].trimEnd() : '');
      cardInfo.addrAlley = (t.length >= 3 ? t[2].trimEnd() : '');
      cardInfo.addrSoi = (t.length >= 4 ? t[3].trimEnd() : '');
      cardInfo.addrStreet = (t.length >= 5 ? t[4].trimEnd() : '');
      let x = (t.length >= 6 ? t[5].trimEnd() : '');
      // cardInfo.addrDistrict = x;
      if (x.indexOf('ตำบล') == 0) {
        cardInfo.addrDistrictType = 'ตำบล';
        cardInfo.addrDistrict = x.substring('ตำบล'.length);
      } else if (x.indexOf('ต.')) {
        cardInfo.addrDistrictType = 'ตำบล';
        cardInfo.addrDistrict = x.substring('ต.'.length);
      } else if (x.indexOf('ต. ')) {
        cardInfo.addrDistrictType = 'ตำบล';
        cardInfo.addrDistrict = x.substring('ต. '.length);
      } else if (x.indexOf('ต .')) {
        cardInfo.addrDistrictType = 'ตำบล';
        cardInfo.addrDistrict = x.substring('ต .'.length);
      } else if (x.indexOf('แขวง')) {
        cardInfo.addrDistrictType = 'แขวง';
        cardInfo.addrDistrict = x.substring('แขวง'.length);
      } else {
        cardInfo.addrDistrictType = 'แขวง';
        cardInfo.addrDistrict = x;
      }
      x = (t.length >= 7 ? t[6].trimEnd() : '');
      // cardInfo.addrZone = x;
      if (x.indexOf('อำเภอ') == 0) {
        cardInfo.addrZoneType = 'อำเภอ';
        cardInfo.addrZone = x.substring('อำเภอ'.length);
      } else if (x.indexOf('อ.')) {
        cardInfo.addrZoneType = 'อำเภอ';
        cardInfo.addrZone = x.substring('อ.'.length);
      } else if (x.indexOf('อ. ')) {
        cardInfo.addrZoneType = 'อำเภอ';
        cardInfo.addrZone = x.substring('อ. '.length);
      } else if (x.indexOf('อ .')) {
        cardInfo.addrZoneType = 'อำเภอ';
        cardInfo.addrZone = x.substring('อ .'.length);
      } else if (x.indexOf('เขต')) {
        cardInfo.addrZoneType = 'เขต';
        cardInfo.addrZone = x.substring('เขต'.length);
      } else if (x.indexOf('ข.')) {
        cardInfo.addrZoneType = 'เขต';
        cardInfo.addrZone = x.substring('ข.'.length);
      } else {
        cardInfo.addrZoneType = 'เขต';
        cardInfo.addrZone = x;
      }
      cardInfo.addrProvince = (t.length >= 8 ? t[7].trimEnd() : '');
    }
    // cardInfo.addrAddress = legacy.decode(address.slice(0, -2), 'iso-8859-11');
    // console.log(legacy.decode(address.slice(0, -2), 'iso-8859-11'))
    // console.log('Get photo: ')
    return getPhoto()
  }).then((photo) => {
    sleep.msleep(50);
    cardInfo.photo = photo;
    // console.log(photo)
    // console.log('ooooo-->' + JSON.stringify(cardInfo));
    devicesStatus.dataStatus = 1;         // ready for get data to used!

    if (socketIo != undefined) {
      // console.log('***' + currentDevice + ', ' + __dirname + '/data/tmp.dat')
      fs.writeFileSync(__dirname + '/data/tmp.dat', JSON.stringify(cardInfo));

      socketIo.emit("card-info", {
        device: currentDevice,
        cardAttr: card.getAtr().toString(),
        cardInfo: JSON.stringify(cardInfo)
      });

    } else {
      console.log('socketIo is undefined')
    }
    console.log('Data is read!')

  }).catch((err) => {

    console.error(err)
    //devicesStatus = 0;
    devicesStatus.dataStatus = 0;         // ready for get data to used!
    // process.exit()

  })

}


async function getPhoto() {
  let hexPhoto = ''
  for (let cmd of cmdPhoto) {
    let result = await getData(cmd, cmdReq)
    hexPhoto += result.toString('hex').slice(0, -4)
  }
  let retn = 'data:image/jpg;base64, ' + hex2imagebase64(hexPhoto)
  return retn;
}

function getData(cmd, req = [0x00, 0xC0, 0x00, 0x00]) {
  let promise = new Promise(function (resolve, reject) {
    card.issueCommand(
      cmd
    ).then((_result) => {
      return card.issueCommand(
        [...req, ...cmd.slice(-1)]
      )
    }).then((result) => {
      resolve(result)
    }).catch((err) => {
      reject(err)
    })
  })
  let retn = promise;
  return retn;
}

// exports.getCardInfo = function () {
//   if (captureDeviceStatus) {
//     if (devicesStatus.dataStatus == 1) {
//       return { status: 'success', cardInfo: cardInfo }; // ok, data is ready.
//     }
//     return { status: 'wait', cardInfo: undefined };     // data is not ready for used
//   }
//   return { status: 'fail', cardInfo: undefined };       // device is not captured
// }


exports.readCard = function (socketIo) {
  _readCard('read', socketIo);
}

// const WS_SERVER_PORT = 13000;
// // this.start();
// // let i = 0;
// // captureDeviceInterval = setInterval(() => {
// //   console.log('Infinite Loop Test interval n %d', i++);
// //   // console.log(this.getCardInfo());
// //   i++;
// //   if (i > 30) {
// //     console.log(this.getCardInfo());
// //     this.stop();
// //     sleep.msleep(4000);
// //     process.exit();
// //     // i = 0;
// //     // this.start();
// //   }
// // }, 1000)
// const { v4: uuidv4 } = require('uuid');
// var config = { user: 'p001', pin: '123456' };
// config.uuid = uuidv4();

// const io = require("socket.io")(WS_SERVER_PORT, {
//   // path: "/test",
//   serveClient: false,
//   // below are engine.IO options
//   pingInterval: 10000,
//   pingTimeout: 5000,
//   connectTimeout: 45000,
//   cookie: false,
//   transports: "websocket"
// });

// this.start(io);

// io.on("connection", socket => {
//   // either with send()
//   // socket.send(");
//   //   // or with emit() and custom event names
//   //   socket.emit("greetings", "Hey!", { "ms": "jane" }, Buffer.from([4, 3, 3, 1]));
//   // socket.join('private-read-card');
//   //socket.join(room);
//   console.log('connection:' + config.uuid);
//   socket.emit("connected", config.uuid);

//   // handle the event sent with socket.send()
//   socket.on("device-activated", (data) => {
//     console.log(data);
//   });

//   // handle the event sent with socket.emit()
//   socket.on("card-inserted", (data) => {
//     console.log(data);
//   });

//   // handle the event sent with socket.emit()
//   socket.on("card-info", (data) => {
//     console.log(data);
//   });

//   // handle the event sent with socket.emit()
//   socket.on("card-info", (data) => {
//     console.log(data);
//   });

//   // handle the event sent with socket.emit()
//   socket.on("card-removed", (data) => {
//     console.log(data);
//   });

//   // handle the event sent with socket.emit()
//   socket.on("device-deactivated", (data) => {
//     console.log(data);
//   });

//   socket.on("error", (data) => {
//     console.log(data);
//   });

//   socket.on("disconnect", () => {
//     console.log("disconnect");
//   });
// });

// let i = 0;
// captureDeviceStatus = true;
// captureDeviceInterval = setInterval(() => {
//   // console.log('Infinite Loop Test interval n %d: deviceStatus=%o', i++, devicesStatus);
//   if (captureDeviceStatus == false) {
//     //   if (devicesStatus.dataStatus == 1) {
//     //     console.log("data is ready: %o\n", cardInfo);
//     //     //console.log("...");
//     //   } else {
//     //     console.log("...");
//     //   }
//     // } else {
//     clearInterval(captureDeviceInterval);
//   }
// }, 2000)