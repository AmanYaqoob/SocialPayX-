import React, { useState } from 'react';

const Landing = () => {
  const [isPopupOpen, setPopupOpen] = useState(false);

  const handleDownloadClick = () => {
    setPopupOpen(true);
  };

  const closePopup = () => {
    setPopupOpen(false);
  };

  return (
    <div>
      <h1>Welcome to SocialPayX</h1>
      <div className="download-buttons">
        <button onClick={handleDownloadClick}>Download APK</button>
        <a href="https://play.google.com" target="_blank">Google Play</a>
        <a href="https://www.apple.com/app-store/" target="_blank">App Store</a>
      </div>
      {isPopupOpen && (
        <div className="popup">
          <div className="popup-content">
            <h2>Download APK</h2>
            <p>Click the button below to download the APK for Android.</p>
            <a href="/path/to/your/apkfile.apk" download className="download-link">Download APK</a>
            <button onClick={closePopup}>Close</button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Landing;
