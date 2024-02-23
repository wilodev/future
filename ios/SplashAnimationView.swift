import UIKit
import Foundation
import Lottie

@objc class SplashAnimationView: NSObject {

  @objc func createAnimationView(rootView: UIView, lottieName: String) -> AnimationView {
    let animationView = AnimationView(name: lottieName)
    animationView.frame = rootView.frame
    animationView.center = rootView.center
    animationView.backgroundColor = UIColor.init(red: 222, green: 0, blue: 165, alpha: 1.0);
    return animationView;
  }

  //@objc func play(animationView: AnimationView) {
  @objc func play(animationView: AnimationView) {
    animationView.play(
      completion: { (success) in
        RNSplashScreen.setAnimationFinished(true)
      }
    );
  }
}
