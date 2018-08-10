
const generate = require('./core/generate');
module.exports = function(options, func) {
  if (typeof func !== 'function') {
    throw Error('func type must be function');
  }
  generate(options, func);
}