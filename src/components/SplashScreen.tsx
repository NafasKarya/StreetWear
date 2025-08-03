// components/SplashScreen.tsx

import React from "react";

const SplashScreen: React.FC = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-br from-pink-300 to-purple-400">
      <div className="animate-spin rounded-full h-24 w-24 border-b-4 border-pink-600 mb-6"></div>
      <div className="text-3xl font-bold text-white tracking-wide mb-1">Nafas Karya Studio</div>
      <div className="text-base text-white opacity-70">Loading ...</div>
    </div>
  );
};

export default SplashScreen;
