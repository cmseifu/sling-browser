# Sling Browser
=============

Simple sling browser to explore the sling content repository, similar to default sling explorer or jcr-explorer.

Requires Sling 6.x+

## Installation

1. download the project from [sling-browser](https://github.com/cmseifu/sling-browser) source from github and extract the files 

2. run mvn install 

3. vist the sling system console on http://{host}:{port}/system/console

4. click on install/update button, select the target/{project}-SNAPSHOT.jar to be install

5. wait about 30 seconds or tail your console log for the package to be installed

6. visit http://{host}:{port}/browser.html and you're done.

## Browser supported

All modern browsers with HTML5 support.

## What is included

- Developed on [Bootstrap 3.3.0](http://getbootstrap.com/) and [jQuery 2.1.1](http://jquery.com/) for modern look and feel.
- Repository Explorer using [jQtree](http://mbraak.github.io/jqTree/)
- GUI with [Sling Post Servlet](http://sling.apache.org/documentation/bundles/manipulating-content-the-slingpostservlet-servlets-post.html) as server backend
- Copy/Paste/Duplicate/Move/Rename
- Color syntax editor for files using [Ace IO](http://ace.c9.io/)
- Add/Remove mixln
- Search by XPATH/JCR_SQL(2)/GQL
- Browser supported local storage for user profile (e.g. Refresh will restores all open tabs and last visited item)

