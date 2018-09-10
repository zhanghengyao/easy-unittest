const fs = require('fs');
const path = require('path');
const { default: generate } = require('babel-generator');
const { convert, writeFile, asyncMkdir, getProjectPath } = require('../utils/utils');
const { addBlockStatementNode } = require('./ast-operation');
const { template } = require('../template');
const createSpecAsts = require('./spec');
const createSuiteAst = require('./suite');
const append = require('./append');

module.exports = async function (options) {
  const {
    projectName,
    output,
    injections
  } = options || {};
  if (!output || !injections) {
    throw Error('easy-unittest init params error');
  }
  const testPath = path.dirname(output);
  const { headerBlocks, rootBlocks, suiteBlocks = {} } = injections;
  if (Object.keys(suiteBlocks).length > 0) {
    let ast = {
      type: 'Program',
      body: []
    }; 
    // 存在的测试文件追加新用例
    if (fs.existsSync(output)) {
      ast = await append(output, suiteBlocks);
    } else {
      // 不存在则创建测试文件
      await asyncMkdir(testPath);
      if (headerBlocks && headerBlocks.length > 0) {
        headerBlocks.forEach(block => {
          ast.body.push(template(block)());
        });
      }
      const projectPath = getProjectPath(output, projectName);
      ast.body.push(createSuiteAst(projectPath, rootBlocks));
      for (const key in suiteBlocks) {
        const suite = suiteBlocks[key];
        const suiteAst = createSuiteAst(key, suite.blocks);
        const specAstArray = createSpecAsts(suite);
        specAstArray.forEach(spec => {
          addBlockStatementNode(suiteAst, spec);
        });
        addBlockStatementNode(ast, suiteAst);
      }
    }
    const testCode = convert(generate(ast, { quotes: 'single' }).code);
    return await writeFile(output, testCode);
  }
  return true;
}