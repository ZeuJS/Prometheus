"use strict";

var AbstractBag = require('zeujsChaos/bags/abstract.js');

var BehaviorsBag = function BehaviorsBag() {
  AbstractBag.call(this);
};

BehaviorsBag.prototype = Object.create(AbstractBag.prototype);
BehaviorsBag.prototype.constructor = BehaviorsBag;

module.exports = BehaviorsBag;