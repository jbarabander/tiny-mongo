var Transform = require('stream').Transform

class Cursor {
  constructor (collectionPromise, methodName, upperArgs) {
    this._wrappedCursor = null
    // this._prefetchStack = []
    this._cursorPromise = collectionPromise.then(collection => {
      this._wrappedCursor = collection[methodName].apply(collection, upperArgs)
      return this._wrappedCursor
    })
  }

  _applyToCursor (methodName, args, returnCursor) {
    var valueToReturn
    if (this._wrappedCursor === null) {
      valueToReturn = this._cursorPromise.then(cursor => {
        return cursor[methodName].apply(cursor, args)
      })
    } else {
      valueToReturn = this._wrappedCursor[methodName].apply(this._wrappedCursor, args)
    }
    if (returnCursor) {
      return this
    } else {
      return valueToReturn
    }
  }

  sort () {
    return this._applyToCursor('sort', arguments, true)
  }

  rewind () {
    return this._applyToCursor('rewind', arguments, true)
  }

  toArray () {
    return this._applyToCursor('toArray', arguments)
  }

  each () {
    return this._applyToCursor('each', arguments)
  }

  limit () {
    return this._applyToCursor('limit', arguments, true)
  }

  skip () {
    return this._applyToCursor('skip', arguments, true)
  }

  stream (transform) {
    var transformOptions = {
      objectMode: true
    }
    if (typeof transform === 'function') {
      transformOptions.transform = transform
    }
    var transformStream = Transform(transformOptions)
    return this.pipe(transformStream)
  }

  pipe (destStream) {
    if (this._wrappedCursor === null) {
      this._cursorPromise.then(function (cursor) {
        cursor.pipe(destStream)
      })
    } else {
      this._wrappedCursor.pipe(destStream)
    }
    return destStream
  }

  on () {
    return this._applyToCursor('on', arguments, true)
  }
}

module.exports = Cursor
