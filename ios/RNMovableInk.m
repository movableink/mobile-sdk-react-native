#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNMovableInk, NSObject)

RCT_EXTERN_METHOD(start)
RCT_EXTERN_METHOD(setMIU:(NSString *)value)

RCT_EXTERN_METHOD(resolveURL:(NSString *)link
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(productSearched:(NSDictionary *)properties)
RCT_EXTERN_METHOD(productViewed:(NSDictionary *)properties)
RCT_EXTERN_METHOD(productAdded:(NSDictionary *)properties)
RCT_EXTERN_METHOD(productRemoved:(NSDictionary *)properties)
RCT_EXTERN_METHOD(orderCompleted:(NSDictionary *)properties)
RCT_EXTERN_METHOD(categoryViewed:(NSDictionary *)properties)
RCT_EXTERN_METHOD(logEvent:(NSString *)name withProperties:(NSDictionary *)properties)
RCT_EXTERN_METHOD(identifyUser)
RCT_EXTERN_METHOD(checkPasteboardOnInstall:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(showInAppMessage:(NSString *)link withCallback:(RCTResponseSenderBlock)callback)

RCT_EXTERN_METHOD(setAppInstallEventEnabled:(BOOL)enabled)
RCT_EXTERN_METHOD(setValidPasteboardValues:(NSArray *)values)


+ (BOOL)requiresMainQueueSetup {
  return TRUE;
}

@end
