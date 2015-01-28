 <%@page session="false"
        contentType="text/html; charset=utf-8"
        trimDirectiveWhitespaces="true"
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core" %>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn" %>
 <title>Sling Browser</title>
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <link href="${staticRoot}/bootstrap-3.3.0/css/bootstrap.min.css" rel="stylesheet" media="screen">
 <link href="${staticRoot}/jqTree-0.22/jqtree.style.css" rel="stylesheet" media="screen">
 <link href="${staticRoot}/font-awesome-4.2.0/css/font-awesome.min.css" rel="stylesheet" media="screen">
 <link href="${staticRoot}/browser.css?t=<%=new java.util.Date().getTime() %>" rel="stylesheet" media="screen">
 <script type="text/javascript" src="${staticRoot}/jquery-2.1.1.min.js"></script>
