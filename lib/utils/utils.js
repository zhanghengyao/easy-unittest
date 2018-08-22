const fs = require('fs');
const path = require('path');
exports.convert = function convert(str){ 
  str = str.replace(/(\\u)(\w{1,4})/gi, (unicode) => { 
      return (String.fromCharCode(parseInt((escape(unicode).replace(/(%5Cu)(\w{1,4})/g,"$2")),16))); 
  });
   
  return str; 
}
/**
* 写文件
* @param {string} filePath 文件路径
* @param {string} data 写入的内容
* @return {Promise}
*/
exports.writeFile = function writeFile(filePath, data, flag) {
 return new Promise((resolve, reject) => {
   fs.writeFile(filePath, data, { flag }, error => {
     if (error) {
       reject(error);
     } else {
       resolve(true);
     }
   });
 });
}
/**
 * 递归创建目录
 * @param {string} dirname
 * @param {function} callback
 * @return {array}
 */
exports.mkdirs = function mkdirs(dirname, callback) {
  fs.access(dirname, fs.constants.R_OK, error => {
    if (error) {
      mkdirs(path.dirname(dirname), () => {
        fs.mkdir(dirname, callback);
      });
    } else {
      callback();
    }
  });
}

/**
 * 将文件路径转成期望的格式
 * entryKey = 'bb'
 * aa/bb/cc/dd/ee.js => { baseName: 'ee.js', partPath: 'cc/dd' }
 * @param {string} filePath
 * @param {string} entryKey
 * @return {array}
 */
exports.getPathProperties = function getPathProperties(filePath, entryKey) {
  const items = transformPathToArray(filePath, '', entryKey);

  const fileName = items.pop();
  // 获取原文件名
  const baseName = path.basename(fileName, '.js');
  const partPath = items.join('/');
  return {
    baseName,
    partPath
  }
}
/**
 * 将文件路径转成数组
 * aa/bb/cc.js => ['aa', 'bb', 'cc']
 * @param {string} filepath
 * @param {string} caseStyle
 * @param {string} entryKey
 * @return {array}
 * https://github.com/eggjs/egg-core/blob/e43c708cc4e90c7a4d7499d939d56e56c97bc654/lib/loader/file_loader.js#L230
 */
function transformPathToArray(filepath, caseStyle, entryKey) {
  let properties = filepath.substring(0, filepath.lastIndexOf('.')).split('/');
  const index = properties.indexOf(entryKey);
  properties = properties.splice(index + 1);
  return properties;
  // return properties.map(property => {
  //   if (!/^[a-z][a-z0-9_-]*$/i.test(property)) {
  //     throw new Error(`${property} is not match 'a-z0-9_-' in ${filepath}`);
  //   }

  //   // use default camelize, will capitalize the first letter
  //   // foo_bar.js > FooBar
  //   // fooBar.js  > FooBar
  //   // FooBar.js  > FooBar
  //   // FooBar.js  > FooBar
  //   // FooBar.js  > fooBar (if lowercaseFirst is true)
  //   property = property.replace(/[_-][a-z]/ig, s => s.substring(1).toUpperCase());
  //   let first = property[0];
  //   switch (caseStyle) {
  //     case 'lower':
  //       first = first.toLowerCase();
  //       break;
  //     case 'upper':
  //       first = first.toUpperCase();
  //       break;
  //     case 'camel':
  //     default:
  //   }
  //   return first + property.substring(1);
  // });
}
exports.getMethodType = function getMethodPrefix(method) {
  const prefix = {
    normal: 'function',
    generator: 'function*',
    async: 'async function'
  };
  return prefix[method];
}