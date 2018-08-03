const { types: babelTypes } = require('babel-core');
const { template, specTpl } = require('../template');
const { addBlockStatementNode } = require('./ast-operation');

module.exports = function(branchs = [], blocks = [],) {
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
  specAstArray.forEach(spec => {
    blocks.forEach(block => {
      addBlockStatementNode(spec, template(block)());
    })
  })
  return specAstArray;
}