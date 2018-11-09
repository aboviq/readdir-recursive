# @aboviq/readdir-recursive

[![Build status][travis-image]][travis-url] [![NPM version][npm-image]][npm-url] [![XO code style][codestyle-image]][codestyle-url]

> Customizeable async recursive fs.readdir with no dependencies and sane defaults

## Why?

- No dependencies / Small
- Asynchronous, i.e. returns a promise (uses async/await under the hood)
- Sane defaults, i.e. does not recurse into `node_modules` by default
- Fully customizable, with [options](#options) to decide in which folders to recurse into and what files and information to include in the results, with full access to each file's [Stats][fs-stats] information

## Installation

Install `@aboviq/readdir-recursive` using [npm](https://www.npmjs.com/):

```bash
npm install @aboviq/readdir-recursive
```

## Usage

### Module usage

```javascript
const readdirRecursive = require('@aboviq/readdir-recursive');

const files = await readdirRecursive('a/path');
/*
[
  "/full-path/a/path/filename.ext",
  "/full-path/a/path/nested/folders/another.ext",
  ...
]
*/
```

## API

### `readdirRecursive(dir, options)`

| Name    | Type     | Description                                                                           |
| ------- | -------- | ------------------------------------------------------------------------------------- |
| dir     | `String` | The folder to read files recursively in, either relative to `cwd` or an absolute path |
| options | `Object` | Options for filtering, recursion and transformation                                   |

Returns: `Promise<Array>`, all found files transformed according to the transformer and that has not been filtered out

### Options

#### `options.filter`

Type: `Function`  
Signature: `filter :: Object -> Boolean`  
Default: `() => true`

The `filter` option is used to decide if a file should be included in the resulting array of files or not. A file is included if the filter function returns a truthy value.

The `Object` passed to the `filter` function has the following properties:

| Name  | Type                | Description                                                          |
| ----- | ------------------- | -------------------------------------------------------------------- |
| file  | `String`            | The file name, e.g. `"file.txt"`                                     |
| path  | `String`            | The full path to the file, e.g. `"/your/folder/sub-folder/file.txt"` |
| stats | [`Stats`][fs-stats] | A stats object providing information about the file                  |

#### `options.transform`

Type: `Function`  
Signature: `transform :: Object -> String`  
Default: a function returing the full path of each file

The `transform` option is used to transform file information into something useful. Every file that passes the filter function will be transformed before being included in the resulting array.

The `Object` passed to the `transform` function has the following properties:

| Name  | Type                | Description                                                          |
| ----- | ------------------- | -------------------------------------------------------------------- |
| file  | `String`            | The file name, e.g. `"file.txt"`                                     |
| path  | `String`            | The full path to the file, e.g. `"/your/folder/sub-folder/file.txt"` |
| stats | [`Stats`][fs-stats] | A stats object providing information about the file                  |

#### `options.recurse`

Type: `Function`  
Signature: `recurse :: Object -> Boolean`  
Default: a function which won't recurse `node_modules`

The `recurse` option is used to decide if a folder should be recursed into or not. A folder is recursed if the recurse function returns a truthy value.

The `Object` passed to the `recurse` function has the following properties:

| Name  | Type                | Description                                                   |
| ----- | ------------------- | ------------------------------------------------------------- |
| dir   | `String`            | The folder name, e.g. `"src"`                                 |
| path  | `String`            | The full path to the folder, e.g. `"/your/folder/sub-folder"` |
| stats | [`Stats`][fs-stats] | A stats object providing information about the folder         |

## Contributing

See [Contribution Guidelines](CONTRIBUTING.md) and our [Code Of Conduct](CODE_OF_CONDUCT.md).

## License

MIT © [Aboviq AB](https://www.aboviq.com/)

[npm-url]: https://npmjs.org/package/@aboviq/readdir-recursive
[npm-image]: https://badge.fury.io/js/@aboviq/readdir-recursive.svg
[travis-url]: https://travis-ci.org/aboviq/@aboviq/readdir-recursive
[travis-image]: https://travis-ci.org/aboviq/@aboviq/readdir-recursive.svg?branch=master
[codestyle-url]: https://github.com/xojs/xo
[codestyle-image]: https://img.shields.io/badge/code%20style-XO-5ed9c7.svg?style=flat
[fs-stats]: https://nodejs.org/docs/latest/api/fs.html#fs_class_fs_stats
