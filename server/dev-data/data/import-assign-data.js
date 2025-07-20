const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const Assignment = require('../../models/assignmentModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD
);

mongoose.connect(DB).then(() => {
  console.log('DB connection successful');
});

const assignments = JSON.parse(
  fs.readFileSync(`${__dirname}/simple-assignment-data.json`, 'utf-8')
);

const importData = async () => {
  try {
    await Assignment.create(assignments);
    console.log('Data successfully loaded');
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

const deleteData = async () => {
  try {
    await Assignment.deleteMany();
    console.log('Data successfully deleted');
    process.exit();
  } catch (err) {
    console.log(err);
    process.exit();
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
