const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const User = require('../../models/userModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose
  // .connect(process.env.DATABASE_LOCAL)
  .connect(DB)
  .then(() => {
    console.log('DB connection successful');
    // console.log(con);
  });

const users = JSON.parse(
  fs.readFileSync(`${__dirname}/simple-users-data.json`, 'utf-8')
);

//import data into database
const importData = async () => {
  try {
    await User.create(users, { validateBeforeSave: false });
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
    process.exit();
  }
  process.exit();
};

const deleteData = async () => {
  try {
    await User.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
  }
  process.exit();
};

console.log(process.argv);

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
