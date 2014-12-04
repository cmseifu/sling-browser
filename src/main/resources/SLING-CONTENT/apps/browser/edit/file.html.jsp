<%@page import="javax.jcr.Session"%>
<%@page session="false" contentType="text/html; charset=utf-8"
	trimDirectiveWhitespaces="true"%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<sling:defineObjects />
<c:set var="staticRoot" value="/apps/browser/static" scope="request" />

<!DOCTYPE html>
<html lang="en">
<head>
<title>${currentNode.name}</title>
<style type="text/css" media="screen">
#editor { 
        position: absolute;
        top: 40px;
        right: 0;
        bottom: 0px;
        left: 0;
        opacity:0;
}
nav {
	height:40px;
}

.themeSelect {
	float:right;
}

#aceThemeSelect{
	float:right;
}
</style>
</head>
<body>
	<nav>
		<form>
			<button type="button" disabled="disabled" id="saveBtn">save</button>
			<div class="themeSelect">
				<small>Theme: </small>
				<select id="aceThemeSelect">
					<option>ambiance</option>
					<option>chaos</option>
					<option>chrome</option>
					<option>clouds_midnight</option>
					<option>clouds</option>
					<option>cobalt</option>
					<option>crimson_editor</option>
					<option>dawn</option>
					<option>dreamweaver</option>
					<option>eclipse</option>
					<option>github</option>
					<option>idle_fingers</option>
					<option>katzenmilch</option>
					<option>kr_theme</option>
					<option>kr</option>
					<option>kuroir</option>
					<option>merbivore_soft</option>
					<option>merbivore</option>
					<option>mono_industrial</option>
					<option>monokai</option>
					<option>pastel_on_dark</option>
					<option>solarized_dark</option>
					<option>solarized_light</option>
					<option>terminal</option>
					<option>textmate</option>
					<option>tomorrow_night_blue</option>
					<option>tomorrow_night_bright</option>
					<option>tomorrow_night_eighties</option>
					<option>tomorrow_night</option>
					<option>tomorrow</option>
					<option>twilight</option>
					<option>vibrant_ink</option>
					<option>xcode</option>
				</select>
			</div>
		</form>
	</nav>
	<div id="editor"><c:out value="<%=currentNode.getProperty("jcr:content/jcr:data").getString() %>" escapeXml="true" /></div>
	<form method="POST" id="updateForm" 
		action="${currentNode.path}/_jcr_content"
		ENCTYPE="MULTIPART/FORM-DATA">
		<input type="hidden" name=":redirect" value="${slingRequest.requestURL}?fileType=${param.fileType}&editType=${param.editType}" />
		<input type="hidden" name="jcr:data" value="" id="jcrData"/>
	</form>

	<script>
		var aceMode = "ace/mode/${param.fileType}";
	</script>
	<script type="text/javascript" src="${staticRoot}/jquery-2.1.1.min.js"></script>
	<script src="${staticRoot}/ace-1.1.7/src-min/ace.js" type="text/javascript" charset="utf-8"></script>
	<script src="${staticRoot}/common.js?t=<%=new java.util.Date().getTime() %>" type="text/javascript" charset="utf-8"></script>
	<script src="${staticRoot}/edit/file.js?t=<%=new java.util.Date().getTime() %>" type="text/javascript" charset="utf-8"></script>
</body>
</html>

