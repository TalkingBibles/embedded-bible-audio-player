var browserify = require('browserify');

var bundler = browserify(__dirname + '/src/index.js');

bundler.transform({
	global: true
}, 'uglifyify');

bundler.bundle()
	.pipe(process.stdout);