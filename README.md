# reload modules

reload nodejs modules with [batchdelcache](https://github.com/NoCoreNode/batchdelcache)


[![Build Status](https://travis-ci.org/NoCoreNode/reload-modules.svg?branch=master)](https://travis-ci.org/NoCoreNode/reload-modules)
[![Coverage Status](https://coveralls.io/repos/github/NoCoreNode/reload-modules/badge.svg?branch=master)](https://coveralls.io/github/NoCoreNode/reload-modules?branch=master)

## Installation

```bash
# use npm
npm install reload-modules
# or use yarn
yarn add reload-modules
```

## Environment

Node.js 10+

## Usage

```js
import Reloader from 'reload-modules';

const reloader = new Reloader({
    fileMap: {
        mod1: 'abcd',
        mod2: 'efcg',
    },
    context: resolve(__dirname, './fixtures'),
    commonRootPath: resolve(__dirname, './fixtures/mainModule.js'),
});

reloader.reload({
    mod1: 'xxxx',
    mod2: 'xxxx',
});
```