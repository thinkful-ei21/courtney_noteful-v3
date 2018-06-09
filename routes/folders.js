'use strict';

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();

const Folder = require('../models/folders');
const Note = require('../models/note');


router.get('/', (req, res, next) => {

	Folder.find()
		.sort({name: 'asc'})
		.then(allFolders => {
			if (allFolders) {
				res.json(allFolders);
			} else {
				next();
			}
		})
		.catch(err => next(err));
});



router.get('/:id', (req, res, next) => {

	const searchId = req.params.id;

	if(!mongoose.Types.ObjectId.isValid(searchId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

	Folder.findById(searchId)
		.then(folder => {
			if(folder) {
				res.status(200).json(folder);
			} else {
				next();
			}
		})
		.catch(err => next(err));
});



router.post('/', (req, res, next) => {

	const name = req.body.name;

	if(!name) {
		const err = new Error('Missing `name` in request body');
		err.status = 400;
		return next(err);
	}

	const newFolder = {name};

	Folder.create(newFolder)
		.then(folder => {
			res.location(`${req.originalUrl}/${folder.id}`)
				.status(201).json(folder);
		})
		.catch(err => {
	    if (err.code === 11000) {
	      err = new Error('The folder name already exists');
	      err.status = 400;
	    }
	    next(err);
	  });
});



router.put('/:id', (req, res, next) => {

	const updateId = req.params.id;
	const {name} = req.body;

	if(!mongoose.Types.ObjectId.isValid(updateId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

	if(!name) {
		const err = new Error('Missing `name` in request body');
		err.status = 400;
		return next(err);
	}

	const updatedFolder = {name};

	Folder.findByIdAndUpdate(updateId,
		updatedFolder,
		{new: true})
		.then(folder => {
			// console.log(folder);
			if(folder) {
				res.status(200).json(folder);
			} else {
				next();
			}
		})
		.catch(err => {
	    if (err.code === 11000) {
	      err = new Error('The folder name already exists');
	      err.status = 400;
	    }
	    next(err);
	  });
});



router.delete('/:id', (req, res, next) => {

	const deleteId = req.params.id;

	if (!mongoose.Types.ObjectId.isValid(deleteId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  //deletes folder itself AND wherever it's referenced by notes
  Promise.all([
  		Folder.findByIdAndRemove(deleteId),
  		Note.deleteMany({folderId: deleteId})
  	])
		.then(() => {
			res.status(204).end();
		})
		.catch(err => next(err));
});









module.exports = router;




