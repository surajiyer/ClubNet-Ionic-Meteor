App.configurePlugin('cordova-plugin-customurlscheme', {
    URL_SCHEME: 'clubnet'
});


// This section sets up some basic app metadata,
// the entire section is optional.
App.info({
  id: 'com.tue.clubnet',
  name: 'ClubNet',
  description: 'ClubNet is an application to aid coaches of youth football teams in organizing things and creating more engagement of the team.',
  author: 'The Brofessionals',
  website: 'http://thegreatmatch.com'
});


App.icons({
  // iOS
  // 'iphone_2x': 'public/icons/clubnet_icon.png',
  // 'iphone_3x': 'public/icons/clubnet_icon.png',
  // 'ipad': 'public/icons/clubnet_icon.png',
  // 'ipad_2x': 'public/icons/clubnet_icon.png',

  // Android
  'android_mdpi': 'resources/icon/android/mipmap-mdpi/ic_launcher.png',
  'android_hdpi': 'resources/icon/android/mipmap-hdpi/ic_launcher.png',
  'android_xhdpi': 'resources/icon/android/mipmap-xhdpi/ic_launcher.png',
  'android_xxhdpi': 'resources/icon/android/mipmap-xxhdpi/ic_launcher.png',
  'android_xxxhdpi': 'resources/icon/android/mipmap-xxxhdpi/ic_launcher.png'
});


// App.launchScreens({
//   'iphone': 'splash/Default~iphone.png',
//   'iphone_2x': 'splash/Default@2x~iphone.png',
//   // ... more screen sizes and platforms ...
// });


App.launchScreens({
  // // iOS
  // 'iphone': 'resources/splash/splash-320x480.png',
  // 'iphone_2x': 'resources/splash/splash-320x480@2x.png',
  // 'iphone5': 'resources/splash/splash-320x568@2x.png',
  // 'iphone6': 'resources/splash/splash-375x667@2x.png',
  // 'iphone6p_portrait': 'resources/splash/splash-414x736@3x.png',
  // 'iphone6p_landscape': 'resources/splash/splash-736x414@3x.png',

  // 'ipad_portrait': 'resources/splash/splash-768x1024.png',
  // 'ipad_portrait_2x': 'resources/splash/splash-768x1024@2x.png',
  // 'ipad_landscape': 'resources/splash/splash-1024x768.png',
  // 'ipad_landscape_2x': 'resources/splash/splash-1024x768@2x.png',


//created with:
//http://apetools.webprofusion.com/tools/imagegorilla
 // Android
  'android_ldpi_portrait': 'resources/splash/drawable-ldpi/screen.png',
  'android_ldpi_landscape': 'resources/splash/drawable-land-ldpi/screen.png',
  'android_mdpi_portrait': 'resources/splash/drawable-mdpi/screen.png',
  'android_mdpi_landscape': 'resources/splash/drawable-land-mdpi/screen.png',
  'android_hdpi_portrait': 'resources/splash/drawable-hdpi/screen.png',
  'android_hdpi_landscape': 'resources/splash/drawable-land-hdpi/screen.png',
  'android_xhdpi_portrait': 'resources/splash/drawable-xhdpi/screen.png',
  'android_xhdpi_landscape': 'resources/splash/drawable-land-xhdpi/screen.png'
});


// Set PhoneGap/Cordova preferences
// App.setPreference('BackgroundColor', '0xff0000ff');
// App.setPreference('HideKeyboardFormAccessoryBar', true);
// App.setPreference('Orientation', 'default');
// App.setPreference('Orientation', 'all', 'ios');
