"use client";

import { useEffect } from 'react';
import OneSignal from 'react-onesignal';

export default function OneSignalInit() {
  
  useEffect(() => {
    const initOneSignal = async () => {
      try {
        await OneSignal.init({
          appId: process.env.NEXT_PUBLIC_ONESIGNAL_APP_ID || "", 
          allowLocalhostAsSecureOrigin: true, 
        });

        // Minta Izin Notifikasi (Pop-up Lonceng)
        OneSignal.Slidedown.promptPush(); 
      } catch (error) {
        console.log("OneSignal Error:", error);
      }
    };

    initOneSignal();
  }, []);

  return null; 
}