#import "AppDelegate.h"
#import <React/RCTBundleURLProvider.h>
#import <MovableInk/MovableInk-Swift.h>
#import <React/RCTLinkingManager.h>
#import <BrazeKit/BrazeKit-Swift.h>

@implementation AppDelegate

static Braze *_braze = nil;

+ (Braze *)braze {
  return _braze;
}

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions
{
  self.moduleName = @"MovableInkExample";
  self.initialProps = @{};
  
  BOOL result = [super application:application didFinishLaunchingWithOptions:launchOptions];
  
  // may need to remove this here and use the ts configg
  BRZConfiguration *configuration = [[BRZConfiguration alloc]
    initWithApiKey:@"8c670cd2-bddf-42ce-b44a-lastpart"
    endpoint:@"sdk.iad-03.braze.com"];
    
  configuration.logger.level = BRZLoggerLevelInfo;
  
  _braze = [[Braze alloc] initWithConfiguration:configuration];
  
  NSLog(@" Braze initialized in iOS");
  
  [[UIApplication sharedApplication] registerForRemoteNotifications];
  
  return result;
}


- (void)application:(UIApplication *)application didRegisterForRemoteNotificationsWithDeviceToken:(NSData *)deviceToken {
  NSLog(@"Push deviceToken %@", deviceToken);
  [_braze.notifications registerDeviceToken:deviceToken];
}

- (void)application:(UIApplication *)application didFailToRegisterForRemoteNotificationsWithError:(NSError *)error {
  NSLog(@" Failed to register for push: %@", error.localizedDescription);
}


- (BOOL)application:(UIApplication *)app openURL:(NSURL *)url options:(NSDictionary<UIApplicationOpenURLOptionsKey,id> *)options {
  return [RCTLinkingManager application:app openURL:url options:options];
}

- (BOOL)application:(UIApplication *)application continueUserActivity:(NSUserActivity *)userActivity restorationHandler:(void (^)(NSArray<id<UIUserActivityRestoring>> * _Nullable))restorationHandler {
  return [RCTLinkingManager application:application
                   continueUserActivity:userActivity
                     restorationHandler:restorationHandler];
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

- (BOOL)concurrentRootEnabled
{
  return true;
}

@end
