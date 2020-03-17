function fetchChangePassword(verificationCode, password) {
    fetch('https://accounts.bhsjp.kro.kr/change-password', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            verificationCode: verificationCode,
            password: password
        })
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: '비밀번호가 변경되었습니다<br>로그인해주세요',
                    callback: () => {
                        location.href = 'https://accounts.bhsjp.kro.kr/sign-in';
                    }
                });

                break;

            case 'password-short':
                vex.dialog.alert({
                    unsafeMessage: '비밀번호는 4글자 이상입니다'
                });

                break;

            case 'error':
                vex.dialog.alert({
                    unsafeMessage: '서버 에러가 발생했습니다<br>다시 시도해주세요'
                });

                break;
        }
    });
}