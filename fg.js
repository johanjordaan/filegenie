var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');

var hashFile = (fileName) => {
	// TODO :  Handle errors
	return new Promise((resolve, reject) => {
		var stream = fs.createReadStream(fileName);

		var hash = crypto.createHash('md5');
		stream.on('data', (data) => {
			hash.update(data, 'utf8')
		})

		stream.on('end', () => {
			resolve(hash.digest('hex'))
		})

	});
}

var walk = function(dir, f) {
	var results = [];
	// Base code from:
	// http://stackoverflow.com/questions/5827612/node-js-fs-readdir-recursive-directory-search
	return new Promise((resolve,reject) => {
		fs.readdir(dir, (err, list) => {
			if (err) reject(err);
			var pending = list.length;
			if (!pending) resolve(results);
			_.each(list,(file) => {
				file = path.resolve(dir, file);
				fs.stat(file, (err, stat) => {
					if (stat && stat.isDirectory()) {
						walk(file).then((res)=>{
							results = results.concat(res);
							if (!--pending) resolve(results);
						}).catch((err)=>{
							reject(err);
						})
					} else {
						if(f !== undefined)
							results.push(f(file));
						else
							results.push(file);
						if (!--pending) resolve(results);
					}
				});
			})
		});
	})
};

var exists = (path) => {
	return new Promise((resolve, reject) => {
		fs.access(path,fs.constants.F_OK,(err)=>{
			if(err === undefined || err === null) resolve(true);
			else resolve(false);
		})
	})
}

var init = (target) => {
	var target_filegenie = path.join(target,".filegenie");
	return exists(target).then((doesExist)=>{
		if(!doesExist) {
			return Promise.reject(new Error(`[${target}] does not exist`))
		} else {
			return exists(target_filegenie);
		}
	}).then((doesExist) => {
		if(!doesExist) {
			return new Promise((resolve, reject) =>{
				fs.mkdir(target_filegenie,(err) => {
					if(err === undefined || err === null) return resolve(true);
					else return reject(err);
				})
			})
		} else {
			return Promise.resolve(true);
		}
	})
}

var processDirectory = (path) => {
	// Modes
	// 1) From -> To
	// 2) Current
	// 3) Two way ?


	// 1) Look for an existing .filegenie file
	// 1.1) Read the file csv [filename,filepath,hash,timestamp,filetimestamp]
	// 2) Read and process the path
	// 2.1) Create a csv file [filename,filepath,hash,timestamp,filetimestamp]
	// 3) Compare the previous file
}

module.exports = {
	hashFile:hashFile,
	walk: walk,
	exists: exists,
	init: init,
}
