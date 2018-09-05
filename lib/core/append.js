const babel = require('babel-core');
const createSpecAsts = require('./spec');
const createSuiteAst = require('./suite');
const { addBlockStatementNode } = require('./ast-operation');
const { transformFile } = require('../utils/utils');
module.exports = async function (testFilePath, suiteBlocks) {
  const { ast } = await transformFile(testFilePath);
  const { program } = ast;
  let rootAst = '';
  let isRoot = true;
  babel.traverse(program, {
    CallExpression(path) {
      const { callee, arguments } = path.node;
      if (callee.name === 'describe') {
        if (isRoot) {
          rootAst = arguments[1].body.body;
          isRoot = false;
          return;
        }
        const val = arguments[0].value
        if (!(suiteBlocks[val] && suiteBlocks[val].specs)) {
          return;
        }
        const suite = suiteBlocks[val];
        // 存在的测试套件增加测试用例
        if (suite.optType === 'patch') {
          const specAstArray = createSpecAsts(suite);
          specAstArray.forEach(spec => {
            arguments[1].body.body.push(spec);
          });
        }
      }
    }
  });
  if (rootAst) {
    for (const key in suiteBlocks) {
      const suite = suiteBlocks[key];
      // 新增测试套件
      if (suite.optType === 'insert') {
        const suiteAst = createSuiteAst(key, suite.blocks);
        const specAstArray = createSpecAsts(suite);
        specAstArray.forEach(spec => {
          addBlockStatementNode(suiteAst, spec);
        });
        rootAst.push(suiteAst);
      }
    }
  }
  return program;
}