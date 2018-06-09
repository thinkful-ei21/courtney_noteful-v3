'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const {TEST_MONGODB_URI} = require('../config');

const Tags = require('../models/tags');
const seedTags = require('../db/seed/tags');

const expect = chai.expect;
chai.use(chaiHttp);



describe('Running tag tests', function() {

	before(function() {
		return mongoose.connect(TEST_MONGODB_URI)
			.then(() => mongoose.connection.db.dropDatabase());
	});

	beforeEach(function() {
		return Promise.all([
			Tags.insertMany(seedTags),
			Tags.createIndexes()
			]);
	});

	afterEach(function() {
		return mongoose.connection.db.dropDatabase();
	});

	after(function() {
		return mongoose.disconnect();
	});




	describe('GET TESTS', function() {

		describe('GET /api/tags', function() {
			it('should return all notes', function() {
				return Promise.all([
					Tags.find(),
					chai.request(app).get('/api/tags')
				])
				.then(([tags, res]) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.a('array');
					expect(res.body).to.have.length(tags.length);
					expect(res.body).to.not.be.null;

					res.body.forEach(function(tag) {
						expect(tag).to.be.a('object');
						expect(tag).to.include.keys('id', 'name');
					});
				});
			});


			it('should return 404 error status if endpoint is invalid', function() {
				return Promise.all([
					Tags.find(),
					chai.request(app).get('/api/tag')
				])
				.then(([tags, res]) => {
					expect(res).to.have.status(404);
					expect(res).to.be.json;
					expect(res).to.be.a('object');
					expect(res.body).to.have.keys('status', 'message');
				});
			});
		});

		describe('GET /api/tags/:id', function() {
			it('should return correct folder with matching id', function() {
				let tags;
				return Tags.findOne()
					.then(randomTags => {
						tags = randomTags;
						return chai.request(app)
							.get(`/api/tags/${tags.id}`);
					})
					.then(res => {
						expect(res).to.have.status(200);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
						expect(res.body).to.have.keys('id', 'name');
						expect(res.body.id).to.not.be.null;

						expect(res.body.id).to.equal(tags.id);
						expect(res.body.name).to.equal(tags.name);
					});
			});


			it('should return 400 error status if id is invalid', function() {
				return chai.request(app)
					.get(`/api/tags/a`)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});


			it('should return 404 error status if folder is not found', function() {
				return chai.request(app)
				.get('/api/tags/211111111111111111111100')
				.then(res => {
					expect(res).to.have.status(404);
					expect(res).to.be.json;
					expect(res).to.be.a('object');
				});
			});
		});
	});


	describe('POST TESTS', function() {

		describe('POST /api/tags', function() {
			it('should create and return a new tag if input is valid', function() {
				const newTag = {
					"name": "Cats"
				};

				let res;
				return chai.request(app)
					.post('/api/tags')
					.send(newTag)
					.then(function(response) {
						res = response;
						expect(res).to.have.status(201);
						expect(res).to.have.header('location');
						expect(res).to.be.json;
						expect(res.body).to.be.a('object');
						expect(res.body).to.have.keys('id', 'name');
						expect(res.body.id).to.not.be.null;
						return Tags.findById(res.body.id);
					})
					.then(newTag => {
						expect(res.body.id).to.equal(newTag.id);
						expect(res.body.name).to.equal(newTag.name);
					});
			});


			it('should return 400 error status if name is not provided', function() {
				const invalidTags = {
					"name": null
				};

				return chai.request(app)
					.post(`/api/tags`)
					.send(invalidTags)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});
		});

	});


	describe('PUT TESTS', function() {

		describe('PUT /api/tags/:id', function() {
			it('should update a tag with new data', function() {
				const updateTag = {
					"name": "Cheesus"
				};

				return Tags.findOne()
					.then(function(randomTag) {
						updateTag.id = randomTag.id;

						return chai.request(app)
							.put(`/api/tags/${updateTag.id}`)
							.send(updateTag);
					})
					.then(res => {
						expect(res).to.have.status(200);
						return Tags.findById(updateTag.id);
					})
					.then(updated => {
						expect(updated.id).to.equal(updateTag.id);
						expect(updated.name).to.equal(updateTag.name);
					});
			});


			it('should return 400 error status if id is invalid', function() {
				return chai.request(app)
					.put(`/api/tags/a`)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});


			it('should return 404 error status if name is not provided', function() {
				const updateTag = {
					"title": "Cheesus"
				};

				return chai.request(app)
					.put(`/api/tags`)
					.send(updateTag)
					.then(res => {
						expect(res).to.have.status(404);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});


			it('should return 404 error status if folder is not found', function() {
				const updateTag = {
					"name": "Cheesus"
				};

				return chai.request(app)
				.put('/api/folders/211111111111111111111100')
				.send(updateTag)
				.then(res => {
					expect(res).to.have.status(404);
					expect(res).to.be.json;
					expect(res).to.be.a('object');
				});
			});
		});
	});


	describe('DELETE TESTS', function() {

		describe('DELETE /api/tags', function() {
			it('should delete a tag at a specific id', function() {
				let tag;

				return Tags.findOne()
					.then(randomTag => {
						tag = randomTag;
						return chai.request(app)
							.delete(`/api/tags/${tag.id}`);
					})
					.then(res => {
						expect(res).to.have.status(204);
						return Tags.findById(tag.id);
					})
					.then(deletedTag => {
						expect(deletedTag).to.be.null;
					});
			});


			it('should return 400 error status if id is invalid', function() {
				return chai.request(app)
					.put(`/api/tags/a`)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});
		});
	});
	





});































