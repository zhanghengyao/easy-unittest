const { types: babelTypes } = require('babel-core');
const { template, specTpl } = require('../template');
const { addBlockStatementNode } = require('./ast-operation');
const babylon = require('babylon');

module.exports = function(branchs = [], blocks = [], filePath, methodName) {
  const specAstArray = [];
  branchs.forEach(branch => {
    const specAst = specTpl({
      BRANCH: babelTypes.stringLiteral(branch.notes || branch.code)
    });
    specAstArray.push(specAst);
  });
  specAstArray.push(specTpl({
    BRANCH: babelTypes.stringLiteral('success')
  }));
  blocks.forEach(block => {
    const { path, method, blocks: specBlock } = block;
    let isAddBlock = false;
    if (!path && !method) {
      isAddBlock = true;
    } else if (path && !method && typeof path === 'object' && path.test(filePath)) {
      isAddBlock = true;
    } else if (!path && method && typeof method === 'object' && method.test(methodName)) {
      isAddBlock = true;
    } else if (path && method) {
      if ((typeof path === 'object' && path.test(filePath)) && (typeof method === 'object' && method.test(methodName))) {
        isAddBlock = true;
      }
    }
    // 重置正则匹配索引(用于加 global 的正则)
    if (path) {
      path.lastIndex = 0;
    }
    if (method) {
      method.lastIndex = 0;
    }
    if (isAddBlock) {
      specAstArray.forEach(spec => {
        specBlock.forEach(code => {
          addBlockStatementNode(spec, template(code)());
        });
      });
    }
  });
  return specAstArray;
}