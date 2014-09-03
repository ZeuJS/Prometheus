"use strict";

var SchemaObject = function(services, litteralSchema) {
  this.sieve = litteralSchema.schema;
  this.setBehaviors(services, litteralSchema.behaviors);
  this.storageEntity = litteralSchema.storageEntity;
  this.source = services.findById('prometheusDatasources').get(litteralSchema.source).source;
  this.sieveBehavior = litteralSchema.schemaMask || 0;

}
SchemaObject.prototype.insert = function (document, callback) {
  this.source.insert(this.storageEntity, document, null, callback);
};
SchemaObject.prototype.setBehaviors = function (services, behaviors) {

};
SchemaObject.prototype.filterInput = function (input) {
  var scopedThis = this;
  Object.keys(input).forEach(function(key) {
    if (scopedThis.sieveBehavior <= 0 && !this.sieve.hasOwnProperty(key)) {
      delete input[key];
    }
  });
};

module.exports = SchemaObject;