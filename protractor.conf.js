// conf.js
exports.config = {
  seleniumAddress: 'http://localhost:4444/wd/hub',
  specs: ['test/e2e/smoke.js'],
  capabilities: {
    'browserName': 'chrome'
  },
  allScriptsTimeout: 20000, // 20 sec. TODO: fix me once we have performance optimization completed
  jasmineNodeOpts: {
    defaultTimeoutInterval: 60000 // 60 sec. TODO: fix me once we have performance optimization completed
  }
}
