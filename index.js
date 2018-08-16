const createEntry = require('./lib');
process.on('unhandledRejection', (reason, p) => {
  console.log('Unhandled Rejection at:', p, 'reason:', reason);
});
module.exports = createEntry;
