'use strict';

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Tag = require('../models/tags');
const Note = require('../models/note');


router.get('/', (req, res, next) => {

	Tag.find()
		.sort({name: 'asc'})
		.then(allTags => {
			if(allTags) {
				res.json(allTags);
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

	Tag.findById(searchId)
		.then(tag => {
			if(tag) {
				res.status(200).json(tag);
			} else {
				next();
			}
		})
		.catch(err => next(err));
});



router.post('/', (req, res, next) => {

	const name = req.body.name;

	if(!name) {
		const err = new Error('The `name` is missing from request body');
		err.status = 400;
		return next(err);
	}

	const newTag = {name};

	Tag.create(newTag)
		.then(newTag => {
			if (newTag) {
				res.location(`${req.originalUrl}/${newTag.id}`)
				.status(201).json(newTag);
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




router.put('/:id', (req, res, next) => {

	const {id} = req.params;
	const {name} = req.body;

	if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }

  if(!name) {
  	const err = new Error('The `name` is missing from the request body');
  	err.status = 400;
  	return next(err);
  }

  const updatedTag = {name};

  	Tag.findByIdAndUpdate(id,
  		updatedTag,
  		{new: true})
  		.then(tag => {
  			if(tag) {
  				res.status(200).json(tag);
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

		if(!mongoose.Types.ObjectId.isValid(deleteId)) {
	    const err = new Error('The `id` is not valid');
	    err.status = 400;
	    return next(err);
	  }

	  Promise.all([
	  		Tag.findByIdAndRemove(deleteId),
	  		Note.updateMany(
	  			{tags: deleteId},
	  			{$pull: {tags: deleteId}}
	  			)
	  	])
			.then(() => {
				res.status(204).end();
			}) 
			.catch(err => next(err));
});



module.exports = router;










