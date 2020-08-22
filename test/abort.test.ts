import * as pull from '@jacobbubu/pull-stream'
import merge from '../src'

function counter(i: number, j: number): pull.Source<number> {
  return function read(end, cb) {
    if (end) {
      ;(read as any).ended = end
      return cb(end)
    }
    const n = i
    i += j
    setImmediate(function () {
      cb(null, n)
    })
  }
}

describe('abort', () => {
  it('counter', (done) => {
    pull(
      counter(1, 2),
      pull.take(4),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([1, 3, 5, 7])
        done()
      })
    )
  })

  it('abort both', (done) => {
    const odd = counter(1, 2)
    const even = counter(0, 2)

    pull(
      merge(odd, even),
      pull.take(4),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([0, 1, 2, 3])
        expect((odd as any).ended).toBeTruthy()
        expect((even as any).ended).toBeTruthy()
        done()
      })
    )
  })

  it('abort left', (done) => {
    const odd = counter(1, 2)
    const even = pull(counter(0, 2), pull.take(1))

    pull(
      merge(odd, even),
      pull.take(4),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([0, 1, 3, 5])
        expect((odd as any).ended).toBeTruthy()
        expect((even as any).ended).toBeUndefined()
        done()
      })
    )
  })

  it('abort right', (done) => {
    const odd = pull(counter(1, 2), pull.take(1))
    const even = counter(0, 2)

    pull(
      merge(odd, even),
      pull.take(4),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([0, 1, 2, 4])
        expect((odd as any).ended).toBeUndefined()
        expect((even as any).ended).toBeTruthy()
        done()
      })
    )
  })
})
