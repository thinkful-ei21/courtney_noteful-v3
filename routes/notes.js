'use strict';

const express = require('express');
const mongoose = require('mongoose');

const router = express.Router();
const Note = require('../models/note');

/* ========== GET/READ ALL ITEM ========== */
router.get('/', (req, res, next) => {

  // console.log('Get All Notes');
  // res.json([
  //   { id: 1, title: 'Temp 1' },
  //   { id: 2, title: 'Temp 2' },
  //   { id: 3, title: 'Temp 3' }
  // ]);

  const {searchTerm, folderId} = req.query;
  let filter = {};

  if (searchTerm) {
    filter.title = { $regex: searchTerm };
  }

  if (folderId) {
    filter.id = { folderId };
  }

  Note.find(filter)
    .sort({ _id: 'asc' })
    .then(results => {
      if (results) {
        res.json(results);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {

  // console.log('Get a Note');
  // res.json({ id: 1, title: 'Temp 1' });

  const searchId = req.params.id;

  if(!mongoose.Types.ObjectId.isValid(searchId)) {
    const err = new Error('The `id` is not valid');
    err.status = 400;
    return next(err);
  }
  
  Note.findById(searchId)
    .then(note => {
      if(note) {
        res.json(note);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  // console.log('Create a Note');
  // res.location('path/to/new/document').status(201).json({ id: 2, title: 'Temp 2' });

  const { title, content, folderId } = req.body;

  if(!title) {
    const err = new Error('Missing `title` in request body');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  const newNote = {title, content, folderId};

  Note.create(newNote)
    .then(note => {
      res.location(`${req.originalUrl}/${note.id}`)
        .status(201).json(note);
    })
    .catch(err => next(err));

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  // console.log('Update a Note');
  // res.json({ id: 1, title: 'Updated Temp 1' });

  const {id} = req.params;
  const {title, content, folderId} = req.body;


  if(!mongoose.Types.ObjectId.isValid(id)) {
    const err = new Error('The `noteId` is not valid');
    err.status = 400;
    return next(err);
  }

  if(!mongoose.Types.ObjectId.isValid(folderId)) {
    const err = new Error('The `folderId` is not valid');
    err.status = 400;
    return next(err);
  }

  const updateNote = {title, content, folderId};

  Note.findByIdAndUpdate(id,
    updateNote, 
    {new: true})
    .then(note => {
      if(note) {
        res.json(note);
      } else {
        next();
      }
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  // console.log('Delete a Note');
  // res.status(204).end();

  const id = req.params.id;

  Note.findByIdAndRemove(id)
    .then(() => {
      res.status(204).end();
    })
    .catch(err => next(err));
});

module.exports = router;