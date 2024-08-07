import MovableInk

@objc(RNMovableInk)
public class RNMovableInk: NSObject {  
  @objc(start)
  public func start() {
    MIClient.start { _ in }
  }

  @objc(setMIU:)
  public func setMIU(value: String) {
    MIClient.setMIU(value)
  }

  @objc(setAppInstallEventEnabled:)
  public func setAppInstallEventEnabled(enabled: Bool) {
    MIClient.appInstallEventEnabled = enabled
  }
  
  @objc(resolveURL:withResolver:withRejecter:)
  public func resolveURL(
    link: String,
    resolve: @escaping RCTPromiseResolveBlock,
    reject: @escaping RCTPromiseRejectBlock
  ) {
    guard let url = URL(string: link) else {
      reject(
        "-1",
        "link could not be coerced to URL",
        NSError(domain: "com.movableink.sdk", code: -1)
      )
      
      return
    }
    
    if !MIClient.canHandleURL(url) {
      resolve(nil)
      return
    }
    
    MIClient.resolve(url: url) { result in
      switch result {
      case let .success(clickthrough):
        resolve(clickthrough.absoluteString)
        
      case let .failure(.failure(failedURL, message)):
        reject(
          "-1",
          "\(failedURL) - \(message)",
          NSError(domain: "com.movableink.sdk", code: -1)
        )
        
      default:
        reject(
          "-1",
          "failed to resolve link",
          NSError(domain: "com.movableink.sdk", code: -1)
        )
      }
    }
  }

  @objc(checkPasteboardOnInstall:withRejecter:)
  public func checkPasteboardOnInstall(resolve: @escaping RCTPromiseResolveBlock, reject: @escaping RCTPromiseRejectBlock) {
    Task {
      let value = await MIClient.checkPasteboardOnInstall()
      resolve(value?.absoluteString)
    }
  }

  @objc(showInAppMessage:withCallback:)
  public func showInAppMessage(link: String, callback: @escaping RCTResponseSenderBlock) {
    MIClient.showInAppMessage(with: link) { buttonID in
      callback([buttonID])
    }
  } 
  
  @objc(productSearched:)
  public func productSearched(properties: [String: Any]) {
    MIClient.productSearched(properties)
  }
  
  @objc(productViewed:)
  public func productViewed(properties: [String: Any]) {
    MIClient.productViewed(properties)
  }
  
  @objc(productAdded:)
  public func productAdded(properties: [String: Any]) {
    MIClient.productAdded(properties)
  }

  @objc(productRemoved:)
  public func productRemoved(properties: [String: Any]) {
    MIClient.productRemoved(properties)
  }
  
  @objc(orderCompleted:)
  public func orderCompleted(properties: [String: Any]) {
    MIClient.orderCompleted(properties)
  }
  
  @objc(categoryViewed:)
  public func categoryViewed(properties: [String: Any]) {
    MIClient.categoryViewed(properties)
  }

  @objc(logEvent:withProperties:)
  public func logEvent(name: String, properties: [String: Any]) {
    MIClient.logEvent(name: name, properties: properties)
  }
  
  @objc(identifyUser)
  public func identifyUser() {
    MIClient.identifyUser()
  }
  
  @objc(setValidPasteboardValues:)
  public func setValidPasteboardValues(values: [String]) {
    MIClient.validPasteboardValues = values
  }
}
