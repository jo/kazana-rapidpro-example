var request = require('request')

function prepareSubmissionDoc (dataReport) {
  var timestamp = new Date().toISOString()

  //dataReport.createdBy = ""
  //dataReport.id = ""
  dataReport.type = 'dataReport'
  dataReport.version = dataReport.version || '1.0.0'

  // can soon be removed:
  // https://github.com/hoodiehq/pouchdb-hoodie-api/issues/47
  dataReport.createdAt = timestamp
  dataReport.updatedAt = timestamp
}

function submissionHandler (server, report, callback) {
  var store = server.methods.getStore({
    name: 'raw-data',
    auth: 'admin'
  })

  prepareSubmissionDoc(report)

  store.add(report)
  .then(function() {
    callback()
  })
  .catch(function(err) {
    callback(err)
  })
}

module.exports = {
  name: 'myapp',
  version: '1.0.0',

  // bootstrap data from bootstrap folder
  bootstrap: 'bootstrap',

  service: function (server, callback) {
    var rapidProAPIKey = server.settings.app.rapidPro.key
    var rapidProFlowUuid = server.settings.app.flow_uuid

    request.get({
      url: 'https://api.textit.in/api/v1/runs.json',
      qs: {
        flow_uuid: rapidProFlowUuid
      },
      headers: {
        Authorization: 'Token ' + rapidProAPIKey
      }
    }, function(err, response, body) {
      if (err) {
        return callback(err)
      }

      submissionHandler(server, {
        data: {
          runs: JSON.parse(body).results
        }
      }, callback)
    })
  }
}
