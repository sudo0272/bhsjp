const fetchSignIn = () => {
    fetch('/check-account', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            id: accountId.value,
            password: accountPassword.value
        })
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'no-id': alert('아이디가 존재하지 않습니다'); break;
            case 'id-length-short':
            case 'id-length-long': alert('아이디의 길이는 1자리에서 10자리입니다'); break;
            case 'id-template-not-match': alert('아이디는 영문 혹은 숫자만 가능합니다'); break;
            case 'no-password': alert('비밀번호가 존재하지 않습니다'); break;
            case 'password-length-short': alert('비밀번호의 길이는 4자리 이상입니다'); break;
            case 'wrong': alert('아이디 또는 비밀번호가 잘못되었습니다'); break;
            case 'already-signed-in': alert('이미 로그인되어있습니다'); break;
            case 'ok': alert('로그인이 완료되었습니다');
        }
    });
};
