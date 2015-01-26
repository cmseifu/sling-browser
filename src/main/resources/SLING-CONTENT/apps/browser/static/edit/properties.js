(function() {
	var SESSION_STORAGE_KEY = slingUserId+'-browser-property';
	
	function toggleLock() {
		if (window.parent && window.parent != window.self && window.parent.document) {
			$( window.parent.document).find('body').toggleClass('lock');
		}
		$('body').toggleClass('lock');
	}
	
	function removePropertyHandler(e) {
		e.preventDefault();
		e.stopPropagation();
		var _tr = $(this).closest('tr');
		var propStr = encodeURIComponent(_tr.data('name'))+'@Delete=';
		
		$.post(resourcePath+"?"+propStr).done(function(data){
			_tr.fadeOut(800, function() { _tr.remove(); })
		}).fail(function() {
			_tr.shake(5,5,800);
		});
	}
	
	$('.glyphicon-trash').one('click dblclick', removePropertyHandler);
	
	var propertyFormTmpl = $('#propertyFormTmpl').clone().removeAttr('id');
	$('tr.alert:not(.readonly)').on('dblclick', function() {
		var _self = $(this);
		_self.toggleClass('editing');
		toggleLock();
		// Create the form only once 
		if (!_self.data('formRendered')) {
			_self.data('formRendered',true);
			createEditPanel(_self);
		}
	})
	// JCR PropertyDefinition String,Date,Binary,Double,Long,Boolean,Name,Path,Reference,Undefined
	
	function createFormElementByType(name, type, value, isMultiple) {
		var out = [];
		out.push('<div class="fieldItem'+(!isMultiple ? ' single':'')+'">')
		if (type == 'Boolean') {
			/* Because checkbox is not submitted, we need to provide default value */
			out.push('<input type="checkbox" name="'+name+'" onclick="this.value=this.checked?true:false" value="'+value+'" '+(value=='true' ? 'checked="checked"': '')+' />');
			out.push('<input type="hidden" name="'+name+'@DefaultValue" value="false"/>');
			out.push('<input type="hidden" name="'+name+'@UseDefaultWhenMissing" value="true"/>');
		} else if (type == 'Long'){
			out.push('<input type="text" required pattern="[0-9]+" name="'+name+'" value="'+value+'" autocapitalize="off" autocorrect="off" autocomplete="off" />');
		} else if (type == 'Double') {
			out.push('<input type="text" required pattern="\\d+(\\.\\d+)?" name="'+name+'" value="'+value+'" autocapitalize="off" autocorrect="off" autocomplete="off" />');
		} else if (type == 'String') {
			if (isMultiple) {
				out.push('<input type="text" required name="'+name+'" value="'+value+'" autocapitalize="off" autocorrect="off" autocomplete="off" />');
			} else {
				out.push('<textarea required name="'+name+'">'+value+'</textarea>');
			}
		} else if (type == 'Reference') {
			//TODO
		} else if (type == 'Date') {
			out.push('<input type="date" required name="'+name+'" value="'+(value=='' ? value : value.substring(0,value.indexOf('T')))+'" autocapitalize="off" autocorrect="off" autocomplete="off" />');
		} else if (type == 'Name') {
			//TODO
		} else if (type == 'Path') {
			//TODO
		} else if (type == 'Undefined') {
			//TODO
		} 
		if (isMultiple) {
			out.push('<span class="glyphicon glyphicon-remove-circle" data-action="remove-prop"></span>')
		}
		out.push('</div>');
		return out.join('');
	}
	function createEditPanel(trElement) {
		var name = trElement.data('name');
		var type = trElement.data('type');
		var isMultiple =  trElement.data('multiple')
		var valueEdit = trElement.find('.value-edit');
		var out = ['<div class="fieldItems">'];
		
		var originalValues =  valueEdit.find('span').map(function() { return $(this).text(); }).get();
		for (var i=0,j=originalValues.length;i<j;i++) {
			out.push(createFormElementByType(name, type, originalValues[i], isMultiple));
		}
		if (isMultiple) {
			out.push('<span class="glyphicon glyphicon-plus" data-action="add-prop"></span>');
		}
		out.push('</div>');
		valueEdit.empty().append(propertyFormTmpl.clone().prepend(out.join('')));
		valueEdit.on('click', function(e) {
			var _propRoot = $(this).closest('tr');
			if (e.target.nodeName == 'SPAN') {
				e.preventDefault();
				e.stopPropagation();
				var $target = $(e.target);
				action = $target.data('action');
				if (!action) return;
				if (action == 'cancel') {
					$target.closest('tr').trigger('dblclick');
				} else if (action == 'remove-prop') {
					$target.parent().remove();
				} else if (action == 'add-prop') {
					$(createFormElementByType(_propRoot.data('name'), _propRoot.data('type'), '', true)).insertBefore($target);
				}  
				
				else if (action == 'ok') {
					var $form = $target.closest('form');
					if (!isFormValid($form)) {
						return;
					}
					$.post($form.attr('action'), $form.serialize())
					.done(function(data) {
						var dataHtml = $(data);
						var status = dataHtml.find('#Status').text();
						var message = dataHtml.find('#Message').text();
						if (status == '200' && message == 'OK') {
							if (type == 'Boolean') {
								valueEdit.prev().text($form.find('[name=\''+name+'\']')[0].checked);
							} if (type == 'Date') {
								valueEdit.prev().text($form.find('[name=\''+name+'\']').val() + 'T00:00:00.000-05:00');
							} else {
								valueEdit.prev().text($form.find('[name=\''+name+'\']').map(function() {return this.value }).get().join(', '));
							}
							visualUpdate(valueEdit.closest('tr').trigger('dblclick'));
						}
					}).fail(function(jqXHR, textStatus, errorThrown) {
						valueEdit.find('form').shake(5,5,800);
					})
					
				}
			} 
		})
	 	
	}
/*
		if (fieldValue.indexOf('<') > -1) {
			var textarea  = $('<textarea></textarea>').attr('name',field).attr('value',fieldValue).appendTo(fieldSet);
			textarea.wysiwyg({
			rmUnusedControls: true,
			controls: {
				bold: { visible : true },
				html: { visible : true },
				italic: {visible: true},
				insertOrderedList: { visible: true},
				insertUnorderedList: {visible: true},
				undo: {visible: true},
				redo: {visible: true},
				removeFormat: { visible : true }
			}
		});
*/
		
	$('#mixinBtn').on('click', function(e) {
		e.preventDefault();
		$('.mixinContainer').toggleClass('editing');
		toggleLock();
	})
	
	$('#mixinCancelBtn').on('click', function() {
		$('.mixinContainer').toggleClass('editing');
		toggleLock();
	});
	
	$('#mixinSubmitBtn').on('click', function() {
		var $form = $('#mixinForm');
		var $errorMsg = $form.find('.errorMsg');
		$errorMsg.empty().hide();
		$.post($form.attr('action'), $form.serialize())
		.done(function(data) {
			var dataHtml = $(data);
			var status = dataHtml.find('#Status').text();
			var message = dataHtml.find('#Message').text();
			
			if (status == '200' && message == 'OK') {
				toggleLock();
				setSessionStorage(SESSION_STORAGE_KEY, {highlight: ['jcr:mixinTypes']});
				window.location.reload(true);
			}
		}).fail(function(jqXHR, textStatus, errorThrown) {
			var dataHtml = $(jqXHR.responseText);
			var status = dataHtml.find('#Status').text();
			var message = dataHtml.find('#Message').text();
			$errorMsg.text(status+": Error saving <strong>"+resourcePath+"</strong> caused by "+message).show();
			$('#mixinSubmitBtn').shake(5,5,800);
		})
		
	});
	
	// Property Modal
	$('#propCancelBtn').on('click', function() {
		$('#addPropModal').modal('hide');
		toggleLock();
	});
	
	// Escape when locked
	$(document).on('keyup', function(e) {
		  if (e.keyCode === 27 && $('body.lock').length) { 
			  $('.editing').toggleClass('editing');
			  toggleLock();
		  } 
	});
	
	function addPropMenuitemHandler(e) {
		e.preventDefault();
		var propName = $('#propName');
		propName.removeClass('alert alert-danger');
		if (!isValidField(propName[0])) {
			if (isSafari()) {
				propName.addClass('alert alert-danger').shake(5,5,800);
			} else {
				propName.closest('form').find('input[type=submit]').trigger('click');
			}
			
			return;
		}
		var name = propName.val();
		var isMultiple = $('#propMultiple:checked').length > 0;
		var type = $(this).text();
		var addPropModal = $('#addPropModal');
		
		var out = [];
		out.push('<input type="hidden" name="'+name+'@TypeHint" value="'+type+(isMultiple?'[]':'')+'" />');
		out.push(createFormElementByType(name, type, '', isMultiple));
		if (isMultiple) {
			out.push('<span class="glyphicon glyphicon-plus" data-action="add-prop"></span>');
		}
		
		addPropModal.removeData().data({name:name, type:type, multiple:isMultiple});
		addPropModal.find('.modal-title').text(type+(isMultiple?'[]':'')+': '+propName.val());
		addPropModal.find('.modal-body').empty().append(out.join(''));
		addPropModal.find('.errorMsg').hide();
		addPropModal.modal('show');
		toggleLock();
	}
	
	$('#addPropMenu .dropdown-menu a').on('click', addPropMenuitemHandler);
	
	$('#addPropModal .modal-content').on('click', function(e) {
		if (e.target && e.target.nodeName == 'SPAN') {
			e.preventDefault();
			e.stopPropagation();
			var $target = $(e.target);
			action = $target.data('action');
			if (!action) return false;
			var _propRoot = $('#addPropModal');
			_propRoot.find('.fieldItem.alert').removeClass('alert alert-danger')
			if (action == 'add-prop') {
				$(createFormElementByType(_propRoot.data('name'), _propRoot.data('type'), '', true)).insertBefore($target);
			}  
			else if (action == 'remove-prop') {
				$target.parent().remove();
			} 
			else if (action == 'ok') {
				var $form = $target.closest('form');
				if (!isFormValid($form)) {
					return;
				}
				$.post($form.attr('action'), $form.serialize())
				.done(function(data) {
					var dataHtml = $(data);
					var status = dataHtml.find('#Status').text();
					var message = dataHtml.find('#Message').text();
					if (status == '200' && message == 'OK') {
						toggleLock();
						setSessionStorage(SESSION_STORAGE_KEY, {highlight: [$('#addPropModal').data('name')]});
						window.location.reload(true);
					}
				}).fail(function(jqXHR, textStatus, errorThrown) {
					var dataHtml = $(jqXHR.responseText);
					var status = dataHtml.find('#Status').text();
					var message = dataHtml.find('#Message').text();
					
					$form.find('.errorMsg').text(status+": Error saving <strong>"+resourcePath+"</strong> caused by "+message).show();
				})
			}
		}
	});
	
	function visualUpdate(ele) {
		ele.addClass('alert-success').fadeOut(500).fadeIn(1000,function() {$(this).removeClass('alert-success')})
	}
	
	function restoreSession() {
		var storage = getJsonSessionStorage(SESSION_STORAGE_KEY);
		if (storage && storage.highlight) {
			for (var i=0;i<storage.highlight.length;i++) {
				visualUpdate($('tr[data-name=\''+storage.highlight[i]+'\']'));
			}
			clearSessionStorage(SESSION_STORAGE_KEY);
		}
	}
	restoreSession();
})();
