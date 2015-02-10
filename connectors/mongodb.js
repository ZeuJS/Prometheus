"use strict";

var mongoDriver = require('mongodb');
var fs = require('fs');
var stream = require('stream');
var mongoClient = mongoDriver.MongoClient;
var GridStore = mongoDriver.GridStore;
var Grid = mongoDriver.Grid;
var ObjectId = mongoDriver.ObjectID;

// Prototyping MongoDB from AbstractConnector
var AbstractConnector = require('./abstract.js');

var MongoDB = function MongoDB(services) {
  AbstractConnector.call(this, services);
};

MongoDB.prototype = Object.create(AbstractConnector.prototype);
MongoDB.prototype.constructor = MongoDB;
MongoDB.prototype.getStorageEntity = function (id, cb) {
  this.storageEntity = this.datasource.collection(id, cb);
};
MongoDB.prototype.getDatasource = function (object, cb) {
  var scopedThis = this;
  if (typeof object.uriSource !== 'string') {
    object.uriSource = 'mongodb://localhost:27017/zeuJS';
  }
  mongoClient.connect(object.uriSource, function(err, db){
    if (err) { throw err }
    scopedThis.datasource = db;
    cb();
  });
};

MongoDB.prototype.insert = function (storageEntity, toInsert, options, cb) {
  var self = this;
  if (options.isBinary) {
    fs.readFile(options.bin.path, function (err, file) {
      if (err) throw err;
      var storageOptions = {
        content_type: options.bin.type,
        metadata: toInsert,
        root: storageEntity
      };
      var gridStore = new GridStore(self.datasource, new ObjectId(), options.bin.name, 'w', storageOptions);
      gridStore.open(function(err, gridStore) {
        gridStore.write(file, function(err, gridStore) {

          gridStore.close(cb);
        });
      });
    });
  } else {
    this.getStorageEntity(storageEntity, function(err, collection){
      if (err) { throw err; }
      collection.insert(toInsert, cb);
    })
  }
};

MongoDB.prototype.save = function (storageEntity, toSave, options, cb) {
  //todo implement binary
  var self = this;
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    collection.save(toSave, cb);
  })
};

MongoDB.prototype.findOne = function (storageEntity, search, options, cb) {
  if (options.isBinary) {
    storageEntity = storageEntity + '.files';
    var oldSearch = search;
    search = {};
    Object.keys(oldSearch).forEach(function(key) {
      if (key === '_id' && oldSearch[key].match(/^[0-9a-fA-F]{24}$/)) {
        search[key] = new ObjectId(oldSearch[key]);
      } else {
        search['metadata.' + key] = oldSearch[key];
      }

    });
  }
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    if (typeof search._id === 'string' && search._id.match(/^[0-9a-fA-F]{24}$/)) {
      search._id = new ObjectId(search._id);
    } else if (search.id && search.id.match(/^[0-9a-fA-F]{24}$/)) {
      search._id = new ObjectId(search.id);
      delete search.id;
    }
    collection.findOne(search, cb);
  })
};

MongoDB.prototype.find = function (storageEntity, search, options, cb) {
  if (options.isBinary) {
    storageEntity = storageEntity + '.files';
    var oldSearch = search;
    search = {};
    Object.keys(oldSearch).forEach(function(key) {
      search['metadata.' + key] = oldSearch[key];
    });
  }
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    collection.find(search).toArray(cb);
  })
};

MongoDB.prototype.getData = function (storageEntity, id, options, cb) {
  if (typeof id === 'string') {
    id = new ObjectId(id);
  }
  var storageOptions = {
    root: storageEntity
  }
  options = options || {};
  options.range = options.range || {};
  options.range.start = options.range.start || 0;
  var gridStore = new GridStore(this.datasource, id, 'r', storageOptions);
  gridStore.open(function(err, gridStore) {
    if (!gridStore) {
      return cb(err);
    }
    gridStore.seek(options.range.start, function() {
      // Read the entire file
      var length = null;
      if (options.range.end) {
        length = options.range.end - options.range.start +1;
      }
      gridStore.read(length, function(err, data) {
        var bufferStream = new stream.PassThrough();
        bufferStream.end(data);
        cb(err, bufferStream);
        gridStore.close();
      });
    });
  });

};

module.exports = MongoDB;