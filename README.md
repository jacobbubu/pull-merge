# @jacobbubu/pull-merge

[![Build Status](https://github.com/jacobbubu/pull-merge/workflows/Build%20and%20Release/badge.svg)](https://github.com/jacobbubu/pull-merge/actions?query=workflow%3A%22Build+and+Release%22)
[![Coverage Status](https://coveralls.io/repos/github/jacobbubu/pull-merge/badge.svg)](https://coveralls.io/github/jacobbubu/pull-merge)
[![npm](https://img.shields.io/npm/v/@jacobbubu/pull-merge.svg)](https://www.npmjs.com/package/@jacobbubu/pull-merge/)

> Rewriting the [pull-merge](https://github.com/dominictarr/pull-merge) with TypeScript.

# pull-merge

merge sorted pull-streams into one pull stream, while maintaining back-pressure.
Source pull streams MUST be in order.

## why rewriting?

* Familiarity with the original author's intent
* Strong type declarations for colleagues to understand and migrate to other programming languages

## example

``` ts
import * as pull from 'pull-stream'
import merge from '@jacobbubu/pull-merge'

pull(
  merge(pull.values([1, 5, 6]), pull.values([2, 4, 7])),
  pull.collect(function (err, ary) {
    if(err) throw err

    console.log(ary)
    //=> [1, 2, 4, 5, 6, 7]
  })
)

```

## signatures

### merge(left, right, compare?)

return a stream that is the merge of left and right streams.
merge pulls a chunk from both `left` and `right` and then
compares them. `compare` has the same signature as `Array#sort(compare)`.

If the two chunks are compared the same, the chunk from the right stream
is taken, but the left chunk is dropped.

Otherwise, the lowest chunk is passed to the stream.

### merge([streams...], compare?)

Merge a collection of steams. This calls the first signature recursively.


## License

MIT
