const goCustomPostList = targetPostList => {
    if (location.href.match(/\d+$/)[0] != targetPostList) {
        fetch('https://community.bhsjp.kro.kr/do-post-list-exist', {
            method: 'post',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                postList: targetPostList
            })
        }).then(res => {
            return res.text();
        }).then(text => {
            switch (text) {
                case 'number-format-not-match':
                case 'error':
                case 'no-list':
                    vex.dialog.alert('에러가 발생했습니다\n다시 시도해주세요');
                    break;
                case 'ok':
                    location.href = 'https://community.bhsjp.kro.kr/view-posts/' + targetPostList;
                    break;
            }
        });
    }
};
