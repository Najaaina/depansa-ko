import { useState } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";

GoogleSignin.configure({
  webClientId: "255470363771-2b7b8jkd4njhffchc33er1icsm7r1kdi.apps.googleusercontent.com",
  offlineAccess: false,
  scopes: ["profile", "email"],
});

export function useGoogleAuth(
  onSuccess: (idToken: string) => void, 
  onError: (message: string) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const idToken = userInfo.data?.idToken;
      if (!idToken) {
        onError("Google sign in failed: no token received.");
        return;
      }

      onSuccess(idToken); 

    } catch (error: any) {
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // rien
      } else if (error.code === statusCodes.IN_PROGRESS) {
        onError("Sign in already in progress.");
      } else if (error.code === statusCodes.PLAY_SERVICES_NOT_AVAILABLE) {
        onError("Google Play Services not available.");
      } else {
        onError("Google sign in failed. Please try again.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return { request: true, promptAsync: signIn, isLoading };
}