<%@page import="javax.jcr.nodetype.NodeTypeIterator"%>
<%@page import="javax.jcr.nodetype.NodeType"%>
<%@page session="false" contentType="text/html; charset=utf-8"
	trimDirectiveWhitespaces="true"%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<sling:defineObjects/>
<form id="new-form" method="post">
	<div id="newModal" class="modal fade">
		<div class="modal-dialog">
			<div class="modal-content">
				<div class="modal-header">
					<h4 class="modal-title">New Child</h4>
				</div>
				<div class="modal-body">
					<div class="alert alert-danger errorMsg" style="display:none"></div>
					<div class="input-group-btn">
						<input type="text" class="form-control" id="newNodeName" required pattern="[\w\:\.\s\,]+" placeholder="child name"/>
						<%
							NodeTypeIterator nodeTypes = currentNode.getSession().getWorkspace().getNodeTypeManager().getPrimaryNodeTypes();
						%>
						<select class="form-control" name="jcr:primaryType" id="nodeTypeSelect">
							<option value="nt:file" data-file="true">nt:file</option>
							<option value="sling:Folder">sling:Folder</option>
							<option value="nt:folder">nt:folder</option>
							<%
								while(nodeTypes.hasNext()) { 
								NodeType nt = nodeTypes.nextNodeType();
								// Place the common use on top
								if (nt.getName().equals("nt:folder") || nt.getName().equals("nt:file") || nt.getName().equals("sling:Folder")) {
									continue;
								}
							 %>
							 <option <%=nt.isNodeType("nt:file") ? "data-file=true" : "" %> value="<%=nt.getName() %>"><%=nt.getName() %></option>
							 <% } %>
						</select>
					</div>
						<!-- Secret to simulate a enter=submit -->
						<input type="submit" style="visibility: hidden" />
					
				</div>
				<div class="modal-footer">
					<button type="button" class="btn btn-default" data-dismiss="modal">Cancel</button>
					<span class="btn btn-primary" id="createBtn">Create</span>
				</div>
			</div>
			<!-- /.modal-content -->
		</div>
		<!-- /.modal-dialog -->
	</div>
	<!-- /.modal -->
</form>