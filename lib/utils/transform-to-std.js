module.exports = function(moduleMeta = {}) {
  const standard = {};
  Object.keys(moduleMeta).forEach(key => {
    // branch
    if (key !== 'isModule') {
      const branch = moduleMeta[key].branch;
      const { ifBranch, switchBranch, returnBranch } = branch;
      const branchStd = [...ifBranch, ...switchBranch, ...returnBranch];
      standard[key] = Object.assign({}, moduleMeta[key], { branch: branchStd });
    }
    
  });
  return standard;
}