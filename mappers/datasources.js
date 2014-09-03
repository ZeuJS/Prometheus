"use strict";

// Prototyping DatasourcesMapper from AbstractMapper
var AbstractMapper = require('zeujsChaos/mappers/abstract.js');
var DatasourcesMapper = function Constructor(services, bag, cb) {
  this.bag = bag;
  this.walker(services, cb);
};

DatasourcesMapper.prototype = Object.create(AbstractMapper.prototype);
DatasourcesMapper.prototype.constructor = DatasourcesMapper;
DatasourcesMapper.prototype.walker = function foreachModule(services, cb) {
  var currentThis = this;
  var scopedProcess = this.process.bind(this);
  var configDataSource = services.findById('configs').find('prometheus')
  scopedProcess(services, Object.keys(configDataSource.sources), configDataSource.sources, cb);
};
DatasourcesMapper.prototype.process = function (services, keys, entities, cb) {
  this.bag.push(services, keys, entities, cb);
};
module.exports = DatasourcesMapper;