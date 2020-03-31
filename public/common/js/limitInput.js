const limitInput = (elem, regex) => {
    elem.addEventListener('keydown', () => {
        elem.value = elem.value.replace(regex, '');
    });
};
