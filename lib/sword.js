var servicedocument = require('./servicedocument')
	, http = require('http')
	, assert = require('assert')
	;

exports.connect = function(options, callback)
{
	var req = http.request(options, function(res) {
		if (res.statusCode != 200)
			return callback(res);
		var content_type = res.headers['content-type'];
		var body = '';
		res.on('data', function(buffer) { body += buffer });
		if (content_type.match(/^application\/xtomsvc\+xml/))
		{
			res.on('end', function() {
				servicedocument.parse(body, callback);
			});
		}
		else
		{
			res.on('end', function() {
				var match = body.match(/(<link[^>]+rel=["']Sword["'][^>]*>)/i)
				if (match == null)
					return callback(new Error('Page response contains no sword link ref'));
				var href = match.match(/href=["']([^'"]+)["']/);
				if (!href || href == url)
					return callback(new Error('Invalid or missing service document URL'));
				exports.connect(href, callback);
			});
		}
	});
	req.on('error', function(err) {
		console.log('Error connecting to %s: %s', url, err);
	});
	req.end();
};
