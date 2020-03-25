const fetchUpdatePost = callback => {
    fetch('https://community.bhsjp.kro.kr/update-post', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            title: postTitle.value,
            originalPassword: userPassword,
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
                    unsafeMessage: messages.error.notSignedIn,
                    callback: () => {
                        location.href = 'https://accounts.bhsjp.kro.kr/sign-in';
                    }
                });

                break;

            case 'empty-content':
                vex.dialog.alert({
                    unsafeMessage: messages.error.emptyPost
                });

                break;

            case 'empty-title':
                vex.dialog.alert({
                    unsafeMessage: messages.error.emptyPostTitle
                });

                break;

            case 'error':
                vex.dialog.alert({
                    unsafeMessage: messages.error.server
                });

                break;

            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: messages.information.postEdited,
                    callback: () => {
                        location.href = 'https://community.bhsjp.kro.kr/view-posts/0';
                    }
                });
        }
    }).catch(err => {
        console.error(err);

        vex.dialog.alert({
            unsafeMessage: messages.error.cannotConnectServer
        });
    });

    callback();
};
