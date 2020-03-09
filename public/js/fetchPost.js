const fetchPost = (postId, password) => {
    fetch('https://community.bhsjp.kro.kr/get-post', {
        method: 'post',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify({
            postId: postId,
            password: password,
            needComments: true
        })
    }).then(res => {
        return res.json();
    }).then(obj => {
        switch (obj.result) {
            case 'right':
                postNickname.innerText = obj.data.nickname;
                postDate.innerText = isoDateToKoreanDate(obj.data.date);
                postContent.innerHTML = obj.data.content;

                if (obj.data.isModified) {
                    title.innerHTML += `<span class="post-edited">(수정됨)</span>`;
                }

                for (let i of obj.data.comments) {
                    commentsContainer.innerHTML += `
                        <div class="comment-form">
                            <div class="comments ${i.isPrivate ? "private-comment" : ""}">
                                <div>
                                    ${i.nickname}&#58;&nbsp;${isoDateToKoreanDate(i.date)}
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
                                                <button class="edit-comment" data-target="${i.index}">수정</button>
                                                <button class="delete-comment" data-target="${i.index}">삭제</button>
                                            </span>
                                        `;
                                    
                                    case 'postOwner':
                                        return `
                                            <span class="configure-comment">
                                                <button class="delete-comment" data-target="${i.index}">삭제</button>
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
                    });
                }

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
