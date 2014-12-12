var STORAGE_KEY = slingUserId+'-browser';

$(document).ready(function() {
		var storage = getJsonLocalStorage(STORAGE_KEY);
		if (!storage) {
			storage = {tabs:{}};
		} 
		var IMAGE_EXTS = ['png','jpe','jpeg','jpg','gif']
		$('#logout').on('click', function(e){
			e.preventDefault();
			$.post($(this).attr('href'),{ "noCache": "noCache" }).always(function() {
				window.location.reload(true);
			})
		});
		// Global var refrences
		var browseTree = $('#browseTree');
		var viewPanel = $('#viewPanel');
		var pageTab = $('#pageTab');
		var pageTabContent = $('#pageTabContent');
		// clones for adding new tab
		var tabTmpl = $('#tabTmpl').clone().removeAttr('id');
		var tabContentTmpl = $('#tabContentTmpl').clone().removeAttr('id');
		
		/* double click on tab gives full screen */
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
		
		
		var fileOpenHandler = function (e) {
			e.preventDefault();
			e.stopPropagation();
			addTab($(this).data('simpleNode'));
		}
		
		
		browseTree.tree({
			autoEscape : false,
			slide: true,
			openFolderDelay: 200,
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
					case 'nt:folder' : icon = 'folder-close';styleClass='folder';break;
					case 'nt:file' : 
						if (node.fileType) {
							icon="pencil";
							node.openType = 'editor';
							canOpen=true;
						} else if (IMAGE_EXTS.indexOf(node.extension)!=-1) {
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
				/* This copied the properties for serialization when tabs are open or restore */
				var simpleNode = {
					name : node.name,
					path : node.path,
					canOpen : node.canOpen,
					nodeType : node.nodeType,
					openType : node.openType,
					uuid: node.uuid,
					fileType : node.fileType
				}
				$li.data('node', node);
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
				//checkEmptyContent();
				//clearCursorWait();
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
			if (!viewPanel.find('div').length) {
				viewPanel.append("<h3>No Content</h3>")
			}
		}
		
		var loaderHandlers = {
				resultHandler : function (data) {
					var loader = this;
					if (data.length <= 0) {
						loader.loaded= true;
						checkEmptyContent();
						return;
					}
					// Last batch
					if (data.length < loader.opts.limit) {
						loader.loaded= true;
					}
					// Remove the hidden div before append 
					data.appendTo(viewPanel).fadeIn("fast");
					checkEmptyContent();
				},
				cacheHandler : function cacheHandler(data) {
					var wrap = document.createElement('wrap');
					wrap.innerHTML = data;
					var result = $('div', $(wrap)).each(processItem);
					return result;
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
			browseTree.tree('openNode', node);
		}
		
		// Push the browser history
		function pushState(node) {
			history.pushState(node.path, node.path, "/browser.html"+node.path);
		}

		function addTab(node, selected) {
			var tab = pageTab.find('a[href=#'+node.uuid+']').parent();
			if (!tab.length) {
				if (node.fileType && node.fileType == 'js') {
					node.fileType = 'javascript';
				} else if (node.fileType && node.fileType == 'txt') {
					node.fileType = 'text';
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
							 tabContent.html('<iframe style="border:0px;width:100%;height:100%" src="/browser.edit.html'+node.path+'?editType=file&fileType='+node.fileType+'"></iframe>');
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
			// If selected not specified or selected = true
			if (!arguments[1] || selected) {
				tab.find('a').trigger('click');
			}
		}
		
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
		
		// Store the last active tab index
		window.onbeforeunload = function(e) {
			var activeTabIndex = $('#pageTab li.active').index();
			storage.activeTabIndex = activeTabIndex;
			setLocalStorage(STORAGE_KEY,storage);
		};
		
		// When all paths are restored, this event will be fired so we restore user profile information.  This should be done only once.
		$('body').one('browser:restoreReady', function () {
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
		);
		
		
		$('#newModal #createBtn').on('click', function(e) {
			var _self = $(this);
			// lock submiting
			
			var $form = $(this).closest('form');
			if (!isFormValid($form)) {
				return;
			}
			var treeLi = $('#newModal').data('treeLi');
			var node = treeLi.data('simpleNode') ;
			var newPath = node.path+'/'+$form.find('#newNodeName').val();
			var nodeType = $form.find('#nodeTypeSelect').val();
			var data = {};
			data["jcr:primaryType"] = nodeType;
			if (nodeType == 'nt:file') {
				data["jcr:content"] = {
				     "jcr:primaryType": "nt:resource",
				     "jcr:data" : "",
				     "jcr:mimeType" : "application/octet-stream"
				}
			}
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
				$form.find('.errorMsg').text(status+": Error saving <strong>"+resourcePath+"</strong> caused by "+message).show();
				
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
		
		
		
		browseTree.contextMenu({
		    menuSelector: "#contextMenu",
		    menuSelected: function (invokedOn, selectedMenu) {
		    	var action = selectedMenu.closest('li').data('action');
		    	if (!action) return;
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
		    					var tab = pageTab.find('a[href=#'+node.uuid+']').parent();
		    					// remove the node
		    					browseTree.tree('removeNode', node);
		    					// select prev or parent
								refreshNode(prev ? prev : parent);
								// close any tags if file is opened
								var tab = pageTab.find('a[href=#'+node.uuid+']').parent();
								if (tab.length) {
									tab.find('span').trigger('click');
								}
		    				}
		    			}).fail(function(jqXHR, textStatus, errorThrown) {
		    				var dataHtml = $(jqXHR.responseText);
		    				var status = dataHtml.find('#Status').text();
		    				var message = dataHtml.find('#Message').text();
		    				
		    				$('body').find('.errorMsg').text(status+": Error deleting <strong>"+resourcePath+"</strong> caused by "+message).show();
		    			});
    				break;
		    	
		    	}
		    }
		});
		
		

	});