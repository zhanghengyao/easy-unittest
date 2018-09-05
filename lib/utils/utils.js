const fs = require('fs');
const path = require('path');
const sep = path.sep;
const babel = require('babel-core');

exports.transformFile = async function transformFile (filePath) {
  const codeString = await loadFile(filePath);
  return babel.transform(codeString);
}; 
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
  console.log('dirname: ', dirname)
  fs.access(dirname, fs.constants.R_OK, error => {
    if (error) {
      mkdirs(path.dirname(dirname), () => {
        console.log('___dirname: ', dirname)
        fs.mkdir(dirname, callback);
      });
    } else {
      callback();
    }
  });
}
/**
 * 异步递归创建目录
 * @param {string} dirname
 * @param {string} _dirname
 * @return {array}
 */
exports.asyncMkdir = async function asyncMkdir(dirname, _dirname) {
  try {
    await access(dirname);
  } catch (error) {    
    // 访问的目录不存在，创建目录
    let _dir = _dirname;  
    if (!_dir) {
      _dir = dirname;
    }
    try {
      await mkdir(_dir);
      // 路径转成数组
      const _dirArray = _dir.split(sep);
      const dirnameArray = dirname.split(sep);
      if (dirnameArray.length > _dirArray.length) {
        _dir = sep + dirnameArray.splice(0, _dirArray.length + 1).join(sep);
      } else {
        _dir = '';
      }
    } catch(err) {
      _dir = path.dirname(_dir);
    };
    await asyncMkdir(dirname, _dir);
  }
}
/**
 * 创建目录,返回 Promise
 * @param {string} dirname
 * @return {Promise}
 */
function mkdir(dirname) {
  return new Promise((resolve, reject) => {
    fs.mkdir(dirname, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  });
}
/**
 * 访问目录是否存在
 * @param {string} dirname
 * @return {Promise}
 */
function access(dirname) {
  return new Promise((resolve, reject) => {
    fs.access(dirname, fs.constants.R_OK, error => {
      if (error) {
        reject(error);
      } else {
        resolve();
      }
    });
  })
}

exports.getMethodType = function getMethodPrefix(method) {
  const prefix = {
    normal: 'function',
    generator: 'function*',
    async: 'async function'
  };
  return prefix[method];
}
/**	
 * 加载文件	
 * @param {string} filePath 文件路径	
 * @return {Promise}	
 */	
function loadFile(filePath) {	
  return new Promise((resolve, reject) => {	
    fs.readFile(filePath, 'utf-8', (error, data) => {	
      if (error) {	
        reject(error);	
      } else {	
        resolve(data);	
      }	
    });	
  });	
}