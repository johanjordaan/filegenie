var fg = require('../fg');


describe("filegenie", (done) => {
	it("should read all the files in the curret directory",(done) => {
		fg.walk('./').then((result)=>{
			console.log(result);
			done();
		}).catch((err)=>{
			done(err);
		})

	})
})
