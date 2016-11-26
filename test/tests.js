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



})
