package com.lobyas.app;

import android.text.format.DateFormat;
import com.getcapacitor.JSObject;
import com.getcapacitor.Plugin;
import com.getcapacitor.PluginCall;
import com.getcapacitor.PluginMethod;
import com.getcapacitor.annotation.CapacitorPlugin;

/** The app's own native calls for the web layer; see docs/native-bridge.md. */
@CapacitorPlugin(name = "LobyasNative")
public class LobyasNativePlugin extends Plugin {

    @PluginMethod
    public void getClock(PluginCall call) {
        JSObject result = new JSObject();
        result.put("is24Hour", DateFormat.is24HourFormat(getContext()));
        call.resolve(result);
    }
}
