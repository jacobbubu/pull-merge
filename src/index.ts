import * as pull from '@jacobbubu/pull-stream'

function isUndef(a: any) {
  return a == null
}

function isOkay(a: any) {
  return a != null
}

function cmp(a: any, b: any) {
  return a < b ? -1 : a > b ? 1 : 0
}

type Cb = (err: pull.EndOrError, v: any) => void

function singly(fun: (value: boolean | null, cb: Cb) => void) {
  let called = false
  return function (value: boolean | null, cb: Cb) {
    if (called) return

    called = true
    fun(value, function (err: pull.EndOrError, value) {
      called = false
      cb(err, value)
    })
  }
}

function once<T>(cb: pull.SourceCallback<T>, name: string = '') {
  let called = false
  name = name || ''
  return function (err: pull.EndOrError, data: T) {
    if (called) {
      throw new Error(name + ' called-back twice!')
    }
    called = true
    return cb(err, data)
  }
}

type Compare<T> = (a: T, b: T) => number

export default function merge<T>(
  left: pull.Source<T> | pull.Source<T>[],
  right?: pull.Source<T> | Compare<T>,
  compare?: Compare<T>
): pull.Source<T> {
  if (Array.isArray(left)) {
    compare = right as Compare<T>
    if (left.length === 0) {
      // empty stream
      return function (abort: pull.Abort, cb: pull.SourceCallback<T>) {
        cb(true)
      }
    } else if (left.length === 1) {
      return left[0]
    } else if (left.length === 2) {
      return merge(left[0], left[1], compare)
    } else if (left.length === 3) {
      return merge(left[0], merge(left[1], left[2], compare), compare)
    } else if (left.length >= 4) {
      const i = Math.floor(left.length / 2)
      return merge(merge(left.slice(0, i), compare), merge(left.slice(i), compare), compare)
    }
  }
  const normalizedCompare = compare ?? cmp

  let cb: pull.SourceCallback<T> | null

  const getLeft = singly(left as pull.Source<T>)
  const getRight = singly(right as pull.Source<T>)

  function abortAll(abort: pull.Abort, cb: pull.SourceCallback<T>) {
    let waiting = 2
    let erred: pull.EndOrError
    if (endedLeft) done()
    else getLeft(true, done)
    if (endedRight) done()
    else getRight(true, done)

    function done(err?: pull.EndOrError) {
      erred = erred || (err === true ? null : err ?? null)
      if (!--waiting) cb(erred || true)
    }
  }

  let readyLeft: T | undefined
  let readyRight: T | undefined
  let endedLeft: pull.EndOrError
  let endedRight: pull.EndOrError

  function next() {
    let _cb: pull.SourceCallback<T>
    let data

    if (!cb) return

    if (endedLeft && endedRight) {
      _cb = cb
      cb = null
      return _cb(true)
    }

    if (endedLeft && isOkay(readyRight)) {
      data = readyRight
      readyRight = undefined
    } else if (endedRight && isOkay(readyLeft)) {
      data = readyLeft
      readyLeft = undefined
    } else if (isUndef(readyLeft) || isUndef(readyRight)) {
      return
    } else {
      // compare the comparator with 0, incase user provided compare() return decimals.
      switch (cmp(normalizedCompare(readyLeft!, readyRight!), 0)) {
        case 0:
          data = readyRight
          readyLeft = readyRight = undefined
          break
        case 1:
          data = readyRight
          readyRight = undefined
          break
        case -1:
          data = readyLeft
          readyLeft = undefined
          break
      }
    }
    _cb = cb
    cb = null
    _cb(null, data)
  }

  function pull() {
    if ((readyLeft || endedLeft) && (readyRight || endedRight)) return next()

    if (isUndef(readyLeft) && !endedLeft) {
      getLeft(null, function (err, data) {
        readyLeft = data
        endedLeft = err
        next()
      })
    }

    if (isUndef(readyRight) && !endedRight) {
      getRight(
        null,
        once<T>(function (err, data) {
          readyRight = data
          endedRight = err
          next()
        })
      )
    }
  }

  return function (abort: pull.Abort, _cb: pull.SourceCallback<T>) {
    cb = _cb
    if (abort) return abortAll(abort, cb)
    pull()
  }
}
