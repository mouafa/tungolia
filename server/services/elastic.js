'use strict'
/** ### This file export the needed ES operations */

// import the ES query builder service
var m = require('./magic')
// import the ES node library
var elasticsearch = require('elasticsearch')
// establish ES connection
var client = new elasticsearch.Client({
  host: process.env.ELASTIC_URL, // 'localhost:5200',
  // determine logging type, `error` for **production** and `trace` for **development**
  log: process.env.NODE_ENV === 'production' ? 'error' : 'trace'
})

// set the main indice name from .env, default to `tungolia`
const mainIndex = process.env.MAIN_INDICE || 'tungolia'

// pinging ES cluster for health checking
client
  .ping({
    requestTimeout: 30000,
    hello: 'elasticsearch'
  })
  .then(() => console.log('{{{{{{{ elasticsearch is shining }}}}}}'), (r) => console.error('###### elasticsearch cluster is down! ######'))

/** ###Exposed API */

// allow indice creation
exports.createIndex = function() {
  return client.indices.create({
    index: mainIndex
  })
}

// check the existing of `mainIndex`
exports.existsIndice = function() {
  return client.indices.exists({
    index: mainIndex
  })
}

// check the existing of `type` in `mainIndex`
exports.existsType = function(type) {
  return client.indices.existsType({
    index: mainIndex,
    type: type
  })
}

// check the existing of document by `type` & `id` in `mainIndex`
exports.exists = function(type, id) {
  return client.exists({
    index: mainIndex,
    type: type,
    id: id
  })
}

// count the existing documents for particular `type`
exports.count = function(type) {
  return client.count({
    index: mainIndex,
    type: type
  })
}

// get an existing document by its `type` & `id`
exports.get = function(type, id) {
  return client.get({
    index: mainIndex,
    type: type,
    id: id
  })
}

// create a new document in `mainIndex` by its `type` & `id` and `body` content
exports.create = function(type, id, body) {
  return client.create({
    index: mainIndex,
    type: type,
    id: id,
    body: body
  })
}

// update an old document by a new one, must provide document `type`, `id` and the new `body`
// ** the new doc must follow the mapping of the old one **
exports.update = function(type, id, body) {
  return client.update({
    index: mainIndex,
    type: type,
    id: id,
    body: {
      doc: body
    }
  })
}

// delete an existing document by its `type` and `id`
exports.delete = function(type, id) {
  return client.delete({
    index: mainIndex,
    type: type,
    id: id
  })
}

// get the mapping of particular `type`
exports.getMapping = function(type) {
  return client.indices.getMapping({
    index: mainIndex,
    type: type
  })
}

// set the mapping of particular `type`
// `map` contain the mapping data, see **mappings** for more details
exports.putMapping = function(type, map) {
  return client.indices.putMapping({
    index: mainIndex,
    type: type,
    body: map
  })
}

// ##Search documents
// the search feature allow the searching of documents in particular `type` by rules supplied in `config`
// > **`config` must follow the spec**
exports.search = function(type, config) {
// *Magic* will build the Search quiryDSL from the supplied `config`
  let query = m.querySimple(config)
  return client.search({
    index: mainIndex,
    type: type,
    body: query
  })
}

// ##Filter documents
// the filter feature is more advanced than search, it allow filtring documents with advanced options
// > **`config` must follow the spec**
exports.filter = function(type, config) {
  // *Magic* will build the Filter quiryDSL from the supplied `config`
  let query = m.queryAdvanced(config)
  return client.search({
    index: mainIndex,
    type: type,
    body: query
  })
}

// ##Suggest documents
// **this feature is not yet ready to use**
exports.suggest = function(type, config) {
  // <!-- console.log('query', m.querySimple(query)) -->
  // <!-- let query = m.queryAdvanced(config) -->
  // <!-- let fields = config.attributesToRetrieve -->
  console.log('config', config)
  return client.suggest({
    index: mainIndex,
    type: type,
    body: {
      docsuggest: {
        text: config.term,
        term: {
          field: 'title'
        }
      }
    }
  })
}
