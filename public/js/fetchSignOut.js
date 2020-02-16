const fetchSignOut = () => {
    fetch('/sign-out', {
        method: 'post'
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'cannot-sign-out': alert('로그아웃 할 수 없습니다'); break;
            case 'not-signed-in': alert('로그인되어있지 않습니다'); break;
            case 'ok':
                alert('로그아웃되었습니다');
                alert('홈페이지로 이동합니다');

                location.href = 'https://bhsjp.kro.kr';

                break;
        }
    });
};
