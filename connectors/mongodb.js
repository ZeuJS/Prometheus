"use strict";

var mongoDriver = require('mongodb');
var mongoClient = mongoDriver.MongoClient;
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
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    collection.insert(toInsert, cb);
  })
};

MongoDB.prototype.findOne = function (storageEntity, search, cb) {
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    if (search.id && search.id.match(/^[0-9a-fA-F]{24}$/)) {
      search._id = new ObjectId(search.id);
      delete search.id;
    }
    collection.findOne(search, cb);
  })
};

MongoDB.prototype.find = function (storageEntity, search, cb) {
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    collection.find(search).toArray(cb);
  })
};

module.exports = MongoDB;