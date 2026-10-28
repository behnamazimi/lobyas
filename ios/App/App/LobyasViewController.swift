import Capacitor

/// The web view's controller, with the app's own plugin registered.
class LobyasViewController: CAPBridgeViewController {
    override func capacitorDidLoad() {
        bridge?.registerPluginInstance(LobyasNativePlugin())
    }
}
