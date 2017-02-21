class Cursor {
  constructor (collectionPromise, methodName, upperArgs) {
    this.__wrappedCursor = null
    // this.__prefetchStack = []
    this.__cursorPromise = collectionPromise.then(collection => {
      this.__wrappedCursor = collection[methodName].apply(collection, upperArgs)
      return this.__wrappedCursor
    })
  }
  __applyToCursor (methodName, args, returnCursor) {
    var valueToReturn
    if (this.__wrappedCursor === null) {
      valueToReturn = this.__cursorPromise.then(cursor => {
        return cursor[methodName].apply(cursor, args)
      })
    } else {
      valueToReturn = this.__wrappedCursor[methodName].apply(this.__wrappedCursor, args)
    }
    if (returnCursor) {
      return this
    } else {
      return valueToReturn
    }
  }
  sort () {
    return this.__applyToCursor('sort', arguments, true)
  }
  rewind () {
    return this.__applyToCursor('rewind', arguments, true)
  }
  toArray () {
    return this.__applyToCursor('toArray', arguments)
  }
  each () {
    return this.__applyToCursor('each', arguments)
  }
  limit () {
    return this.__applyToCursor('limit', arguments, true)
  }
  skip () {
    return this.__applyToCursor('skip', arguments, true)
  }
  stream () {
    // NOTE: I know this has issues we are just going to let it go for now
    return this.__applyToCursor('stream', arguments, true)
  }
  pipe (destStream) {
    if (this.__wrappedCursor === null) {
      this.__cursorPromise.then(function (cursor) {
        cursor.pipe(destStream)
      })
    } else {
      this.__wrappedCursor.pipe(destStream)
    }
    return destStream
  }
  on () {
    return this.__applyToCursor('on', arguments, true)
  }
}

module.exports = Cursor
