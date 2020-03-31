const disableWaitButton = (button, text, originalText) => {
    text.classList.remove('material-icons');
    text.classList.remove('animated');
    text.classList.remove('rotating');
    text.innerText = originalText;
    button.disabled = false;
};
