function toggleSubMenu(e: Event, topMenuIcon: Element, subMenu: Element): void {
    const eTargetDataset = (<HTMLInputElement>e.target).dataset;

    if (eTargetDataset !== null) {
        if (eTargetDataset.isOpened === 'true') {
            topMenuIcon.innerHTML = 'keyboard_arrow_right';
            (<HTMLElement>subMenu).style.height = '0px';

            eTargetDataset.isOpened = 'false';
        } else {
            topMenuIcon.innerHTML = 'keyboard_arrow_down';
            (<HTMLElement>subMenu).style.height = 'auto';

            eTargetDataset.isOpened = 'true';
        }
    }
}
