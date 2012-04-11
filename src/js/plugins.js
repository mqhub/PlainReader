/* plugins.js
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.md for details) */

/*global log */
// usage: log('inside coolFunc', this, arguments);
// paulirish.com/2009/log-a-lightweight-wrapper-for-consolelog/
window.log = function(){
  log.history = log.history || [];   // store logs to an array for reference
  log.history.push(arguments);
  if(this.console) {
    arguments.callee = arguments.callee.caller;
    var newarr = [].slice.call(arguments);
    (typeof console.log === 'object' ? log.apply.call(console.log, console, newarr) : console.log.apply(console, newarr));
  }
};

// make it safe to use console.log always
(function(b){function c(){}for(var d="assert,count,debug,dir,dirxml,error,exception,group,groupCollapsed,groupEnd,info,log,timeStamp,profile,profileEnd,time,timeEnd,trace,warn".split(","),a;a=d.pop();){b[a]=b[a]||c;}})(function(){try
{console.log();return window.console;}catch(err){return {};}}());


// place any jQuery/helper plugins in here, instead of separate, slower script files.
/* plugins.css
part of PlainReader by Luke Hagan
created: 2011-11-05
released under the MIT license (see LICENSE.md for details) */

// https://github.com/madrobby/zepto/issues/247
// with modifications (.each didn't work for some reason)
$.fn.clone=function() {
    return this[0].cloneNode(true);
};

// strip HTML tags
// http://stackoverflow.com/questions/822452/strip-html-from-text-javascript
function stripTags(html) {
   var tmp = document.createElement("DIV");
   tmp.innerHTML = html;
   return tmp.textContent||tmp.innerText;
}

// TODO: may be other useful extensions here
// https://gist.github.com/1379704/f5898782fb366b157c66239e09a96aa52bc9258a
/*
  $.fn.scrollTop = function(scrollTop) {
    this.each(function() {
      this.scrollTop = scrollTop;
    });
    return this;
  };
  */

// page scrolling
// based on: https://github.com/madrobby/zepto/issues/401#issuecomment-4156269
// with modifications to scroll div element instead of window
smoothScroll = function(element, deltaY, duration) {
	var targetElement = document.getElementById(element);
	var startY = targetElement.scrollTop;
    var endY = startY + deltaY;

    var startT  = +(new Date());
    var finishT = startT + duration

    var interpolate = function (source, target, shift) { 
        return (source + (target - source) * shift); 
    };

    var easing = function (pos) { 
        return (-Math.cos(pos * Math.PI) / 2) + .5; 
    };

    var animate = function() {
        var now = +(new Date());
        var shift = (now > finishT) ? 1 : (now - startT) / duration;
		
		targetElement.scrollTop = Math.floor(interpolate(startY, endY, easing(shift)));
        (now > finishT) || setTimeout(animate, 15);
    };

    animate();
};

// check array for object with property that matches provided value
Array.prototype.containsObjectWithPropertyValue = function (property, value) {
	var i, l = this.length;
	for (i = 0; i < l; i += 1) {
		if (this[i].hasOwnProperty(property) && this[i][property] === value) {
			return true;
		}
	}
	return false;
};

// work-around for bug in Mobile Safari that results in zoom-in when rotating
// from portrait to landscape
// http://adactio.com/journal/4470/
if ($.os.ios) {
  var viewportmeta = document.querySelector('meta[name="viewport"]');
  if (viewportmeta) {
    viewportmeta.content = 'width=device-width, minimum-scale=1.0, maximum-scale=1.0';
    document.body.addEventListener('gesturestart', function() {
      viewportmeta.content = 'width=device-width, minimum-scale=0.25, maximum-scale=1.6';
    }, false);
  }
};