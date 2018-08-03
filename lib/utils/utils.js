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
 * 获取目录下文件的驼峰命名
 * @param {string} filePath
 * @param {string} dir
 * @param {function} func
 * @return {array}
 */
exports.getCamelFileName = function getCamelFileName(filePath, dir, func) {
  const items = getDirPath(filePath, dir);

  const fileName = items.pop();
  // 获取原文件名
  const baseName = path.basename(fileName, '.js');
  const newPath = items.join('/');
  // 转换成驼峰的形式，方法是照搬 egg-core 的
  const newFileName = changeFileNameToFrameworkPropertyName(baseName);
  if (typeof func === 'function') {
    func(baseName, newFileName, newPath);
  }
  return newFileName;
}
/**
 * 把文件名转换成驼峰
 * @param file
 * @return {string}
 */
function changeFileNameToFrameworkPropertyName(fileName) {
  // 转换成驼峰的形式，方法是照搬 egg-core 的
  // docs: https://github.com/eggjs/egg-core/blob/master/lib/loader/file_loader.js#L237
  return fileName.replace(/[_-][a-z]/ig, s => s.substring(1).toUpperCase());
}
/**
 * 传入文件路径，获取方法名称
 * @param {string} filePath
 * @param {array} keys
 * @return {array}
 */
function getDirPath(filePath, keys) {
  const items = filePath.split('/');
  const length = items.length;
  let index = -1;
  for (let i = 0; i < keys.length; i++) {
    const key = keys[i];
    index = items.indexOf(key);
    if(index !== -1) {
      break;
    }
  }
  return items.splice(index, length - index);
}