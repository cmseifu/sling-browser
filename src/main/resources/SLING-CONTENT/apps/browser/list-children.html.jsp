<%@page import="java.util.Arrays"%>
<%@page 
	import="javax.jcr.Session"
	import="javax.jcr.RepositoryException"
	import="org.apache.jackrabbit.JcrConstants"
	import="javax.jcr.Node" 
	import="javax.jcr.NodeIterator"
	import="java.util.NoSuchElementException"
	
	session="false"
    contentType="text/html; charset=utf-8"
    trimDirectiveWhitespaces="true"
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling" %>
<sling:defineObjects />
<%! 
	private static final String[] SUPPORTED_EXTENSIONS = {
		"jsp","htm","html","java","css","txt","xml","js","json","jsonp","esp", "groovy", "md"
	};
%> 

<% 
	NodeIterator nodeIterator = null;
	String suffix = slingRequest.getRequestPathInfo().getSuffix();
	if (suffix == null) {
		response.setStatus(HttpServletResponse.SC_NOT_FOUND);
		return;
	}
	try {
		Session session=slingRequest.getResourceResolver().adaptTo(Session.class);
		nodeIterator = session.getNode(suffix).getNodes();
	} catch (RepositoryException e) {
		response.setStatus(HttpServletResponse.SC_NOT_FOUND);
		return;
	}

	long MAX_LIMIT = 5000;
	long DEFAULT_LIMIT = 50;
	long size =  nodeIterator.getSize();
	long offset = 0;
	long limit = DEFAULT_LIMIT;
	long count = 0;
	if (request.getParameter("offset") != null) {
		try {
			offset = Long.parseLong(request.getParameter("offset"));
		} catch (NumberFormatException nfe) {
			// ignore
		}
	}
	if (request.getParameter("limit") != null) {
		try {
			limit = Long.parseLong(request.getParameter("limit"));
			if (limit < 0 || limit >= MAX_LIMIT ) {
				limit = DEFAULT_LIMIT;
			}
		} catch (NumberFormatException nfe) {
			// ignore
		}
	}
	
	if (nodeIterator.hasNext()) { 
		try {
			nodeIterator.skip(offset);
			if (nodeIterator.hasNext()) {
				while (nodeIterator.hasNext()) {
					if (count++ == limit) {
						break;
					}
					Node node = nodeIterator.nextNode();
					String name = node.getName();
					String path = node.getPath();
					
					String primaryType = null;
					String fileExtension = null;
					if (node.isNodeType(JcrConstants.NT_FOLDER)) {
						primaryType = "folder";
					} else if (node.isNodeType(JcrConstants.NT_FILE)) {
						primaryType = "file";
						int typeIndex = path.lastIndexOf('.');
						if (typeIndex != -1) {
							String ext = path.substring(typeIndex+1);
							for (String extension:SUPPORTED_EXTENSIONS) {
								if (extension.equalsIgnoreCase(ext)) {
									fileExtension = ext;
									break;
								}
							}
						} else {
							String mimetype = node.getProperty("jcr:content/jcr:mimeType").getString().toLowerCase();
							if  (mimetype.equals("plain/text") || mimetype.equals("text/plain") || mimetype.equals("text/html")){
								fileExtension = "txt";
							}
						}
					} else {
						primaryType = "unstructured";
					}
					
					String dataEditable = node.getSession().hasPermission(node.getPath(), "read,remove,add_node,set_property") ? "data-editable=\"true\"" : "";
					String dataExtension = fileExtension!=null ?  "data-extension=\""+fileExtension+"\"" : "";
					StringBuilder span = new StringBuilder("<span class=\""+primaryType+"\">");
					if (node.isNodeType(JcrConstants.NT_FOLDER)) {
						span.append("<a href=\"/browser.html" + path+"\">" + name + "</a>");
					} else {
						span.append(name);
					} 
					span.append("</span>");
					
					/* put the mockups together */
					out.write(String.format(
							"<div %s %s data-type=\"%s\" data-id=\"%s\" data-path=\"%s\">%s (%s)</div>", 
							dataEditable, dataExtension, primaryType, node.getIdentifier(), path, span, primaryType != "file"? "": node.getProperty("jcr:content/jcr:mimeType").getString().toLowerCase())
					);
				}
			}
		} catch (NoSuchElementException e) {
			response.setStatus(HttpServletResponse.SC_NOT_FOUND); 
		}
	} else {
		response.setStatus(HttpServletResponse.SC_NOT_FOUND);
	}
	
%>