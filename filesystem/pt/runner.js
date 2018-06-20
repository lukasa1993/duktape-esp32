/* globals require, FS, Buffer, log, DUKF, module*/
var pt_utils = require('pt/utils');

(function () {
  var app_index = pt_utils.readFile('pt/app_index.json');
  app_index     = JSON.parse(app_index);

  var active_js = require('pt/apps/' + app_index.apps[app_index.active]);
  active_js.init();

})();