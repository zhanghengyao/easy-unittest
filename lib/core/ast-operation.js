const babel = require('babel-core');
exports.addBlockStatementNode = function (parentAst, childAst) {
  babel.traverse(parentAst, {
    noScope: true,
    ArrowFunctionExpression(path) {
      path.node.body.body.push(childAst);
      path.stop();
    },
    FunctionExpression(path) {
      path.node.body.body.push(childAst);
      path.stop();
    }
  });
};