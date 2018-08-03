const template = require('babel-template');
exports.suiteTpl = template('describe(DESCRIBE_NAME, () => {});');
exports.specTpl = template('it(BRANCH, async function () {});');
exports.template = template;