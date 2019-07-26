// Karma configuration file, see link for more information
// https://karma-runner.github.io/1.0/config/configuration-file.html

module.exports = function(config) {
  require('../../karma.conf')(config);
  config.set({
    coverageIstanbulReporter: {
      dir: require('path').join(__dirname, '../../coverage/openapi-viewer'),
      reports: ['html', 'lcovonly'],
      fixWebpackSourcePaths: true
    }
  });
};
