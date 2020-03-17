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
                    unsafeMessage: '로그아웃 할 수 없습니다'
                });

                break;

            case 'not-signed-in':
                vex.dialog.alert({
                    unsafeMessage: '로그인되어있지 않습니다'
                });

                break;

            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: '로그아웃되었습니다<br>홈페이지로 이동합니다',
                    callback: () => {
                        location.href = 'https://bhsjp.kro.kr';
                    }
                });

                break;
        }
    }).catch(err => {
        console.error(err);

        vex.dialog.alert({
            unsafeMessage: '서버와 통신할 수 없습니다<br>다시 시도해주세요'
        });
    });
};
