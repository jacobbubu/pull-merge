import * as pull from '@jacobbubu/pull-stream'
import merge from '../src'

pull(
  merge(pull.values([2, 3]), pull.values([1])),
  pull.collect(function (_, ary) {
    console.log(ary)
  })
)
