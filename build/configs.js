const path = require('path')
const buble = require('@rollup/plugin-buble')
const replace = require('@rollup/plugin-replace')
const node = require('@rollup/plugin-node-resolve')
const babel = require('rollup-plugin-babel')
const copy = require('rollup-plugin-copy')
const featureFlags = require('./feature-flags')
const pckg = require('../package.json')

const FILENAME = 'fuse'
const VERSION = process.env.VERSION || pckg.version
const AUTHOR = pckg.author
const HOMEPAGE = pckg.homepage
const DESCRIPTION = pckg.description

const banner = `/**
 * Fuse.js v${VERSION} - ${DESCRIPTION} (${HOMEPAGE})
 *
 * Copyright (c) ${new Date().getFullYear()} ${AUTHOR.name} (${AUTHOR.url})
 * All Rights Reserved. Apache Software License 2.0
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 */\n`

const resolve = _path => path.resolve(__dirname, '../', _path)

const builds = {
  // UMD build
  'umd-dev': {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${FILENAME}.js`),
    format: 'umd',
    env: 'development',
    plugins: [copy({
      targets: [{
        src: resolve('src/index.d.ts'),
        dest: resolve('dist'),
        rename: `${FILENAME}.d.ts`,
        transform: (content) => {
          return `// Type definitions for Fuse.js v${VERSION}\n${content}`
        }
      }]
    })]
  },
  // UMD production build
  'umd-prod': {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${FILENAME}.min.js`),
    format: 'umd',
    env: 'production',
  },
  // CommonJS build
  'commonjs-dev': {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${FILENAME}.common.dev.js`),
    env: 'development',
    format: 'cjs',
  },
  'commonjs-prod': {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${FILENAME}.common.prod.js`),
    env: 'production',
    format: 'cjs',
  },
  // ES modules build (for bundlers)
  'esm': {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${FILENAME}.esm.js`),
    format: 'es',
    env: 'development',
  },
  // ES modules build (for direct import in browser)
  'esm-browser-dev': {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${FILENAME}.esm.browser.js`),
    format: 'es',
    env: 'development',
    transpile: false,
  },
  // ES modules production build (for direct import in browser)
  'esm-browser-prod': {
    entry: resolve('src/index.js'),
    dest: resolve(`dist/${FILENAME}.esm.browser.min.js`),
    format: 'es',
    env: 'production',
    transpile: false,
  },
}
// built-in vars
const vars = {
  __VERSION__: VERSION
}

function genConfig(options) {
  const config = {
    input: options.entry,
    plugins: [
      node(),
      ...options.plugins || [],
    ],
    output: {
      banner,
      file: options.dest,
      format: options.format,
      name: 'Fuse.js'
    }
  }

  // build-specific env
  if (options.env) {
    vars['process.env.NODE_ENV'] = JSON.stringify(options.env)
  }

  // feature flags
  Object.keys(featureFlags).forEach(key => {
    vars[`process.env.${key}`] = featureFlags[key]
  })

  config.plugins.push(replace(vars))

  if (options.transpile !== false) {
    config.plugins.push(babel())
    config.plugins.push(buble())
  }

  return config
}

function mapValues(obj, fn) {
  const res = {}
  Object.keys(obj).forEach(key => {
    res[key] = fn(obj[key], key)
  })
  return res
}

module.exports = mapValues(builds, genConfig)
