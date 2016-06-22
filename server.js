'use strict'
var path = require('path')
require('dotenv').config({
  path: path.join(__dirname, '/.env')
})
var eslint = require('eslint')
var linter = new eslint.CLIEngine({})
var formatter = require('eslint-friendly-formatter')
var report = linter.executeOnFiles(['server/'])
const Pack = require('./package')
var corsHeaders = require('hapi-cors-headers')
const Swagger = {
  register: require('hapi-swagger'),
  options: {
    documentationPath: '/swagger',
    jsonEditor: true,
    info: {
      'title': 'Tungolia API Endpoints',
      'version': Pack.version
    }
  }
}
const Tv = {
  register: require('tv'),
  options: {
    authenticateEndpoint: false
  }
}
const Inert = require('inert')
const Vision = require('vision')
const Good = {
  register: require('good'),
  options: {
    ops: {
      interval: 1000
    },
    reporters: {
      console: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          log: '*',
          response: '*',
          error: '*',
          request: '*'
        }]
      }, {
        module: 'good-console'
      }, 'stdout'],
      http: [{
        module: 'good-squeeze',
        name: 'Squeeze',
        args: [{
          error: '*'
        }]
      }, {
        module: 'good-http',
        args: ['http://localhost:8080/debug/console', {
          wreck: {
            headers: {
              'x-api-key': 12345
            }
          }
        }]
      }]
    }
  }
}

if (report.errorCount) {
  console.log(formatter(report.results))
    // process.exit()
}

const Composer = require('./index')

Composer((err, server) => {
  if (err) throw err
  server.ext('onPreResponse', corsHeaders)
  server.register([Good, Inert, Vision, Swagger, Tv], function(err) {
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
