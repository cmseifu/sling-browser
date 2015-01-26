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
                    	e.preventDefault();
                    	e.stopPropagation();
                        $(this).hide();
                        var $invokedOn = $(this).data("invokedOn");
                        var $selectedMenu = $(e.target);
                        settings.menuSelected.call(this, $invokedOn, $selectedMenu);
                });
                return false;
            });

            //make sure menu closes on any click
            $(document).on('click', function () {
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

// If in a frame, hide parent contextMenu
$(document).on('click', function(e) {
	if (window.parent && window.parent != window.self && window.parent.document) {
		$(window.parent.document).find('#contextMenu').hide();
	}
});

// Check for safari 
function isSafari() {
	return /^((?!chrome).)*safari/i.test(navigator.userAgent);
}

// Escape % as %25 on browser
function escapePercent(str) {
	if (str && str.indexOf('%')!=-1 && str.indexOf('%25')==-1 ) {
		str = str.replace(/%/g,'%25');
	}
	return str;
}

// Field validation
function isValidField(field) {
	if (typeof field.willValidate !== "undefined") {
		field.checkValidity();
		return field.validity.valid;
	}
	// Legacy browser, will let server handle the validation so returning true
	return true;
}

// Check if form is valid before submit
function isFormValid($form) {
	var isValid = true;
	var invaldField = null;
	var fields = $form.find('[required]');
	// Clear all errors
	fields.removeClass('alert alert-danger');
	if (fields.length) {
		fields.each(function() {
			if (!isValidField(this)) {
				isValid = false;
				invalidField = this;
				return false;
			}
		})
	}
	var $errorMsg = $form.find('.errorMsg');
	if ($errorMsg.length) {
		$errorMsg.empty().hide();
	}
	if (!isValid) {
		//HTML5 form validation
		//Safari do not support error message so we just shake it 
		if (isSafari()) {
			$(invalidField).addClass('alert alert-danger').shake(5,5,800);
			$(invalidField).one('focus', function() { $(this).removeClass('alert alert-danger')});
			if ($errorMsg.length) {
				$errorMsg.text("Entry is invalid!").show();
			}
		}
		else {
			$form.find('input[type=submit]').trigger('click');
		}
		return false;
	}
	return true;
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

/* session */
(function() {
	if (window.top == window.self) {
		setInterval(function () {
			$.get('/system/sling/info.sessionInfo.json', function(data) {
				if (slingUserId != data.userID) {
					window.location.reload(true);
				}
			})
		},1000*60*5);
	}
})()

/* pre-run fix up vars and form paths */
resourcePath = escapePercent(resourcePath);
$('form').each(function () { 
	var _self = $(this);
	_self.attr('action', escapePercent(_self.attr('action')));
});