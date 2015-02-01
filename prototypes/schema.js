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
  this.binaryStorage = litteralSchema.withBinary || false;

}
SchemaObject.prototype.insert = function (document, options, callback) {
  if (!callback) {
    callback = options;
    options = {};
  }
  options.isBinary = this.binaryStorage;
  var scopedThis = this;
  this.filterSchema(document, function (err, cleanDocument) {
    if (err) {
      callback (err)
    } else {
      scopedThis.source.insert(scopedThis.storageEntity, cleanDocument, options, callback);
    }
  });
};

SchemaObject.prototype.findOne = function (search, options, callback) {
  if (!callback) {
    callback = options;
    options = {}
  }
  options.isBinary = this.binaryStorage;
  if (options.maskName && options.maskName in this.masks) {
    search = jsonMask(search, this.masks[options.maskName])
  }
  this.source.findOne(this.storageEntity, search, options, callback);
};

SchemaObject.prototype.find = function (search, options, callback) {

  if (!callback) {
    callback = options;
    options = {}
  }
  options.isBinary = this.binaryStorage;
  var schemaThis = this;

  Object.keys(search).forEach(function (key) {
    var object = navigateWithDots(schemaThis.sieve, key);
    search[key] = new object(search[key]);
  });

  if (options.maskName && options.maskName in this.masks) {
    search = jsonMask(search, this.masks[options.maskName])
  }
  this.source.find(this.storageEntity, search, options, callback);
};

SchemaObject.prototype.setBehaviors = function (services, behaviors) {
  //todo
};

SchemaObject.prototype.filterSchema = function(input, cb) {
  cb.apply(null, this.filterObject(input, this.sieve));
}

SchemaObject.prototype.filterObject = function (input, schema) {
  var output = {};
  var errors = [];
  var scopedThis = this;
  Object.keys(schema).forEach(function(key) {
    var value;
    if (typeof input === 'undefined') {
      value = scopedThis.filterValue(input, schema[key]);
    } else {
      value = scopedThis.filterValue(input[key], schema[key]);
    }
    if (value[0]) {
      errors.push(
        {
          key: key,
          errors: value[0]
        }
      );
    }
    output[key] = value[1];
  });
  if (errors.length === 0) {
    errors = null;
  }
  return [errors, output];
}

SchemaObject.prototype.filterArray = function (scopedInput, scopedSchema) {
  var input;
  if (scopedInput instanceof Array) {
    input = scopedInput;
  } else {
    input = [scopedInput];
  }
  var errors = [];
  var output = [];
  var scopedThis = this;

  input.forEach(function(value) {
    var val = scopedThis.filterValue(value, scopedSchema[0]);
    if (val[0]) {
      errors.push(val[0]);
    }
    output.push(val[1]);
  });
  if (errors.length === 0) {
    errors = null;
  }
  return [errors, output];
}

SchemaObject.prototype.filterValue = function (scopedInput, scopedSchema) {
  if (typeof scopedSchema === 'object' && scopedSchema instanceof Array) {
    return this.filterArray(scopedInput, scopedSchema);
  } else if (typeof scopedSchema === 'object' && scopedSchema.constructor === Object) {
    return this.filterObject(scopedInput, scopedSchema);
  }

  var errors = [];
  var output;
  if (typeof scopedInput === 'undefined') {
    errors.push('undefined');
  }
  try {
    var object = new scopedSchema(scopedInput);
    if(object.valueFor) {
      output = object.valueFor(this.source.constructor.name);
    } else if(object.valueOf) {
      output = object.valueOf();
    } else {
      output = object;
    }
  } catch (e) {
    if (typeof e === 'string') {
      errors.push(e);
    } else {
      errors.push(e.message);
    }
  }

  if (errors.length === 0) {
    errors = null;
  }
  return [errors, output];
};

SchemaObject.prototype.getData = function (id, options, callback) {
  if (!this.binaryStorage) {
    throw 'To use retrieve, schema must be binary';
  }
  if (!callback) {
    callback = options;
    options = {}
  }
  this.source.getData(this.storageEntity, id, options, callback);
}

module.exports = SchemaObject;

function navigateWithDots (object, way) {
  if (typeof way === 'string') {
    way = way.split(".");
  }

  while(way.length && (object = object[way.shift()]));
  return object;
}