function fetchFindId(email, callback) {
    fetch('https://accounts.bhsjp.kro.kr/id-lookup', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            email: email
        })
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'ok':
            case 'no-row':
                vex.dialog.alert({
                    unsafeMessage: messages.information.emailSent,
                    callback: () => {
                        location.href = 'https://accounts.bhsjp.kro.kr/sign-in';
                    }
                });

                break;

            case 'error':
                vex.dialog.alert({
                    unsafeMessage: messages.error.server
                });

                break;
        }
    }).catch(err => {
        console.error(err);

        vex.dialog.alert({
            unsafeMessage: messages.error.cannotConnectServer
        });
    });

    callback();
}
