<%@page import="javax.jcr.Session"%>
<%@page session="false"
        contentType="text/html; charset=utf-8"
        trimDirectiveWhitespaces="true"
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
<sling:defineObjects/>
<script type="text/javascript" src="${staticRoot}/bootstrap-3.3.0/js/bootstrap.min.js"></script>
<script type="text/javascript" src="${staticRoot}/jqTree-0.22/tree.jquery.js"></script>
<script type="text/javascript" src="${staticRoot}/contentloader.js"></script>
<script type="text/javascript" src="${staticRoot}/jquery.jqGrid-4.6.0/js/jquery.jqGrid.min.js"></script>

<script type="text/javascript">
	var ROOT_PATH = "/";
	var REQUEST_PATH = "/services/browser";
	var isAnonymous = ${slingRequest.resourceResolver.userID == 'anonymous'};
	var currentNode = null;
	var currentPath = null;
	var slingUserId = "${slingRequest.resourceResolver.userID}";
	var suffix = "${empty slingRequest.requestPathInfo.suffix ? '/': slingRequest.requestPathInfo.suffix}";
	
</script>
<script src="${staticRoot}/common.js?t=<%=new java.util.Date().getTime() %>" type="text/javascript" charset="utf-8"></script>
<script type="text/javascript" src="${staticRoot}/browser.js?t=<%=new java.util.Date().getTime() %>"></script>