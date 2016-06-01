'use strict'

/** exposed API **/

exports.querySimple = function(config) {
  let fields = config.attributesToSearch ? config.attributesToSearch.map((i, c, l) => `${i}^${l.length - c}`) : ['_all']
  let term = config.term.trim().split(' ').join('* ').concat('*')
  let queryOptions = setQueryOptions(config)
  let q = {
    'query': {
      'query_string': {
        'query': term,
        'fields': fields, // ['title^5', '_all'],
        'default_operator': 'and'
      }
    },
    'suggest': {
      'text': config.term,
      'phraseSuggestion': {
        'phrase': {
          'field': 'title.basic',
          'direct_generator': [{
            'field': 'title.basic',
            'suggest_mode': 'popular',
            'min_word_length': 1
          }]
        }
      }
    }
  }
  Object.assign(q, queryOptions)
  return q
}

exports.queryAdvanced = function(config) {
  let queryOptions = setQueryOptions(config)
  let filters = setFilters(config)
  let queryType = setQueryType(config)
  let q = {
    'query': {
      'filtered': {
        'query': queryType
      }
    }
  }
  Object.assign(q.query.filtered, filters)
  Object.assign(q, queryOptions)
  return q
}

/** intern API **/

function setQueryOptions(config) {
  let base = {
    '_source': config.attributesToRetrieve || ['*'],
    'size': config.hitsPerPage || 10,
    'from': config.page ? (config.page - 1) * config.hitsPerPage : 0
  }

  let f = setQueryFacets(config)
  if (f) Object.assign(base, f)

  let h = setQueryHighlight(config)
  if (h) Object.assign(base, h)

  let s = setQuerySort(config)
  if (s) Object.assign(base, s)

  return base
}

function setQueryFacets(config) {
  let out = null
  if (config.facets && config.facets.length) {
    out = {
      'aggregations': {}
    }
    config.facets.forEach(i => {
      out.aggregations[i.field] = {
        [i.type]: {
          'field': i.field
        }
      }
    })
  }
  return out
}

function setQueryHighlight(config) {
  let out = null
  if (config.highlight) {
    out = {
      'highlight': {
        'type': 'plain',
        'require_field_match': false,
        'no_match_size': 100000,
        'pre_tags': config.highlightPreTag ? [config.highlightPreTag] : ['<b>'],
        'post_tags': config.highlightPostTag ? [config.highlightPostTag] : ['</b>'],
        'number_of_fragments': 0,
        'fields': setHighletedField(config.attributesToRetrieve)
      }
    }
  }
  return out
}

function setQuerySort(config) {
  let out = null
  if (config.sortBy) {
    let order = (config.sortOrder == 'asc' || config.sortOrder == 'desc') ? config.sortOrder : 'desc'
    out = {
      'sort': [{
        [config.sortBy]: order
      }]
    }
  }
  return out
}

function setFilters(config) {
  let out = {}
  if (!config.filters || !config.filters.length) return out

  let filtersList = classify(config.filters, 'field')
  let filters = filtersList.map(category => {
    return { 'bool': { 'should': category.map(setFiltersType) } }
  })
  // let filters = config.filters.map(setFiltersType)

  out.filter = {
    bool: {
      must: filters
    }
  }
  // console.log('---------', JSON.stringify(out))
  return out
}

function setFiltersType(i) {
  let item = {}
  if (i.type == 'range') {
    item.range = {
      [i.field]: {
        'gte': i.from || null,
        'lte': i.to || null
      }
    }
  } else if (i.type == 'term') {
    item.term = {
      [i.field]: i.value
    }
  }
  return item
}

function setQueryType(config) {
  if (!config.term) {
    return {
      'match_all': {}
    }
  } else {
    let fields = config.attributesToSearch ? config.attributesToSearch.map((i, c, l) => `${i}^${l.length - c}`) : ['_all']
    let typoTolerance = setFuzziness(config.typoTolerance)
    return {
      'multi_match': { // 'match_all'
        'query': config.term,
        'fields': fields, // ['title^5', '_all'],
        'type': 'phrase_prefix',
        'fuzziness': typoTolerance
      }
    }
  }
}

// funct

/** utility **/

function setHighletedField(fields) {
  var out = {}
  if (fields && fields.length) {
    fields.forEach((i) => (out[i] = {}))
  } else {
    out['*'] = {}
  }
  return out
}

function setFuzziness(value) {
  let out = 0
  if (value == 'max') {
    out = 2
  } else if (value) {
    out = 1
  }
  return out
}

function classify(t = [], atr) {
  var tmp = Array(...t)
  var out = []
  while (tmp.length) {
    let i = tmp[0]
    out[out.length] = tmp.filter(j => j[atr] == i[atr])
    tmp = tmp.filter(j => j[atr] != i[atr])
  }
  return out
}
