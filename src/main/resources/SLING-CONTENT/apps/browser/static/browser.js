var STORAGE_KEY = slingUserId+'-browser';

$(document).ready(function() {
		// User profile on browser localStorage
	var storage = getJsonLocalStorage(STORAGE_KEY);
	if (!storage) {
		storage = {tabs:{}};
	} 
	var IMAGE_TYPES = ['image/gif','image/jpeg','image/pjpeg','image/png','image/svg+xml', 'image/tiff'];
	$('#logout').on('click', function(e){
		e.preventDefault();
		$.post($(this).attr('href'),{ "noCache": "noCache" }).always(function() {
			window.location.reload(true);
		})
	});
	// Global var references
	var browseTree = $('#browseTree');
	var resultPanel = $('#resultPanel');
	var tabSearch = $('#tabSearch')
	var pageTab = $('#pageTab');
	var pageTabContent = $('#pageTabContent');
	// clones for adding new tab
	var tabTmpl = $('#tabTmpl').clone().removeAttr('id');
	var tabContentTmpl = $('#tabContentTmpl').clone().removeAttr('id');
	
	/* click on the icon toggles full screen */
	$('#full-screen, #small-screen').on('click', function(e) {
		$('body').toggleClass('full-screen');
	})
	
	var suffixProccessed = true;
	if (suffix != null) {
		currentPath = suffix;
		suffixProccessed = false;
	}  else {
		currentPath = ROOT_PATH;
	}
	
	// Open file in a tab
	var fileOpenHandler = function (e) {
		e.preventDefault();
		e.stopPropagation();
		addTab($(this).data('simpleNode'));
	}
	
	// Tree configuration
	browseTree.tree({
		autoEscape : false,
		slide: true,
		//openFolderDelay: 50,
		useContextMenu: false,
		autoOpen : 1, // true|false, or 0-n depth
		selectable : true,
		//dragAndDrop: true,
		onCreateLi: function(node, $li) {
			/* default look */
			var icon = 'cog';
			var styleClass = 'unstructured';
			var canOpen = false;
			switch (node.nodeType) {
				case 'nt:folder' : 
					icon = 'folder-close';styleClass='folder';
					break;
				case 'nt:file' : 
					if (node.supportedFileType) {
						icon="pencil";
						node.openType = 'editor';
						canOpen=true;
					} 
					else if (IMAGE_TYPES.indexOf(node.mimeType)!=-1) {
						icon="camera";
						node.openType = 'image'
						canOpen=true;
					} else {
						icon="file";
					}
					styleClass='file';
					break;
			}
			$li.addClass(styleClass).find('.jqtree-title').prepend('<span class="glyphicon glyphicon-'+icon+'"></span>');
			if (canOpen) {
				$li.on('dblclick', fileOpenHandler);
			}
			node.path = escapePercent(node.path);
			
			/* This copied the properties for serialization when tabs are open or restore */
			var simpleNode = {
				name : node.name,
				path : node.path,
				canOpen : node.canOpen,
				nodeType : node.nodeType,
				openType : node.openType,
				extension : node.extension,
				uuid: node.uuid,
				supportedFileType : node.supportedFileType
			}
			$li.data('node', node);
			$li.attr('data-name', node.name);
			$li.data('simpleNode', simpleNode);
	    },
		dataUrl : function (node) { 
			if (!node) {
				return REQUEST_PATH+".json"+ROOT_PATH;
			} else {
				return REQUEST_PATH+".children.json"+node.path;
			}
		},
		onLoadFailed: function() {
			
		}
	});
	
	// Bind click event 
	browseTree.bind('tree.click', function(event) { 
		updateCurrent(event.node,true); 
	});
	
	
	// Tree initialization
	browseTree.bind('tree.init', function() { 
			restoreState(buildPaths());
		}
	);
	
	
	// Obtain the parent paths of non-loaded nodes
	function buildPaths() {
		var paths = splitPath(currentPath);
		var l = paths.length-1;
		var node = browseTree.tree('getNodeById', paths[l]);
		while (node == null && l > -1) {
			 node = browseTree.tree('getNodeById', paths[--l]);
		} 
		if (node != null && node.path != null) {
			return	paths.slice(paths.indexOf(node.path));
		} else {
			return paths;
		}
	}
	
	// Split path
	function splitPath(path) {
		var paths = path.split('/');
		var tmpout = [];
		var newPath = [];
		for (var i=0;i<paths.length;i++) {
			newPath.push(paths[i]);
			tmpout.push(i==0 ? ROOT_PATH : newPath.join('/'));
		}
		return tmpout;
	}
	
	
	// Expand the tree based on paths
	function restoreState(paths) {
		if (paths.length > 0) {
			if (paths.length == 1) {
				selectNodeByPath(paths[0], false);
			} else {
				$.getJSON(REQUEST_PATH+".json"+paths[0], function (data) {
					var newPaths = paths.slice(1);
					var node = browseTree.tree('getNodeById', paths[0]);
	        		browseTree.tree('loadData', data[0].children, node);
	        		browseTree.tree('openNode', node);
	        		restoreState(newPaths);
		        }).fail(function () {
		        	selectNodeByPath(paths[0], false);
		        })
			}
		} else {
			selectNodeByPath(currentPath, false);
		}
	}
	

	// Select a node by path
	function selectNodeByPath(path, storeState) {
		var node = browseTree.tree('getNodeById', path);
		if (!node) {
			var paths = splitPath(path);
			var l = paths.length-1;
			var node = browseTree.tree('getNodeById', paths[l]);
			while (node == null && l > -1) {
				 node = browseTree.tree('getNodeById', paths[--l]);
			} 
		}
		if (node != null) {
			browseTree.tree('selectNode', node);
			updateCurrent(node, storeState);
		}
		$('body').trigger('browser:restoreReady');
	}

	// Update the breadcrumb
	function updateNav(path) {
		var prefix = "/";
		var paths = path.substring(prefix.length).split('/');
		var tmpout = [];
		var newPath = [];
		
		tmpout.push('<li><a href="/">jcr:root</a> <span class="divider"></span></li>');
		for (var i=0;i<paths.length-1;i++) {
			newPath.push(paths[i]);
			tmpout.push('<li><a href="'+prefix+newPath.join('/')+'">'+paths[i]+'</a> <span class="divider"></span></li>');
		} 
		tmpout.push('<li class="active"><a href="'+path+'">'+paths[paths.length-1]+'</a> </li>');
		var ele = $(tmpout.join("")).appendTo($('#currentPath').empty());
		 
		$('a',ele).each( 
				function () { 
					$(this).click(function (e) {
						e.preventDefault();
						e.stopPropagation();
						currentPath = $(this).attr("href");
						var node = browseTree.tree('getNodeById', currentPath);
						updateCurrent(node,true); 
						browseTree.tree('selectNode', node);
						//restoreState(paths);
					});
				}
		);  
	}
	
	// Display empty content when no records
	function checkEmptyContent() {
		if (!resultPanel.find('div').length) {
			resultPanel.append("<h3>No Content</h3>")
		}
	}
	
	

	// When a tree is clicked 
	var tabProperties = pageTab.find('a[href=#tabProperties]');
	var propertiesFrame = $('#propertiesFrame');
	function updateCurrent(node,storeState) {
		tabProperties.tab('show');
		// Need to do this instead of change the src attr as it will add the frame to the history */
		if (!propertiesFrame[0].contentDocument.location.href.match(node.path+"$")) {
			propertiesFrame[0].contentDocument.location.replace('/browser.edit.html'+node.path+'?editType=properties');
		}
		currentNode = node;
		updateNav(node.path);
		if (storeState) {
			pushState(node);
		}
		//browseTree.tree('openNode', node);
		
	}
	
	// Push the browser history
	function pushState(node) {
		history.pushState(node.path, node.path, "/browser.html"+node.path);
	}

	// Adding a new tab when opening a file
	function addTab(node, selected) {
		var tab = pageTab.find('a[href=#'+node.uuid+']').parent();
		if (!tab.length) {
			if (node.supportedFileType == 'js') {
				node.supportedFileType = 'javascript';
			} else if (node.supportedFileType == 'txt') {
				node.supportedFileType = 'text';
			}
			tab = tabTmpl.clone();
			tab.find('a').attr('href', '#'+node.uuid).data('path',node.path).attr('title',node.path).text(node.name);
			tab.find('span').on('click',removeTabHandler);
			tab.find('a').on('shown.bs.tab', function (e) {
				  var _self = $(this);
				  var tabContent = $(_self.attr('href'));
				  if (!tabContent.data('loaded')) {
					  tabContent.data('loaded',true);
					  if (node.openType == 'image') {
						 tabContent.html('<img src="'+node.path+'"/>');
					  } else {
						 tabContent.html('<iframe style="border:0px;width:100%;height:100%" src="/browser.edit.html'+node.path+'?editType=file&supportedFileType='+node.supportedFileType+'"></iframe>');
					  }
				  }
			});
			pageTab.append(tab);
			
			var tabContent = tabContentTmpl.clone();
			tabContent.attr('id',node.uuid);
			pageTabContent.append(tabContent);
			storage.tabs[node.uuid] = node;
			setLocalStorage(STORAGE_KEY, storage);
		}
		// If selected is not specified or selected = true
		if (!arguments[1] || selected) {
			tab.find('a').trigger('click');
		}
	}
	
	// Remove tab
	var removeTabHandler = function(e) {
		var _self = $(this);
		var tabId = _self.prev().attr('href');
		if (tabId) {
			_self.parent().remove();
			$(tabId).remove();
			pageTab.find('li:last a').tab('show');
			delete storage.tabs[tabId.substring(1)];
			setLocalStorage(STORAGE_KEY, storage);
		}
	}
	
	
	
	// On browser navigation button pushed.
	window.onpopstate = function(event) {
		if (event.state != null) {
			currentPath  = event.state;
			restoreState(buildPaths());
		}
	};
	
	// Before the browser window close or refresh, store the last active tab index
	window.onbeforeunload = function(e) {
		var activeTabIndex = $('#pageTab li.active').index();
		storage.activeTabIndex = activeTabIndex;
		setLocalStorage(STORAGE_KEY,storage);
	};
	
	$('body').on('browser:restoreReady', function () {
			// When all paths are restored, this event will be fired so we restore user profile information.  This should be done only once.
			if (!$(this).data('init')) {
				// only one time
				$(this).data('init',true);
				if (storage && storage.tabs) {
					var tabs = storage.tabs;
					for (var tab in tabs) {
						if (tabs.hasOwnProperty(tab)) {
							addTab(tabs[tab],false);
						}
					}
					// Select the last active Tab
					if (storage.activeTabIndex != -1) {
						$('#pageTab li').eq(storage.activeTabIndex).find('a').trigger('click');
					}
				}	
			}
			// From search
			var node = browseTree.tree('getNodeById', currentPath);
			if (node) {
				var scrollHeight = $('.col-a')[0].scrollHeight;
				setTimeout(function() { $('.col-a').scrollTop(scrollHeight - node.element.scrollHeight) }, 500);
			}
			
		}
	);
	
	// Disable submit on new-form as it's done by AJAX
	$('#new-form').on('submit', function() { return false; });
	$('#newModal #createBtn').on('click', function(e) {
		var _self = $(this);
		
		var $form = $(this).closest('form');
		if (!isFormValid($form)) {
			return;
		}
		var treeLi = $('#newModal').data('treeLi');
		var node = treeLi.data('simpleNode') ;
		var nodeTypeSelect = $form.find('#nodeTypeSelect');
		var newPath = node.path+'/'+$form.find('#newNodeName').val();
		var selectedIndex = nodeTypeSelect[0].selectedIndex;
		var isFile = nodeTypeSelect.find('option').eq(selectedIndex).data('file');
		
		var data = {};
		data["jcr:primaryType"] = nodeTypeSelect.val();
		if (isFile) {
			data["jcr:content"] = {
			     "jcr:primaryType": "nt:resource",
			     "jcr:data" : "",
			     "jcr:mimeType" : "application/octet-stream"
			}
		}
		// lock submiting
		if (_self.data('submitting')) {
			return;
		}
		_self.data('submitting',true);
		$.post(node.path+"?:name="+$form.find('#newNodeName').val()+"&:operation=import&:contentType=json&:content="+encodeURIComponent(JSON.stringify(data)))
		.done(function(data) {
			_self.removeData('submitting');
			var dataHtml = $(data);
			var status = dataHtml.find('#Status').text();
			var message = dataHtml.find('#Message').text();
			if ((status == '200' && message == 'OK') || (status == '201' && message == 'Created')) {
				refreshNode(treeLi.data('node'),newPath);
			}
			$('#newModal').removeData('treeLi').modal('hide');
		}).fail(function(jqXHR, textStatus, errorThrown) {
			_self.removeData('submitting');
			var dataHtml = $(jqXHR.responseText);
			var status = dataHtml.find('#Status').text();
			var message = dataHtml.find('#Message').text();
			$form.find('.errorMsg').text(status+": Error saving <strong>"+node.path+"</strong> caused by "+message).show();
			
		});
		
	});
	
	// Refresh a node
	function refreshNode(node, selectPath) {
		if (!node) return;
		$.getJSON(REQUEST_PATH+".json"+node.path, { "noCache": "noCache" }, function (data) {
        	 browseTree.tree('updateNode',node,{label:data[0].label});
        	 if (data[0].children) {
        		 browseTree.tree('loadData', data[0].children, node);
        	 }
        	 if (!selectPath) {
	        	 browseTree.tree('selectNode', node);
	        	 updateCurrent(node);
        	 } else {
        		 selectNodeByPath(selectPath, true);
        	 }
        });
	}
	
	
	// Context menu actions
	browseTree.contextMenu({
	    menuSelector: "#contextMenu",
	    menuSelected: function (invokedOn, selectedMenu) {
	    	var menuLi = selectedMenu.closest('li');
	    	var action = menuLi.data('action');
	    	if (!action || menuLi.is('.disabled') ) return false;
	    	$('body').find('.errorMsg').empty().hide();
	    	var treeLi = invokedOn.closest('li');
	    	switch (action) {
	    		case 'add' : $('#newModal').data('treeLi', treeLi).modal('show'); 
	    			break;
	    		case 'refresh' : refreshNode(treeLi.data('node'));
    				break;
	    		case 'delete' : 
	    			$.post(treeLi.data('simpleNode').path+'?:operation=delete')
	    			.done(function(data) {
	    				var dataHtml = $(data);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				if ((status == '200' && message == 'OK')) {
	    					var node = treeLi.data('node');
	    					var prev = node.getPreviousSibling();
	    					var parent = node.parent;
	    					// remove the node
	    					browseTree.tree('removeNode', node);
	    					// select prev or parent
							refreshNode(prev ? prev : parent);
							// close the tab if file is opened
							var tab = pageTab.find('a[href=#'+node.uuid+']').parent();
							if (tab.length) {
								tab.find('span').trigger('click');
							}
	    				}
	    			}).fail(function(jqXHR, textStatus, errorThrown) {
	    				var dataHtml = $(jqXHR.responseText);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				
	    				$('#mainErrorMsg').text(status+": Error deleting <strong>"+resourcePath+"</strong> caused by "+message).show();
	    			});
	    			break;
	    		case 'copy' : 
	    			$('#contextMenu').data('clipboard', treeLi.data('node')).find('.clipboardOnly').removeClass('disabled');
	    			break;
	    		case 'paste' : 
	    			var clipboardNode = $('#contextMenu').data('clipboard');
	    			var childExist = treeLi.find('>ul>li[data-name=\''+clipboardNode.name+'\']').length;
	    			var newPath = [treeLi.data('node').path,'/'];
	    			if (childExist) {
	    				var names = [];
	    				treeLi.find('>ul>li[data-name^=\''+clipboardNode.name+'\']').each(function() {
	    					var nameToken = $(this).attr('data-name').substring(clipboardNode.name.length-1).split(' ');
	    					if (nameToken.length == 2) {
	    						var num = parseInt(nameToken[1]);
	    						names.push(isNaN(num) ? 1 : num)
	    					}
	    				});
	    				if (names.length && names.length > 1) {
	    					//descending
	    					names.sort(function(a, b){return b-a});
	    				} else {
	    					names.push(1);
	    				}
	    				newPath.push(clipboardNode.name + " " + (++names[0]));
	    			}
	    			
    				$.post(clipboardNode.path+'?:operation=copy&:replace=false&:dest='+newPath.join(''))
	    			.done(function(data) {
	    				var dataHtml = $(data);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				if (status.indexOf('20') == 0) { // Ok
	    					refreshNode(treeLi.data('node'), newPath.join('') );
	    				}
	    			}).fail(function(jqXHR, textStatus, errorThrown) {
	    				var dataHtml = $(jqXHR.responseText);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				
	    				$('#mainErrorMsg').text(status+": Error pasting <strong>"+clipboardNode.path+"</strong> to  <strong>"+treeLi.data('node').path+"</strong> caused by "+message).show()
	    			});
	    			
	    			break;
	    		case 'move' : 
	    			var clipboardNode = $('#contextMenu').data('clipboard');
    				$.post(clipboardNode.path+'?:operation=move&:dest='+treeLi.data('node').path+'/')
	    			.done(function(data) {
	    				var dataHtml = $(data);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				if (status.indexOf('20') == 0) { // Ok
	    					// Remove the item from clipboard
	    					$('#contextMenu').removeData('clipboard');
	    					// Disabled other actions
	    					$('#contextMenu').find('.clipboardOnly').addClass('disabled');
	    					// Capture the moveTo node as it goes away after removeNode method.
	    					var node = treeLi.data('node');
	    					// remove the movedNode
	    					browseTree.tree('removeNode', clipboardNode);
	    					// Refresh the captured node
	    					refreshNode(node)
							// close any tab if node is file and opened
							var tab = pageTab.find('a[href=#'+clipboardNode.uuid+']').parent();
							if (tab.length) {
								tab.find('span').trigger('click');
							}
	    				}
	    			}).fail(function(jqXHR, textStatus, errorThrown) {
	    				var dataHtml = $(jqXHR.responseText);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				$('#mainErrorMsg').text(status+": Error moving <strong>"+clipboardNode.path+"</strong> to  <strong>"+treeLi.data('node').path+"</strong> caused by "+message).show();
	    			});
	    			
	    			break;
	    		case 'rename' : 
	    			var renameItem = $('#contextMenu .renameItem');
	    			var renameTo = renameItem.find('input[name=renameTo]');
	    			$('#contextMenu').show();
	    			if (renameItem.is('.hide')) {
		    			$('#renameForm').data('node', treeLi.data('node'));
		    			renameItem.removeClass('hide')
		    			renameTo.val(treeLi.data('node').name).focus();
		    			if (renameTo[0].setSelectionRange) {
		    				renameTo[0].setSelectionRange(0,renameTo.val().length);
		    			}
	    			} else {
	    				renameTo.focus();
	    			}
	    			break;
	    	
	    	}
	    }
	}).on('contextmenu', function() {
		// Hide the rename form field unless rename is clicked
		$('#contextMenu .renameItem').addClass('hide');
	})
	
	// Disable the actual submit and only through AJAX
	$('#renameForm').on('submit', function() { return false;});
	// Update when enter key is pressed
	$('#contextMenu input[name=renameTo]').on('click dblclick', function(e) {
		e.stopPropagation();
	}).on('keydown', function(e) {
		if (e.which == 13) {
			e.preventDefault();
			e.stopPropagation();
			var $form = $('#renameForm');
			if (isFormValid($form)) {
				var node = $form.data('node');
				if (node && node.parent) {
					var newName = $form.find('input[name=renameTo]').val();
					$.post(node.path+'?:operation=move&:dest='+node.parent.path+'/'+newName)
	    			.done(function(data) {
	    				var dataHtml = $(data);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				if (status.indexOf('20') == 0) { // Ok
	    					var parentNode = node.parent;
	    					// remove the movedNode
	    					browseTree.tree('removeNode', node);
	    					// Refresh the captured node
	    					refreshNode(parentNode, parentNode.path+'/'+newName);
							// close any tab if node is file and opened
							var tab = pageTab.find('a[href=#'+node.uuid+']').parent();
							if (tab.length) {
								tab.find('span').trigger('click');
							}
	    				}
	    			}).fail(function(jqXHR, textStatus, errorThrown) {
	    				var dataHtml = $(jqXHR.responseText);
	    				var status = dataHtml.find('#Status').text();
	    				var message = dataHtml.find('#Message').text();
	    				$('#mainErrorMsg').text(status+": Error renaming <strong>"+node.name+"</strong> to  <strong>"+newName+"</strong> caused by "+message).show();
	    			});
				} else {
    				$('#mainErrorMsg').text("Cannot modify ROOT NODE").show();
				}
				$('#contextMenu').hide();
			}
		}
	})
	
	var disableClickHandler = function (e) {
		e.preventDefault();
	}
	// Search 
	var loaderHandlers = {
			resultHandler : function (data) {
				var loader = this;
				if (data.length <= 0) {
					loader.done();
					checkEmptyContent();
					return;
				}
				// Last batch
				if (data.length < loader.opts.limit) {
					loader.done();
				}
				// Remove the hidden div before append 
				if (resultPanel.find('#loadMore').length) {
					data.insertBefore(resultPanel.find('#loadMore'));
				} else {
					resultPanel.append(data);
				}
				
				checkEmptyContent();
			},
			cacheHandler : function cacheHandler(data) {
				var wrap = document.createElement('wrap');
				wrap.innerHTML = data;
				var result = $('div', $(wrap));
				result.find('a').on('click',disableClickHandler);
				return result;
			},
			/* Override the default scroll handling behavior */
			isInView  : function () {
				var el = this.loadOnElement[0];
				var elemTop = el.getBoundingClientRect().top;
				var elemBottom = el.getBoundingClientRect().bottom;
				var isVisible = (elemTop >= 0) && (elemBottom <= window.innerHeight);
				return isVisible;
			}
		}
	
	$('#searchForm').on('submit', function (e) {
		e.preventDefault();
		var val = $('#searchField').val();
		if (val.indexOf('/') == 0 && val.indexOf('//')==-1) {
			currentPath = val;
			history.replaceState(currentPath, currentPath, "/browser.html"+currentPath);
			restoreState(buildPaths());
			return false;
		}
		resultPanel.empty().html('<a id="loadMore"></a>');
		new ContentLoader(
				{	
					"fillType": "auto", 
					"limit": 50, 
					"container" : "#resultPanel",
					"dataType": "html", 
					"loadOnElement": "#loadMore", 
					"maxScrollLimit": 10,
					"ajaxUrl" : "/browser.search.html?query="+$('#searchField').val()
				}, 
				loaderHandlers
		);
	})
	resultPanel.on('click', function(e) {
		if (e.target && e.target.nodeName == 'A') {
			currentPath = $(e.target).attr('href');
			history.replaceState(currentPath, currentPath, "/browser.html"+currentPath);
			restoreState(buildPaths());
		}
	})
});