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
    case 'highlight':
      return highlightParser(input)
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

function highlightParser(input) {
  var hits = input.hits.hits
  var out = {
    total: input.hits.total,
    hits: hits.map(mergeHighlight)
  }
  return out
}

function mergeHighlight(item) {
  let source = item._source
  let highlight = item.highlight
  let out = {}
  Object.keys(source).forEach((key) => {
    out[key] = {
      source: source[key],
      highlight: source[key] ? highlight[key][0] : source[key]
    }
  })
  return out
  // return source
}
