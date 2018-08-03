const moduleAnalysis = require('../../module-analysis');
const generate = require('./core/generate');
module.exports = function(options) {
  generate(moduleAnalysis, options);
}