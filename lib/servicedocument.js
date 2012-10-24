
var xml = require('libxmljs')
	, ns = require('./namespace')
	, collection = require('./collection')
	;

/**
 * Create a new ServiceDocument object.
 *
 * @method servicedocument
 * @return {Object} ServiceDocument object.
 */

exports = module.exports = function() {
	new ServiceDocument();
};

function ServiceDocument() {}

ServiceDocument.prototype = {
	title: null,
	collection: [],
	parse: function(node) {

		this.title = node.find('/app:service/app:workspace/atom:title', ns.prefixes)[0];
		if (this.title != null)
			this.title = this.title.text();

		var collections = node.find('/app:service/app:workspace/app:collection', ns.prefixes);
		for(var i = 0; i < collections.length; ++i)
		{
			var coll = collection();
			coll.parse (collections[i]);
			this.collection.push (coll);
		}
	}
};

/**
 * Parse a servicedocument body returned by the server.
 *
 * @method parse
 * @param {String} body servicedocument contents.
 * @param {Function} callback function(err, ServiceDocument)
 */

exports.parse = function(body, callback) {
	var doc = xml.parseXml (body);
	var servicedocument = new ServiceDocument();
	servicedocument.parse (doc.root());
	callback (null, servicedocument);
};
