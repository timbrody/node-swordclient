
var ns = require('./namespace');

/**
 * Create a new Collection object.
 *
 * @method collection
 * @return {Object} Collection object.
 */

exports = module.exports = function() {
	return new Collection();
};

function Collection() {}

Collection.prototype = {
	url: null,
	title: null,
	accept: [],
	parse: function(node) {

		this.url = node.attr ('href');

		this.title = node.find('./atom:title', ns.prefixes)[0];
		if (this.title != null)
			this.title = this.title.text();

		var nl = node.find('./app:accept', ns.prefixes);
		for(var i = 0; i < nl.length; ++i)
		{
			var accept = {
				'content-type': nl[i].text()
			};
			var attrs = nl[i].attrs();
			for(var j = 0; j < attrs.length; ++j)
				accept[attrs[j].name()] = attrs[j].value();
			this.accept.push (accept);
		}
	}
};
