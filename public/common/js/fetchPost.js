const fetchPost = (postId, password) => {
    fetch('https://community.bhsjp.kro.kr/get-post', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: postId,
            password: password,
            needComments: true,
            increaseViews: true
        })
    }).then(res => {
        return res.json();
    }).then(obj => {
        switch (obj.result) {
            case 'right':
                postNickname.innerHTML = obj.data.nickname ? obj.data.nickname : `<span><del>${messages.static.nonExistingUser}</del></span>`;
                postViews.innerText = obj.data.views;
                postDate.innerText = new Date(obj.data.date).toLocaleString();
                postContent.innerHTML = obj.data.content;

                if (obj.data.isModified) {
                    title.innerHTML += `<span class="post-edited">${messages.static.edited}</span>`;
                }

                for (let i of obj.data.comments) {
                    commentsContainer.innerHTML += `
                        <div class="comment-form">
                            <div class="comments ${i.isPrivate ? "private-comment" : ""}">
                                <div>
                                    ${i.nickname ? i.nickname : `<span><del>${messages.static.nonExistingUser}</del></span>`}&#58;&nbsp;${new Date(i.date).toLocaleString()}${i.isModified ? `&nbsp;(${messages.static.edited})` : ''}
                                </div>
                                
                                <div>
                                    ${i.content}
                                </div>
                            </div>
                            
                            ${(() => {
                                switch (i.userPermission) {
                                    case 'writer':
                                        return `
                                            <span class="configure-comment">
                                                <button class="edit-comment" data-target="${i.index}">${messages.static.edit}</button>
                                                <button class="delete-comment" data-target="${i.index}">${messages.static.delete}</button>
                                            </span>
                                        `;
                                    
                                    case 'postOwner':
                                        return `
                                            <span class="configure-comment">
                                                <button class="delete-comment" data-target="${i.index}">${messages.static.delete}</button>
                                            </span>
                                        `;
                                    
                                    case 'none':
                                        return ``;
                                }
                            })()}
                        </div>
                    `
                }

                for (const i of document.getElementsByClassName('edit-comment')) {
                    i.addEventListener('click', () => {
                        let root = i.parentElement.parentElement.firstElementChild;

                        quill.clipboard.dangerouslyPasteHTML(root.getElementsByTagName('div')[1].innerHTML);
                        isPrivateComment.checked = root.classList.contains('private-comment');
                        updateTarget = i.dataset.target;

                        newComment.style.display = 'none';
                        updateComment.style.display = 'block';
                        cancelUpdateComment.style.display = 'block';
                    });
                }

                for (const i of document.getElementsByClassName('delete-comment')) {
                    i.addEventListener('click', () => {
                        vex.dialog.confirm({
                            message: messages.confirm.deleteComment,
                            callback: value => {
                                if (value) {
                                    fetchDeleteComment(i.dataset.target);
                                }
                            }
                        });
                    });
                }

                break;

            case 'wrong':
                vex.dialog.open({
                    message: messages.request.inputPassword,
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
                    unsafeMessage: messages.error.noPost,
                    callback: () => {
                        history.back();
                    }
                });

                break;

            case 'error':
                vex.dialog.alert({
                    unsafeMessage: messages.error.server,
                    callback: () => {
                        vex.dialog.open({
                            message: messages.request.inputPassword,
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
    }).catch(err => {
        console.error(err);

        vex.dialog.alert({
            unsafeMessage: messages.error.cannotConnectServer
        });
    });
};
