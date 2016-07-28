'use strict'
/** ### This file generate validation with Joi library, common used in router handler params and data */

var Joi = require('joi')

/* join all validation */
exports.join = function (...cats) {
  var obj = {}
  cats.forEach(i => Object.assign(obj, i))
  // <!-- return { validate: obj } -->
  return obj
}

/* classify validation type
  default validation for `params` */
exports.cat = function (category = 'params', ...vals) {
  var obj = {}
  vals.forEach(i => Object.assign(obj, i))
  return {
    [category]: obj
  }
}

/* validating `string` param */
exports.string = function (atr = '', min = 3, max = 10) {
  return { [atr]: Joi.string().min(min).max(max) }
}

/* validating `email` param */
exports.email = function (atr = '') {
  return { [atr]: Joi.string().email() }
}

/* validating `number` param */
exports.number = function (atr = '') {
  return { [atr]: Joi.number() }
}

/* validating `integer` param */
exports.integer = function (atr = '') {
  return { [atr]: Joi.number().integer() }
}

/* validating `range` param */
exports.range = function (atr = '', min = 3, max = 10) {
  return { [atr]: Joi.number().integer().min(min).max(max) }
}

/* validating `object` param */
exports.object = function (atr = '') {
  return { [atr]: Joi.object() }
}
