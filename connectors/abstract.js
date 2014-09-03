"use strict";

var AbstractConnector = function(services) {
  this.services = services;
  this.datasource = null;
  this.storageEntity = null;
}

AbstractConnector.prototype.setStorageEntity = function (datasource, id, cb) {
  throw 'getCollectionObject must be defined in connector';
};

AbstractConnector.prototype.addDatasource = function (data) {
  throw 'addDatasource must be defined in connector';
};

AbstractConnector.prototype.insert = function (storageEntity, toInsert, options, cb) {
  throw 'insert must be defined in connector';
};


module.exports = AbstractConnector;