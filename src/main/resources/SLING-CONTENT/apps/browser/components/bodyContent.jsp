<%@page session="false" contentType="text/html; charset=utf-8"
	trimDirectiveWhitespaces="true"%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@ taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
<sling:defineObjects/>
<!-- <div id="dock"></div> -->
<div class="header">
	<ul class="breadcrumb" id="currentPath"></ul>
	<a href="/system/sling/logout" id="logout">Logout</a>
</div>
<div class="content-main">
	<div class="col-a">
		<div id="browseTree"></div>
	</div>
	<div class="col-b">
			
		<ul id="pageTab" class="nav nav-tabs">
			<li><a href="#tabProperties" data-toggle="tab">Properties</a></li>
		</ul>
		<div id="pageTabContent" class="tab-content">
			<div class="tab-pane" id="tabProperties">
				<iframe id="propertiesFrame" style="border:0px;width:100%;height:100%" src=""></iframe>
			</div>
			
		</div>
	</div>
</div>

<div style="display:none">
	<li id="tabTmpl"><a data-toggle="tab"></a><span>x</span></li>
	<div id="tabContentTmpl" class="tab-pane"></div>
</div>


