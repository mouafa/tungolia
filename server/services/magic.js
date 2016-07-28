'use strict'
/** ### This file used to build queryDSL for Search and Filter feature */

/** ### Exposed API */

// this function used to build simple query like the one used in Search
exports.querySimple = function(config) {
  // by default all fields are applied to search, but if the `config` contain `attributesToSearch`, those fields will be *boosted* according to their position in the array, first is more important

  // ```['title', 'about', 'description']``` **will be transformed to** ```['title^3', 'about^2', 'description^1'] ```
  let fields = config.attributesToSearch ? config.attributesToSearch.map((i, c, l) => `${i}^${l.length - c}`) : ['_all']

  // `querySimple` allow term autocomplete
  // ```frontend developer``` **will be transformed to** ```frontend* developer*```
  let term = config.term.trim().split(' ').join('* ').concat('*')
  // generate `queryOptions`, see `setQueryOptions` bellow
  let queryOptions = setQueryOptions(config)
  // `q` is the skeleton of the query
  let q = {
    'query': {
      'query_string': {
        'query': term,
        'fields': fields, // ['title^5', '_all'],
        // all the conditions must be satisfied
        'default_operator': 'and'
      }
    }
  }
  // merging `q` with `queryOptions`
  Object.assign(q, queryOptions)
  // returning the generated queryDSL
  return q
}

// this function used to build advanced query like the one used in Filter
exports.queryAdvanced = function(config) {
  // generate `queryOptions`, see `setQueryOptions` bellow
  let queryOptions = setQueryOptions(config)
  // generate `filters`, see `setFilters` bellow
  let filters = setFilters(config)
  // generate `queryType`, see `setQueryType` bellow
  let queryType = setQueryType(config)
  // `q` is the skeleton of the query
  let q = {
    'query': {
      'filtered': {
        'query': queryType
      }
    }
  }
  // merging `filters` inside `q.query.filtered`
  Object.assign(q.query.filtered, filters)
  // merging `queryOptions` inside `q`
  Object.assign(q, queryOptions)
  // returning the generated queryDSL
  return q
}

// ***
// ## querySuggest
// this feature is not yet ready

