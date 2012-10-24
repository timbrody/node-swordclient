var sword = require('../lib/sword.js')
	, getopt = require('posix-getopt')
	, assert = require('assert')
	, url_util = require('url')
	, Promise = require('node-promise').Promise
	;

var parser = new getopt.BasicParser('h(help)u:(username)p:(password)', process.argv);

var username = ''
	, password = ''
;

while ((option = parser.getopt()) !== undefined)
{
	switch (option.option) {
		case 'h':
			help();
			break;
		case 'u':
			username = option.optarg;
			break;
		case 'p':
			password = option.optarg;
			break;
		default:
			assert('?', option.option);
			break;
	}
}

if (parser.optind() >= process.argv.length)
	usage('missing required argument: "url"');

var url = process.argv[parser.optind()];

console.log ('Connect to ' + url);

var options = url_util.parse (url);

sword.connect (options, response);

function response(err, serviceDocument)
{
	if (err && err.statusCode) {
		console.log('HTTP Response: ' + err.statusCode);
		switch (err.statusCode) {
			case 401:
				basic_auth ();
				return;
		};
	}
	assert.equal (err, null);
	console.log (serviceDocument);
}

function basic_auth()
{
	var promise = new Promise();
	promise.then(function(u) {
		var promise = new Promise();
		promise.then(function(p) {
			options.auth = u + ':' + p;
			username = password = '';
			console.log('Basic auth: ' + u);
			sword.connect (options, response);
		}, function(err) {
			throw err;
		});
		if (password != '')
			promise.resolve (password);
		else
			hidden_input('Password', /.+/, function(p) {
				promise.resolve (p);
			});
	}, function(err) {
		throw err;
	});
	if (username != '')
		promise.resolve (username);
	else
		input('Username', /[^:]+/, function(u) {
			promise.resolve (u);
		});
}

function help()
{
	console.log('Usage: ' + process.argv[0] + ' ' + process.argv[1] + ' [options] <url>');
	console.log('Options:');
	console.log('\t-h');
	console.log('\t\tShow this screen.');
	process.exit(1);
}

function usage(msg)
{
	console.log(msg);
	process.exit(1);
}

// http://st-on-it.blogspot.co.uk/2011/05/how-to-read-user-input-with-nodejs.html
function input(prompt, format, callback)
{
	var stdin = process.stdin
		, stdout = process.stdout;

	stdin.resume();
	stdout.write(prompt + ': ');

	stdin.once('data', function(data) {
		data = data.toString().trim();

		if (format.test(data)) {
			callback(data);
		}
		else {
			stdout.write('It should match: ' + format + '\n');
			input (prompt, format, callback);
		}
	});
}

if (!process.stdin.setRawMode)
	process.stdin.setRawMode = function(mode) {
		require ('tty').setRawMode (mode);
	};

function hidden_input(prompt, format, callback)
{
	var stdin = process.stdin
		, stdout = process.stdout
		;

	stdin.setRawMode (true);
	stdin.resume();
	stdout.write(prompt + ': ');

	var password = '';
	stdin.on('data', function(c) {
		c = c.toString();
		switch (c) {
		case '\n':
		case '\r':
		case '\u0004':
			stdin.setRawMode (false);
			stdin.pause();
			if (format.test(password))
				callback (password);
			else {
				stdout.write('It should match: ' + format + '\n');
				hidden_input (prompt, format, callback);
			}
			break;
		case '\u0003':
			process.exit();
			break;
		default:
			password += c;
			break;
		};
	});
}
