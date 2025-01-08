export function handleGameSessionAd(messageData, validatedTelegramID, sessionID, socket) {
    console.log(`Received game session ad`);
    console.log(messageData);
    const videoPath = messageData.ad.ad_path;

    const videoContainer = document.getElementById('video-container');
    videoContainer.style.visibility = 'visible';

    const videoElement = document.getElementById('ad-video');
    const sourceElement = document.getElementById('ad-video-source');
    sourceElement.src = videoPath;
    videoElement.load();
    videoElement.play();

    videoElement.onended = () => {
        videoContainer.style.visibility = 'hidden';
        startGame(validatedTelegramID, sessionID, socket);
    };
};
