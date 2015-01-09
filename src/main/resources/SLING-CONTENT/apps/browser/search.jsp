<%@page import="org.apache.jackrabbit.commons.query.GQL"%>
<%@page import="javax.jcr.query.Query"%>
<%@page import="javax.jcr.query.Row"%>
<%@page import="javax.jcr.query.RowIterator"%>
<%@page import="javax.jcr.Session"%>
<%@page import="javax.jcr.Node"%>
<%@page import="java.util.Iterator"%>
<%@page 
	session="false"
    contentType="text/html; charset=utf-8"
    trimDirectiveWhitespaces="true"
%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0" %>
<sling:defineObjects />
<% 
	String queryStr = request.getParameter("query");
	String language = null;
	if (queryStr == null || queryStr.trim().length()==0) {
		response.setStatus(HttpServletResponse.SC_NOT_FOUND);
		return;
	}
	queryStr = queryStr.trim();
	// Detect query language
	if (queryStr.indexOf("//") == 0) {
		language = Query.XPATH;
	} else if (queryStr.startsWith("select")) {
		if (queryStr.indexOf('[') != -1) {
			language = Query.JCR_SQL2;
		} else {
			language = Query.SQL;
		}
	} 
	Session session = slingRequest.getResourceResolver().adaptTo(Session.class);
	if (session == null) {
		response.setStatus(HttpServletResponse.SC_NOT_FOUND);
		return;
	}

	long MAX_LIMIT = 5000;
	long DEFAULT_LIMIT = 50;
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
	RowIterator rows = null;
	if (language != null) {
		final Query query = session.getWorkspace().getQueryManager().createQuery(queryStr, language);
		query.setLimit(limit);
		query.setOffset(offset);
		rows= query.execute().getRows();
	} else {
		// GQL
		String limitStr = " limit:"+offset+".."+(offset+limit);
		StringBuilder sb = new StringBuilder();
		if (queryStr.indexOf(':') == -1) {
			sb.append("name:").append(queryStr).append(limitStr);
		} else if (queryStr.indexOf("limit:") == -1){
			sb.append(queryStr).append(limitStr);
		}
		rows = GQL.execute(sb.toString(), session);
	}
	if (rows != null && rows.hasNext()) { 
		while (rows.hasNext()) {
			Row row = rows.nextRow();
			out.println("<div><a href=\""+row.getPath()+"\">"+row.getPath()+"</a></div>");
		}
	} 
	
%>