/* globals require, ESP32, WIFI, Duktape, module*/

var pt_utils = require('pt/utils');
var ws       = require('pt/libs/ws');

var general = {
  init:              function () {
    console.log('General Start');

    this.connectToDebug();
    var self = this;
    //   setInterval(function() {
    //   self.scanWIFI(function (data) {
    //       console.log(JSON.stringify(data));
    //     });
    // }, 5000);
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
  },
  connectToDebug:    function () {
    var self = this;
    WIFI.connect({
        ssid:     'PicktekLLC',
        password: 'fantod204-marches'
      }, function (err) {
        log('Now connected as a station! - err: ' + err);
        log('ESP32 Heap: ' + ESP32.getState().heapSize);
        self.setWebSocket();
      }
    ); // WIFI.connect
  },
  setWebSocket:      function () {
    console.log('starting websocket');

    var WEBSOCKET_PORT  = 8002;
    var webSocketServer = ws.Server();

    webSocketServer.on('connection', function (wsConnection) {
      log('We have received a new WebSocket connection.  The path is "' + wsConnection.path + '"');
      var sendJSON = function (payload) {
        wsConnection.send(JSON.stringify(payload));
      };

      wsConnection.on('message', function (payload) {
        log('We have received an incoming message: ' + payload);
        payload = JSON.parse(payload);

        if (payload.action === 'mostat_ping') {
          sendJSON({ action: 'mostat_pong' });
        } else if (payload.action === 'mostat_reboot') {
          log('REBOOT!');
          ESP32.reboot();
        } else if (payload.action === 'mostat_file') {
          pt_utils.saveRemoteFile(payload.url, payload.path);
        }
      });

      wsConnection.on('close', function () {
        log('Web Socket connection closed, ending handler!');
        console.handler = null;
      });

      // Register a console.log() handler that will send the logged message to
      // the WebSocket.
      console.handler = function (message) {
        log('Sending to WS');
        wsConnection.send(message);
      };
    });
    log('Being a WebSocket server on port ' + WEBSOCKET_PORT);
    webSocketServer.listen(WEBSOCKET_PORT);
  }
};

module.exports = general;