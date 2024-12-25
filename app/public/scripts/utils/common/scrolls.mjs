export function scrollToBottom(element) {
    element.scrollTop = element.scrollHeight;
};


export function scrollInputsIntoView() {
    const inputs = document.querySelectorAll('input, textarea');
    inputs.forEach((input) => {
        input.addEventListener('focus', () => {
            setTimeout(() => {
                input.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }, 300);
        });
    });
};
