const easyUnittest = require('..');
const path = require('path');
easyUnittest({
  entry: path.join(__dirname, '../fixtures/**/*.js'),
  output: path.join(__dirname, '../demo'),
  entryKey: 'fixtures',
  mode: 'all'
}, moduleMeta => {
  const suiteBlocks = {};
  for (const key in moduleMeta) {
    const item = moduleMeta[key];
    const specs = item.branch.map(b => {
      const bKey = b.notes || b.code;
      return {
        [bKey]: ''
      }
    });
    console.log(item)
    suiteBlocks[key] = {
      blocks: [],
      specs
    }
  }
  return {
    suiteBlocks
  };
})