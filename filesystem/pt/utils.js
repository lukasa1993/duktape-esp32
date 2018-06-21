/* globals require, FS, Buffer, log, DUKF, JSON, module*/
var FS        = require('pt/libs/fs');
var http      = require('pt/libs/http');
var urlParser = require('pt/libs/url');

var utils = {
  root_path:      '/spiffs/',
  app_index_path: 'pt/app_index.json'
};

utils.readFile = function (filename) {
  var fd      = FS.openSync(this.root_path + filename, 'r');
  var content = '';

  var buffer = new Buffer(128);
  while (1) {
    var sizeRead = FS.readSync(fd, buffer, 0, buffer.length, null);

    if (sizeRead <= 0) {
      break;
    }
    content += buffer.toString('utf8', 0, sizeRead);
  }

  FS.closeSync(fd);

  return content;
};

utils.saveFile = function (fileName, data) {
  var fd = FS.openSync(this.root_path + fileName, 'w');
  FS.writeSync(fd, data);
  FS.closeSync(fd);
};

utils.listRoot = function () {
  return FS.spiffsDir();
};

utils.setActiveApp   = function (app_name) {
  var app_index = this.readFile(this.app_index_path);
  app_index     = JSON.parse(app_index);

  if (app_index.apps.hasOwnProperty(app_name) === false) {
    console.log(app_name + ' Not Found!');
    return;
  }

  app_index.active = app_name;

  this.saveFile(this.app_index_path, JSON.stringify(app_index));
};
utils.saveRemoteFile = function (url, path) {
  var self      = this;
  var parsedURL = urlParser.parse(url);

  http.request({
    host: parsedURL.hostname,
    port: parsedURL.port,
    path: parsedURL.pathname
  }, function (response) {
    let postBody = '';
    response.on('data', function (data) {
      postBody += data;

    });
    response.on('end', function () {
      self.saveFile(path, postBody);
    });
  });
};

module.exports = utils;