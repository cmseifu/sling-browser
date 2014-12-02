<%@page import="org.apache.commons.lang.ArrayUtils"%>
<%@page import="javax.jcr.nodetype.NodeType"%>
<%@page import="javax.jcr.nodetype.NodeTypeIterator"%>
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
	z-index:1;
 }
 
 .readonly {
 	opacity:0.6;
 }
 
 .value-edit {
 	display:none;
 }
 
 .value-edit textarea {
 	width: 95%;
	resize: vertical;
 }
 
 .editing {
 	-webkit-user-select:none;
 	user-select:none;
 }
 .editing .value-edit {
 	display:block;
 }
 .editing .value-display {
 	display:none;
 }
 
.screenLock {
	position: fixed;
	width: 100%;
	height: 100%;
	min-height: 100%;
	max-height: 100%;
	top: 0;
	right: 0;
	padding: 0;
	margin: 0;
	background: rgba(255, 255, 255, 0.8);
	overflow-y: hidden;
	overflow-x: hidden;
	-moz-user-select: none;
	-webkit-user-select: none;
	-ms-user-select: none;
	user-select: none;
	z-index: -1; 
	line-height:normal;
	letter-spacing:normal;
}

body.lock .screenLock {
	z-index:100;
}

body.lock .value-edit {
	z-index:101;
}

.glyphicon {
	cursor:pointer;
}
.glyphicon:hover {
	color:red;
}

.glyphicon-ok:hover {
	color:green;
}

.value-edit:before {
	content: attr(title);
	display: inline-block;
	font-weight:bold;
	font-size:1.1em;
	color: #476C8A;
}


.value-edit {
	background-color: rgba(255, 255, 255, 0.90);
	border: 1px solid #999;
	box-shadow: 3px 5px 20px 2px #ddd;
	box-sizing: border-box;
	border-radius: 5px;
	padding:5px;
	width:100%;
}

.fieldItem {
	position:relative;
	float:left;
	padding:3px;
}

.fieldItem.single {
	width:100%;
}

.fieldItem input[type=text] {
	border:1px solid #999;
	padding:3px;
	
}

.fieldItem .glyphicon-remove-circle {
	left:-18px;
}

.value-edit .glyphicon-plus {
	float: left;
	top: 10px;
}

.clear {
	clear:both;
}

.mixinContainer {
	position: fixed;
	top: -500px;
	right: 0;
	padding: 0;
	margin: 0;
	background: rgba(255, 255, 255, 0.9);
	overflow-y: hidden;
	overflow-x: hidden;
	line-height:normal;
	letter-spacing:normal;
	transition:opacity 0.3s;
	width: 100%;
	height: 0%;
	transition:top 0.3s ease-in-out, height 0.1s ease-in-out;
	-webkit-transition:top 0.3s ease-in-out, height 0.1s ease-in-out;
}

body.lock .mixinContainer.editing {
	z-index: 101;
	top:0px;
	height:100%;
}

.mixinItem {
	padding: 3px;
	width: 250px;
	float:left;
	clear:right;
	white-space:nowrap;
}
.mixinItem>div {
	float: left;
	display:inline-block;
}
/* .browser-checkbox */
.browser-checkbox {
	width: 20px;
	position: relative;
	margin-right: 5px;
}

.browser-checkbox label {
	width: 20px;
	height: 20px;
	cursor: pointer;
	position: absolute;
	top: 0;
	left: 0;
	background: #fcfff4;
	border: 1px solid #999;
}

.browser-checkbox label:after {
	content: '';
	width: 9px;
	height: 5px;
	position: absolute;
	top: 4px;
	left: 4px;
	border: 3px solid #333;
	border-top: none;
	border-right: none;
	background: transparent;
	opacity: 0;
	-moz-transform: rotate(-45deg);
	-ms-transform: rotate(-45deg);
	-webkit-transform: rotate(-45deg);
	transform: rotate(-45deg);
}

.browser-checkbox label:hover::after {
	opacity: 0.3;
}

.browser-checkbox input[type=checkbox] {
	visibility: hidden;
}

.browser-checkbox input[type=checkbox]:checked+label::after {
	opacity: 1;
}


 </style>
  <script type="text/javascript" src="${staticRoot}/jquery-2.1.1.min.js"></script>
