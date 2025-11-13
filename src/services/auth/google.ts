import { Platform } from 'react-native'

export const configureGoogleSignin = () => {
  const webClientId = process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || ''
  const iosClientId = process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || undefined
  const androidClientId = process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || undefined

  // Lazy import to avoid web bundling issues
  let GoogleSignin: any
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin
  } catch (e) {
    throw new Error('Google Sign-In requires a development build (Expo Go is not supported). Build a dev client to use Google auth.')
  }
  GoogleSignin.configure({
    webClientId,
    iosClientId,
    offlineAccess: false,
    forceCodeForRefreshToken: false,
  })
}

export const signInWithGoogleNative = async () => {
  let GoogleSignin: any
  try {
    GoogleSignin = require('@react-native-google-signin/google-signin').GoogleSignin
  } catch (e) {
    throw new Error('Google Sign-In requires a development build (Expo Go is not supported). Build a dev client to use Google auth.')
  }
  await GoogleSignin.hasPlayServices({ showPlayServicesUpdateDialog: true })
  const result = await GoogleSignin.signIn()
  return result
}
