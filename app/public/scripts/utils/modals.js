export function showModal(message) {
    const modal = document.getElementById('create-bid-form-modal');
    const modalOkButton = document.getElementById('modal-button');
    const modalMessage = document.getElementById('modal-message')

    modal.style.visibility = 'visible';
    modalMessage.innerHTML = message;

    modalOkButton.onclick = () => {
        modal.style.visibility = 'hidden';
    };
};