package com.lobyas.app;

import android.os.Bundle;
import android.webkit.CookieManager;
import android.webkit.WebResourceError;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import com.getcapacitor.Bridge;
import com.getcapacitor.BridgeActivity;
import com.getcapacitor.BridgeWebViewClient;
import java.util.Map;

public class MainActivity extends BridgeActivity {

    @Override
    public void onCreate(Bundle savedInstanceState) {
        // The bridge is built in super.onCreate, so the app's own plugin is registered first.
        registerPlugin(LobyasNativePlugin.class);
        super.onCreate(savedInstanceState);
        if (bridge != null) {
            bridge.setWebViewClient(new ConnectionErrorWebViewClient(bridge));
        }
    }

    /**
     * The WebView writes cookies to disk lazily, so a sign-in made just before the app is
     * closed (the first session after install) would be lost without this.
     */
    @Override
    public void onPause() {
        CookieManager.getInstance().flush();
        super.onPause();
    }

    /**
     * Capacitor loads the offline page for any HTTP error on a page, so a 404 or
     * 5xx would replace a working site. Here only a failed connection does, and
     * only when the site's service worker isn't there to answer it.
     */
    private static class ConnectionErrorWebViewClient extends BridgeWebViewClient {

        ConnectionErrorWebViewClient(Bridge bridge) {
            super(bridge);
        }

        @Override
        public void onReceivedHttpError(
            WebView view,
            WebResourceRequest request,
            WebResourceResponse errorResponse
        ) {}

        /**
         * Offline, the WebView reports the service worker's navigation preload as a
         * failed page load. The worker still answers with its offline page, which
         * Capacitor's offline.html would replace.
         */
        @Override
        public void onReceivedError(WebView view, WebResourceRequest request, WebResourceError error) {
            if (isNavigationPreload(request)) {
                return;
            }
            super.onReceivedError(view, request, error);
        }

        private static boolean isNavigationPreload(WebResourceRequest request) {
            Map<String, String> headers = request.getRequestHeaders();
            if (headers == null) {
                return false;
            }
            for (String name : headers.keySet()) {
                if ("Service-Worker-Navigation-Preload".equalsIgnoreCase(name)) {
                    return true;
                }
            }
            return false;
        }
    }
}
