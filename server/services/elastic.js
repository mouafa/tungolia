'use strict'

var elasticsearch = require('elasticsearch')
var client = new elasticsearch.Client({
  host: 'localhost:5200',
  log: 'trace'
})

var m = require('./magic')

const mainIndex = 'tungolia'

client
.ping({ requestTimeout: 30000, hello: 'elasticsearch' })
.then(() => console.log('elasticsearch is shining')
, (r) => console.error('elasticsearch cluster is down!'))

/** exposed API **/

exports.existsType = function (type) {
  return client.indices.existsType({
    index: mainIndex,
    type: type
  })
}

exports.exists = function (type, id) {
  return client.exists({
    index: mainIndex,
    type: type,
    id: id
  })
}

exports.count = function (type, id) {
  return client.count({
    index: mainIndex,
    type: type
  })
}

exports.get = function (type, id) {
  return client.get({
    index: mainIndex,
    type: type,
    id: id
  })
}

exports.create = function (type, id, body) {
  return client.create({
    index: mainIndex,
    type: type,
    id: id,
    body: body
  })
}

exports.update = function (type, id, body) {
  return client.update({
    index: mainIndex,
    type: type,
    id: id,
    body: {doc: body}
  })
}

exports.delete = function (type, id) {
  return client.delete({
    index: mainIndex,
    type: type,
    id: id
  })
}

exports.search = function (type, config) {
  // console.log('query', m.querySimple(query))
  let query = m.querySimple(config)
  // let fields = config.attributesToRetrieve
  return client.search({
    index: mainIndex,
    type: type,
    body: query
  })
}
