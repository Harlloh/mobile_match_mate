import * as ExpoInAppUpdates from 'expo-in-app-updates';
import { useEffect, useRef } from 'react';
import { Platform } from 'react-native';

export default function AppUpdateChecker() {
  const checkInProgress = useRef(false);

  useEffect(() => {
    async function checkForAppUpdate() {
      // Google Play In-App Updates only works in installed Android release builds.
      if (__DEV__ || Platform.OS !== 'android' || checkInProgress.current) {
        return;
      }

      checkInProgress.current = true;

      try {
        const { updateAvailable, flexibleAllowed } =
          await ExpoInAppUpdates.checkForUpdate();

        if (updateAvailable && flexibleAllowed) {
          // Google Play displays and manages its native flexible-update flow.
          await ExpoInAppUpdates.startUpdate(false);
        }
      } catch (error) {
        // An update-check failure must never prevent the app from opening.
        if (__DEV__) console.warn('Could not check for a Play Store update:', error);
      } finally {
        checkInProgress.current = false;
      }
    }

    void checkForAppUpdate();
  }, []);

  return null;
}
