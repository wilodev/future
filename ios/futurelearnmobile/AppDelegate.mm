#import "AppDelegate.h"

#import <React/RCTBridge.h>
#import <React/RCTBundleURLProvider.h>
#import <React/RCTRootView.h>
#import <React/RCTConvert.h>

#import "RNSplashScreen.h"
#import "ExpoModulesCore-Swift.h"
#import "futurelearnmobile-Swift.h"
#import <Firebase.h>

#ifdef FB_SONARKIT_ENABLED
#import <FlipperKit/FlipperClient.h>
#import <FlipperKitLayoutPlugin/FlipperKitLayoutPlugin.h>
#import <FlipperKitUserDefaultsPlugin/FKUserDefaultsPlugin.h>
#import <FlipperKitNetworkPlugin/FlipperKitNetworkPlugin.h>
#import <SKIOSNetworkPlugin/SKIOSNetworkAdapter.h>
#import <FlipperKitReactPlugin/FlipperKitReactPlugin.h>

static void InitializeFlipper(UIApplication *application) {
    FlipperClient *client = [FlipperClient sharedClient];
    SKDescriptorMapper *layoutDescriptorMapper = [[SKDescriptorMapper alloc] initWithDefaults];
    [client addPlugin:[[FlipperKitLayoutPlugin alloc] initWithRootNode:application withDescriptorMapper:layoutDescriptorMapper]];
    [client addPlugin:[[FKUserDefaultsPlugin alloc] initWithSuiteName:nil]];
    [client addPlugin:[FlipperKitReactPlugin new]];
    [client addPlugin:[[FlipperKitNetworkPlugin alloc] initWithNetworkAdapter:[SKIOSNetworkAdapter new]]];
    [client start];
}
#endif

@implementation AppDelegate

- (BOOL)application:(UIApplication *)application didFinishLaunchingWithOptions:(NSDictionary *)launchOptions {
    self.moduleName = @"futurelearnmobile";
    self.initialProps = @{};
    [FIRApp configure];
#ifdef FB_SONARKIT_ENABLED
    InitializeFlipper(application);
#endif

    RCTBridge *bridge = [self.reactDelegate createBridgeWithDelegate:self launchOptions:launchOptions];
    RCTRootView *rootView = [self.reactDelegate createRootViewWithBridge:bridge
                                                             moduleName:@"futurelearnmobile"
                                                      initialProperties:nil];

    self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
    UIViewController *rootViewController = [self.reactDelegate createRootViewController];
    rootViewController.view = rootView;
    self.window.rootViewController = rootViewController;
    [self.window makeKeyAndVisible];

    BOOL success = [super application:application didFinishLaunchingWithOptions:launchOptions];
    if (success) {
      // Check if the device is in dark-mode
      BOOL isDarkMode = false;
      if (@available(iOS 13.0, *)) {
        isDarkMode = self.window.traitCollection.userInterfaceStyle == UIUserInterfaceStyleDark;
      }

      // Set the Lottie animation name based on the mode
      NSString *lottieName = isDarkMode ? @"animation_night" : @"animation";

      SplashAnimationView *t = [SplashAnimationView new];
      UIView *animationUIView = (UIView *)[t createAnimationViewWithRootView:rootView lottieName:lottieName];
      UIImage *backgroundImage = isDarkMode ? [UIImage imageNamed:@"launch_screen_night.png"] : [UIImage imageNamed:@"launch_screen_light.png"] ;
      animationUIView.backgroundColor = [UIColor colorWithPatternImage:backgroundImage];
      // register LottieSplashScreen to RNSplashScreen
      [RNSplashScreen showLottieSplash:animationUIView inRootView:rootView];

      // casting UIView type to AnimationView type
      AnimationView *animationView = (AnimationView *) animationUIView;

      // play
      [t playWithAnimationView:animationView];

      // If you want the animation layout to be forced to remove when hide is called, use this code
      [RNSplashScreen setAnimationFinished:true];
    }
    // return [super application:application didFinishLaunchingWithOptions:launchOptions];
    return success;
}

- (NSURL *)sourceURLForBridge:(RCTBridge *)bridge
{
#if DEBUG
  return [[RCTBundleURLProvider sharedSettings] jsBundleURLForBundleRoot:@"index"];
#else
  return [[NSBundle mainBundle] URLForResource:@"main" withExtension:@"jsbundle"];
#endif
}

@end
