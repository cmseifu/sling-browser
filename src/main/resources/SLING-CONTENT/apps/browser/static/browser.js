var SESSION_KEY = 'browser';

$(document).ready(function() {
		var IMAGE_EXTS = ['png','jpe','jpeg','jpg','gif']
		$("#loginModal").on('shown.bs.modal', function() {
			$('#login-form #j_username').focus();
		});
		$('#login-form').on('submit', function(event) {
			event.preventDefault();
			$.post('/j_security_check', $(this).serialize(), function(data) {
				$('#login-form .alert').addClass('hide');
				window.location.reload(true);
			}).fail(function() {
				$('#login-form .alert').removeClass('hide').fadeOut(500).fadeIn(1000);
				
			})
		});
		if (isAnonymous) {
			$('#loginModal').modal('show');
		}
		$('#logout').on('click', function(e){
			e.preventDefault();
			$.get($(this).attr('href'), function() {
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
		/*
		var deleteModal = $('#deleteModal');
		var confirmModal = $('#confirmModal');
		var confirmIndexModal = $('#confirmIndexModal');
		var resultModal = $('#resultModal');
		var viewModal = $('#viewModal');
		var viewPanel = $('#viewPanel');
		*/
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
			addTab($(this).data('node'));
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
				$li.data('node', node);
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
		
		// Bind click to context menu
		//browseTree.vscontext({menuBlock: 'vs-context-menu', speed: 'fast'});
		
		// Show the bootstrap dropdown but hidden inside context menu
		//$('.vs-context-menu .dropdown-menu').toggle();
		
		// Tree initialization
		browseTree.bind('tree.init', function() { 
				restoreState(buildPaths());
			}
		);
		
		
		// Obtain the parent paths of non-loaded nodes
		function buildPaths() {
			var paths = getPaths(currentPath);
			var l = paths.length-1;
			var node = browseTree.tree('getNodeById', paths[l]);
			while (node == null && l > -1) {
				 node = browseTree.tree('getNodeById', paths[--l]);
			} 
			if (node != null && node.path != null) {
				return	paths.slice(paths.indexOf(node.path));
			} else {
				return [currentPath];
			}
		}
		
		function getPaths(path) {
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
				var node = browseTree.tree('getNodeById', paths[0]);
				if (node && node.path) {
					if (paths.length == 1) {
						selectNode(currentPath, false);
					} else {
						$.getJSON(REQUEST_PATH+".json"+node.path, function (data) {
							var newPaths = paths.slice(1);
			        		browseTree.tree('loadData', data[0].children, node);
			        		browseTree.tree('openNode', node);
			        		restoreState(newPaths);
				        });
					}
				} 
			} else {
				selectNode(currentPath, false);
			}
		}
		

		// Select a node
		function selectNode(id, storeState) {
			var node = browseTree.tree('getNodeById', id);
			if (node != null) {
				browseTree.tree('selectNode', node);
				updateCurrent(node, storeState);
			}
		}
		
		
		// Refresh a node
		function refreshNode(node) {
			$.getJSON(node.path+".browse.folder.json", { "noCache": "noCache" }, function (data) {
	        	 browseTree.tree('updateNode',node,{label:data[0].label});
	        	 if (data[0].children) {
	        		 browseTree.tree('loadData', data[0].children, node);
	        	 }
	        	 browseTree.tree('selectNode', node);
	        	 updateCurrent(node);
	        });
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
			//viewPanel.empty();
			//$(window).scrollTop($('#currentPath').offset().top-100);
			/*
			new ContentLoader(
					{	
						"fillType": "auto", 
						"limit": 25, 
						"container" : "#tabItems",
						"dataType": "html", 
						"loadOnElement": "#loadMore", 
						"ajaxUrl" : "/browser.list-children.html"+node.path
					}, 
					loaderHandlers
			);
			*/
			
		}
		
		// Push the browser history
		function pushState(node) {
			history.pushState(node.path, node.path, "/browser.html"+node.path);
		}

		function addTab(node) {
			var tab = pageTab.find('a[href=#'+node.uuid+']').parent();
			if (!tab.length) {
				if (node.fileType && node.fileType == 'js') {
					node.fileType = 'javascript';
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
			}
			tab.find('a').tab('show');
		}
		
		var removeTabHandler = function(e) {
			var _self = $(this);
			var tabId = _self.prev().attr('href');
			_self.parent().remove();
			$(tabId).remove();
			pageTab.find('li:last a').tab('show');
		}
		
		
		
		// On browser navigation button pushed.
		window.onpopstate = function(event) {
			if (event.state != null) {
				currentPath  = event.state;
				restoreState(buildPaths());
			}
		};
		
		var storage = getJsonLocalStorage(SESSION_KEY);
		if (!storage) {
			storage = {tabs:[]};
		}

	});