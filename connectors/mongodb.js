"use strict";

var mongoDriver = require('mongodb');
var mongoClient = mongoDriver.MongoClient;
var ObjectId = mongoDriver.ObjectID;

// Prototyping MongoDBConnector from AbstractConnector
var AbstractConnector = require('./abstract.js');

var MongoDBConnector = function MongoDBConnector(services) {
  AbstractConnector.call(this, services);
};

MongoDBConnector.prototype = Object.create(AbstractConnector.prototype);
MongoDBConnector.prototype.constructor = MongoDBConnector;
MongoDBConnector.prototype.getStorageEntity = function (id, cb) {
  this.storageEntity = this.datasource.collection(id, cb);
};
MongoDBConnector.prototype.getDatasource = function (object, cb) {
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

MongoDBConnector.prototype.insert = function (storageEntity, toInsert, options, cb) {
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    collection.insert(toInsert, cb);
  })
};

MongoDBConnector.prototype.findOne = function (storageEntity, search, cb) {
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    if (search.id && search.id.match(/^[0-9a-fA-F]{24}$/)) {
      search._id = new ObjectId(search.id);
      delete search.id;
    }
    collection.findOne(search, cb);
  })
};

MongoDBConnector.prototype.find = function (storageEntity, search, cb) {
  this.getStorageEntity(storageEntity, function(err, collection){
    if (err) { throw err; }
    collection.find(search).toArray(cb);
  })
};

module.exports = MongoDBConnector;