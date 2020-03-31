const fetchSignOut = () => {
    fetch('https://accounts.bhsjp.kro.kr/sign-out', {
        method: 'post',
        mode: 'cors',
        credentials: 'include'
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'cannot-sign-out':
                vex.dialog.alert({
                    unsafeMessage: messages.error.cannotSignOut
                });

                break;

            case 'not-signed-in':
                vex.dialog.alert({
                    unsafeMessage: messages.error.notSignedIn,
                    callback: () => {
                        location.href = "https://accounts.bhsjp.kro.kr/sign-in"
                    }
                });

                break;

            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: messages.information.successfullySignedOut,
                    callback: () => {
                        location.href = 'https://bhsjp.kro.kr';
                    }
                });

                break;
        }
    }).catch(err => {
        console.error(err);

        vex.dialog.alert({
            unsafeMessage: messages.error.cannotConnectServer
        });
    });
};
