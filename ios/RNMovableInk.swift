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
  
  @objc(orderCompleted:)
  public func orderCompleted(properties: [String: Any]) {
    MIClient.orderCompleted(properties)
  }
  
  @objc(categoryViewed:)
  public func categoryViewed(properties: [String: Any]) {
    MIClient.categoryViewed(properties)
  }
  
  @objc(identifyUser)
  public func identifyUser() {
    MIClient.identifyUser()
  }
}
