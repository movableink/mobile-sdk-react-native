import UIKit
import React
import BrazeKit
import braze_react_native_sdk
import MovableInk


@UIApplicationMain
class AppDelegate: UIResponder, UIApplicationDelegate {
  var window: UIWindow?
  static var braze: Braze?

  override init() {
    super.init()
  }

  func application(
    _ application: UIApplication,
    didFinishLaunchingWithOptions launchOptions: [UIApplication.LaunchOptionsKey : Any]? = nil
  ) -> Bool {


    DispatchQueue.main.async {

      guard let window = UIApplication.shared.windows.first,
            window.rootViewController != nil else {
        DispatchQueue.main.asyncAfter(deadline: .now() + 0.9) {
          self.initializeBraze()
        }
        return
      }

      self.initializeBraze()
    }

    return true
  }

  private func initializeBraze() {
    let configuration = Braze.Configuration(
      apiKey: "apiKey",
      endpoint: "endpoint"
    )

    configuration.logger.level = .info

    if let braze = BrazeReactBridge.perform(
      #selector(BrazeReactBridge.initBraze(_:)),
      with: configuration
    ).takeUnretainedValue() as? Braze {
      AppDelegate.braze = braze

    } else {
      print(" Failed to initialize Braze.")
    }
  }
}
