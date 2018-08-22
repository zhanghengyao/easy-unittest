const babel = require('babel-core');
const createSpecAsts = require('./spec');
const createSuiteAst = require('./suite');
const { addBlockStatementNode } = require('./ast-operation');
const { default: generate } = require('babel-generator');
const { convert, writeFile } = require('../utils/utils');
module.exports = function (filePath, moduleStd, injections) {
  const { ast } = babel.transformFileSync(filePath);
  // 这里直接用 ast 输出无法格式化
  const { program } = ast;
  const { suiteBlocks } = injections;
  let rootAst = '';
  let isRoot = true;
  const keys = Object.keys(moduleStd);
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
        const index = keys.indexOf(val);
        // suite 存在，判断是否需要新增 spec
        if (index !== -1) {
          const branch = [...moduleStd[val].branch];
          path.traverse({
            CallExpression(path) {
              const { callee, arguments } = path.node;
              if (callee.name === 'it') {
                const val = arguments[0].value;
                for (let i = 0; i < branch.length; i++) {
                  let branchStr = branch[i].notes || branch[i].code;
                  branchStr = branchStr.replace(/'/g, '"');
                  if (val === branchStr) {
                    branch.splice(i, 1);
                    break;
                  }
                }
              }
            }
          });
          // 存在新增 spec
          if (branch.length > 0) {
            const specAstArray = createSpecAsts(moduleStd[val].method, branch, suiteBlocks[val].specs);
            specAstArray.forEach(spec => {
              arguments[1].body.body.push(spec);
            });
          }
        }
        keys.splice(index, 1);
      }
    }
  });
  if (!rootAst) {
    return;
  }
  // 存在新增的 suite
  if (keys.length > 0) {
    keys.forEach(key => {
      const suiteAst = createSuiteAst(key, suiteBlocks[key].blocks);
      const specAstArray = createSpecAsts(moduleStd[key].method, moduleStd[key].branch, suiteBlocks[key].specs, true);
      specAstArray.forEach(spec => {
        addBlockStatementNode(suiteAst, spec);
      });
      rootAst.push(suiteAst);
    });
  }
  const testCode = convert(generate(program, { quotes: 'single' }).code);
  writeFile(filePath, testCode);
}