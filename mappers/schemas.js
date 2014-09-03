"use strict";

// Prototyping SchemasMapper from AbstractMapper
var AbstractMapper = require('zeujsChaos/mappers/abstract.js');

var SchemasMapper = function SchemasMapper(modules, bag) {
  this.bag = bag;
  AbstractMapper.call(this, modules);
};

SchemasMapper.prototype = Object.create(AbstractMapper.prototype);
SchemasMapper.prototype.constructor = SchemasMapper;
SchemasMapper.prototype.entityKey = 'prometheusSchemas';
module.exports = SchemasMapper;