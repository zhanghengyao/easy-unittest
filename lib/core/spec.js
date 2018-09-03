const babel = require('babel-core');
const { getMethodType } = require('../utils/utils');
module.exports = function(suite) {
  const { methodType, specs } = suite
  const specAstArray = [];
  for (const key in specs) {
    const branckBlocks = specs[key];
    if (branckBlocks && branckBlocks.length > 0) {
      pkgItBlock(methodType, key, branckBlocks);
      const specAst = pkgItBlock(methodType, key, branckBlocks);
      specAstArray.push(specAst);
    }
  }
  return specAstArray;
}
function pkgItBlock(methodType, branch, sourceBlocks) {
  branch = branch.replace(/'/g, '"');
  const prefix = getMethodType(methodType);
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