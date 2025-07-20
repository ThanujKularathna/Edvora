const bcrypt = require('bcrypt');

const password = 'test1234';
const saltRounds = 10;

async function hashPasswordMultipleTimes() {
  for (let i = 1; i <= 10; i++) {
    const hashed = await bcrypt.hash(password, saltRounds);
    console.log(`Hash ${i}: ${hashed}`);
  }
}

hashPasswordMultipleTimes();
