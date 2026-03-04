import * as WebBrowser from "expo-web-browser";
import * as Google from "expo-auth-session/providers/google";
import { useEffect, useState } from "react";
import { storageService } from "@/services/storage.service";
import type { GoogleUser } from "@/types/api.types";

WebBrowser.maybeCompleteAuthSession();

const GOOGLE_CLIENT_IDS = {
  androidClientId: "255470363771-d309sk28eqhg3h2fqg56ve33sie66svs.apps.googleusercontent.com",
  iosClientId: "255470363771-15uueij7snucifmor92kddtpgpe0tb5l.apps.googleusercontent.com",
  webClientId: "255470363771-2b7b8jkd4njhffchc33er1icsm7r1kdi.apps.googleusercontent.com",
};

export function useGoogleAuth(
  onSuccess: (user: { id: string; username: string }) => void,
  onError: (message: string) => void
) {
  const [isLoading, setIsLoading] = useState(false);

  const [request, response, promptAsync] = Google.useAuthRequest(GOOGLE_CLIENT_IDS);

  useEffect(() => {
    if (response?.type === "success") {
      handleGoogleResponse(response.authentication?.accessToken);
    } else if (response?.type === "error") {
      onError("Google authentication failed. Please try again.");
    }
  }, [response]);

  const handleGoogleResponse = async (accessToken?: string) => {
    if (!accessToken) {
      onError("No access token received from Google.");
      return;
    }

    setIsLoading(true);
    try {
      const res = await fetch("https://www.googleapis.com/userinfo/v2/me", {
        headers: { Authorization: `Bearer ${accessToken}` },
      });

      if (!res.ok) throw new Error("Failed to fetch Google profile");

      const googleUser: GoogleUser = await res.json();

      await storageService.saveGoogleSession(googleUser);

      onSuccess({
        id: googleUser.id,
        username: googleUser.name,
      });
    } catch (err) {
      onError("Failed to retrieve Google profile. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  return { request, promptAsync, isLoading };
}