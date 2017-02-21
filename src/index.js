var mongodb = require('mongodb')
var Promise = require('bluebird')
const Model = require('./Model')
class Db {
  constructor (uri) {
    if (uri) {
      this.connect(uri)
    }
    this.models = {}
    this.modelQueue = []
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

  __runModelQueue () {
    while (this.modelQueue.length) {
      var currentAction = this.modelQueue.shift()
      if (currentAction.name && curentAction.schema) {
        this.model(currentAction.name, currentAction.schema)
      }
    }
  }

  __flushModelQueue () {
    this.modelQueue = []
  }

  __addToModelQueue (name, schema) {
    this.modelQueue.push({name, schema})
  }

  model (name, schema) {
    if (schema) {
      if (!this.__connectionPromise) {
        this.__addToModelQueue(name, schema)
      } else {
        this.models[name] = new Model(name, schema, this.__connectionPromise)
      }
    }
    return this.models[name]
  }
}

module.exports = Db
