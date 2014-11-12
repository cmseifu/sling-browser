// Editor.js
var ACE_THEMES=["ambiance", "chaos", "chrome", "clouds_midnight", "clouds", "cobalt", "crimson_editor", "dawn", "dreamweaver", "eclipse", "github", "idle_fingers", "katzenmilch", "kr_theme", "kr", "kuroir", "merbivore_soft", "merbivore", "mono_industrial", "monokai", "pastel_on_dark", "solarized_dark", "solarized_light", "terminal", "textmate", "tomorrow_night_blue", "tomorrow_night_bright", "tomorrow_night_eighties", "tomorrow_night", "tomorrow", "twilight", "vibrant_ink", "xcode"];
(function() {
	var editor = ace.edit("editor");
	var saveBtn = $('#saveBtn');
	// parent file should set the aceMode variable
	editor.getSession().setMode(aceMode);
	editor.getSession().setUseWrapMode(false);
	editor.getSession().on('change', function(e) {
	   saveBtn[0].disabled=false;
	});
	
	var out = [];
	for (var i=0,j=ACE_THEMES.length;i<j;i++) {
		out.push('<option>'+ACE_THEMES[i]+'</option>');
	}
	$('#aceThemeSelect').append(out.join(''));
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
