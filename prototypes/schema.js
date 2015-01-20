"use strict";
var jsonMask = require('json-mask');

var SchemaObject = function(services, litteralSchema) {
  this.sieve = litteralSchema.schema;
  if (typeof litteralSchema.schema === 'function') {
    this.sieve = litteralSchema.schema(services.findById('prometheusTypes'));
  } else if (typeof litteralSchema.schema === 'object') {
    this.sieve = litteralSchema.schema;
  } else {
    throw 'Schema must be function or litteral object';
  }
  this.masks = litteralSchema.masks;
  this.setBehaviors(services, litteralSchema.behaviors);
  this.storageEntity = litteralSchema.storageEntity;
  this.source = services.findById('prometheusDatasources').get(litteralSchema.source).source;

}
SchemaObject.prototype.insert = function (document, callback) {
  var scopedThis = this;
  this.filterInput(document, function (err, cleanDocument) {
    if (err) {
      callback (err)
    } else {
      scopedThis.source.insert(scopedThis.storageEntity, cleanDocument, null, callback);
    }
  });
};

SchemaObject.prototype.findOne = function (maskName, search, callback) {
  if (!callback) {
    callback = search;
    search = maskName;
    maskName = undefined;
  }
  if (maskName && maskName in this.masks) {
    search = jsonMask(search, this.masks[maskName])
  }
  this.source.findOne(this.storageEntity, search, callback);
};

SchemaObject.prototype.setBehaviors = function (services, behaviors) {

};
SchemaObject.prototype.filterInput = function (input, cb) {
  var scopedThis = this;
  var errors = [];
  var output = {};
  Object.keys(scopedThis.sieve).forEach(function(key) {
    try {
      if (!input.hasOwnProperty(key)) {
        throw {key: key, error: 'Not exist'}
      }
      var Object;
      if (typeof scopedThis.sieve[key] === 'object' && scopedThis.sieve[key] instanceof Array) {
        Object = scopedThis.sieve[key][0];
        output[key] = [];
        if (typeof input[key] !== 'object' || !(input[key] instanceof Array)) {
          input[key] = [input[key]];
        }
        input[key].forEach(function (value) {
          var object = new Object(value);
          output[key].push(object.valueOf());
        });
      } else {
        Object = scopedThis.sieve[key];
        var object = new Object(input[key]);
        output[key] = object.valueOf();
      }
    } catch (e) {
      errors.push(e);
    }
  });
  if (errors.length === 0) {
    errors = null;
  }
  cb(errors, output);
};

module.exports = SchemaObject;