exports.querySuggest = function(config) {
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
          'field': 'title',
          'direct_generator': [{
            'field': 'title',
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

/** #####intern API */

// ***
// ###setQueryOptions
function setQueryOptions(config) {
  let base = {
    // retrieve only the requested fields in `attributesToRetrieve`, *default to all fields*
    '_source': config.attributesToRetrieve || ['*'],
    // `hitsPerPage` determine the number of result to retrieve per page, *default to 10*
    'size': config.hitsPerPage || 10,
    // `page` determine the desired page to retrieve
    'from': config.page ? (config.page - 1) * config.hitsPerPage : 0
  }

  // set query facets if exist, see `setQueryFacets` bellow
  let f = setQueryFacets(config)
  if (f) Object.assign(base, f)

  // set query highlight if exist, see `setQueryHighlight` bellow
  let h = setQueryHighlight(config)
  if (h) Object.assign(base, h)

  // set query sort if exist, see `setQuerySort` bellow
  let s = setQuerySort(config)
  if (s) Object.assign(base, s)

  // return all the generated query options
  return base
}

// ***
// ###setQueryFacets
function setQueryFacets(config) {
  let out = null
  // if `config` contain facets, generate it
  // ####[learn more about aggregation here](https://qbox.io/blog/elasticsearch-aggregations)
  if (config.facets && config.facets.length) {
    out = {
      'aggregations': {}
    }
    config.facets.forEach(i => {
      out.aggregations[i.field] = {
        // `type` could be `terms` or `stats`
        [i.type]: {
          'field': i.field
        }
      }
    })
  }
  return out
}

// ***
// ###setQueryHighlight
function setQueryHighlight(config) {
  let out = null
  // if `config.highlight` is true, enable highlighting result
  // ####[learn more about highlight here](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-highlighting.html)
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

// ***
// ###setQuerySort
function setQuerySort(config) {
  let out = null
  // if `config.sortBy` is set, enable sorting
  // ####[learn more about highlight here](https://www.elastic.co/guide/en/elasticsearch/reference/current/search-request-sort.html)
  if (config.sortBy) {
    // `sortOrder` can be `asc` for ascending sorting or `desc` for descending, *default to `desc`*
    let order = (config.sortOrder == 'asc' || config.sortOrder == 'desc') ? config.sortOrder : 'desc'
    out = {
      'sort': [{
        [config.sortBy]: order
      }]
    }
  }
  return out
}

// ***
// ###setFilters
function setFilters(config) {
  let out = {}
  // if `config` contain filters, generate it
  // ####[learn more about filters here](https://www.elastic.co/guide/en/elasticsearch/reference/current/query-dsl-filtered-query.html)
  if (!config.filters || !config.filters.length) return out
  // make categories contain filters grouped by the same field
  let filtersList = classify(config.filters, 'field')
  // generate filters for each category
  let filters = filtersList.map(category => {
    // `should` associate filters on the same `field` with logic operator **or**
    return { 'bool': { 'should': category.map(setFiltersType) } }
  })
  // <let filters = config.filters.map(setFiltersType)

  out.filter = {
    bool: {
      // `must` associate all filters with logic operator **and**
      must: filters
    }
  }
  return out
}

// ***
// ###setFiltersType
function setFiltersType(i) {
  let item = {}
  // `range` type used with a range of value, must supply `gte` or `lte` or both
  if (i.type == 'range') {
    item.range = {
      [i.field]: {
        'gte': i.from || null,
        'lte': i.to || null
      }
    }
  // `term` used with term, supplied `term` need to be exist as it in the desired `field`
  } else if (i.type == 'term') {
    item.term = {
      [i.field]: i.value
    }
  }
  // returned value will look like ```{ "term": { "company": "google" }}```
  // or ```{ "range": { "salary": {"gte": 1000, "lte": 2000} }}```
  return item
}

// ***
// ###setQueryType
function setQueryType(config) {
  // if `config` doesn't contain `term` then use `match_all` query
  if (!config.term) {
    return {
      'match_all': {}
    }
  } else {
  // if `config`contain `term` then use `multi_match` query
    let fields = config.attributesToSearch ? config.attributesToSearch.map((i, c, l) => `${i}^${l.length - c}`) : ['_all']
    // < let typoTolerance = setFuzziness(config.typoTolerance)
    return {
      'multi_match': {
        'query': config.term,
        'fields': fields, // ['title^5', '_all'],
        'type': 'phrase_prefix'
        // < 'fuzziness': typoTolerance
      }
    }
  }
}

/** ### utility */

// ***
// ### setHighletedField
// used to apply highlight on retrieved fields
function setHighletedField(fields) {
  var out = {}
  if (fields && fields.length) {
    fields.forEach((i) => (out[i] = {}))
  } else {
    out['*'] = {}
  }
  return out
}

// <used to set fuzziness between 1 & 2
/** <!-- function setFuzziness(value) {
  let out = 0
  if (value == 'max') {
    out = 2
  } else if (value == 'min') {
    out = 1
  }
  return out
}  -->*/

// ***
// ### classify
// used to generate an array of array that groups the `t` array by the `atr` field
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
// **example**

// ``` var filters = [{"field": "salary_type", "type": "term", "value" : "Per month"}, {"field": "salary_min", "type": "range", "from": 1000, "to": 2000}, {"field": "salary_type", "type": "term", "value" : "Per year"}] ```

// ``` classify(filters, field) ```

// ``` [[{"field":"salary_type","type":"term","value":"Per month"},{"field":"salary_type","type":"term","value":"Per year"}],[{"field":"salary_min","type":"range","from":1000,"to":2000}]] ```
