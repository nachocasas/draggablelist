const fs = require('fs');
const MongoClient = require('mongodb').MongoClient;
const ObjectID = require('mongodb').ObjectID

const CONN_URL = 'mongodb://mongoDB/';
//const CONN_URL = 'mongodb://127.0.0.1:27017/';
const DB_NAME = 'draggable'

exports.deleteItem = function (id, callback){
  MongoClient.connect(CONN_URL, function(err, client) {
    if(err) { callback(err, null); return};
    const db = client.db(DB_NAME);
    const collection = db.collection('items');
    let filename = '';

    module.exports.getItem(id, function(err, item){
      if(err) return;
      filename = item.img;
   
      collection.remove({_id: ObjectID(id)}, function(err, removed) {
        if(filename){
          fs.unlink('uploads/'+filename, function(err) {
            if (err) return;
          });
        }
        callback(err, removed);
        client.close();
      });
    });
  });
}

exports.updateItem = function(id, data, callback){
  MongoClient.connect(CONN_URL, function(err, client) {
    const db = client.db(DB_NAME);
    const collection = db.collection('items');
    let filename = '';

    module.exports.getItem(id, function(err, item){
      if(err) return;
      filename = item.img;
      collection.updateOne({_id: ObjectID(id)}, {$set: data}, function(err, result){
        if(filename){
          fs.unlink('uploads/'+filename, function(err) {
            if (err) return;
            console.log('uploads/'+filename+ ' DELETED');
          });
        }
        callback(err, result);
        client.close();
      })
      });
  });
}

exports.updateItems = function(ids){
  MongoClient.connect(CONN_URL, function(err, client) {
    const db = client.db(DB_NAME);
    const collection = db.collection('items');
    for (i in ids){
      collection.updateOne({_id: ObjectID(ids[i])}, {$set: {order: i}})
    }
  });
}

exports.saveItem = function(item, callback){
  MongoClient.connect(CONN_URL, function(err, client) {
    if(err) { callback(err, null); return};
    const db = client.db(DB_NAME);
    const collection = db.collection('items');

    collection.insertOne(item, function(err, result){
      callback(err, result);
      client.close();
    });
  });
}

exports.getAllItems = function(callback){
  MongoClient.connect(CONN_URL, function(err, client) {
    if(err) { callback(err, null); return };
    const db = client.db(DB_NAME);
    const collection = db.collection('items');

    collection.find({}).sort({order: 1}).toArray(function(err, items) {
      if(err) { callback(err, null); return};
      callback(null, items);
      client.close();
    })
  });
}

exports.getItem = function(id, callback){
  MongoClient.connect(CONN_URL, function(err, client) {
    if(err) { callback(err, null); return };
    const db = client.db(DB_NAME);
    const collection = db.collection('items');

    collection.findOne({_id: ObjectID(id)}, function(err, item) {
      if(err) { callback(err, null); return };
      callback(null, item);
      client.close();
    })
  });
}
