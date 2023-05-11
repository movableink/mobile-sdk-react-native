#import <React/RCTBridgeModule.h>

@interface RCT_EXTERN_MODULE(RNMovableInk, NSObject)

RCT_EXTERN_METHOD(multiply:(float)a withB:(float)b
                 withResolver:(RCTPromiseResolveBlock)resolve
                 withRejecter:(RCTPromiseRejectBlock)reject)

RCT_EXTERN_METHOD(start)

RCT_EXTERN_METHOD(resolveURL:(NSString *)link
                  withResolver:(RCTPromiseResolveBlock)resolve
                  withRejecter:(RCTPromiseRejectBlock)reject)

// RCT_EXPORT_METHOD(start)

+ (BOOL)requiresMainQueueSetup {
  return TRUE;
}

@end
