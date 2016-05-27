var maps = require('../mappings')
var lazy = require('lazy.js')
var elastic = require('./elastic')

module.exports = function boostrap(_client) {
  elastic.existsIndice()
    .then((exist) => {
      if (!exist) {
        console.info('>>>>>>>>>>>>>> creating index <<<<<<<<<<<<<<')
        elastic.createIndex()
          .then(() => lazy(maps).each(checkType))
      } else {
        // console.info('>>>>>>>>>>>>>> index already exist <<<<<<<<<<<<<<')
        lazy(maps).each(checkType)
      }
    })
}

function checkType(map, type) {
  elastic.existsType(type)
    .then((exist) => {
      if (!exist) {
        console.info('>>>>>>>>>>>>>> create type mapping <<<<<<<<<<<<<<')
        elastic.putMapping(type, map)
      } else {
        // console.info('>>>>>>>>>>>>>> type already exist <<<<<<<<<<<<<<')
      }
    })
}
