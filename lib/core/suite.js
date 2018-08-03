const { types: babelTypes } = require('babel-core');
const { template, suiteTpl } = require('../template');
const { addBlockStatementNode } = require('./ast-operation');

module.exports = function(describeName, blocks = []) {
  const specAst = suiteTpl({
    DESCRIBE_NAME: babelTypes.stringLiteral(describeName)
  });
  blocks.forEach(block => {
    addBlockStatementNode(specAst, template(block)());
  });
  return specAst;
}