"use strict";

var AbstractBag = require('zeujsChaos/bags/abstract.js');
var SchemaPrototype = require('../prototypes/schema.js');

var SchemasBag = function SchemasBag() {
  AbstractBag.call(this);
};

SchemasBag.prototype = Object.create(AbstractBag.prototype);
SchemasBag.prototype.constructor = SchemasBag;
SchemasBag.prototype.find = function find(schemaId) {
  var schema = this.findById(schemaId);
  if (typeof schema === 'undefined') {
    throw 'Schema want to be defined';
  }
  return schema.schema;
};

SchemasBag.prototype.push = function push(datum) {
  this.normalize(datum);
  this.data.push(
    {
      id: datum.id,
      schema: new SchemaPrototype(this.services, datum)
    }
  );
};
module.exports = SchemasBag;