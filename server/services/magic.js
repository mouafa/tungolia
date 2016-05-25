'use strict'

/** exposed API **/

exports.querySimple = function (config) {
  let fields = config.attributesToSearch.map((i, c, l) => `${i}^${l.length - c}`)
  let term = config.term.trim().split(' ').join('* ').concat('*')
  return {
    'query': {
      'simple_query_string': {
        'query': term,
        'fields': fields, // ['title^5', '_all'],
        'default_operator': 'and'
      }
    },
    // 'fields': config.attributesToRetrieve,
    // '_source': config.attributesToRetrieve || ['*'],
    'size': config.hitsPerPage || 10,
    'from': config.page ? (config.page - 1) * config.hitsPerPage : 0,
    // 'fuzziness': 2
    'highlight': {
      'require_field_match': false,
      'pre_tags': [config.highlightPreTag],
      'post_tags': [config.highlightPostTag],
      'fields': {
        '*': {}
      }
    }
  }
}
