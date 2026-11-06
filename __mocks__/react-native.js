module.exports = {
  Platform: {
    OS: 'android',
    select: (obj) => obj.android || obj.default,
  },
  Vibration: {
    vibrate: jest.fn(),
    cancel: jest.fn(),
  },
  StyleSheet: {
    create: (styles) => styles,
  },
  Dimensions: {
    get: () => ({ width: 375, height: 812 }),
  },
  Linking: {
    openURL: jest.fn().mockResolvedValue(true),
  },
};
