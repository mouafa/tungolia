'use strict'
var Joi = require('joi')

exports.join = function (...cats) {
  var obj = {}
  cats.forEach(i => Object.assign(obj, i))
  // return { validate: obj }
  return obj
}

exports.cat = function (category = 'params', ...vals) {
  var obj = {}
  vals.forEach(i => Object.assign(obj, i))
  return {
    [category]: obj
  }
}

exports.string = function (atr = '', min = 3, max = 10) {
  return { [atr]: Joi.string().min(min).max(max) }
}

exports.email = function (atr = '') {
  return { [atr]: Joi.string().email() }
}

exports.number = function (atr = '') {
  return { [atr]: Joi.number() }
}

exports.integer = function (atr = '') {
  return { [atr]: Joi.number().integer() }
}

exports.range = function (atr = '', min = 3, max = 10) {
  return { [atr]: Joi.number().integer().min(min).max(max) }
}

exports.object = function (atr = '') {
  return { [atr]: Joi.object() }
}
