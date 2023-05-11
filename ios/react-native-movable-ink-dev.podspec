require "json"

package = JSON.parse(File.read(File.join(__dir__, "../package.json")))

Pod::Spec.new do |s|
  s.name             = package['name']
  s.version          = package['version']
  s.summary          = package['description']
  # s.requires_arc = true
  s.authors      = "MovableInk <dev@movableink.com> (https://github.com/movableink)"
  s.license      = package['license']
  s.homepage     = package['homepage']
  s.platform     = :ios, "13.0"
  s.source       = { :git => "https://github.com/movableink/mobile-sdk-react-native.git", :tag => "#{s.version}" }
  s.source_files = "ios/**/*.{h,m,mm,swift}"

  # s.header_dir   = 'MovableInk'
  s.dependency 'MovableInk'
  s.dependency 'React' # to ensure the correct build order
end