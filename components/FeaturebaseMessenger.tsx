"use client";

import { useEffect } from "react";
import Script from "next/script";

const FeaturebaseMessenger = () => {
  useEffect(() => {
    const win = window as any;
    
    // Initialize Featurebase if it doesn't exist
    if (typeof win.Featurebase !== "function") {
      win.Featurebase = function () {
        (win.Featurebase.q = win.Featurebase.q || []).push(arguments);
      };
    }
    
    // Boot Featurebase messenger with configuration
    win.Featurebase("boot", {
      appId: process.env.NEXT_PUBLIC_FEATUREBASE_APP_ID || "YOUR_APP_ID_HERE",
      theme: "dark",
      language: "en",
    });
  }, []);

  return (
    <>
      {/* Load the Featurebase SDK */}
      <Script 
        src="https://do.featurebase.app/js/sdk.js" 
        id="featurebase-sdk" 
        strategy="afterInteractive"
      />
    </>
  );
};

export default FeaturebaseMessenger;


