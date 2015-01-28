package org.apache.sling.browser.util;

import org.apache.sling.api.adapter.Adaptable;

public class AdaptUtil {

	public static <AdapterType> AdapterType adapt(Adaptable adaptable, Class<AdapterType> type) {
		return null==adaptable ? null :  adaptable.adaptTo(type);
	}

	public static <AdapterType> AdapterType adapt(Adaptable adaptable, Class<AdapterType> type, AdapterType defaultValue) {
		return null==adaptable ? defaultValue :  adaptable.adaptTo(type);
	}
}
