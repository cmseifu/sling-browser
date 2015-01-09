<%@page session="false" contentType="text/html; charset=utf-8"
	trimDirectiveWhitespaces="true"%>
<%@taglib prefix="sling" uri="http://sling.apache.org/taglibs/sling/1.0"%>
<%@taglib prefix="c" uri="http://java.sun.com/jsp/jstl/core"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/functions" prefix="fn"%>
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
		<div id="mainErrorMsg" class="alert alert-danger errorMsg" style="display:none"></div>
		<span id="full-screen" class="glyphicon glyphicon-resize-full" title="full"></span>
		<span id="small-screen" class="glyphicon glyphicon-resize-small" title="small"></span>
		<ul id="pageTab" class="nav nav-tabs">
			<li><a href="#tabProperties" data-toggle="tab">Properties</a></li>
			<li><a href="#tabSearch" data-toggle="tab">Search</a></li>
		</ul>
		<div id="pageTabContent" class="tab-content">
			<div class="tab-pane" id="tabProperties">
				<iframe id="propertiesFrame" style="border:0px;width:100%;height:100%" src=""></iframe>
			</div>
			<div class="tab-pane" id="tabSearch">
				<form id="searchForm" action="/browser.search.html">
					<div class="input-group">
				      <input type="text" name="query" class="form-control" placeholder="Search by PATH, XPATH, SQL(2), or GQL" id="searchField">
				      <span class="input-group-btn">
				        <button class="btn btn-default" type="submit" id="searchSubmitBtn">Go!</button>
				      </span>
				    </div>
				</form>
				<div id="resultPanel"></div>
			</div>
			
		</div>
	</div>
</div>


<div class="screenLock"></div>
<ul id="contextMenu" class="dropdown-menu" role="menu" style="display:none" >
	<li data-action="refresh"><a tabindex="-1" href="#"><span class="fa fa-refresh" title=""></span> Refresh</a></li>
	<li class="divider"></li>
    <li data-action="add"><a tabindex="-1" href="#"><span class="fa fa-plus-circle" title=""></span> Add</a></li>
    <li data-action="delete"><a tabindex="-1" href="#"><span class="fa fa-trash" title=""></span> Delete</a></li>
    <li class="divider"></li>
    <li data-action="copy"><a tabindex="-1" href="#"><span class="fa fa-copy" title=""></span> Copy</a></li>
    <li data-action="rename"><a tabindex="-1" href="#"><span class="fa fa-wrench" title=""></span> Rename</a>
	    <div class="renameItem hide">
	    	<form id="renameForm"  method="post" action="" enctype="multipart/form-data">
		    	<input type="text" id="renameTo" name="renameTo" required pattern="[\w\:\.\s]+" value="" />
			</form>
	    </div>
    </li>
    <li class="clipboardOnly disabled" data-action="paste"><a tabindex="-1" href="#"><span class="fa fa-paste" title=""></span> Paste</a></li>
    <li class="clipboardOnly disabled" data-action="move"><a tabindex="-1" href="#"><span class="fa fa-arrows" title=""></span> Move</a></li>
</ul>


<div style="display:none">
	<li id="tabTmpl"><a data-toggle="tab"></a><span>x</span></li>
	<div id="tabContentTmpl" class="tab-pane"></div>
	
</div>



