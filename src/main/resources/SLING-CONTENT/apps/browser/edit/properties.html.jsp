<%@page import="javax.jcr.PropertyType"%>
<%@page import="javax.jcr.nodetype.PropertyDefinition"%>
<%@page import="javax.jcr.security.Privilege"%>
<%@page import="javax.jcr.security.AccessControlManager"%>
<%@page import="org.apache.commons.lang.StringUtils"%>
<%@page import="java.util.List"%>
<%@page import="java.util.ArrayList"%>
<%@page import="javax.jcr.Value"%>
<%@page import="javax.jcr.Property"%>
<%@page import="javax.jcr.PropertyIterator"%>
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
 <meta name="viewport" content="width=device-width, initial-scale=1.0">
 <link href="${staticRoot}/bootstrap-3.3.0/css/bootstrap.min.css" rel="stylesheet" media="screen">
 <style>
 .table>thead>tr>th {
 	border-top:none;
 }
 .container {
 	margin-right: 0;
	margin-left: 0;
	background-color: #fff;
	border-color: #ddd;
	border-width: 1px;
	border-radius: 4px 4px 0 0;
	-webkit-box-shadow: none;
	box-shadow: none;
 }
 
 .readonly {
 	opacity:0.6;
 }
 
 </style>
</head>
<body>
<div class="container">
<table class="table table-condensed">
<tbody>
	<thead>
		<tr>
			<th>Name</th>
			<th>Value</th>
			<th>Status</th>
			<th>Action</th>
		</tr>
	</thead>
			
<%
	PropertyIterator properties = currentNode.getProperties();
	String primaryType = currentNode.getProperty("jcr:primaryType").getString();
	String resourceType = resource.getResourceType();
	String path = currentNode.getPath();
	if (properties != null) {
		Session session = currentNode.getSession();
		AccessControlManager acm = currentNode.getSession().getAccessControlManager();
		/*
		Privilege[] privileges = acm.getPrivileges(currentNode.getPath());
		
		for (int i=0;i<privileges.length;i++) {
			out.println(privileges[i].getName());
		}
		*/
		while (properties.hasNext()) {
			Property p = properties.nextProperty();
			PropertyDefinition propertyDefinition = p.getDefinition();
			String name = p.getName();
			String value = null;
			
			String readonlyClass = propertyDefinition.isProtected() ? "class=readonly" : "";
			if (p.isMultiple()) {
				Value v[] = p.getValues();
				String[] values =  new String[v.length];
				for (int i = 0; i < v.length; i++) {
					values[i] = v[i].getString();
				}
				value = StringUtils.join(values, ", ");
				
			} else {
				value = name.equals("jcr:data") ? "binary" : p.getString();
			}
%>
	<tr <%=readonlyClass %>>
		<td><%=name%><%= propertyDefinition.isMultiple()?"[]": "" %></td>
		<td><%=value%></td>
		<td>[
			 protected: <%= propertyDefinition.isProtected() %>, 
			 autoCreated: <%= propertyDefinition.isAutoCreated() %>, 
			 mandatory: <%= propertyDefinition.isMandatory() %>, 
			 multiple: <%= propertyDefinition.isMultiple() %>, 
			 type: <%= PropertyType.nameFromValue(propertyDefinition.getRequiredType()) %>
			 ]
		</td>
		<td class="actions">
			<% if (!propertyDefinition.isProtected()) { %>
				<span class="glyphicon glyphicon-pencil"></span> <span class="glyphicon glyphicon-remove"></span> 
			<% } %>
		</td>
	</tr>
<%
		}
	}
%>
</tbody>
</table>
</div>
</body>
</html>