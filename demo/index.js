const easyUnittest = require('../lib/core/generate');
const path = require('path');
easyUnittest({
  output: path.join(__dirname, '../demo/test/controller/home.test.js'),
  injections: {
    rootBlocks: ['const a = 123'],
    suiteBlocks: {
      create: {
        optType: 'patch',
        methodType: 'generator',
        blocks: [],
        specs: {
          'test branch': ['const gan = \'gan\'']
        }
      }
    }
  }
});