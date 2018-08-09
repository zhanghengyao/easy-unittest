const start = require('./lib');
start({
  entry:'../../demo/**/**/*.js',
  output: '../../test/',
  injections: {
    headerBlocks:[{
      path: '',
      blocks: [
        `const assert = require('assert')`,
      ]
    },{
      path: /controller/,
      blocks: [
        `const mockResult = { data: [123] }`
      ]
    },{
      path: /service/,
      blocks: [
        `const mockResult = { data: [666] }`
      ]
    }],
    suiteBlocks: [{
      path: /controller/,
      blocks: [
        ` beforeEach(async function() {
          this.testHelper.middlewarePrepare.loginPrepare();
        });`,
        `const apiUrl = '/dashboard/rank_special';`
      ]
    }],
    specBlocks: [{
        path: /controller|service/,
        method: /^(?!pageEntry)/,
        blocks: [
          `assert(ret === mockResult);`
        ]
      },{
        path: /controller/,
        method: /pageEntry/,
        blocks: [
          `assert(ret.status === 200);`
        ]
      }
    ]
  },
  dependencies: [{
    rule: /service/g,
    mock: `this.app.mockServiceArgs(CALLEE, METHOD, (...params) => {
      
    })`
  }]
});