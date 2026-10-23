import Capacitor
import Foundation

/// The app's own native calls for the web layer; see docs/native-bridge.md.
@objc(LobyasNativePlugin)
public class LobyasNativePlugin: CAPPlugin, CAPBridgedPlugin {
    public let identifier = "LobyasNativePlugin"
    public let jsName = "LobyasNative"
    public let pluginMethods: [CAPPluginMethod] = [
        CAPPluginMethod(name: "getClock", returnType: CAPPluginReturnPromise)
    ]

    @objc func getClock(_ call: CAPPluginCall) {
        // The "j" template resolves to the user's 12 or 24-hour choice, not just the locale's default.
        let pattern = DateFormatter.dateFormat(fromTemplate: "j", options: 0, locale: Locale.current) ?? ""
        call.resolve(["is24Hour": !pattern.contains("a")])
    }
}
