const fetchSignUp = () => {
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
            case 'no-id': alert('아이디가 존재하지 않습니다'); break;
            case 'id-length-short':
            case 'id-length-long': alert('아이디의 길이는 1자리에서 10자리입니다'); break;
            case 'id-template-not-match': alert('아이디는 영문 혹은 숫자만 가능합니다'); break;
            case 'no-password': alert('비밀번호가 존재하지 않습니다'); break;
            case 'password-length-short': alert('비밀번호의 길이는 4자리 이상입니다'); break;
            case 'no-nickname': alert('닉네임이 존재하지 않습니다'); break;
            case 'nickname-length-short':
            case 'nickname-length-long': alert('닉네임의 길이는 1자리에서 10자리 입니다'); break;
            case 'no-email': alert('이메일이 존재하지 않습니다'); break;
            case 'email-length-short':
            case 'email-length-long': alert('이메일의 길이는 @을 포함하여 3자리에서 320자리입니다'); break;
            case 'email-template-not-match': alert('이메일의 형식이 맞지 않습니다'); break;
            case 'id-already-exists': alert('이미 존재하는 아이디입니다'); break;
            case 'ok': alert('회원가입이 완료되었습니다'); break;
        }
    });
};
