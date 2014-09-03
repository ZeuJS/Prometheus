"use strict";

var AbstractBag = require('zeujsChaos/bags/abstract.js');
var mongodb = require('mongodb');
var MongoClient = mongodb.MongoClient;

var DatasourceBag = function DatasourceBag(config) {
  AbstractBag.call(this);
};

DatasourceBag.prototype = Object.create(AbstractBag.prototype);
DatasourceBag.prototype.constructor = DatasourceBag;

DatasourceBag.prototype.get = function getDSource(id) {
  var source = this.findById(id);
  if (typeof source === 'undefined') {
    var defaultSource = "default";
    source = this.findById(defaultSource);
  }
  return source
};

DatasourceBag.prototype.push = function push(services, keys, items, cb) {
  if (keys.length < 1) {
    cb();
    return;
  }
  var key = keys.shift();
  var item = items[key];
  var Connector = require('../connectors/' + item.connector + '.js');
  var connector = new Connector(services);
  var scopedThis = this;
  connector.getDatasource(item, function() {
    scopedThis.data.push({
      id: key,
      source: connector,
    });
    scopedThis.push(services, keys, items, cb);
  });
};

module.exports = DatasourceBag;