const fs = require('fs');

const filePath = `${__dirname}/../views/resetPassword.pug`;

if (fs.existsSync(filePath)) {
  console.error('❌ Template not found at:', filePath);
}
console.log('run');
