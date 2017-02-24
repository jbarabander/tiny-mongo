const Cursor = require('./Cursor')
const tv4 = require('tv4')
const Promise = require('bluebird')
class Model {
  constructor (name, schema, dbPromise) {
    this._collection = null
    this.name = name
    this.schema = schema
    this._collectionPromise = dbPromise.then(db => {
      this._collection = db.collection(this.name)
      return this._collection
    })
  }

  validate (doc) {
    return tv4.validate(doc, this.schema)
  }

  giveCursorBack (method, args) {
    return new Cursor(this._collectionPromise, method, args)
  }

  find () {
    var args = arguments
    return this.giveCursorBack('find', args)
  }

  findOne () {
    var args = arguments
    return this._collectionPromise.then(function (collection) {
      return collection.findOne.apply(collection, args)
    })
  }

  findAndModify () {
    var args = arguments
    return this._collectionPromise.then(function (collection) {
      return collection.findOne.apply(collection, args)
    })
  }

  update () {
    var args = arguments
    return this._collectionPromise.then(function (collection) {
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
    return this._collectionPromise.then(function (collection) {
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
    return this._collectionPromise.then(function (collection) {
      return collection.createIndex(keys, options)
    })
  }
}

module.exports = Model
