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