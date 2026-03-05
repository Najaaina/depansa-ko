import { useState } from "react";
import {
  GoogleSignin,
  statusCodes,
} from "@react-native-google-signin/google-signin";
import { storageService } from "@/services/storage.service";
import type { GoogleUser } from "@/types/api.types";

GoogleSignin.configure({
  webClientId:
    "255470363771-2b7b8jkd4njhffchc33er1icsm7r1kdi.apps.googleusercontent.com",
  offlineAccess: false,
  scopes: ["profile", "email"],
});

export function useGoogleAuth(
  onSuccess: (user: { id: string; username: string }) => void,
  onError: (message: string) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  const signIn = async () => {
    setIsLoading(true);
    try {
      await GoogleSignin.hasPlayServices();
      const userInfo = await GoogleSignin.signIn();

      const googleUser: GoogleUser = {
        id: userInfo.data?.user.id ?? "",
        email: userInfo.data?.user.email ?? "",
        name: userInfo.data?.user.name ?? "",
        picture: userInfo.data?.user.photo ?? undefined,
      };

      console.log("Google user:", JSON.stringify(googleUser));

      await storageService.saveGoogleSession(googleUser);

      onSuccess({
        id: googleUser.id,
        username: googleUser.name,
      });
    } catch (error: any) {
      console.log("Google Sign-In error:", error);
      if (error.code === statusCodes.SIGN_IN_CANCELLED) {
        // Utilisateur a annulé — pas d'erreur à afficher
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

  return {
    request: true,
    promptAsync: signIn,
    isLoading,
  };
}