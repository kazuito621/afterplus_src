// conf.js
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['test/e2e/smoke.js'],
  capabilities: {
    'browserName': 'chrome'
  },
  allScriptsTimeout: 50000, // 50 sec. TODO: fix me once we have performance optimization completed
  jasmineNodeOpts: {
    defaultTimeoutInterval: 100000 // 100 sec. TODO: fix me once we have performance optimization completed
  }
}
