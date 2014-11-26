/* Extend jQuery Shake */
jQuery.fn.shake = function(intShakes, intDistance, intDuration) {
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

/* End extend */
var propertyFormTmpl = $('#propertyFormTmpl').clone().removeAttr('id');
$('tr:not(.readonly)').on('dblclick', function() {
	var _self = $(this);
	_self.toggleClass('editing');
	if (window.parent && window.parent.document) {
		$( window.parent.document).find('body').toggleClass('lock');
	}
	$('body').toggleClass('lock');
	
	if (!_self.data('renderForm')) {
		_self.data('renderForm',true);
		createEditPanel(_self);
	}
	if (_self.is('.editing')) {
		var valueEdit = _self.find('.value-edit')
		var clientRect = valueEdit[0].getBoundingClientRect();
		valueEdit.css({position:'fixed',width:clientRect.width , left:clientRect.left, top:clientRect.top});
	}
})
// JCR PropertyDefinition String,Date,Binary,Double,Long,Boolean,Name,Path,Reference,Undefined
function createEditPanel(trElement) {
	var name = trElement.data('name');
	var type = trElement.data('type');
	var isMultiple =  trElement.data('multiple')
	var valueEdit = trElement.find('.value-edit');
	var propertyForm = propertyFormTmpl.clone();
	var out = [];
	if (!isMultiple) {
		var val = valueEdit.find('span').text();
		if (type == 'Boolean') {
			/* Because checkbox is not submitted, we need to provide default value */
			out.push('<input type="checkbox" name="'+name+'" onclick="this.value=this.checked?true:false" value="'+val+'" '+(val=='true' ? 'checked="checked"': '')+' />');
			out.push('<input type="hidden" name="'+name+'@DefaultValue" value="false"/>');
			out.push('<input type="hidden" name="'+name+'@UseDefaultWhenMissing" value="true"/>');
		} else if (type == 'Reference') {
			//TODO
		} else if (type == 'Date') {
			//TODO
		} else if (type == 'Name') {
			//TODO
		} else if (type == 'Long'){
			out.push('<input type="text" required pattern="[0-9]+" name="'+name+'" value="'+val+'" />');
		} else if (type == 'Double') {
			out.push('<input type="text" required pattern="\\d+(\\.\\d{2})?" name="'+name+'" value="'+val+'" />');
		}
		else {
			out.push('<textarea name="'+name+'">'+val+'</textarea>');
		}
	} else {
		
	}
	valueEdit.on('click', function(e) {
		if (e.target.nodeName == 'SPAN') {
			e.preventDefault();
			var $target = $(e.target);
			action = $target.data('action');
			if (action == 'cancel') {
				$target.closest('tr').trigger('dblclick');
			} else if (action == 'ok') {
				var $form = $target.closest('form');
				var isValid = true;
				var fields = $form.find('input[pattern]');
				/* Html5 supported */
				if (fields.length && typeof fields[0].willValidate !== 'undefined') {
					fields.each(function() {
						this.checkValidity();
						if (!this.validity.valid) {
							isValid = false;
							return;
						}
					})
				}
				if (!isValid) {
					valueEdit.find('form').shake(5,5,800);
				}
				else {
					$.post($form.attr('action'), $form.serialize())
					.done(function(data) {
						var dataHtml = $(data);
						var status = dataHtml.find('#Status').text();
						var message = dataHtml.find('#Message').text();
						if (status == '200' && message == 'OK') {
							if (type == 'Boolean') {
								valueEdit.prev().text($form.find('[name='+name+']')[0].checked);
							} else {
								valueEdit.prev().text($form.find('[name='+name+']').val());
							}
							valueEdit.closest('tr').trigger('dblclick').addClass('alert-success').fadeOut(500).fadeIn(1000,function() {$(this).removeClass('alert-success')});
						}
					}).fail(function(jqXHR, textStatus, errorThrown) {
						valueEdit.find('form').shake(5,5,800);
					})
				}
			}
		} 
	})
 	valueEdit.empty().append(propertyForm.prepend(out.join('')));
}

	function openEdit(event) {
		event.preventDefault();
		var field = $(this).attr('data-field');
		var fieldValue = dataJson[field];
		var fieldSet = $("#dialog-edit fieldset")
		fieldSet.empty();
		$("#dialog-edit").dialog('option','title','FIELD: '+field);
		if (fieldValue instanceof Array) {
			for (var i in fieldValue) {
				$('<input type="text" />').attr('name',field).attr('value',fieldValue[i]).appendTo(fieldSet);
			}
			fieldSet.children().each(function() {	
		$(this).css({'border-width': '0px', 'outline': 'none', 'border-spacing':'5px'})
			.wrap('<div class="divclearable"></div>')
			.parent()
			.attr('class', $(this).attr('class') + ' divclearable')
			.append('<a class="clearlink" href="#"></a>');
	
		$('.clearlink')
			.attr('title', 'Click to clear this textbox')
			.click(function(event) {
				event.preventDefault();
				$(this).parent().remove();
			});
		  });
		} else if (fieldValue.indexOf('<') > -1) {
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
		} else {
			$('<input type="text"/>').attr('name',field).attr('value',fieldValue).appendTo(fieldSet);
		}
		
		 $("#dialog-edit").dialog('open');
	}
	

	

