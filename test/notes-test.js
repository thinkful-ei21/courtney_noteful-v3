'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const {TEST_MONGODB_URI} = require('../config');

const Note = require('../models/note');
const seedNotes = require('../db/seed/notes');

const expect = chai.expect;
chai.use(chaiHttp);



describe('Running note tests', function() {

	before(function() {
		return mongoose.connect(TEST_MONGODB_URI)
			.then(() => mongoose.connection.db.dropDatabase());
	});

	beforeEach(function() {
		return Note.insertMany(seedNotes);
	});

	afterEach(function() {
		return mongoose.connection.db.dropDatabase();
	});

	after(function() {
		return mongoose.disconnect();
	});




	describe.only('GET TESTS', function() {

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
						expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
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
						expect(res.body).to.have.keys('id', 'title', 'content', 'createdAt', 'updatedAt');
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



	





});































