#!/usr/bin/env -S mocha --u=tdd

'use strict';

let assert = require('assert')
let lib = require('../fmt-hyphen')

function mk_hyphenate() {
    let he = lib.mk_hyphen_engine('en-us')
    return (word) => {
        return lib.hyphenate(he, word)
    }
}
let hyphenate = mk_hyphenate()

suite('Utils', function() {
    setup(function() {
    })

    test('smoke', function() {
        assert.deepEqual(hyphenate('Albuquerque'), [
            { chunk: 'Albuquerque', leftover: '' },
            { chunk: 'Albu‐', leftover: 'querque' },
            { chunk: 'Al‐', leftover: 'buquerque' }
        ])
        assert.deepEqual(hyphenate('the'), [
            { chunk: 'the', leftover: '' },
        ])
    })

    test('fold', function() {
        assert.deepEqual(lib.fold(2, 20, '11zzzzzzzzzzzzzzzzzzzzyyyyyyy'), {
            word: "11\n"
                + "zzzzzzzzzzzzzzzzzzzz\n"
                + "yyyyyyy",
            length: 7
        })
        assert.deepEqual(lib.fold(0, 20, '11zzzzzzzzzzzzzzzzzzzzyyyyyyy'), {
            word: "11zzzzzzzzzzzzzzzzzz\n"
                + "zzyyyyyyy",
            length: 9
        })
        assert.deepEqual(lib.fold(2, 20, '11zzzzzzzzzzzzzzzzzzzz'), {
            word: "11\n"
                + "zzzzzzzzzzzzzzzzzzzz",
            length: 20
        })
        assert.deepEqual(lib.fold(-1, 5, 'Impala'), {
            word: "Impal\na",
            length: 1
        })
    })
})
