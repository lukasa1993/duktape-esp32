/* globals require, ESP32, WIFI, module*/

var pt_utils = require('pt/utils');

var general = {
  init:              function () {
    console.log('General Start');

    this.becomeAccessPoint();
    this.scanWIFI(function (data) {
      console.log(JSON.stringify(data));
    });
  },
  becomeAccessPoint: function () {
    log('Becoming an access point');
    WIFI.start();
    WIFI.listen({
      ssid:     'Mostat-test-esp32',
      auth:     'wpa2',
      password: 'Mostat1234'
    }, function () {
      log('Wifi Callback!!!');
      // We are now a WiFi access point ... so let us log our IP address
      log('***********************');
      log('* Now an Access Point *');
      log('***********************');
      log('IP Address: ' + WIFI.getState().apIp);
    });
  },
  scanWIFI:          function (cb) {
    WIFI.scan(cb);
  }
};

module.exports = general;