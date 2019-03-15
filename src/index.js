'use strict';
const {promisify} = require('util');
const {readdir, stat, readdirSync, statSync} = require('fs');
const {resolve} = require('path');

const readdirP = promisify(readdir);
const statP = promisify(stat);
const defaultIgnoreFolders = ['node_modules'];
const defaultFilter = () => true;
const defaultTransform = ({path}) => path;
const defaultRecurse = ({dir}) => !defaultIgnoreFolders.includes(dir);
const defaultOptions = {
	recurse: defaultRecurse,
	filter: defaultFilter,
	transform: defaultTransform
};

const readdirRecursive = async (dir, options = {}) => {
	const {recurse, filter, transform} = {...defaultOptions, ...options};
	const files = await readdirP(dir);

	return files.reduce(async (last, file) => {
		const keptFiles = await last;
		const path = resolve(dir, file);
		const stats = await statP(path);

		if (stats.isDirectory()) {
			if (await recurse({dir: file, path, stats})) {
				return [
					...keptFiles,
					...(await readdirRecursive(path, {recurse, filter, transform}))
				];
			}
			return keptFiles;
		}

		if (await filter({file, path, stats})) {
			return [...keptFiles, await transform({file, path, stats})];
		}
		return keptFiles;
	}, []);
};

const readdirRecursiveSync = (dir, options = {}) => {
	const {recurse, filter, transform} = {...defaultOptions, ...options};
	const files = readdirSync(dir);

	return files.reduce((keptFiles, file) => {
		const path = resolve(dir, file);
		const stats = statSync(path);

		if (stats.isDirectory()) {
			if (recurse({dir: file, path, stats})) {
				return [
					...keptFiles,
					...readdirRecursiveSync(path, {recurse, filter, transform})
				];
			}
			return keptFiles;
		}

		if (filter({file, path, stats})) {
			return [...keptFiles, transform({file, path, stats})];
		}
		return keptFiles;
	}, []);
};

module.exports = readdirRecursive;

readdirRecursive.sync = readdirRecursiveSync;
