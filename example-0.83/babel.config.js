module.exports = {
  presets: ['module:@react-native/babel-preset'],
  plugins: [
    [
      'module-resolver',
      {
        alias: {
          '@movable/react-native-sdk': '../src',
        },
      },
    ],
  ],
};
