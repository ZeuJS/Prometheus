"use strict";

// Prototyping TypesMapper from AbstractMapper
var AbstractMapper = require('zeujsChaos/mappers/abstract.js');

var TypesMapper = function TypesMapper(modules, bag) {
  this.bag = bag;
  AbstractMapper.call(this, modules);
};

TypesMapper.prototype = Object.create(AbstractMapper.prototype);
TypesMapper.prototype.constructor = TypesMapper;
TypesMapper.prototype.entityKey = 'prometheusTypes';

TypesMapper.prototype.process = function (entity) {
  this.bag.push(entity.id, entity.type);
};

module.exports = TypesMapper;