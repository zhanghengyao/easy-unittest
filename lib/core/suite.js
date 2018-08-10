const babel = require('babel-core');
const { template, suiteTpl } = require('../template');
const { addBlockStatementNode } = require('./ast-operation');

module.exports = function(describeName, blocks = [], isRoot) {
  const specAst = suiteTpl({
    DESCRIBE_NAME: babel.types.stringLiteral(describeName)
  });
  if (!isRoot) {
    blocks.forEach(block => {
      try {
        addBlockStatementNode(specAst, template(block)());
      } catch (error) {
        console.log('\n easy-unittest/suite: ', block);
        throw error;
      }
    });
  }
  return specAst;
}