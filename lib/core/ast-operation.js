const babel = require('babel-core');
exports.addBlockStatementNode = function (parentAst, childAst) {
  babel.traverse(parentAst, {
    noScope: true,
    ArrowFunctionExpression(path) {
      addStatementAst(path, childAst);
      path.stop();
    },
    FunctionExpression(path) {
      addStatementAst(path, childAst);
      path.stop();
    }
  });
};
exports.addArgumentsStatementNode = function (parentAst, childAst) {
  babel.traverse(parentAst, {
    noScope: true,
    CallExpression(path) {
      addArgumentsAst(path, childAst);
      path.stop();
    }
  });
}
function addStatementAst(path, childAst) {
  const calleeName = path.parent.callee.name;
  if (calleeName === 'describe') {
    path.node.body.body.push(childAst);
  }
}
function addArgumentsAst(path, childAst) {
  const { callee, arguments } = path.node;
  if (callee.name === 'it') {
    arguments.push(childAst);
  }
}