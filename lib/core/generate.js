const glob = require('glob');
const path = require('path');
const { default: generate } = require('babel-generator');
const transformStd = require('../utils/transform-to-std');
const { convert, writeFile, getCamelFileName, mkdirs } = require('../utils/utils');
const { addBlockStatementNode } = require('./ast-operation');
const { template } = require('../template');
const createSpecAsts = require('./spec');
const createSuiteAst = require('./suite');

module.exports = function(moduleAnalysis, options, func) {
  const {
    entry, 
    output,
    injections = {}
  } = options || {};
  const { headerBlocks, suiteBlocks, specBlocks } = injections;
  if (!entry) {
    throw Error('param entry must be required');
  }
  const files = glob.sync(path.resolve(__dirname, entry));
  if (files.length === 0) {
    throw Error('no such file');
  }
  console.log(`检测到${files.length}个文件`);
  
  files.forEach(filePath => {
    const ast = {
      type: 'Program',
      body: []
    };
    if (headerBlocks && headerBlocks.length > 0) {
      headerBlocks.forEach(block => {
        const { path, blocks } = block;
        if (!path || typeof path === 'object' && path.test(filePath)) {
          blocks.forEach(code => {
            ast.body.push(template(code)());
          });
        }
      });
    }
    ast.body.push(createSuiteAst(filePath, suiteBlocks, true, filePath));
    moduleAnalysis(filePath).then(moduleMeta => {
      const moduleStd = transformStd(moduleMeta);
      func(moduleStd)
      Object.keys(moduleStd).forEach(key => {
        const suiteAst = createSuiteAst(key, suiteBlocks, false, filePath);
        const specAstArray = createSpecAsts(moduleStd[key].branch, specBlocks, filePath, key);
        specAstArray.forEach(spec => {
          addBlockStatementNode(suiteAst, spec);
        });
        addBlockStatementNode(ast, suiteAst);
      });
      const testCode = convert(generate(ast).code);
      const dirs = ['core', 'template', 'utils']
      getCamelFileName(filePath, dirs, (baseName, newFileName, newPath) => {
        const testPath = path.resolve(__dirname, `${output}${newPath}`);
        // 不存在的目录和测试文件将被创建
        mkdirs(testPath, () => {
          const testFilePath = `${testPath}/${baseName}.test.js`;
          writeFile(testFilePath, testCode)
        });
      });
    }).catch(err => console.log(err));
  })
}