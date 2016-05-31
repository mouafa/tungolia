'use strict'
// var Joi = require('joi');
var handler = require('./handler')
var v = require('./validation')
// require('../services/elastic')
// console.log('validate', v.join(v.cat('params', v.string('type', 3, 10))))

exports.register = function (server, options, next) {
  server.route([
    {
      method: 'GET',
      path: '/',
      handler: handler.get
    },
    {
      method: 'GET',
      path: '/exists/{type}/{id?}',
      handler: handler.exists,
      config: v.join(v.cat('params', v.string('type'), v.string('id', 1)))
    },
    {
      method: 'GET',
      path: '/count/{type}',
      handler: handler.count,
      config: v.join(v.cat('params', v.string('type')))
    },
    {
      method: 'GET',
      path: '/doc/{type}/{id}',
      handler: handler.get,
      config: v.join(v.cat('params', v.string('type'), v.string('id', 1)))
    },
    {
      method: 'POST',
      path: '/doc/{type}/{id}',
      handler: handler.create,
      config: v.join(v.cat('params', v.string('type'), v.string('id', 1)),
                     v.object('payload'))
    },
    {
      method: 'PUT',
      path: '/doc/{type}/{id}',
      handler: handler.update,
      config: v.join(v.cat('params', v.string('type'), v.string('id', 1)),
                     v.object('payload'))
    },
    {
      method: 'DELETE',
      path: '/doc/{type}/{id}',
      handler: handler.delete,
      config: v.join(v.cat('params', v.string('type'), v.string('id', 1)))
    },
    {
      method: 'POST',
      path: '/search/{type}/{term?}',
      handler: handler.search,
      config: v.join(v.cat('params', v.string('type'), v.string('term', 1, 1e4)))
    },
    {
      method: 'POST',
      path: '/filter/{type}/{term?}',
      handler: handler.filter,
      config: v.join(v.cat('params', v.string('type'), v.string('term', 1, 1e4)))
    }

  ])

  next()
}

exports.register.attributes = {
  name: 'api'
}
