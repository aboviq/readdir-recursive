'use strict';
const {join} = require('path');
const readdirRecursive = require('.');

const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('readdirRecursive', () => {
	it('does not read files in "node_modules" by default', async () => {
		const files = await readdirRecursive('.');

		expect(files).not.toEqual(
			expect.arrayContaining([expect.stringMatching(/node_modules/)])
		);
	});

	it('does read recursively by default', async () => {
		const files = await readdirRecursive('.');

		expect(files).toEqual(
			expect.arrayContaining([
				expect.stringMatching(/package\.json$/),
				expect.stringMatching(/src\/index\.js$/),
				expect.stringMatching(/src\/index\.test\.js$/)
			])
		);
	});

	it('reads files relative to cwd by default', async () => {
		const files = await readdirRecursive('src');

		expect(files).toHaveLength(2);
		expect(files).toEqual(
			expect.arrayContaining([__filename, join(__dirname, 'index.js')])
		);
	});

	it('can read absolute paths', async () => {
		const files = await readdirRecursive(__dirname);

		expect(files).toHaveLength(2);
		expect(files).toEqual(
			expect.arrayContaining([__filename, join(__dirname, 'index.js')])
		);
	});

	it('filters files based on given filter function', async () => {
		const onlyTestFiles = ({file}) => /\.test\./.test(file);
		const files = await readdirRecursive('.', {filter: onlyTestFiles});

		expect(files).toEqual([__filename]);
	});

	it('accepts async filter functions', async () => {
		const onlyTestFiles = async ({file}) => {
			await sleep(2);
			return /\.test\./.test(file);
		};
		const files = await readdirRecursive('.', {filter: onlyTestFiles});

		expect(files).toEqual([__filename]);
	});

	it("passes full file path's to the filter function", async () => {
		const onlyThisFile = ({path}) => path === __filename;
		const files = await readdirRecursive('.', {filter: onlyThisFile});

		expect(files).toEqual([__filename]);
	});

	it("passes the file's stats to the filter function", async () => {
		const allFiles = ({stats}) => stats.isFile();
		const files = await readdirRecursive('.', {filter: allFiles});

		expect(files).toEqual(expect.arrayContaining([__filename]));
	});

	it('recurses directories based on given recurse function', async () => {
		const noSourceFiles = ({dir}) => dir !== 'src' && dir !== 'node_modules';
		const files = await readdirRecursive('.', {recurse: noSourceFiles});

		expect(files).not.toEqual(expect.arrayContaining([__filename]));
	});

	it('accepts async recurse functions', async () => {
		const noSourceFiles = async ({dir}) => {
			await sleep(2);
			return dir !== 'src' && dir !== 'node_modules';
		};
		const files = await readdirRecursive('.', {recurse: noSourceFiles});

		expect(files).not.toEqual(expect.arrayContaining([__filename]));
	});

	it('passes the full folder path to the recurse function', async () => {
		const noSourceFiles = ({path, dir}) =>
			path !== __dirname && dir !== 'node_modules';
		const files = await readdirRecursive('.', {recurse: noSourceFiles});

		expect(files).not.toEqual(expect.arrayContaining([__filename]));
	});

	it("passes the folder's stats to the recurse function", async () => {
		const allFiles = ({stats, dir}) =>
			stats.isDirectory() && dir !== 'node_modules';
		const files = await readdirRecursive('.', {recurse: allFiles});

		expect(files).toEqual(expect.arrayContaining([__filename]));
	});

	it('transforms files based on given transform function', async () => {
		const doubleFilename = ({file}) => `${file}${file}`;
		const files = await readdirRecursive('.', {transform: doubleFilename});

		expect(files).toEqual(
			expect.arrayContaining(['index.jsindex.js', 'package.jsonpackage.json'])
		);
	});

	it('accepts async transform functions', async () => {
		const doubleFilename = async ({file}) => {
			await sleep(2);
			return `${file}${file}`;
		};
		const files = await readdirRecursive('.', {transform: doubleFilename});

		expect(files).toEqual(
			expect.arrayContaining(['index.jsindex.js', 'package.jsonpackage.json'])
		);
	});

	it("passes full file path's to the transform function", async () => {
		const doubleFilePath = ({path}) => `${path}${path}`;
		const files = await readdirRecursive('.', {transform: doubleFilePath});

		expect(files).toEqual(
			expect.arrayContaining([`${__filename}${__filename}`])
		);
	});

	it("passes the file's stats to the transform function", async () => {
		const isFile = ({stats}) => stats.isFile();
		const files = await readdirRecursive('.', {transform: isFile});

		expect(files).toEqual(expect.arrayContaining([true]));
	});
});
