var _ = require("lodash");
var fs = require('fs');

var should = require('chai').should()
var expect = require('chai').expect

var fg = require('../fg');

describe("filegenie", (done) => {
	before((done)=>{
		fs.rmdir('./test/fixtures/source/.filegenie', (err) => {
  			if (err) done();
			else done();
		});
	});

	describe("hashFile", (done) => {
		it("should hash the file and return the hash in hex",(done) => {
			fg.hashFile('./test/fixtures/source/file_1.txt').then((hash) => {
				hash.should.equal('cb7d53b25a9f40056bfe25a198fe8755');
				done();
			}).catch((err)=>{
				done(err);
			})
		});
	});

	describe("processDirectory", (done) => {
		it("should return a list of hashes of the files",(done) => {
			var progress = (state,name) => {
				//console.log(state,name);
			}

			fg.processDirectory('./test/fixtures/source',undefined,progress).then((manifest) => {
				expect(manifest).to.exist;
				_.keys(manifest).length.should.equal(3);
				done();
			}).catch((err) => {
				done(err);
			})
		})

		it("should return a list of hashes of the files",(done) => {
			var progress = (state,name) => {
				//console.log(state,name);
			}

			fg.processDirectory('./test/fixtures/source').then((manifest) => {
				return fg.processDirectory('./test/fixtures/source',manifest,progress)
			}).then((manifest) => {
				expect(manifest).to.exist;
				_.keys(manifest).length.should.equal(3);
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})

	describe("initialise", (done) => {
		it("should fail if the target directory does not exist",(done) => {
			fg.initialise('./aadafffqwewqe/').then((success)=>{
				done(new Error("This should not be a success"))
			}).catch((err) => {
				done();
			})
		})

		it("should create the .filegenie directory",(done) => {
			fg.initialise('./test/fixtures/source').then((success)=>{
				success.should.equal(true);
				done();
			}).catch((err) => {
				done(err);
			})
		})

		it("should not fail if the .filegenie directory already exists",(done) => {
			fg.initialise('./test/fixtures/source').then((success)=>{
				success.should.equal(true);
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})

	describe("wasInitialised", (done) => {
		it("should return true for a previously initialised directory",(done) => {
			fg.wasInitialised('./test/fixtures/source').then((success)=>{
				success.should.equal(true);
				done();
			}).catch((err) => {
				done(err);
			})
		})

		it("should return false for a directory that has not been initialised",(done) => {
			fg.wasInitialised('./test/').then((success)=>{
				success.should.equal(false);
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})

	describe("saveManifest", (done) => {
		it("should save a manifest of the files in the .filegenie directory",(done) => {
			fg.processDirectory('./test/fixtures/source').then((results) => {
				return fg.saveManifest('./test/fixtures/source',results);
			}).then((success) => {
				success.should.equal(true);
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})

	describe("loadManifest", (done) => {
		it("should load a manifest of the files in the .filegenie directory",(done) => {
			fg.processDirectory('./test/fixtures/source').then((results) => {
				return fg.saveManifest('./test/fixtures/source',results);
			}).then((success) => {
				success.should.equal(true);
				return fg.loadManifest('./test/fixtures/source');
			}).then((loadedResults) => {
				_.keys(loadedResults).length.should.equal(3);
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})

	describe("diff", (done) => {
		it("should generate a diff between the source and destination",(done) => {
			fg.initialise('./test/fixtures/source').then((success)=>{
				return fg.initialise('./test/fixtures/target');
			}).then((success)=>{
				return fg.processDirectory('./test/fixtures/source');
			}).then((results) => {
				return fg.saveManifest('./test/fixtures/source',results);
			}).then((success) => {
				return fg.processDirectory('./test/fixtures/target');
			}).then((results) => {
				return fg.saveManifest('./test/fixtures/target',results);
			}).then((success) => {
				return fg.diff('./test/fixtures/source','./test/fixtures/target');
			}).then((diffResults) => {
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})

})
