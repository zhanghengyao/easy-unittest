const template = require('babel-template');
exports.suiteTpl = template('describe(DESCRIBE_NAME, () => {});');
exports.specTpl = template('it(BRANCH);');
exports.template = template;