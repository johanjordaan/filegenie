var _ = require('lodash');
var crypto = require('crypto');
var hash = crypto.createHash('md5');
var fs = require('fs');
var path = require('path');



var hashFile = (fileName) => {
	// TODO :  Handle errors
	return new Promise((resolve, reject) => {
		stream = fs.createReadStream(fileName);

		stream.on('data', (data) => {
			hash.update(data, 'utf8')
		})

		stream.on('end', () => {
			resolve(null, hash.digest('hex'))
		})
	});
}

var walk = function(dir, f) {
	var results = [];
	// Base code from:
	// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
	return new Promise((resolve,reject) => {
		fs.readdir(dir, (err, list) => {
			if (err) return reject(err);
			var pending = list.length;
			if (!pending) return resolve(null, results);
			_.each(list,(file) => {
				file = path.resolve(dir, file);
				fs.stat(file, (err, stat) => {
					if (stat && stat.isDirectory()) {
						walk(file, (err, res) => {
							results = results.concat(res);
							if (!--pending) resolve(null, results);
						});
					} else {
						if(f !== undefined)
							results.push(f(file));
						else
							results.push(file);
						if (!--pending) resolve(null, results);
					}
				});
			})
		});
	})
};


module.exports = {
	hashFile:hashFile,
	walk: walk,
}
