// Editor.js
(function() {
	var editor = ace.edit("editor");
	var saveBtn = $('#saveBtn');
	// parent file should set the aceMode variable
	editor.getSession().setMode(aceMode);
	editor.getSession().setUseWrapMode(false);
	editor.getSession().on('change', function(e) {
	   saveBtn[0].disabled=false;
	});
	
	$('#aceThemeSelect').on('change',function () {
		editor.setTheme("ace/theme/"+$(this).val());
	})
	saveBtn.on('click', function(e) {
		this.disabled=true;
		$('input#jcrData').val(editor.getValue());
		$('#updateForm').submit();
	});
	$('#editor').css('opacity',1);
})()
