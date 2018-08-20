const glob = require('glob');
const fs = require('fs');
const path = require('path');
const { default: generate } = require('babel-generator');
const transformStd = require('../utils/transform-to-std');
const { convert, writeFile, getPathProperties, mkdirs } = require('../utils/utils');
const { addBlockStatementNode } = require('./ast-operation');
const { template } = require('../template');
const createSpecAsts = require('./spec');
const createSuiteAst = require('./suite');
const moduleAnalysis = require('module-meta-analysis');
const append = require('./append');
const chalk       = require('chalk');
const cliProgress = require('cli-progress');

module.exports = async function (options, injectFunc) {
  const {
    entry, 
    output,
    ignore,
    mode,
    entryKey = 'app'
  } = options || {};
  if (!entry) {
    throw Error('param entry must be required');
  }
  const files = glob.sync(entry, { ignore });
  if (files.length === 0) {
    throw Error(`no such file: ${entry}`);
  }
  // 非全量模式对已经存在的单元测试文件不作处理
  if (mode !== 'all') {
    // 获取所有单元测试文件
    const testFiles = glob.sync(path.join(output, '/**'));
    while(files.some((f, i) => {
      // xxx/app/service/home.js => /service/home
      const partPath = path.join(output, f.split(`/${entryKey}/`)[1].replace('.js', '.test.js'));
      if (testFiles.indexOf(partPath) !== -1) {
        files.splice(i, 1);
        return true;
      }
      return false;
    }));
    console.log(chalk.green(`${chalk.yellow('增量')}扫描生成单元测试文件...`));
  } else {
    console.log(chalk.green(`${chalk.red('全量')}扫描生成单元测试文件...`));
  }
  const filesTotal = files.length;
  console.log(chalk.green(`总共 ${filesTotal} 个文件待处理...`));
  if (filesTotal === 0) {
    return;
  }
  const startTime = new Date().valueOf();
  const bar = new cliProgress.Bar({
    format: chalk.green('[{bar}] {percentage}% | {value}/{total}                 ')
  });
  bar.start(filesTotal, 0);
  for (let i = 0; i < filesTotal; i++) {
    const filePath = files[i];
    const { baseName, partPath } = getPathProperties(filePath, entryKey);
    const testPath = `${output}/${partPath}`;
    const moduleMeta = await moduleAnalysis(filePath);
    const moduleStd = transformStd(moduleMeta.metaData);
    const injections = (await injectFunc(moduleStd, filePath)) || {};
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
        if (suiteBlocks) {
          for (const key in suiteBlocks) {
            const suite = suiteBlocks[key];
            const suiteAst = createSuiteAst(key, suite.blocks);
            const specAstArray = createSpecAsts(moduleStd[key].branch, suite.specs, true);
            specAstArray.forEach(spec => {
              addBlockStatementNode(suiteAst, spec);
            });
            addBlockStatementNode(ast, suiteAst);
          }
        }
        const testCode = convert(generate(ast).code);
        writeFile(testFilePath, testCode);
      }
      bar.update(i + 1);
      if (i + 1 === filesTotal) {
        bar.stop();
        const endTime = new Date().valueOf();
        console.log(chalk.green(`处理完成：${((endTime - startTime) / 1000).toFixed()}(s)`));
      }
    });
  }
}