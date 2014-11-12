package org.apache.sling.browser.resource;

import java.util.Collections;
import java.util.Comparator;
import java.util.Iterator;
import java.util.LinkedList;
import java.util.List;

import javax.jcr.Node;
import javax.jcr.RepositoryException;
import javax.jcr.Session;

import org.apache.jackrabbit.JcrConstants;
import org.apache.sling.api.resource.AbstractResource;
import org.apache.sling.api.resource.Resource;
import org.apache.sling.api.resource.ResourceMetadata;
import org.apache.sling.api.resource.ResourceResolver;

public class BrowserResource extends AbstractResource {

	private final Resource resource;
	private Node node;
	private List<BrowserResource> children = null;

	/**
	 * @param resource
	 */
	public BrowserResource(Resource resource) {
		this.resource = resource;
		this.node = resource.adaptTo(Node.class);

	}

	public String getPath() {
		return this.resource.getPath();
	}

	public Resource unwrap() {
		return this.resource;
	}

	public ResourceMetadata getResourceMetadata() {
		return this.resource.getResourceMetadata();
	}

	public ResourceResolver getResourceResolver() {
		return this.resource.getResourceResolver();
	}

	public String getResourceSuperType() {
		return this.resource.getResourceSuperType();
	}

	public String getResourceType() {
		return "browser";
	}

	/**
	 * Get the under lying node
	 * 
	 * @return
	 */
	public Node getNode() {
		return this.node;
	}

	/**
	 * Get the size of the children
	 * 
	 * @return
	 * @throws RepositoryException
	 */
	public int getSize() throws RepositoryException {
		return getChildren().size();
	}

	public Session getSession() {
		return getResourceResolver().adaptTo(Session.class);
	}

	public Boolean isModfiable() {
		try {
			if (getSession().hasPermission(getPath(),"read,remove,add_node,set_property")) {
				return true;
			}
		} catch (RepositoryException e) {
			// ignore and return false
		}

		return false;
	}

	public BrowserResource getParent() {
		Resource parent = super.getParent();
		if (parent != null) {
			return new BrowserResource(parent);
		}
		return null;
	}

	public String getIdentifier() throws RepositoryException {
		if (!isNode()) {
			return null;
		}
		return getNode().getIdentifier();
	}
	
	public String getSimpleNodeType() throws RepositoryException {
		if (!isNode()) {
			return JcrConstants.NT_UNSTRUCTURED;
		} else if (this.node.isNodeType(JcrConstants.NT_FOLDER)) {
			return JcrConstants.NT_FOLDER;
		} else if (this.node.isNodeType(JcrConstants.NT_FILE)) {
			return JcrConstants.NT_FILE;
		}
		return JcrConstants.NT_UNSTRUCTURED;
	}

	/**
	 * Returns the folder only children
	 * 
	 * @return
	 * @throws RepositoryException
	 */
	public List<BrowserResource> getChildren() throws RepositoryException {
		if (this.children != null) {
			return this.children;
		}
		List<BrowserResource> list = new LinkedList<BrowserResource>();
		Iterator<Resource> children = listChildren();
		while (children.hasNext()) {
			Resource child = children.next();
			Node childNode = child.adaptTo(Node.class);
			if (childNode != null) {
				list.add(new BrowserResource(child));
			}
		}
		Collections.sort(list, new Comparator<BrowserResource>() {
			public int compare(BrowserResource o1, BrowserResource o2) {
				return o1.getName().compareTo(o2.getName());
			}
		});
		this.children = Collections.unmodifiableList(list);
		return this.children;
	}

	public boolean isNode() throws RepositoryException {
		return this.node != null;
	}

}
