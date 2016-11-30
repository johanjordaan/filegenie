var program = require('commander');
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


program
	.version('0.0.1');

program
	.command('init <dir>')
	.action(function (dir) {
		console.log(`init ${dir}`);

		fg.initialise(dir).then((success)=>{
			return fg.processDirectory(dir,progress);
		}).then((results) => {
			return fg.saveManifest(dir,results);
		}).catch((err) => {
			done();
		})

	})

program
	.command('update <dir>')
	.action(function () {
		console.log(`update ${dir}`);


	});

program.parse(process.argv);
if (!program.args.length) program.help();
