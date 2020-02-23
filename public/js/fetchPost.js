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
                postDate.innerText = obj.data.date;
                postContent.innerHTML = obj.data.content;

                break;

            case 'wrong':
            case 'no-post':
                vex.dialog.open({
                    message: '비밀번호를 입력해주세요',
                    input: `
                        <input name="password" type="password">
                    `,
                    callback: (data) => {
                        fetchPost(postId, data.password);
                    }
                });

                break;

            case 'error':
                vex.dialog.alert('서버 에러가 발생했습니다');

                vex.dialog.open({
                    message: '비밀번호를 입력해주세요',
                    input: `
                        <input name="password" type="password">
                    `,
                    callback: (data) => {
                        fetchPost(postId, data.password);
                    }
                });

                break;
        }
    });
};
