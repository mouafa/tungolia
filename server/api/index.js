'use strict'
// var Joi = require('joi');
var handler = require('./handler')
var v = require('./validation')
  // require('../services/elastic')
  // console.log('validate', v.join(v.cat('params', v.string('type', 3, 10))))

exports.register = function(server, options, next) {
  server.route([{
    method: ['*'],
    path: '/',
    handler: handler.test,
    config: {
      tags: ['test']
    }
  }, {
    method: 'GET',
    path: '/exists/{type}/{id?}',
    handler: handler.exists,
    config: {
      tags: ['api'],
      description: 'check if type or doc exists',
      validate: v.join(v.cat('params', v.string('type'), v.string('id', 1)))
    }
  }, {
    method: 'GET',
    path: '/count/{type}',
    handler: handler.count,
    config: {
      tags: ['api'],
      description: 'count the docs for a type',
      validate: v.join(v.cat('params', v.string('type')))
    }
  }, {
    method: 'GET',
    path: '/doc/{type}/{id}',
    handler: handler.get,
    config: {
      tags: ['api'],
      description: 'get doc by type and id',
      validate: v.join(v.cat('params', v.string('type'), v.string('id', 1)))
    }
  },
  // {
  //   method: 'POST',
  //   path: '/doc/{type}/{id}',
  //   handler: handler.create,
  //   config: v.join(v.cat('params', v.string('type'), v.string('id', 1)),
  //                  v.object('payload'))
  // },
  {
    method: ['PUT', 'POST'],
    path: '/doc/{type}/{id}',
    handler: handler.update,
    config: {
      tags: ['api'],
      description: 'create or update a doc',
      validate: v.join(v.cat('params', v.string('type'), v.string('id', 1)),
        v.object('payload'))
    }
  }, {
    method: 'DELETE',
    path: '/doc/{type}/{id}',
    handler: handler.delete,
    config: {
      tags: ['api'],
      description: 'delete a doc',
      validate: v.join(v.cat('params', v.string('type'), v.string('id', 1)))
    }
  }, {
    method: 'POST',
    path: '/search/{type}/{term?}',
    handler: handler.search,
    config: {
      tags: ['api'],
      description: 'search for docs',
      validate: v.join(v.cat('params', v.string('type'), v.string('term', 1, 1e4)))
    }
  }, {
    method: 'POST',
    path: '/filter/{type}/{term?}',
    handler: handler.filter,
    config: {
      tags: ['api'],
      description: 'filter docs',
      validate: v.join(v.cat('params', v.string('type'), v.string('term', 1, 1e4)))
    }
  }
  ])

  next()
}

exports.register.attributes = {
  name: 'api'
}
