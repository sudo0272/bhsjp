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
                    unsafeMessage: '아이디가 존재하지 않습니다'
                });

                break;

            case 'id-length-short':
            case 'id-length-long':
                vex.dialog.alert({
                    unsafeMessage: '아이디의 길이는 1자리에서 10자리입니다'
                });

                break;

            case 'id-template-not-match':
                vex.dialog.alert({
                    unsafeMessage: '아이디는 영문 혹은 숫자만 가능합니다'
                });

                break;

            case 'no-password':
                vex.dialog.alert({
                    unsafeMessage: '비밀번호가 존재하지 않습니다'
                });

                break;

            case 'password-length-short':
                vex.dialog.alert({
                    unsafeMessage: '비밀번호의 길이는 4자리 이상입니다'
                });

                break;

            case 'no-nickname':
                vex.dialog.alert({
                    unsafeMessage: '닉네임이 존재하지 않습니다'
                });

                break;

            case 'nickname-length-short':
            case 'nickname-length-long':
                vex.dialog.alert({
                    unsafeMessage: '닉네임의 길이는 1자리에서 10자리 입니다'
                });

                break;
            case 'no-email':
                vex.dialog.alert({
                    unsafeMessage: '이메일이 존재하지 않습니다'
                });

                break;

            case 'email-length-short':
            case 'email-length-long':
                vex.dialog.alert({
                    unsafeMessage: '이메일의 길이는 @을 포함하여 3자리에서 320자리입니다'
                });
                break;

            case 'email-template-not-match':
                vex.dialog.alert({
                    unsafeMessage: '이메일의 형식이 맞지 않습니다'
                });

                break;

            case 'id-already-exists':
                vex.dialog.alert({
                    unsafeMessage: '이미 존재하는 아이디입니다'
                });

                break;

            case 'error':
                vex.dialog.alert({
                    unsafeMessage: '서버 에러가 발생했습니다<br>다시 시도해 주세요'
                });

                break;

            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: '회원가입이 완료되었습니다<br>입력하신 메일로 인증메일이 발송되었으니 인증해주시고 로그인해주세요',
                    callback: () => {
                        location.href = '/sign-in';
                    }
                });

                break;
        }
    }).catch(err => {
        console.error(err);

        vex.dialog.alert({
            unsafeMessage: '서버와 통신할 수 없습니다.<br>다시 시도해주세요'
        });
    });

    callback();
};
