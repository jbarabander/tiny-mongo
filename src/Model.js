var Cursor = require('./Cursor')
var tv4 = require('tv4')
var Promise = require('bluebird')
class Model {
  constructor (name, schema, dbPromise) {
    this.__collection = null
    this.name = name
    this.schema = schema
    this.__collectionPromise = dbPromise.then(db => {
      this.__collection = db.collection(this.name)
      return this.__collection
    })
  }

  validate (doc) {
    return tv4.validate(doc, this.schema)
  }
  giveCursorBack (method, args) {
    return new Cursor(this.__collectionPromise, method, args)
  }

  find () {
    var args = arguments
    return this.giveCursorBack('find', args)
  }
  findOne () {
    var args = arguments
    return this.__collectionPromise.then(function (collection) {
      return collection.findOne.apply(collection, args)
    })
  }
  update () {
    var args = arguments
    return this.__collectionPromise.then(function (collection) {
      return collection.update.apply(collection, args)
    })
  }
  insert () {
    var isValid = this.validate(arguments[0])
    if (!isValid) {
      var error = Error('Invalid Document')
      return Promise.reject(error)
    }
    var args = arguments
    return this.__collectionPromise.then(function (collection) {
      return collection.insert.apply(collection, args)
    })
  }
  createIndex (keys, options) {
    if (!options) {
      options = {}
    }
    if (!options.background) {
      options.background = true
    }
    return this.__collectionPromise.then(function (collection) {
      return collection.createIndex(keys, options)
    })
  }
}

module.exports = Model
