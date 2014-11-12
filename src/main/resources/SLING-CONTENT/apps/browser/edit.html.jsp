<%@page import="javax.jcr.Session"%>
<%@page session="false"
        contentType="text/html; charset=utf-8"
        trimDirectiveWhitespaces="true"
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<sling:defineObjects/>
<c:set var="staticRoot" value="/apps/browser/static" scope="request" />

<%-- direct the the corresponding editType --%>
<c:if test="${!empty slingRequest.requestPathInfo.suffix }">
	<sling:include path="${slingRequest.requestPathInfo.suffix}" replaceSelectors="edit.${param.editType=='properties' ? 'properties' : 'file'}" resourceType="browser"  replaceSuffix=""/>
</c:if>