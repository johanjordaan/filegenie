var _ = require('lodash');
var crypto = require('crypto');
var fs = require('fs');
var moment = require('moment');

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

var getFileId = (name, size, creationDate, modificationDate) => {
	var hash = crypto.createHash('md5');
	hash.update(name, 'utf8');
	hash.update(size, 'utf8');
	hash.update(creationDate, 'utf8');
	hash.update(modificationDate, 'utf8');
	return hash.digest('hex');
}

var exists = (path) => {
	return new Promise((resolve, reject) => {
		fs.access(path,fs.constants.F_OK,(err)=>{
			if(err === undefined || err === null) resolve(true);
			else resolve(false);
		})
	})
}

var processDirectory = (dir, manifest, progress) => {
	if(manifest === undefined) manifest = {};

	return new Promise((resolve, reject) => {
		var walker  = walk.walk(dir, { followLinks: false })
		var results = {};

		walker.on("file", (root, fileStat, next) => {
			if(root.match(/\.filegenie/) !== null) next();
			else {
				creationDate = moment(fileStat.birthtime).format("YYYYMMDD hhmmss");
				modificationDate = moment(fileStat.mtime).format("YYYYMMDD hhmmss");
				id = getFileId(fileStat.name,`${fileStat.size}`,creationDate,modificationDate)


				results[id] = {
					id: id,
					name: fileStat.name,
					path: path.join(root,fileStat.name),
					modificationDate: modificationDate,
					creationDate: creationDate,
					size: fileStat.size,
					hash: '',
				};
				if(progress !== undefined) progress("DISCOVERING FILES",fileStat.name);
				next();
			}
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
			var hashPromises = _.map(_.values(results),(item) => {
				previousItem = manifest[item.id];

				if(previousItem !== undefined) {
					item.hash = previousItem.hash;
					if(progress !== undefined) progress("SKIPPING FILES",item.name);
				} else {
					return hashFile(item.path).then((hash)=>{
						if(progress !== undefined) progress("HASHING FILES",item.name);
						item.hash =  hash;
					})
				}
			})
			// NOTE : I assume that they resolve in the same order
			Promise.all(hashPromises).then(() => {
				resolve(results);
			});
		});
	})
}

var wasInitialised = (dir) => {
	return exists(path.join(dir,".filegenie"));
}

var initialise = (target) => {
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

var saveManifest = (dir, results) => {
	return new Promise((resolve, reject) => {
		var location = path.join(dir,".filegenie","manifest.json");
		fs.writeFile(location, JSON.stringify(results), "utf-8", (err) => {
			if(err) reject(err);
			else resolve(true);
		})
	});
}

var loadManifest = (dir) => {
	return new Promise((resolve, reject) => {
		var location = path.join(dir,".filegenie","manifest.json");
		fs.readFile(location, "utf-8", (err, data) => {
			console.log(err,data)
			if(err) reject(err);
			else resolve(JSON.parse(data));
		})
	});
}

var diff = (source, target) => {
	console.log(source,target);
	var sourceManifest = {};
	loadManifest(target).then((results)=>{
//		sourceManifest = results;
		console.log("...2",target,source);
		return loadManifest(target);
	}).then((targetManifest) => {

		console.log("...");
		// Check all items in source: Same, Deleted, Changed, Renamed
		var d = _.map(sourceManifest,(item)=>{
			return(id);
		})
		console.log(d);

		// Check all items in target: New


	}).catch((err)=>{
		console.log(err);
	})
}

module.exports = {
	hashFile: hashFile,
	exists: exists,
	wasInitialised: wasInitialised,
	initialise: initialise,
	processDirectory: processDirectory,
	saveManifest: saveManifest,
	loadManifest: loadManifest,
	diff: diff,
}
