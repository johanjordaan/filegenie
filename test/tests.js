var fg = require('../fg');
var should = require('chai').should()

describe("filegenie", (done) => {

	describe("walk", (done) => {
		it("should read all the files in the current directory",(done) => {
			fg.walk('./test/fixtures').then((result)=>{
				result.length.should.equal(3);
				done();
			}).catch((err)=>{
				done(err);
			})
		})
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

})
