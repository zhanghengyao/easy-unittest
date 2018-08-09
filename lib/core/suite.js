const { types: babelTypes } = require('babel-core');
const { template, suiteTpl } = require('../template');
const { addBlockStatementNode } = require('./ast-operation');

module.exports = function(describeName, blocks = [], isRoot, filePath) {
  const specAst = suiteTpl({
    DESCRIBE_NAME: babelTypes.stringLiteral(describeName)
  });
  if (!isRoot) {
    blocks.forEach(block => {
      const { path, blocks } = block;
      if (!path || typeof path === 'object' && path.test(filePath)) {
        if (path) {
          path.lastIndex = 0;
        }
        blocks.forEach(code => {
          addBlockStatementNode(specAst, template(code)());
        });
      }
    });
  }
  return specAst;
}