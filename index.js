var fg = require('./fg');

var total = 0;
var count = 0;
var progress = (state,details) => {
	if(state === "DISCOVERING FILES")
		total = total + 1;
	if(state === "HASHING FILES") {
		count = count + 1;
		console.log(`[${(count/total)*100}%] - ${details}`);
	}
}

fg.processDirectory('/Users/johan/Desktop/all_photos',progress).then((results) => {
	console.log(`Done... [${total}]`);
}).catch((err) => {
	console.log(err);
})
