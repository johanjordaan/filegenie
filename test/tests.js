var fs = require('fs');

var should = require('chai').should()
var expect = require('chai').expect

var fg = require('../fg');

describe("filegenie", (done) => {
	before((done)=>{
		fs.rmdir('./test/fixtures/.filegenie', (err) => {
  			if (err) done();
			else done();
		});
	});

	describe("hashFile", (done) => {
		it("should hash the file and return the hash in hex",(done) => {
			fg.hashFile('./test/fixtures/file_1.txt').then((hash) => {
				hash.should.equal('cb7d53b25a9f40056bfe25a198fe8755');
				done();
			}).catch((err)=>{
				done(err);
			})
		});
	});


	describe("processDirectory", (done) => {
		it("should return a list of hashes of the files",(done) => {
			fg.processDirectory('./test/fixtures').then((results) => {
				expect(results).to.exist;
				results.length.should.equal(3);
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})


	describe("init", (done) => {
		it("should fail if the target directory does not exist",(done) => {
			fg.init('./aadafffqwewqe/').then((success)=>{
				done(new Error("This should not be a success"))
			}).catch((err) => {
				done();
			})
		})

		it("should create the .filegenie directory",(done) => {
			fg.init('./test/fixtures').then((success)=>{
				success.should.equal(true);
				done();
			}).catch((err) => {
				done(err);
			})
		})

		it("should not fail if the .filegenie directory already exists",(done) => {
			fg.init('./test/fixtures').then((success)=>{
				success.should.equal(true);
				done();
			}).catch((err) => {
				done(err);
			})
		})
	})
})
