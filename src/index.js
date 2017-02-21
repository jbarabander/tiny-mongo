var mongodb = require('mongodb')
var Promise = require('bluebird')
const Model = require('./Model')
class Db {
  constructor (uri) {
    this.__connectionPromise = this.connect(uri)
    this.models = {}
  }
  connect (uri) {
    return new Promise(function (resolve, reject) {
      mongodb.connect(uri, function (err, db) {
        if (err) {
          return reject(err)
        }
        resolve(db)
      })
    })
  }
  model (name, schema) {
    if (schema) {
      this.models[name] = new Model(name, schema, this.__connectionPromise)
    }
    return this.models[name]
  }
}

module.exports = Db
