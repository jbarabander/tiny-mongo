var mongodb = require('mongodb')
var Promise = require('bluebird')
const Model = require('./Model')
class Db {
  constructor (uri) {
    if (uri) {
      this.connect(uri)
    }
    this.models = {}
  }
  connect (uri) {
    this.__connectionPromise = new Promise((resolve, reject) => {
      mongodb.connect(uri, (err, db) => {
        if (err) {
          return reject(err)
        }
        resolve(db)
      })
    })
    return this.__connectionPromise
  }
  model (name, schema) {
    if (schema) {
      this.models[name] = new Model(name, schema, this.__connectionPromise)
    }
    return this.models[name]
  }
}

module.exports = Db
