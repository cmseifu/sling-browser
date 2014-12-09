// jQuery extend
(function ($, window) {
	// Context menu from http://jsfiddle.net/KyleMit/X9tgY/
    $.fn.contextMenu = function (settings) {
        return this.each(function () {
            // Open context menu
            $(this).on("contextmenu", function (e) {
                //open menu
                $(settings.menuSelector)
                    .data("invokedOn", $(e.target))
                    .show()
                    .css({
                        position: "absolute",
                        left: getLeftLocation(e),
                        top: getTopLocation(e)
                    })
                    .off('click')
                    .on('click', function (e) {
                        $(this).hide();
                        var $invokedOn = $(this).data("invokedOn");
                        var $selectedMenu = $(e.target);
                        settings.menuSelected.call(this, $invokedOn, $selectedMenu);
                });
                return false;
            });

            //make sure menu closes on any click
            $(document).click(function () {
                $(settings.menuSelector).hide();
            });
        });

        function getLeftLocation(e) {
            var mouseWidth = e.pageX;
            var pageWidth = $(window).width();
            var menuWidth = $(settings.menuSelector).width();
            // opening menu would pass the side of the page
            if (mouseWidth + menuWidth > pageWidth &&
                menuWidth < mouseWidth) {
                return mouseWidth - menuWidth;
            } 
            return mouseWidth;
        }        
        
        function getTopLocation(e) {
            var mouseHeight = e.pageY;
            var pageHeight = $(window).height();
            var menuHeight = $(settings.menuSelector).height();
            // opening menu would pass the bottom of the page
            if (mouseHeight + menuHeight > pageHeight &&
                menuHeight < mouseHeight) {
                return mouseHeight - menuHeight;
            } 
            return mouseHeight;
        }

    };
    
    /* Shake from http://jsfiddle.net/Webveloper/HjFUK/ */
    $.fn.shake = function(intShakes, intDistance, intDuration) {
        this.each(function() {
            $(this).css("position","relative"); 
            for (var x=1; x<=intShakes; x++) {
            $(this).animate({left:(intDistance*-1)}, (((intDuration/intShakes)/3)))
        .animate({left:intDistance}, ((intDuration/intShakes)/2))
        .animate({left:0}, (((intDuration/intShakes)/3)));
        }
      });
        return this;
    };
})(jQuery, window);
/* End extend */

// Check for safari 
function isSafari() {
	return /^((?!chrome).)*safari/i.test(navigator.userAgent);
}


/* Local Storage methods, persist to host */
   /* Use check if localStorage is supported */
	function hasLocalStorage() {
		return (typeof localStorage !== "undefined" && localStorage != null);
	}
   
	/* Retrieve the string from storage */
   function getLocalStorage(key) {
	   return hasLocalStorage() ? localStorage.getItem(key) : null;
   }
   
   /* Retrive the JSON object from storage */
	function getJsonLocalStorage(key) {
		try {
			return JSON.parse(getLocalStorage(key));
		} catch (e) {
			console.log(key+" does not seem to have JSON format, try use getLocalStorage instead ("+e+")");
		}
	}
	
	/* Set to storage, if object it will be stringified */
	function setLocalStorage(key, value) {
		if (hasLocalStorage()) {
			localStorage.setItem(key, typeof value == 'string' ? value : JSON.stringify(value));
		}
	}
	/* Remove the key from storage */
	function clearLocalStorage(key) {
		if (hasLocalStorage()) {
			localStorage.removeItem(key);
		}
	}
	
	/* Session Storage methods, persist only through out the life of the browser tab */
   /* Use check if sessionStorage is supported */
	function hasSessionStorage() {
		return (typeof sessionStorage !== "undefined" && sessionStorage != null);
	}
   
	/* Retrieve the string from storage */
   function getSessionStorage(key) {
	   return hasSessionStorage() ? sessionStorage.getItem(key) : null;
   }
   
   /* Retrive the JSON object from storage */
	function getJsonSessionStorage(key) {
		try {
			return JSON.parse(getSessionStorage(key));
		} catch (e) {
			console.log(key+" does not seem to have JSON format, try use getSessionStorage instead ("+e+")");
		}
		
	}
	
	/* Set to storage, if object it will be stringified */
	function setSessionStorage(key, value) {
		if (hasSessionStorage()) {
			sessionStorage.setItem(key, typeof value === 'string' ? value : JSON.stringify(value));
		}
	}
	/* Remove the key from storage */
	function clearSessionStorage(key) {
		if (hasSessionStorage()) {
			sessionStorage.removeItem(key);
		}
	}