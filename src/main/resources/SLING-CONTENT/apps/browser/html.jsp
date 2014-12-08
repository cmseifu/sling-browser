<%@page import="javax.jcr.Session"%>
<%@page session="false"
        contentType="text/html; charset=utf-8"
        trimDirectiveWhitespaces="true"
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<sling:defineObjects/>
<c:set var="staticRoot" value="/apps/browser/static" scope="request" />

<!DOCTYPE html>
<html>
	<head>
		<sling:include replaceSelectors="components.head"/>
	</head>
	<body>
		<c:choose>
			<c:when test="${slingRequest.resourceResolver.userID == 'anonymous'}">
				<sling:include replaceSelectors="components.login"/>
			</c:when>
			<c:otherwise>
			<sling:include replaceSelectors="components.bodyContent"/>
		</c:otherwise>
		</c:choose>
		<sling:include replaceSelectors="components.tail"/>
	</body>
</html>





