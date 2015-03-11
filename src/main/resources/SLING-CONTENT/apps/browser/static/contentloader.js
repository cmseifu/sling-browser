// A content loader class for infinite-scroll or on-demand loading
   function ContentLoader(opts, handlers) {
		// instance
		var _self = this;
		_self.opts = { // Default options
			"ajaxUrl" : ""+window.location.href, // Ajax url, default is window location
			"ajaxMethod" : "get", // default ajax action type, 
			"ajaxData" : null, // Ajax data, normally used by post method to post the data
			"offset" : 0, // Beginning off set
			"limit" : 10, // Limit per load
			"offsetName" : "offset",
			"limitName" : "limit",
			"isScroll" : !/Android|webOS|iPhone|iPod|BlackBerry/i.test(navigator.userAgent), // Default (true, false on mobile), Set to false will need to manually invoke load()
			"loadOnElement" : null, // Element to act on, default element appended to end of body
			"container" : null, // The parent container for this content loader. loadOnElement must be declared inside of this container.
			"data" : null, // If data not provided, will call using the ajaxUrl
			"dataType" : "json", // Ajax return data type, default is json
			"fillType" : "none", // Options: none (don't do anything), auto (fill till scroll bar), once (load once), or precache (cache in memory)
			"adjustment" :  0, // Default 0, how many pixel of adjustment prior trigger the load
			"maxCacheSize" : 2, // How many request should be preloaded
			"maxScrollLimit" : -1, // Default -1 (a.k.a infinite), if isScroll is true and max request limited is reached, stop the scroll event and let user manually load it.
			"loadOn" : ["compacted"] // Besides the scroll, other custom events can be registered on the loadOnElement.  Once fired, it will trigger a load. 
		}	  
		// User provided options
		if (opts != null) {
			// opts override
			jQuery.extend(_self.opts, opts);
		}
		
		// allow limit to be a callback
		_self.limit  = typeof(opts.limit)	==	"function" ? opts.limit : function() {return opts.limit};
		
		_self.loaded=false; // User controlled flag by resultHandler or cacheHandler to stop loading when no more content available.
		_self.loading=false; // Boolean flag lock to avoid multiple scroll events fired.
		
		_self.dataCache = []; // Internal cache of next requests.
		// Flag to disable more ajax calls if failed
		_self.requestFailed = false;
		
		_self.scrollLimit = 0; // Counter to determine if maxScrollLimit is reached.  
		

		// Self contained scroll, if not specified, it will be end of page scroll.
		if (_self.opts.container != null &&  $(_self.opts.container).length > 0) {
			_self.container = $(_self.opts.container);
		}
  
		// convert to jquery object;
		if (_self.opts.loadOnElement != null &&  $(_self.opts.loadOnElement).length > 0) {
			_self.loadOnElement = $(_self.opts.loadOnElement);
		}
		
		
		// create the mark by default, if container is provided, loadOnElement must be declare for each container
		if (!_self.loadOnElement && !_self.container) {
			if ($('#ContentLoaderMarker').length > 0) {
				_self.loadOnElement = $('#ContentLoaderMarker');
			} else {
				_self.loadOnElement = $('<div id="ContentLoaderMarker"></div>').appendTo($('body',document));
			}
		} else if (_self.container &&!_self.loadOnElement) {
			throw "Parent container is provided, loadOnElement must be declared inside of this container";
		}
		
		// Fill up the cache bucket based on cacheSize
		_self.preload = function () {
			if (_self.dataCache.length < _self.opts.maxCacheSize && !_self.requestFailed && !_self.loaded) {
				if (_self.opts.ajaxMethod == "get") {
					$.get(_self.nextHandler(), function (data) { 
						_self.dataCache.push(_self.cacheHandler(data));
						if (typeof data === 'string' && data.trim().length >0 || typeof data === 'object') {
							_self.preload();
						} else {
							// Empty data, don't continue cache
							_self.requestFailed = true;
						}
					},_self.opts.dataType).fail(function () {
						_self.requestFailed=true;
					});
				} else if (_self.opts.ajaxMethod == "post") {
					$.post(_self.nextHandler(), _self.opts.ajaxData, function (data) { 
						_self.dataCache.push(_self.cacheHandler(data));
						if (typeof data === 'string' && data.trim().length >0 || typeof data === 'object') {
							_self.preload();
						} else {
							// Empty data, don't continue cache
							_self.requestFailed = true;
						}
					},_self.opts.dataType).fail(function () {
						_self.requestFailed=true;
					});
					
				}
			} 
		}
		
		// Loading the content
		_self.load = function() {
			// check scrollLimit
			if (_self.opts.maxScrollLimit != -1) {
				if (_self.scrollLimit < _self.opts.maxScrollLimit)  {
					_self.scrollLimit++;
				} else if (!_self.scrollDetached) {
					_self.scrollDetached = true;
					_self.detachScroll();
				} 
			}
			// Flag check 
			if (!_self.loaded && !_self.loading) {
				// Mark the loading flag
				_self.loading = true;
				_self.loadOnElement.trigger('ContentLoaderLoading');
				// No data provide, will use ajax
				if (_self.opts.data == null) {
					// Use the cache
					if (_self.dataCache.length > 0) {
						_self.resultHandler(_self.dataCache.shift());
						_self.loading = false;
						_self.loadOnElement.trigger('ContentLoaderLoaded');
						// Begin caching
						_self.preload(); 
					} else  {
						// Make the first request
						if (_self.opts.ajaxMethod == "get") {
							$.get(_self.nextHandler(), function (data) { 
								_self.resultHandler(_self.cacheHandler(data));
								_self.loading = false;
								_self.loadOnElement.trigger('ContentLoaderLoaded');
								// Begin caching
								 _self.preload(); 
								},_self.opts.dataType).fail(function () {
								_self.requestFailed=true;
							});
						} else if (_self.opts.ajaxMethod == "post") {
							$.post(_self.nextHandler(), _self.opts.ajaxData, function (data) { 
								_self.resultHandler(_self.cacheHandler(data));
								_self.loading = false;
								_self.loadOnElement.trigger('ContentLoaderLoaded');
								// Begin caching
								 _self.preload(); 
								},_self.opts.dataType).fail(function () {
								_self.requestFailed=true;
							});
						}
					}
				} else {
					// data provided, just handle the result
					 _self.resultHandler(_self.cacheHandler(_self.opts.data.slice(_self.opts.offset, _self.opts.offset + _self.limit())));
					 _self.loading=false;
					 _self.loadOnElement.trigger('ContentLoaderLoaded');
					 // Increase the offset
					 _self.opts.offset+=_self.limit();
					 
				}
			}else {
				_self.loadOnElement.trigger('ContentLoaderLoaded');
			}
		}
		
		// Auto fill method to trigger the scroll bar
		_self.autoFill = function () {
			if (!_self.loaded && _self.opts.isScroll ) {
				if (_self.isInView()) {
					 _self.load();
					 setTimeout(_self.autoFill,250);
				}
			}
		} 
		
		// DEFAULT cacheHandler is just pass through, but allows advance method action such as preload the DOM or load images before hand it to resultHandler.
		_self.cacheHandler = function (data) {
			return data;
		}
		// DEFAULT nextHandler, override by user provided nextHandler
		_self.nextHandler = function () {
			var next = _self.opts.ajaxUrl+(_self.opts.ajaxUrl.indexOf("?") == -1 ? "?" : "&") + _self.opts.offsetName + "="+_self.opts.offset+"&" +_self.opts.limitName + "="+_self.limit();
			next = next.replace(/\?&/,'?');
			_self.opts.offset+=_self.limit();
			// console.log("Requesting: "+next);
			return next;
		}
		
		// check if element is view
		_self.isInView = function () {
			var container = _self.container ? _self.container : $(window);
			var containerTop = container.scrollTop();
			var top = _self.loadOnElement.offset().top;
			if (top + _self.loadOnElement.height() >= containerTop &&
				top + _self.opts.adjustment <= containerTop + container.height()) {
				 return true;
			}
			return false;
		}
		
		// DEFAULT scrollHandler, override with caution as it use the inview method to compute the element position
		_self.scrollHandler = function() {
			if (_self.loading || _self.loaded) return;
			if (_self.isInView()) {
				_self.load();
			}
		};
		
		
		// DEFAULT click handler for the loadOnElement, override by user provided clickHandler
		_self.clickHandler = function (e) {
			e.preventDefault();
			e.stopPropagation();
			_self.load();
		}
		
		_self.detachScroll = function() {
			if (_self.container) {
				_self.container.unbind("scroll.ContentLoader");
			} else {
				 $(window).unbind("scroll.ContentLoader");
			}
		}
		
		// DEFAUT done impl clean up 
		_self.done = function () {
			_self.loaded = true;
			_self.loadOnElement.remove();
			_self.detachScroll();
			_self.container = null;
			_self.load = function () {};
			  
		}
		
		// No handlers provided throws exception
		if (handlers == null || typeof handlers.resultHandler != 'function') {
			throw "At least a resultHandler is required to process the results";
		} // User provide handlers takes priority
		else {
			 jQuery.extend(_self, handlers);
		}
		
		// Load on element when a specific event is triggered
		_self.onEventLoadHandler = function () {
			if (_self.isInView()) {
				_self.load();
			}
		}
		
		// Auto bind the click event, user can override by providing custom handler
		_self.loadOnElement.bind('click', _self.clickHandler);
		
		if (typeof _self.opts.loadOn === 'string') {
			_self.loadOnElement.on(_self.opts.loadOn, _self.onEventLoadHandler)
		} else if (typeof _self.opts.loadOn === 'object' && _self.opts.loadOn instanceof Array) {
			for (var i=0,j=_self.opts.loadOn.length;i<j;i++) {
				_self.loadOnElement.on(_self.opts.loadOn[i], _self.onEventLoadHandler);
			}
		}
		
		
		
		// Initialization
		if (_self.opts.isScroll) {
			// Clean scroll event
			_self.detachScroll();
			if (!_self.container) {
				// Attach the new event
				$(window).bind("scroll.ContentLoader", _self.scrollHandler);
			} else {
				// Attach the new event
				_self.container.bind("scroll.ContentLoader", _self.scrollHandler);
			}
		}
		switch (_self.opts.fillType) {
			case 'auto' : _self.autoFill();
							break;
			case 'once' : if (_self.isInView()) { _self.load(); } else { _self.preload() };
							break;
			case 'precache' : _self.preload();
							break;
		}
	}
   
