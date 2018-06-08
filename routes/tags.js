'use strict';

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Tag = require('../models/tags');


router.get('/', (req, res, next) => {

	Tag.find()
		.sort({name: 'asc'})
		.then(results => {
			if(results) {
				res.json(results);
			} else {
				next();
			}
		})
		.catch(err => next(err));
});


router.get('/:id', (req, res, next) => {
	
});