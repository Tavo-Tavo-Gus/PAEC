const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const config = getDefaultConfig(__dirname);

// Resolve Node.js modules to prevent them from being bundled
config.resolver.extraNodeModules = {
  stream: require.resolve('stream-browserify'),
  buffer: require.resolve('buffer'),
  util: require.resolve('util'),
  events: require.resolve('events'),
  http: require.resolve('stream-browserify'), // Use stream as fallback
  https: require.resolve('stream-browserify'), // Use stream as fallback
  net: require.resolve('stream-browserify'), // Use stream as fallback
  tls: require.resolve('stream-browserify'), // Use stream as fallback
  zlib: require.resolve('stream-browserify'), // Use stream as fallback
  crypto: require.resolve('stream-browserify'), // Use stream as fallback
  ws: path.join(__dirname, 'ws-shim.js'),
  url: require.resolve('url'),
};

// Blacklist ws internals to force use of shim
const originalGetBlocklist = config.resolver.getBlocklist;
config.resolver.getBlocklist = () => {
  const blockList = originalGetBlocklist ? originalGetBlocklist() : [];
  return [
    ...blockList,
    /node_modules\/ws\/lib\/.*/,
    /node_modules\/ws\/index\.js/,
  ];
};

module.exports = config;
