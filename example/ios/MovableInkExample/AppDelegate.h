#import <RCTAppDelegate.h>
#import <UIKit/UIKit.h>
@class Braze;

@interface AppDelegate : RCTAppDelegate

@property (class, nonatomic, strong, readonly) Braze *braze;

@end
