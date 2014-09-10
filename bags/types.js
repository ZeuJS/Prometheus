"use strict";

var AbstractBag = require('zeujsChaos/bags/abstractIndexed.js');

var TypesBag = function TypesBag() {
  AbstractBag.call(this);
};

TypesBag.prototype = Object.create(AbstractBag.prototype);
TypesBag.prototype.constructor = TypesBag;

module.exports = TypesBag;