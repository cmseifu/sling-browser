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
 <script type="text/javascript" src="${staticRoot}/jquery-2.1.1.min.js"></script>
</head>
<body>
	<nav>
		<form>
			<button type="button" disabled="disabled" id="saveBtn">save</button>
			<div class="themeSelect">
				<small>Theme: </small>
				<select id="aceThemeSelect">

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
	<script src="${staticRoot}/ace-1.1.7/src-min/ace.js" type="text/javascript" charset="utf-8"></script>
	<script src="${staticRoot}/edit/file.js" type="text/javascript" charset="utf-8"></script>
</body>
</html>

