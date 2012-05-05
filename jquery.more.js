/* http://keith-wood.name/more.html
   Text truncation and show more for jQuery v1.0.0.
   Written by Keith Wood (kwood{at}iinet.com.au) May 2010.
   Dual licensed under the GPL (http://dev.jquery.com/browser/trunk/jquery/GPL-LICENSE.txt) and 
   MIT (http://dev.jquery.com/browser/trunk/jquery/MIT-LICENSE.txt) licenses. 
   Please attribute the author if you use it. */

(function($) { // Hide scope, no $ conflict

var PROP_NAME = 'more';

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

	/* Override the default settings for all more instances.
	   @param  settings  (object) the new settings to use as defaults
	   @return  (More) this object */
	setDefaults: function(settings) {
		$.extend(this._defaults, settings || {});
		return this;
	},

	/* Attach the more functionality to a paragraph.
	   @param  target    (element) the element to affect
	   @param  settings  (object) the custom options for this instance */
	_attachMore: function(target, settings) {
		target = $(target);
		if (target.hasClass(this.markerClassName)) {
			return;
		}
		target.addClass(this.markerClassName);
		var inst = {settings: $.extend({}, this._defaults)};
		$.data(target[0], PROP_NAME, inst);
		this._changeMore(target, settings);
	},

	/* Reconfigure the settings for a more element.
	   @param  target    (element) the element to affect
	   @param  settings  (object) the new options for this instance or
	                     (string) an individual property name
	   @param  value     (any) the individual property value (omit if settings is an object) */
	_changeMore: function(target, settings, value) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		settings = settings || {};
		if (typeof settings == 'string') {
			var name = settings;
			settings = {};
			settings[name] = value;
		}
		var inst = $.data(target[0], PROP_NAME);
		$.extend(inst.settings, settings);
		target.find('span.more-ellipsis,a.more-link').remove().end().
			text(target.text());
		var text = target.text();
		if (text.length > inst.settings.length + inst.settings.leeway) {
			var pos = inst.settings.length;
			if (inst.settings.wordBreak) {
				var matches = text.substring(0, inst.settings.length + 1).
					replace('\n', ' ').match(/^.*\W/m);
				pos = (matches ? matches[0].length - 1 : pos);
			}
			var html = '<span class="more-showing">' + text.substring(0, pos) +
				'</span><span class="more-ellipsis">' + inst.settings.ellipsisText + '</span>' +
				'<span class="more-hidden">' + text.substring(pos) + '</span>' +
				'<a href="#" class="more-link">' + inst.settings.moreText + '</a>';
			target.empty().append(html).find('a').click(function(event) {
				var link = $(this);
				var expanding = link.html() == inst.settings.moreText;
				link.html(expanding ? inst.settings.lessText : inst.settings.moreText).
					siblings('span.more-ellipsis,span.more-hidden').toggle();
				if (!inst.settings.toggle) {
					link.remove();
				}
				if (inst.settings.onChange) {
					inst.settings.onChange.apply(target, [expanding]);
				}
				event.stopPropagation();
				return false;
			});
		}
	},

	/* Remove the more functionality from an element.
	   @param  target  (element) the element to affect */
	_destroyMore: function(target) {
		target = $(target);
		if (!target.hasClass(this.markerClassName)) {
			return;
		}
		target.removeClass(this.markerClassName).
			find('span.more-ellipsis,a.more-link').remove().end().
			text(target.text());
		$.removeData(target[0], PROP_NAME);
	},

	/* Retrieve the current instance settings.
	   @param  target  (element) the element to check
	   @return  (object) the current instance settings */
	_settingsMore: function(target) {
		var inst = $.data(target, PROP_NAME);
		return inst.settings;
	}
});

// The list of commands that return values and don't permit chaining
var getters = ['settings'];

/* Attach the more functionality to a jQuery selection.
   @param  command  (string) the command to run (optional, default 'attach')
   @param  options  (object) the new settings to use for these instances (optional)
   @return  (jQuery) for chaining further calls */
$.fn.more = function(options) {
	var otherArgs = Array.prototype.slice.call(arguments, 1);
	if ($.inArray(options, getters) > -1) {
		return $.more['_' + options + 'More'].
			apply($.more, [this[0]].concat(otherArgs));
	}
	return this.each(function() {
		if (typeof options == 'string') {
			$.more['_' + options + 'More'].
				apply($.more, [this].concat(otherArgs));
		}
		else {
			$.more._attachMore(this, options || {});
		}
	});
};

/* Initialise the more functionality. */
$.more = new More(); // singleton instance

})(jQuery);
