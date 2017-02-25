const mongodb = require('mongodb')
const Promise = require('bluebird')
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
    this._connectionPromise = new Promise((resolve, reject) => {
      mongodb.connect(uri, (err, db) => {
        if (err) {
          return reject(err)
        }
        resolve(db)
      })
    })
    this._connectionPromise
    .then(() => {
      this._runModelQueue()
    })
    return this._connectionPromise
  }

  _runModelQueue () {
    while (this.modelQueue.length) {
      var currentAction = this.modelQueue.shift()
      if (currentAction.name && currentAction.schema) {
        this.model(currentAction.name, currentAction.schema)
      }
    }
  }

  _flushModelQueue () {
    this.modelQueue = []
  }

  _addToModelQueue (name, schema) {
    this.modelQueue.push({name, schema})
  }

  model (name, schema) {
    if (schema) {
      if (!this._connectionPromise) {
        this._addToModelQueue(name, schema)
      } else {
        this.models[name] = new Model(name, schema, this._connectionPromise)
      }
    }
    return this.models[name]
  }
}

module.exports = Db
