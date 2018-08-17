const babel = require('babel-core');

module.exports = function(branchs = [], specBlocks = {}, isAddDeafult = false) {
  const specAstArray = [];
  branchs.forEach(branch => {
    const key = branch.notes || branch.code;
    const branckBlocks = specBlocks[key];
    if (branckBlocks && branckBlocks.length > 0) {
      pkgItBlock(key, branckBlocks);
      const specAst = pkgItBlock(key, branckBlocks);
      specAstArray.push(specAst);
    }
  });
  if (isAddDeafult && specBlocks.success) {
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