var less = require('less')
module.exports = function (RED) {
  function lessStringNode (config) {
    RED.nodes.createNode(this, config)

    this.name = config.name
    this.options = config.options
    var node = this

    node.on('input', function (msg) {
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
      less.render(msg.payload, {modifyVars: options}, function (err, result) {
        if (err) {
          node.error('Error rendering less-string, ' + JSON.stringify(err), err)
        } else {
          msg.payload = result
          msg.css = msg.payload
          node.send(msg)
        }
      })
      return
    })
  }

  RED.nodes.registerType('less-string', lessStringNode)
}
