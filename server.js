'use strict'
require('dotenv').config()
var eslint = require('eslint')
var linter = new eslint.CLIEngine({})
var formatter = require('eslint-friendly-formatter')
var report = linter.executeOnFiles(['server/'])
const Pack = require('./package')
const Cors = {
  register: require('hapi-cors'),
  options: {
    origins: ['http://localhost:8081']
  }
}
const Swagger = {
  register: require('hapi-swagger'),
  options: {
    tags: [{
      'name': 'api',
      'description': 'API Endpoints'
    }, {
      'name': 'test',
      'description': 'API Endpoints'
    }],
    jsonEditor: true,
    info: {
      'title': 'Tungolia API Endpoints',
      'version': Pack.version
    }
  }
}
const Tv = require('tv')
const Inert = require('inert')
const Vision = require('vision')

if (report.errorCount) {
  console.log(formatter(report.results))
    // process.exit()
}

const Composer = require('./index')

Composer((err, server) => {
  if (err) throw err
  server.register([Cors, Inert, Vision, Swagger, Tv], function(err) {
    if (!err) {
      server.start(() => {
        require('./server/services/bootstrap')()
        console.log('***************************************')
        console.log('---------------------------------------')
        console.log('>>>> Tungolia started on port ' + server.info.port + ' <<<<')
        console.log('---------------------------------------')
        console.log('***************************************')
      })
    }
  })
})
