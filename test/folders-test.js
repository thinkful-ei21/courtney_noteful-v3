'use strict';

const chai = require('chai');
const chaiHttp = require('chai-http');
const mongoose = require('mongoose');

const app = require('../server');
const {TEST_MONGODB_URI} = require('../config');

const Folder = require('../models/folders');
const seedFolder = require('../db/seed/folders');

const expect = chai.expect;
chai.use(chaiHttp);



describe('Running folder tests', function() {

	before(function() {
		return mongoose.connect(TEST_MONGODB_URI)
			.then(() => mongoose.connection.db.dropDatabase());
	});

	beforeEach(function() {
		return Promise.all([
			Folder.insertMany(seedFolder),
			Folder.createIndexes()
			]);
	});

	afterEach(function() {
		return mongoose.connection.db.dropDatabase();
	});

	after(function() {
		return mongoose.disconnect();
	});




	describe('GET TESTS', function() {

		describe('GET /api/folders', function() {
			it('should return all notes with valid query', function() {
				return Promise.all([
					Folder.find(),
					chai.request(app).get('/api/folders')
				])
				.then(([folders, res]) => {
					expect(res).to.have.status(200);
					expect(res).to.be.json;
					expect(res.body).to.be.a('array');
					expect(res.body).to.have.length(folders.length);
					expect(res.body).to.not.be.null;

					res.body.forEach(function(folders) {
						expect(folders).to.be.a('object');
						expect(folders).to.include.keys('id', 'name', 'createdAt', 'updatedAt');
					});
				});
			});

			it('should return 404 error status if endpoint is invalid', function() {
				return Promise.all([
					Folder.find(),
					chai.request(app).get('/api/folder')
				])
				.then(([folders, res]) => {
					expect(res).to.have.status(404);
					expect(res).to.be.json;
					expect(res).to.be.a('object');
					expect(res.body).to.have.keys('status', 'message');
				});
			});
		});

		describe('GET /api/folders/:id', function() {
			it('should return correct folder with matching id', function() {
				let folder;
				return Folder.findOne()
					.then(randomFolder => {
						folder = randomFolder;
						return chai.request(app)
							.get(`/api/folders/${folder.id}`);
					})
					.then(res => {
						expect(res).to.have.status(200);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
						expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
						expect(res.body.id).to.not.be.null;

						expect(res.body.id).to.equal(folder.id);
						expect(res.body.name).to.equal(folder.name);
						expect(new Date(res.body.createdAt)).to.eql(folder.createdAt);
						expect(new Date(res.body.updatedAt)).to.eql(folder.updatedAt);
					});
			});

			it('should return 400 error status if id is invalid', function() {
				return chai.request(app)
					.get(`/api/folders/a`)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});

			it('should return 404 error status if folder is not found', function() {
				return chai.request(app)
				.get('/api/folders/211111111111111111111100')
				.then(res => {
					expect(res).to.have.status(404);
					expect(res).to.be.json;
					expect(res).to.be.a('object');
				});
			});
		});
	});


	describe('POST TESTS', function() {

		describe('POST /api/folders', function() {
			it('should create and return a new folder if input is valid', function() {
				const newFolder = {
					"name": "Cats"
				};

				let res;
				return chai.request(app)
					.post('/api/folders')
					.send(newFolder)
					.then(function(response) {
						res = response;
						expect(res).to.have.status(201);
						expect(res).to.have.header('location');
						expect(res).to.be.json;
						expect(res.body).to.be.a('object');
						expect(res.body).to.have.keys('id', 'name', 'createdAt', 'updatedAt');
						expect(res.body.id).to.not.be.null;
						return Folder.findById(res.body.id);
					})
					.then(newFolder => {
						expect(res.body.id).to.equal(newFolder.id);
						expect(res.body.name).to.equal(newFolder.name);
						expect(new Date(res.body.createdAt)).to.eql(newFolder.createdAt);
						expect(new Date(res.body.updatedAt)).to.eql(newFolder.updatedAt);
					});
			});

			it('should return 400 error status if name is not provided', function() {
				const invalidFolder = {
					"name": null
				};

				return chai.request(app)
					.post(`/api/folders`)
					.send(invalidFolder)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});
		});

	});


	describe('PUT TESTS', function() {

		describe('PUT /api/folders/:id', function() {
			it('should update a folder with new data', function() {
				const updateFolder = {
					"name": "Cheesus"
				};

				return Folder.findOne()
					.then(function(randomFolder) {
						updateFolder.id = randomFolder.id;

						return chai.request(app)
							.put(`/api/folders/${updateFolder.id}`)
							.send(updateFolder);
					})
					.then(res => {
						expect(res).to.have.status(200);
						return Folder.findById(updateFolder.id);
					})
					.then(updated => {
						expect(updated.id).to.equal(updateFolder.id);
						expect(updated.name).to.equal(updateFolder.name);
					});
			});


			it('should return 400 error status if id is invalid', function() {
				return chai.request(app)
					.put(`/api/folders/a`)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});


			it('should return 404 error status if name is not provided', function() {
				const updateFolder = {
					"title": "Cheesus"
				};

				return chai.request(app)
					.put(`/api/folders`)
					.send(updateFolder)
					.then(res => {
						expect(res).to.have.status(404);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});


			it('should return 404 error status if folder is not found', function() {
				const updateFolder = {
					"name": "Cheesus"
				};

				return chai.request(app)
				.put('/api/folders/211111111111111111111100')
				.send(updateFolder)
				.then(res => {
					expect(res).to.have.status(404);
					expect(res).to.be.json;
					expect(res).to.be.a('object');
				});
			});
		});
	});


	describe('DELETE TESTS', function() {

		describe('DELETE /api/folders', function() {
			it('should delete a folder at a specific id', function() {
				let folder;

				return Folder.findOne()
					.then(randomFolder => {
						folder = randomFolder;
						return chai.request(app)
							.delete(`/api/folders/${folder.id}`);
					})
					.then(res => {
						expect(res).to.have.status(204);
						return Folder.findById(folder.id);
					})
					.then(deletedFolder => {
						expect(deletedFolder).to.be.null;
					});
			});


			it('should return 400 error status if id is invalid', function() {
				return chai.request(app)
					.put(`/api/folders/a`)
					.then(res => {
						expect(res).to.have.status(400);
						expect(res).to.be.json;
						expect(res).to.be.a('object');
					});
			});
		});
	});

});































