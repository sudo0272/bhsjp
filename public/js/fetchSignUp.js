const fetchSignUp = callback => {
    fetch('/create-account', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: accountId.value,
            password: accountPassword.value,
            nickname: accountNickname.value,
            email: accountEmail.value
        })
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'no-id':
                vex.dialog.alert({
                    unsafeMessage: messages.error.noId
                });

                break;

            case 'id-length-short':
            case 'id-length-long':
                vex.dialog.alert({
                    unsafeMessage: messages.error.idLength
                });

                break;

            case 'id-template-not-match':
                vex.dialog.alert({
                    unsafeMessage: messages.error.idTemplate
                });

                break;

            case 'no-password':
                vex.dialog.alert({
                    unsafeMessage: messages.error.noPassword
                });

                break;

            case 'password-length-short':
                vex.dialog.alert({
                    unsafeMessage: messages.error.passwordLength
                });

                break;

            case 'no-nickname':
                vex.dialog.alert({
                    unsafeMessage: messages.error.noNickname
                });

                break;

            case 'nickname-length-short':
            case 'nickname-length-long':
                vex.dialog.alert({
                    unsafeMessage: messages.error.nicknameLength
                });

                break;
            case 'no-email':
                vex.dialog.alert({
                    unsafeMessage: messages.error.noEmail
                });

                break;

            case 'email-length-short':
            case 'email-length-long':
                vex.dialog.alert({
                    unsafeMessage: messages.error.emailLength
                });
                break;

            case 'email-template-not-match':
                vex.dialog.alert({
                    unsafeMessage: messages.error.emailTemplate
                });

                break;

            case 'id-already-exists':
                vex.dialog.alert({
                    unsafeMessage: messages.error.idAlreadyJoined
                });

                break;

            case 'error':
                vex.dialog.alert({
                    unsafeMessage: messages.error.server
                });

                break;

            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: messages.information.successfullySignedUp,
                    callback: () => {
                        location.href = '/sign-in';
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

    callback();
};
