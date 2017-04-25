const Cursor = require('./Cursor')
const tv4 = require('tv4')
const objectId = require('mongodb').ObjectID
const Promise = require('bluebird')

tv4.addFormat('isValidMongoId', (data) => {
  if (objectId.isValid(data.toString())) {
    return null
  }
  return 'This is not a valid mongo id'
})

tv4.addSchema('objectId', {
  type: ['string', 'object'],
  format: 'isValidMongoId'
})

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

  _applyMethod (method, args) {
    return this._collectionPromise.then(function (collection) {
      return collection[method].apply(collection, args)
    })
  }

  validate (doc) {
    return tv4.validate(doc, this.schema)
  }

  giveCursorBack (method, args) {
    return new Cursor(this._collectionPromise, method, args)
  }

  find () {
    return this.giveCursorBack('find', arguments)
  }

  findOne () {
    return this._applyMethod('findOne', arguments)
  }

  findAndModify () {
    return this._applyMethod('findAndModify', arguments)
  }

  update () {
    return this._applyMethod('update', arguments)
  }

  insert () {
    var isValid = this.validate(arguments[0])
    if (!isValid) {
      var error = Error('Invalid Document')
      return Promise.reject(error)
    }
    return this._applyMethod('insert', arguments)
  }

  createIndex (keys, options) {
    if (!options) {
      options = {}
    }
    if (options.background === undefined) {
      options.background = true
    }
    return this._applyMethod('createIndex', [keys, options])
  }
}

module.exports = Model
