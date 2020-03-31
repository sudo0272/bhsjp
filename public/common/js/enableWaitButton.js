const enableWaitButton = (button, text) => {
    text.classList.add('material-icons');
    text.classList.add('animated');
    text.classList.add('rotating');
    text.innerText = 'refresh';
    button.disabled = true;
};
