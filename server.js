'use strict'
var path = require('path')
require('dotenv').config({path: path.join(__dirname, '/.env')})
var eslint = require('eslint')
var linter = new eslint.CLIEngine({})
var formatter = require('eslint-friendly-formatter')
var report = linter.executeOnFiles(['server/'])
const Pack = require('./package')
const Cors = {
  register: require('hapi-cors'),
  options: {
    origins: ['*'],
    headers: ["Accept", "Authorization", "Content-Type", "If-None-Match", "Accept-language"]
  }
}
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
