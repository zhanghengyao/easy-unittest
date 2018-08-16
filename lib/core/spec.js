const babel = require('babel-core');

module.exports = function(branchs = [], specBlocks = {}, isAddDeafult = false) {
  const specAstArray = [];
  branchs.forEach(branch => {
    const key = branch.notes || branch.code;
    const branckBlocks = specBlocks[key];
    pkgItBlock(key, branckBlocks);
    const specAst = pkgItBlock(key, branckBlocks);
    specAstArray.push(specAst);
  });
  if (isAddDeafult) {
    const specAst = pkgItBlock('success', specBlocks.success);
    specAstArray.push(specAst);
  }
  return specAstArray;
}
function pkgItBlock(branch, sourceBlocks) {
  const blocks = ['it(', `"${branch}", `, 'async function () {', ...sourceBlocks, '})'];
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