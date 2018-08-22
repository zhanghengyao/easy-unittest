const babel = require('babel-core');
const { getMethodType } = require('../utils/utils');
module.exports = function(method, branchs = [], specBlocks = {}, isAddDeafult = false) {
  const specAstArray = [];
  branchs.forEach(branch => {
    const key = branch.notes || branch.code;
    const branckBlocks = specBlocks[key];
    if (branckBlocks && branckBlocks.length > 0) {
      pkgItBlock(method, key, branckBlocks);
      const specAst = pkgItBlock(method, key, branckBlocks);
      specAstArray.push(specAst);
    }
  });
  if (isAddDeafult && specBlocks.success) {
    const specAst = pkgItBlock(method, 'success', specBlocks.success);
    specAstArray.push(specAst);
  }
  return specAstArray;
}
function pkgItBlock(method, branch, sourceBlocks) {
  branch = branch.replace(/'/g, '"');
  const prefix = getMethodType(method);
  const blocks = ['it(', `'${branch}', `, `${prefix} () {`, ...sourceBlocks, '})'];
  const code = blocks.join('');
  let blockAst = '';
  try {
    const { ast } = babel.transform(code);
    blockAst = ast;
  } catch (error) {
    console.log('\n easy-unittest/spec: ', code);
    throw error;
  }
  return blockAst;
}