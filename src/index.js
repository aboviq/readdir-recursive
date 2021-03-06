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

const tryReaddirP = async dir => {
	try {
		return await readdirP(dir);
	} catch (error) {
		if (error.code === 'EACCES') {
			return [];
		}

		throw error;
	}
};

const tryReaddirSync = dir => {
	try {
		return readdirSync(dir);
	} catch (error) {
		if (error.code === 'EACCES') {
			return [];
		}

		throw error;
	}
};

const readdirRecursive = async (dir, options = {}) => {
	const {recurse, filter, transform} = {...defaultOptions, ...options};
	const files = await tryReaddirP(dir);

	return files.reduce(async (last, file) => {
		const keptFiles = await last;
		const path = resolve(dir, file);
		let stats;

		try {
			stats = await statP(path);
		} catch (error) {
			if (error.code === 'ENOENT') {
				// This happens for symlinks pointing to non-existing files
				return keptFiles;
			}

			if (error.code === 'EACCES') {
				// This happens for folders without read permission
				return keptFiles;
			}

			throw error;
		}

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
	const files = tryReaddirSync(dir);

	return files.reduce((keptFiles, file) => {
		const path = resolve(dir, file);
		let stats;

		try {
			stats = statSync(path);
		} catch (error) {
			if (error.code === 'ENOENT') {
				// This happens for symlinks pointing to non-existing files
				return keptFiles;
			}

			if (error.code === 'EACCES') {
				// This happens for folders without read permission
				return keptFiles;
			}

			throw error;
		}

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