</head>
<body>
	<div class="container">
		<div class="btn-toolbar" role="toolbar" aria-label="...">
		  <div class="btn-group" role="group" aria-label="..."> 
		  	<button type="button" class="btn btn-default" id="mixinBtn">Mixins</button>
		  </div>
		</div>
		<table class="table table-condensed">
			<tbody>
				<thead>
					<tr>
						<th>Name</th>
						<th>Type</th>
						<th>Value</th>
						<%--><th>Status</th> --%>
						<th>Action</th>
					</tr>
				</thead>
						
			<%
				PropertyIterator properties = currentNode.getProperties();
				
				String resourceType = resource.getResourceType();
				String path = currentNode.getPath();
				if (properties != null) {
					Session session = currentNode.getSession();
					while (properties.hasNext()) {
						Property p = properties.nextProperty();
						PropertyDefinition propertyDefinition = p.getDefinition();
						String name = p.getName();
						String[] values = null;
						
						String readonlyClass = (propertyDefinition.isProtected() || name.equals("jcr:data")) ? "readonly" : "";
						if (p.isMultiple()) {
							Value v[] = p.getValues();
							values =  new String[v.length];
							for (int i = 0; i < v.length; i++) {
								values[i] = v[i].getString();
							}
							
						} else {
							values = new String[1];
							values[0] = name.equals("jcr:data") ? "binary" : p.getString();
						}
						String propertyType = PropertyType.nameFromValue(p.getType());
			%>
				<tr class="<%=readonlyClass%> alert" data-name="<%=name%>" data-type="<%=propertyType %>" data-multiple="<%=p.isMultiple() %>" >
					<td><%=name%></td>
					<td><%=propertyType %><%= propertyDefinition.isMultiple()?"[]": "" %></td>
					<td>
						<div class="value-display"><%= StringUtils.join(values,", ") %></div>
						<div class="value-edit" title="<%=name%>">
							<% for (String value:values) { %>
							<span><%=value%></span>
							<% } %>
						</div>
					</td>
					
					<td class="actions">
						<% if (!(propertyDefinition.isProtected() || name.equals("jcr:data"))) { %>
							<span class="glyphicon glyphicon-trash" title="delete this property"></span> 
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
	<div style="display:none">
		<form id="propertyFormTmpl"  method="post" action="${resource.path}" enctype="multipart/form-data">
			<%--
			<input type="hidden" name=":redirect" value="${slingRequest.requestURL}?editType=${param.editType}" />
			<input type="hidden" name=":errorpage" value="${slingRequest.requestURL}?editType=${param.editType}" />
			 --%>
			<div class="clear"></div>
			<span class="glyphicon glyphicon-ok" data-action="ok" title="save changes"></span> <span class="glyphicon glyphicon-remove"  data-action="cancel" title="cancel"></span>
		</form>
	</div>
	<form method="post" id="mixinForm" action="${resource.path}" enctype="multipart/form-data">
			<div class="mixinContainer">
			<% NodeTypeIterator nodeTypes = currentNode.getSession().getWorkspace().getNodeTypeManager().getMixinNodeTypes(); %>
				 <% 
				 	NodeType primaryType = currentNode.getPrimaryNodeType();
				    NodeType[] mixins = currentNode.getMixinNodeTypes();
				 	while(nodeTypes.hasNext()) { 
						NodeType nt = nodeTypes.nextNodeType();
						StringBuilder sb = new StringBuilder();
						if ( primaryType.equals(nt)) {
							sb.append("disabled ");
						} 
						if ( ArrayUtils.contains(mixins, nt)) {
							sb.append("checked ");
						}
						sb.append("value=\""+nt.getName()+"\"");
				 %>
				 <div class="mixinItem">
				 	<div class="browser-checkbox">
				 		<input type="checkbox" name="./jcr:mixinTypes" id="prop-<%=nt.getName() %>" <%=sb %> /> 
				  	 	<label for="prop-<%=nt.getName() %>"></label>
				 	</div>
					<div><%=nt.getName() %></div>
				 </div>
				 <% } %>
				<input type="hidden" name="./jcr:mixinTypes@Delete" value="" />
				<div class="clear"></div>
				<hr />
				<div class="alert alert-danger" style="display:none" id="mixinErrorMsg"></div>
				<button type="button" class="btn btn-default" id="mixinCancelBtn">Cancel</button>
				<button type="button" class="btn btn-primary" id="mixinSubmitBtn">Submit</button>
	</div>
				<!-- /.modal-content -->
			
	</form>
<!-- /.modal -->

	
	<div class="screenLock"></div>
	<script type="text/javascript" src="${staticRoot}/bootstrap-3.3.0/js/bootstrap.min.js"></script>
	<script>
		resourcePath = "${resource.path}";
	</script>
	<script src="${staticRoot}/edit/properties.js?t=<%=new java.util.Date().getTime() %>" type="text/javascript" charset="utf-8"></script>
</body>
</html>