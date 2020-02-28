const fetchPost = (postId, password) => {
    fetch('https://community.bhsjp.kro.kr/get-post', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: postId,
            password: password
        })
    }).then(res => {
        return res.json();
    }).then(obj => {
        switch (obj.result) {
        case 'right':
            postNickname.innerText = obj.data.nickname;
            postDate.innerText = obj.data.date
                .replace('-', '년 ')
                .replace('-', '월 ')
                .replace('T', '일 ')
                .replace(':', '시 ')
                .replace(':', '분')
                .substr(0, 21);
            postContent.innerHTML = obj.data.content;

            break;

        case 'wrong':
            vex.dialog.open({
                message: '비밀번호를 입력해주세요',
                input: `
                    <input name="password" type="password">
                `,
                callback: data => {
                    if (data) {
                        fetchPost(postId, data.password);
                    } else {
                        history.back()
                    }
                }
            });

            break;

        case 'no-post':
            vex.dialog.alert({
                unsafeMessage: '존재하지 않는 글입니다\n전 페이지로 이동합니다',
                callback: () => {
                    history.back();
                }
            });

            break;

        case 'error':
            vex.dialog.alert({
                unsafeMessage: '서버 에러가 발생했습니다',
                callback: () => {
                    vex.dialog.open({
                        message: '비밀번호를 입력해주세요',
                        input: `
                            <input name="password" type="password">
                        `,
                        callback: (data) => {
                            if (data) {
                                fetchPost(postId, data.password);
                            } else {
                                history.back()
                            }
                        }
                    });
                }
            });

            break;
        }
    });
};
