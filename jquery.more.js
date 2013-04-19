/* http://keith-wood.name/more.html
   Text truncation and show more for jQuery v1.1.0.
   Written by Keith Wood (kwood{at}iinet.com.au) May 2010.
   Available under the MIT (https://github.com/jquery/jquery/blob/master/MIT-LICENSE.txt) license. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

/* More manager. */
function More() {
	this._defaults = {
		length: 100, // Truncation length
		leeway: 5, // Overrun allowed without truncation
		wordBreak: false, // True to break between words, false to break anywhere
		toggle: true, // True to toggle, false to display and exit
		ellipsisText: '...', // Display text for ellipsis
		moreText: 'Show more', // Display text for more link
		lessText: 'Show less', // Display text for less link
		onChange: null // Callback function when expanded/collapsed
	};
}

$.extend(More.prototype, {
	/* Class name added to elements to indicate already configured with more. */
	markerClassName: 'hasMore',
	/* Name of the data property for instance settings. */
	propertyName: 'more',

	_ellipsisClass: 'more-ellipsis', // The ellipsis marker class
	_linkClass: 'more-link', // The link marker class
	_showingClass: 'more-showing', // The text showing marker class
	_hiddenClass: 'more-hidden', // The text hidden marker class

	/* Override the default settings for all more instances.
	   @param  options  (object) the new settings to use as defaults
	   @return  (More) this object */
	setDefaults: function(options) {
		$.extend(this._defaults, options || {});
		return this;
	},

	/* Attach the more functionality to a paragraph.
	   @param  target   (element) the element to affect
	   @param  options  (object) the custom options for this instance */
	_attachPlugin: function(target, options) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		var inst = {options: $.extend({}, this._defaults)};
		target.addClass(this.markerClassName).data(this.propertyName, inst);
		this._optionPlugin(target, options);
	},

	/* Retrieve or reconfigure the settings for a control.
	   @param  target   (element) the control to affect
	   @param  options  (object) the new options for this instance or
	                    (string) an individual property name
	   @param  value    (any) the individual property value (omit if options
	                    is an object or to retrieve the value of a setting)
	   @return  (any) if retrieving a value */
	_optionPlugin: function(target, options, value) {
		target = $(target);
		var inst = target.data(this.propertyName);
		if (!options || (typeof options == 'string' && value == null)) { // Get option
			var name = options;
			options = (inst || {}).options;
			return (options && name ? options[name] : options);
		}

		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		options = options || {};
		if (typeof options == 'string') {
			var name = options;
			options = {};
			options[name] = value;
		}
		$.extend(inst.options, options);
		target.find('span.' + this._ellipsisClass + ',a.' + this._linkClass).remove().end().
			text(target.text());
		var text = target.text();
		if (text.length > inst.options.length + inst.options.leeway) {
			var pos = inst.options.length;
			if (inst.options.wordBreak) {
				var matches = text.substring(0, inst.options.length + 1).
					replace('\n', ' ').match(/^.*\W/m);
				pos = (matches ? matches[0].length - 1 : pos);
			}
			var html = '<span class="' + this._showingClass + '">' + text.substring(0, pos) +
				'</span><span class="' + this._ellipsisClass + '">' + inst.options.ellipsisText + '</span>' +
				'<span class="' + this._hiddenClass + '">' + text.substring(pos) + '</span>' +
				'<a href="#" class="' + this._linkClass + '">' + inst.options.moreText + '</a>';
			target.empty().append(html).find('a').click(function(event) {
				var link = $(this);
				var expanding = link.html() == inst.options.moreText;
				link.html(expanding ? inst.options.lessText : inst.options.moreText).
					siblings('span.' + plugin._ellipsisClass + ',span.' + plugin._hiddenClass).toggle();
				if (!inst.options.toggle) {
					link.remove();
				}
				if ($.isFunction(inst.options.onChange)) {
					inst.options.onChange.apply(target, [expanding]);
				}
				event.stopPropagation();
				return false;
			});
		}
	},

	/* Remove the plugin functionality from a control.
	   @param  target  (element) the element to affect */
	_destroyPlugin: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).removeData(this.propertyName).
			find('span.' + this._ellipsisClass + ',a.' + this._linkClass).remove().end().
			text(target.text());
	}
});

// The list of commands that return values and don't permit chaining
var getters = [''];

/* Determine whether a command is a getter and doesn't permit chaining.
   @param  command    (string, optional) the command to run
   @param  otherArgs  ([], optional) any other arguments for the command
   @return  true if the command is a getter, false if not */
function isNotChained(command, otherArgs) {
	if (command == 'option' && (otherArgs.length == 0 ||
			(otherArgs.length == 1 && typeof otherArgs[0] == 'string'))) {
		return true;
	}
	return $.inArray(command, getters) > -1;
}

/* Attach the more functionality to a jQuery selection.
   @param  options  (object) the new settings to use for these instances (optional) or
                    (string) the command to run (optional)
   @return  (jQuery) for chaining further calls or
            (any) getter value */
$.fn.more = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if (isNotChained(options, otherArgs)) {
		return plugin['_' + options + 'Plugin'].apply(plugin, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			if (!plugin['_' + options + 'Plugin']) {
				throw 'Unknown command: ' + options;
			}
			plugin['_' + options + 'Plugin'].apply(plugin, [this].concat(otherArgs));
		}
		else {
			plugin._attachPlugin(this, options || {});
		}
	});
};

/* Initialise the more functionality. */
var plugin = $.more = new More(); // Singleton instance

})(jQuery);
