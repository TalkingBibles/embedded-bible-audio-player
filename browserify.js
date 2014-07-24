var browserify = require('browserify');
var fs = require('fs');

var bundler = browserify(__dirname + '/src/index.js');

bundler.transform({
	global: true
}, 'uglifyify');

bundler.bundle()
	.pipe(fs.createWriteStream(__dirname + '/build/tbplayer.' + new Date().valueOf() + '.min.js'));