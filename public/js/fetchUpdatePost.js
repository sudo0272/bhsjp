const fetchUpdatePost = callback => {
    fetch('https://community.bhsjp.kro.kr/update-post', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: postTitle.value,
            password: postPassword.value,
            content: quill.container.firstChild.innerHTML,
            postId: postId
        })
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'not-signed-in':
                vex.dialog.alert({
                    unsafeMessage: '로그인되어있지 않습니다\n로그인 페이지로 이동합니다',
                    callback: () => {
                        location.href = 'https://accounts.bhsjp.kro.kr/sign-in';
                    }
                });

                break;

            case 'empty-content': vex.dialog.alert('글의 내용이 비어있습니다'); break;
            case 'empty-title': vex.dialog.alert('제목이 비어있습니다'); break;
            case 'error': vex.dialog.alert('서버 에러가 발생했습니다\n다시 시도해주세요'); break;
            case 'ok': vex.dialog.alert({
                unsafeMessage: '글이 수정되었습니다\n"글 보기" 페이지로 이동합니다',
                callback: () => {
                    location.href = 'https://community.bhsjp.kro.kr/view-posts/0';
                }
            });
        }
    });

    callback();
};
