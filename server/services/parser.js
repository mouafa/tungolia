'use strict'
var lazy = require('lazy.js')

/** exposed API **/

module.exports = function parser(input, parser) {
  input = basicParser(input)
  switch (parser) {
    case 'source':
      return sourceParser(input)
    case 'hits':
      return hitsParser(sourceParser(input))
    default:
      return input
  }
}

/** intern API **/

function sourceParser(input) {
  input.total = input.hits.total
  input.hits = input.hits.hits.map(i => i._source)
  return input
}

function hitsParser(input) {
  return input.hits
}

function basicParser(input = {}) {
  let out = {}
  if (input.aggregations) {
    out.facets = {}
    lazy(input.aggregations).each((val, key) => {
      out.facets[key] = val.buckets ? val.buckets : val
    })
  }
  out.hits = input.hits
  return out
}
