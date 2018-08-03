const start = require('./lib');
start({
  entry:'../../lib/**/**/*.js',
  output: '../../test/',
  injections: {
    headerBlocks:[
      `const assert = require('assert')`,
      'const mockResult = { data: [123] }'
    ],
    specBlocks: [
      `console.log('fuck')`,
      `assert(ret === mockResult);`
    ]
  }
});