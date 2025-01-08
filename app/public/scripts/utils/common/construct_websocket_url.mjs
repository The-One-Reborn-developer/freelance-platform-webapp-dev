export function constructWebSocketURL(telegramID, service, sessionID) {
    const queryParameters = new URLSearchParams({
        'telegram_id': telegramID,
        'service': service,
    });

    if (service === 'game') {
        queryParameters.append('session_id', sessionID);
    };

    return `wss://${window.location.host}?${queryParameters.toString()}`;
};
