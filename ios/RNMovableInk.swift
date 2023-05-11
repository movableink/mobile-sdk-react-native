import MovableInk

@objc(RNMovableInk)
public class RNMovableInk: NSObject {
  @objc(multiply:withB:withResolver:withRejecter:)
  public func multiply(
    a: Float,
    b: Float,
    resolve:RCTPromiseResolveBlock,
    reject:RCTPromiseRejectBlock
  ) {
    resolve(a*b)
  }
  
  @objc(start)
  public func start() {
    MIClient.start { _ in }
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
}
