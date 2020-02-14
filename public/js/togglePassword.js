function togglePassword(passwordToggle, passwordToggleIcon, target) {
    passwordToggle.addEventListener('click', () => {
        if (passwordToggle.dataset.isShowing === 'true') {
            passwordToggleIcon.innerHTML = 'radio_button_unchecked';
            target.type = 'password';
            passwordToggle.dataset.isShowing = 'false';
        } else {
            passwordToggleIcon.innerHTML = 'radio_button_checked';
            target.type = 'text';
            passwordToggle.dataset.isShowing = 'true';
        }
    });
}
