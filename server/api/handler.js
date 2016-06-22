'use strict'

var elastic = require('../services/elastic')
var parser = require('../services/parser')
const Boom = require('boom')

exports.test = function (req, rep) {
  rep({message: 'welcome to tungolia'})
}

exports.exists = function (req, rep) {
  let params = req.params
  if (params.id) {
    elastic.exists(params.type, params.id)
    .then((exists) => rep(exists))
  } else {
    elastic.existsType(params.type)
    .then((exists) => rep(exists))
  }
}

exports.count = function (req, rep) {
  let params = req.params
  elastic.count(params.type, params.id)
  .then((res) => rep(res.count),
        (err) => rep(Boom.badImplementation(err.message)))
}

exports.get = function (req, rep) {
  let params = req.params
  elastic.get(params.type, params.id)
  .then((res) => rep(res),
        (err) => err.status == 404 ? rep(Boom.notFound(err.message)) : rep(Boom.badImplementation(err.message)))
}

exports.create = function (req, rep) {
  let params = req.params
  let body = req.payload
  elastic.create(params.type, params.id, body)
  .then((res) => rep(res),
        (err) => err.statusCode == 409 ? rep(Boom.badRequest(err.message)) : rep(Boom.badImplementation(err.message)))
}

exports.update = function (req, rep) {
  let params = req.params
  let body = req.payload
  elastic.update(params.type, params.id, body)
  .then((res) => rep(res),
        (err) => err.statusCode == 404 ? rep(Boom.badRequest(err.message)) : rep(Boom.badImplementation(err.message)))
}

exports.delete = function (req, rep) {
  let params = req.params
  elastic.delete(params.type, params.id)
  .then((res) => rep(res),
        (err) => err.status == 404 ? rep(Boom.badRequest(err.message)) : rep(Boom.badImplementation(err.message)))
}

exports.search = function (req, rep) {
  let params = req.params
  let body = req.payload
  if (params.term) body.term = params.term
  // rep('tada')
  elastic.search(params.type, body)
  .then((res) => rep(parser(res, body.parser)),
        (err) => rep(Boom.badImplementation(err.message)))
}

exports.filter = function (req, rep) {
  let params = req.params
  let body = req.payload
  if (params.term) body.term = params.term
  // rep('tada')
  elastic.filter(params.type, body)
  .then((res) => rep(parser(res, body.parser)),
        (err) => rep(Boom.badImplementation(err.message)))
}

exports.suggest = function (req, rep) {
  let params = req.params
  let body = req.payload
  if (params.term) body.term = params.term
  // rep('tada')
  elastic.suggest(params.type, body)
  .then((res) => rep(parser(res, body.parser)),
        (err) => console.log('err', err))
}
