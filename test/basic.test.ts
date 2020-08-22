import * as pull from '@jacobbubu/pull-stream'
import merge from '../src'

describe('basic', () => {
  it('empty', (done) => {
    pull(
      merge(pull.values([]), pull.values([])),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([])
        done()
      })
    )
  })

  it('equal', (done) => {
    pull(
      merge(pull.values([1]), pull.values([1])),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([1])
        done()
      })
    )
  })

  it('array parameter', (done) => {
    pull(
      merge([pull.values([1]), pull.values([2])]),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([1, 2])
        done()
      })
    )
  })

  it('different', (done) => {
    pull(
      merge(pull.values([1]), pull.values([2])),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([1, 2])
        done()
      })
    )
  })

  it('different2', (done) => {
    pull(
      merge(pull.values([2, 3]), pull.values([1])),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([1, 2, 3])
        done()
      })
    )
  })

  it('simple', (done) => {
    pull(
      merge(pull.values([0, 2, 4, 6]), pull.values([1, 3, 5, 7])),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
        done()
      })
    )
  })

  it('overwrite', (done) => {
    pull(
      merge(pull.values([0, 2, 3, 5, 6]), pull.values([1, 4, 5, 7])),
      pull.collect(function (err, ary) {
        expect(err).toBeFalsy()
        expect(ary).toEqual([0, 1, 2, 3, 4, 5, 6, 7])
        done()
      })
    )
  })
})
