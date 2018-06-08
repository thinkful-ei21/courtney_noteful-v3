'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const {TEST_MONGODB_URI} = require('../config');

const Note = require('../models/note');
const Folder = require('../models/folders');
const Tags = require('../models/tags');

const seedNotes = require('../db/seed/notes');
const seedFolders = require('../db/seed/folders');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);



describe('Running note tests', function() {

	before(function() {
		return mongoose.connect(TEST_MONGODB_URI)
			.then(() => mongoose.connection.db.dropDatabase());
	});

	beforeEach(function() {
		return Promise.all([
			Note.insertMany(seedNotes),
			Folder.insertMany(seedFolders),
			Tags.insertMany(seedTags)
		])
		.then(() => {
			return Note.createIndexes();
		});
	});

	afterEach(function() {
		return mongoose.connection.db.dropDatabase();
	});

	after(function() {
		return mongoose.disconnect();
	});




	describe('GET TESTS', function() {

		describe('GET /api/note', function() {
			it('should return all notes', function() {
				return Promise.all([
					Note.find(),
					chai.request(app).get('/api/notes')
				])
				.then(([notes, res]) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.a('array');
					expect(res.body).to.have.length(notes.length);
					expect(res.body).to.not.be.null;

					res.body.forEach(function(note) {
						expect(note).to.be.a('object');
						expect(note).to.include.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
					});
				});
			});
		});

		describe('GET /api/notes/:id', function() {
			it('should return correct note with matching id', function() {
				let note;
				return Note.findOne()
					.then(randomNote => {
						note = randomNote;
						return chai.request(app)
							.get(`/api/notes/${note.id}`);
					})
					.then(res => {
						expect(res).to.have.status(200);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
						expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');
						expect(res.body.id).to.not.be.null;

						expect(res.body.id).to.equal(note.id);
						expect(res.body.title).to.equal(note.title);
						expect(res.body.content).to.equal(note.content);
						expect(new Date(res.body.createdAt)).to.eql(note.createdAt);
						expect(new Date(res.body.updatedAt)).to.eql(note.updatedAt);
					});
			});
		});
	});


	describe('POST TESTS', function() {

		describe('POST /api/notes', function() {
			it('should create and return a new note if input is valid', function() {
				const newNote = {
					"title": "Cats Rule the World",
					"content": "The Title Says it All"
				};

				let res;
				return chai.request(app)
					.post('/api/notes')
					.send(newNote)
					.then(function(response) {
						res = response;
						expect(res).to.have.status(201);
						expect(res).to.have.header('location');
						expect(res).to.be.json;
						expect(res.body).to.be.a('object');
						expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'tags');
						expect(res.body.id).to.not.be.null;
						return Note.findById(res.body.id);
					})
					.then(newNote => {
						expect(res.body.id).to.equal(newNote.id);
						expect(res.body.title).to.equal(newNote.title);
						expect(res.body.content).to.equal(newNote.content);
						expect(new Date(res.body.createdAt)).to.eql(newNote.createdAt);
						expect(new Date(res.body.updatedAt)).to.eql(newNote.updatedAt);
					});
			});
		});

	});


	describe('PUT TESTS', function() {

		describe('PUT /api/notes/:id', function() {
			it('should update a note with new data', function() {
				const updateNote = {
					"title": "Cheesus",
					"content": "Lord of all cheeses..."
				};

				return Note.findOne()
					.then(function(randomNote) {
						updateNote.id = randomNote.id;
						updateNote.folderId = randomNote.folderId;

						return chai.request(app)
							.put(`/api/notes/${updateNote.id}`)
							.send(updateNote);
					})
					.then(res => {
						expect(res).to.have.status(200);
						expect(res).to.be.json;
	          expect(res.body).to.be.a('object');
	          expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt', 'folderId', 'tags');

						return Note.findById(updateNote.id);
					})
					.then(updated => {
						expect(updated.id).to.equal(updateNote.id);
						expect(updated.title).to.equal(updateNote.title);
						expect(updated.content).to.equal(updateNote.content);
					});
			});
		});
	});


	describe('DELETE TESTS', function() {

		describe('DELETE /api/notes', function() {
			it('should delete a note at a specific id', function() {
				let note;

				return Note.findOne()
					.then(randomNote => {
						note = randomNote;
						return chai.request(app)
							.delete(`/api/notes/${note.id}`);
					})
					.then(res => {
						expect(res).to.have.status(204);
						return Note.findById(note.id);
					})
					.then(deletedNote => {
						expect(deletedNote).to.be.null;
					});
			});
		});
	});
	





});































