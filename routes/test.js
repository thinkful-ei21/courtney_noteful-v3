'use strict';


//MONGOOSE PRACTICE WITH ALI- 6/5, 6/7

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Note = require('../models/note');


// router.get('/', (req, res, next) => {
// 	Note.find()
// 		.then(results => {
// 			if(results) {
// 				res.json(results);
// 			} else {
// 				next();
// 			}
// 		})
// 		.catch(err => next(err));
// });


// router.get('/', (req, res, next) => {
// 	Note.find()
// 		.sort({createdAt: -1})
// 		.then(sorted => {
// 			return sorted.map((note, index) => {
// 				note.createdAt = index + 1;
// 				Note.update(note);
// 				return note;
// 			});
// 		})
// 		.then(results => {
// 			console.log(results);
// 			if(results) {
// 				res.json(results);
// 			} else {
// 				next();
// 			}
// 		})
// 		.catch(err => next(err));
// });


// router.get('/', (req, res, next) => {
// 	Note.find()
// 		.sort({createdAt: -1})
// 		.then(sorted => {
// 			return sorted.map((note) => {
// 				let newDate = new Date();
// 				note.createdAt = newDate.setDate(newDate.getDate() + 1);
// 				Note.update(note);
// 				return note;
// 			});
// 		})
// 		.then(results => {
// 			console.log(results);
// 			if(results) {
// 				res.json(results);
// 			} else {
// 				next();
// 			}
// 		})
// 		.catch(err => next(err));
// });


// router.get('/', (req, res, next) => {
// 	Note.find({content: {$regex: /lorem/ }})
// 		.then(result => {
// 			res.json(result);
// 		})
// 		.catch(err => next(err));

// });








module.exports = router;
