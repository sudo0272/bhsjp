const fetchUpdateComment = (commentId, callback) => {
    fetch('https://community.bhsjp.kro.kr/update-comment', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            commentId: commentId,
            isPrivate: isPrivateComment.checked,
            content: quill.container.firstChild.innerHTML
        })
    }).then(res => {
        return res.text();
    }).then(text => {
        switch (text) {
            case 'ok':
                vex.dialog.alert({
                    unsafeMessage: messages.information.commentEdited,
                    callback: () => {
                        location.reload();
                    }
                });

                break;

            case 'error':
                vex.dialog.alert({
                    unsafeMessage: messages.error.server
                });

                break;
        }

        callback();
    }).catch(err => {
        console.error(err);

        vex.dialog.alert({
            unsafeMessage: messages.error.cannotConnectServer
        });
    });
};
