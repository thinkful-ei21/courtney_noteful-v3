'use strict';


const mongoose = require('mongoose');

const { MONGODB_URI } = require('../config');
const Note = require('../models/note');
const Folder = require('../models/folders');
const Tag = require('../models/tags');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');


// console.log(Note);

console.log(MONGODB_URI);

mongoose.connect(MONGODB_URI)
  .then(() => mongoose.connection.db.dropDatabase())
  .then(() => {
  	return Promise.all([
  		Note.insertMany(seedNotes),
  		Folder.insertMany(seedFolders),
      Tag.insertMany(seedTags),

  		Folder.createIndexes(),
      Tag.createIndexes()
  	]);
  })
  // .then(() => Note.insertMany(seedNotes))
  .then(results => {
    console.info(`Inserted ${results.length} Notes`);
  })
  .then(() => mongoose.disconnect())
  .catch(err => {
    console.error(err);
  });