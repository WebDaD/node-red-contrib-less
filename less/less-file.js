var less = require('less')
var fs = require('fs')
module.exports = function (RED) {
  function lessFileNode (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.filename = config.filename
    this.options = config.options
    var node = this

    if (node.filename) {
      node.status({fill: 'grey', shape: 'dot', text: 'testing ' + node.filename})
      fs.access(node.filename, fs.constants.R_OK, function (error) {
        if (error) {
          node.status({fill: 'red', shape: 'dot', text: node.filename + ' not Accessible'})
        } else {
          node.status({fill: 'green', shape: 'dot', text: node.filename + ' Accessible'})
        }
      })
    }

    node.on('input', function (msg) {
      // Filename
      var file = ''
      if (node.filename) {
        file = node.filename
      } else {
        if (msg.filename) {
          file = msg.filename
        } else {
          if (msg.payload) {
            file = msg.payload
          } else {
            return node.send(null)
          }
        }
      }

      // Options
      var options = {}
      node.options.forEach(function (option) {
        var value = RED.util.evaluateNodeProperty(option.value, option.value_type, node, null)
        options[option.key] = value
      })
      for (var option in msg.options) {
        if (msg.options.hasOwnProperty(option)) {
          options[option] = msg.options[option]
        }
      }
      fs.readFile(file, 'utf8', function (err, data) {
        if (err) {
          node.error('Error rendering less-file', err)
        } else {
          less.render(data, {modifyVars: options}, function (err, result) {
            if (err) {
              node.error('Error rendering less-file', err)
            } else {
              msg.payload = result
              msg.css = msg.payload
              node.send(msg)
            }
          })
        }
      })
      return
    })
  }

  RED.nodes.registerType('less-file', lessFileNode)
}
