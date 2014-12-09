// Editor.js
(function() {
	var STORAGE_KEY = slingUserId+'-browser-file';
	var editor = ace.edit("editor");
	var saveBtn = $('#saveBtn');
	// parent file should set the aceMode variable
	editor.getSession().setMode(aceMode);
	editor.getSession().setUseWrapMode(false);
	editor.getSession().on('change', function(e) {
	   saveBtn[0].disabled=false;
	});
	
	$('#aceThemeSelect').on('change',function () {
		var theme = $(this).val();
		editor.setTheme("ace/theme/"+theme);
		setLocalStorage(STORAGE_KEY, {theme:theme});
	})
	saveBtn.on('click', function(e) {
		this.disabled=true;
		$('input#jcrData').val(editor.getValue());
		$('#updateForm').submit();
	});
	$('#editor').css('opacity',1);
	
	var storage = getJsonLocalStorage(STORAGE_KEY);
	if (storage && storage.theme) {
		$('#aceThemeSelect').val(storage.theme).trigger('change');
	}
})()
