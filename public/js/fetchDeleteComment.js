const fetchDeleteComment = commentId => {
    fetch('https://community.bhsjp.kro.kr/delete-comment', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            commentId: commentId
        })
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: '정상적으로 삭제되었습니다',
                    callback: () => {
                        location.reload();
                    }
                });

                break;

            case 'invalid-user': vex.dialog.alert('삭제 권한이 없습니다'); break;
            case 'no-row': vex.dialog.alert('댓글이 존재하지 않습니다'); break;
            case 'error': vex.dialog.alert('서버 에러가 발생했습니다\n다시 시도해주세요');
        }
    });
};
