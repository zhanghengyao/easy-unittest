const glob = require('glob');
const fs = require('fs');
const { default: generate } = require('babel-generator');
const transformStd = require('../utils/transform-to-std');
const { convert, writeFile, getPathProperties, mkdirs } = require('../utils/utils');
const { addBlockStatementNode } = require('./ast-operation');
const { template } = require('../template');
const createSpecAsts = require('./spec');
const createSuiteAst = require('./suite');
const moduleAnalysis = require('../../../module-analysis');
const append = require('./append');
const chalk       = require('chalk');
const cliProgress = require('cli-progress');

module.exports = async function (options, injectFunc) {
  const {
    entry, 
    output,
    ignore,
    entryKey = 'app'
  } = options || {};
  
  if (!entry) {
    throw Error('param entry must be required');
  }
  const files = glob.sync(entry, { ignore });
  if (files.length === 0) {
    throw Error(`no such file: ${entry}`);
  }
  const bar = new cliProgress.Bar({
    format: 'file total: [{bar}] {percentage}% | {value}/{total}                 '
  });
  bar.start(files.length, 0);
  for (let i = 0; i < files.length; i++) {
    const filePath = files[i];
    const { baseName, partPath } = getPathProperties(filePath, entryKey);
    const testPath = `${output}/${partPath}`;
    const moduleMeta = await moduleAnalysis(filePath);
    const moduleStd = transformStd(moduleMeta.metaData);
    const injections = await injectFunc(moduleStd, filePath);
    mkdirs(testPath, () => {
      const testFilePath = `${testPath}/${baseName}.test.js`;
      // 存在的测试文件追加新用例
      if (fs.existsSync(testFilePath)) {
        append(testFilePath, moduleStd, injections);
      } else {
        // 不存在则创建测试文件
        const ast = {
          type: 'Program',
          body: []
        };
        const { headerBlocks, suiteBlocks } = injections;
        if (headerBlocks && headerBlocks.length > 0) {
          headerBlocks.forEach(block => {
            ast.body.push(template(block)());
          });
        }
        ast.body.push(createSuiteAst(filePath, null, true));
        for (const key in suiteBlocks) {
          const suite = suiteBlocks[key];
          const suiteAst = createSuiteAst(key, suite.blocks);
          const specAstArray = createSpecAsts(moduleStd[key].branch, suite.specs, true);
          specAstArray.forEach(spec => {
            addBlockStatementNode(suiteAst, spec);
          });
          addBlockStatementNode(ast, suiteAst);
        }
        const testCode = convert(generate(ast).code);
        writeFile(testFilePath, testCode);
      }
      bar.update(i + 1);
      if (i + 1 === files.length) {
        bar.stop();
      }
    });
  }
}