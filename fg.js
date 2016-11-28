var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var path = require('path');
var walk = require('walk');

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

var exists = (path) => {
	return new Promise((resolve, reject) => {
		fs.access(path,fs.constants.F_OK,(err)=>{
			if(err === undefined || err === null) resolve(true);
			else resolve(false);
		})
	})
}

var processDirectory = (target,progress) => {
	return new Promise((resolve, reject) => {
		var walker  = walk.walk(target, { followLinks: false })
		var results = [];

		walker.on("file", (root, fileStat, next) => {
			results.push({
				name: fileStat.name,
				path: path.join(root,fileStat.name),
				mtime: fileStat.mtime, //data modified
				birthtime: fileStat.mtime, //create date
				hash: '',
			});
			if(progress !== undefined) progress("DISCOVERING FILES",fileStat.name);
			next();
		});

		walker.on("errors", (root, nodeStatsArray, next) => {
			nodeStatsArray.forEach(function (n) {
				console.error("[ERROR] " + n.name)
				console.error(n.error.message || (n.error.code + ": " + n.error.path));
			});
			reject(new Error("xxxxx"));
			next();
		});

		walker.on("end", () => {
			var hashPromises = _.map(results,(item) => {
				return hashFile(item.path).then((hash)=>{
					if(progress !== undefined) progress("HASHING FILES",item.name);
					return hash;
				})
			})
			// NOTE : I assume that they resolve in the same order
			Promise.all(hashPromises).then((values) => {
				results = _.map(_.zip(results,values),([item,hash]) => {
					item.hash = hash;
					return item;
				});
				resolve(results);
			});
		});
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

var saveResults = (dir, results) => {
	new Promise((resolve, reject) => {
		var location = path.join(dir,".filegenie","current.json");
		fs.writeFile(location, JSON.stringify(results), "utf-8", (err) => {
			if(err) reject(err);
			else resolve(true);
		})
	});

}

module.exports = {
	hashFile: hashFile,
	exists: exists,
	init: init,
	processDirectory: processDirectory,
	saveResults: saveResults,
}
