"use strict";

// Prototyping BehaviorsMapper from AbstractMapper
var AbstractMapper = require('zeujsChaos/mappers/abstract.js');

var BehaviorsMapper = function BehaviorsMapper(modules, bag) {
  this.bag = bag;
  AbstractMapper.call(this, modules);
};

BehaviorsMapper.prototype = Object.create(AbstractMapper.prototype);
BehaviorsMapper.prototype.constructor = BehaviorsMapper;
BehaviorsMapper.prototype.entityKey = 'prometheusBehaviors';
module.exports = BehaviorsMapper;