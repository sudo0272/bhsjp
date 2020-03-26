const pug = require('pug');
const path = require('path');

const viewPath = path.join(__dirname, '../views');

function compile(view) {
    return pug.compileFile(`${viewPath}/${view}.pug`);
}

module.exports = {
    accounts: {
        index: compile('accounts/index'),
        findId: compile('accounts/find-id'),
        findPassword: compile('accounts/find-password'),
        privacy: compile('accounts/privacy'),
        resetPassword: compile('accounts/reset-password'),
        signIn: compile('accounts/sign-in'),
        signUp: compile('accounts/sign-up'),
        verificationFailure: compile('accounts/verification-failure'),
        verificationSuccess: compile('accounts/verification-success')
    },
    community: {
        index: compile('community/index'),
        fixPost: compile('community/fix-post'),
        newPost: compile('community/new-post'),
        readPost: compile('community/read-post'),
        viewPosts: compile('community/view-posts')
    },
    errors: {
        '403': compile('errors/403'),
        '404': compile('errors/404'),
        '500': compile('errors/500')
    },
    introduce: {
        index: compile('introduce/index'),
        project: compile('introduce/project'),
        developer: compile('introduce/developer')
    },
    index: compile('index')
};
