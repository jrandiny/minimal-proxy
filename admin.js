const fs = require('fs');
const conf = JSON.parse(fs.readFileSync('config.json'));

function printHelp() {
  console.log('Simple admin');
  console.log('------------');
  console.log('add_user <username> <password>   - Add new user');
  console.log('delete_user <username>           - Delete user');
  console.log('help                             - Print this help')
}

function getUserStore() {
  console.log(`Using ${conf.user_db}`);
  return new (require('./userStore'))(conf.user_db);
}

console.log(process.argv);

if (process.argv.length <= 2) {
  printHelp();
} else {
  switch (process.argv[2]) {
    case 'add_user':
      getUserStore().create(process.argv[3], process.argv[4]);
      console.log('User created');
      break;
    case 'delete_user':
      getUserStore().delete(process.argv[3]);
      console.log('User deleted');
      break;
    default:
      printHelp();
      break;
  }
}