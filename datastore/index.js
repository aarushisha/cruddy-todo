const fs = require('fs');
const path = require('path');
const _ = require('underscore');
const counter = require('./counter');
var Promise = require('bluebird');

var items = {};

// Public API - Fix these CRUD functions ///////////////////////////////////////

exports.create = (text, callback) => {
  counter.getNextUniqueId(function(err, id) {
    fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, function(err, data) {
      if (err) {
        console.log('err in exports.create ', err);
      } else {
        callback(null, { id, text });
      }
    });
  });
};


exports.readOne = (id, callback) => {
  fs.readFile(path.join(exports.dataDir, `${id}.txt`), 'utf8', function(err, data) {
    if (!data) {
      callback(new Error(`No item with id: ${id}`));
    } else {
      callback(null, { id, text: data });
    }
  });
};

var promisifiedReadOne = Promise.promisify(exports.readOne);
console.log('helllooooooo ', typeof exports.readOne);

exports.readAll = (callback) => {

  fs.readdir(exports.dataDir, function(err, files) {
    Promise.all(_.map(files, (zeroPaddedNumber) => {
      var id = zeroPaddedNumber.slice(0, 5);
      return promisifiedReadOne(id);
    })).then(function(response) {
      console.log(response);
      callback(null, response);
    })
  });
};


exports.update = (id, text, callback) => {
  fs.stat(path.join(exports.dataDir, `${id}.txt`), function(err, stats) {
    if (stats) {
      fs.writeFile(path.join(exports.dataDir, `${id}.txt`), text, function(err, data) {
        callback(null, { id, text });
      });
    } else {
      callback(new Error(`No item with id: ${id}`));
    }
  });
};

exports.delete = (id, callback) => {
  fs.stat(path.join(exports.dataDir, `${id}.txt`), function(err, stats) {
    if (stats) {
      fs.unlink(path.join(exports.dataDir, `${id}.txt`), function(err) {
        callback();
      });
    } else {
      callback(new Error(`No item with id: ${id}`));
    }
  });
};

// Config+Initialization code -- DO NOT MODIFY /////////////////////////////////

exports.dataDir = path.join(__dirname, 'data');

exports.initialize = () => {
  if (!fs.existsSync(exports.dataDir)) {
    fs.mkdirSync(exports.dataDir);
  }
};
