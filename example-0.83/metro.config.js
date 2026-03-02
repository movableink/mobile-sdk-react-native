const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const path = require('path');

/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const config = {
  watchFolders: [path.resolve(__dirname, '..')],
  resolver: {
    blockList: [
      // Exclude other example apps
      /example\/node_modules\/.*/,
      /example-0\.73\/node_modules\/.*/,
      /example-0\.79\/node_modules\/.*/,
    ],
    extraNodeModules: {
      '@movable/react-native-sdk': path.resolve(__dirname, '../src'),
    },
  },
};

module.exports = mergeConfig(getDefaultConfig(__dirname), config);
