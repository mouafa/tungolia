'use strict'
/** ### This file roule is to ensure that the used ES cluster is ready to use */

// import all exprted mappings
var maps = require('../mappings')
// this is an underscore lazy alternative
var lazy = require('lazy.js')
// import elastic service
var elastic = require('./elastic')

module.exports = function boostrap(_client) {
  /** check if the main used indice exist */
  elastic.existsIndice()
    .then((exist) => {
      if (!exist) {
        // if it's not exist it'll create it
        console.info('>>>>>>>>>>>>>> creating index <<<<<<<<<<<<<<')
        elastic.createIndex()
        // then it checks the existing for all the document types exported in mappings
          .then(() => lazy(maps).each(checkType))
      } else {
        // this also checks the existing for all the document types exported in mappings
        lazy(maps).each(checkType)
      }
    })
}

/** this function checks the existing of particular type
    if the type is not exist, it'll create it with it's associated mapping */
function checkType(map, type) {
  // check type existing
  elastic.existsType(type)
    .then((exist) => {
      if (!exist) {
        // if not exist, put type mapping
        console.info('>>>>>>>>>>>>>> create type mapping <<<<<<<<<<<<<<')
        elastic.putMapping(type, map)
      }
    })
}
