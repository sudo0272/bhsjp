const express = require('express');
const bodyParser = require('body-parser');
const Account = require('../controllers/Account');
const expressSession = require('express-session');
const cors = require('cors');
const RedisStore = require('connect-redis')(expressSession);
const RedisData = require('../models/RedisData');
const SessionData = require('../models/SessionData');
const redisClient = new RedisData().getClient();
const morgan = require('morgan');
const Aes256 = require('../lib/Aes256');
const Sha512 = require('../lib/Sha512');
const nodemailer = require('nodemailer');
const NodemailerData = require('../models/NodemailerData');
const VerificationData = require('../models/VerificationData');
const i18n = require('i18n');
const cookieParser = require('cookie-parser');
const I18nData = require('../models/I18nData');
const i18nData = new I18nData();
const util = require('util');
const corsWhiteList = [
    'https://bhsjp.kro.kr',
    'https://introduce.bhsjp.kro.kr',
    'https://accounts.bhsjp.kro.kr',
    'https://community.bhsjp.kro.kr'
];

const nodemailerData = new NodemailerData();

const transporter = nodemailer.createTransport({
    service: nodemailerData.getService(),
    auth: {
        user: nodemailerData.getEmailAddress(),
        pass: nodemailerData.getPassword()
    }
});

const sessionData = new SessionData();

const accountsRouter = express.Router();

accountsRouter.use(bodyParser.urlencoded({
    extended: true
}));

accountsRouter.use(bodyParser.json());
accountsRouter.use(bodyParser.raw());

accountsRouter.use(expressSession({
    secret: sessionData.getSecret(),
    resave: sessionData.getResave(),
    saveUninitialized: sessionData.getSaveUninitialized(),
    store: eval(sessionData.getStore()),
    cookie: {
        secure: sessionData.getCookieSecure(),
        name: sessionData.getCookieName(),
        domain: sessionData.getCookieDomain(),
        httpOnly: sessionData.getCookieHttpOnly(),
        maxAge: sessionData.getMaxAge()
    }
}));

accountsRouter.use(morgan(':remote-addr - :remote-user [:date[iso]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent"'));

morgan.token('remote-user', (req, res) => {
    return (req.session && req.session.user) ? req.session.user.id : '-';
});

accountsRouter.use(cookieParser());

i18n.configure({
    locales:       i18nData.getLocales(),
    defaultLocale: i18nData.getDefaultLocale(),
    cookie:        i18nData.getCookieName(),
    directory:     i18nData.getDirectoryPath(),
    updateFiles:   i18nData.getUpdateFiles(),
    register:      i18nData.getRegister()
});

accountsRouter.use(i18n.init);

accountsRouter.all('/*', (req, res, next) => {
    res.header('Access-Control-Allow-Origin', corsWhiteList);
    res.header('Access-Control-Allow-Headers', 'X-Requested-With');
    res.header('Access-Control-Allow-Credentials', 'true');

    next();
});

accountsRouter.get('/', (req, res) => {
    const __accounts = __('accounts');

    res.render('accounts/index', {
        title: __accounts.title,
        isSignedIn: !!req.session.user
    });
});

accountsRouter.get('/sign-in', (req, res) => {
    const __accounts = __('accounts');

    res.render('accounts/sign-in', {
        title: __accounts.signIn.title,
        isSignedIn: !!req.session.user
    });
});

accountsRouter.get('/sign-up', (req, res) => {
    const __accounts = __('accounts');

    res.render('accounts/sign-up', {
        title: __accounts.signUp.title,
        isSignedIn: !!req.session.user
    });
});

accountsRouter.post('/create-account', (req, res) => {
    const id = req.body.id;
    const password = req.body.password;
    const nickname = req.body.nickname;
    const email = req.body.email;
    const account = new Account();

    const __mail = __('mail');

    if (id === undefined) {
        res.send('no-id');
    } else if (id.length < 1) {
        res.send('id-length-short');
    } else if (id.length > 10) {
        res.send('id-length-long');
    } else if (id.match(/^\w{1,10}$/g) === null) {
        res.send('id-template-not-match');
    } else if (password === undefined) {
        res.send('no-password');
    } else if (password.length < 4) {
        res.send('password-length-short');
    } else if (nickname === undefined) {
        res.send('no-nickname');
    } else if (nickname.length < 1) {
        res.send('nickname-length-short');
    } else if (nickname.length > 10) {
        res.send('nickname-length-long');
    } else if (email === undefined) {
        res.send('no-email');
    } else if (email.length < 3) { // 3: /.@./
        res.send('email-length-short');
    } else if (email.length > 320) {
        res.send('email-length-long');
    } else if (email.match(/^[^@]{1,64}@[^@]{1,255}$/) === null) {
        res.send('email-template-not-match');
    } else {
        account
            .doIdExist(id)
            .then(() => {
                res.send('id-already-exists');
            }, () => {
                account
                    .doEmailExist(email)
                    .then(() => {
                        res.send('email-already-exists');
                    }, () => {
                        account
                            .doNicknameExist(nickname)
                            .then(() => {
                                res.send('nickname-already-exists');
                            }, () => {
                                account
                                    .create(id, password, nickname, email)
                                    .then(() => {
                                        const userCertificationAddress = 'https://accounts.bhsjp.kro.kr/auth/' + new Aes256(id, 'plain', nodemailerData.getUserCertificationKey(), nodemailerData.getUserCertificationIv()).getEncrypted();

                                        transporter.sendMail({
                                            from: nodemailerData.getEmailAddress(),
                                            to: email,
                                            subject: __mail.signUp.subject,
                                            html: util.format(__mail.signUp.html.join(''), userCertificationAddress, userCertificationAddress)
                                        });

                                        res.send('ok');
                                    }).catch(error => {
                                        console.error(error);

                                        res.send('error');
                                    }
                                );
                            }).catch(error => {
                                res.send('error');
                                console.error(error);
                            }
                        );
                    }).catch(error => {
                        res.send('error');
                        console.error(error);
                    }
                );
            }
        );
    }
});

accountsRouter.post('/check-account', (req, res) => {
    const id = req.body.id;
    const password = req.body.password;
    const account = new Account();

    if (id === undefined) {
        res.send('no-id');
    } else if (id.length < 1) {
        res.send('id-length-short');
    } else if (id.length > 10) {
        res.send('id-length-long');
    } else if (id.match(/^\w{1,10}$/g) === null) {
        res.send('id-template-not-match');
    } else if (password === undefined) {
        res.send('no-password');
    } else if (password.length < 4) {
        res.send('password-length-short');
    } else {
        account
            .doAccountExist(id, password)
            .then(accountData => {
                if (req.session.user) {
                    res.send('already-signed-in');
                } else {
                    account
                        .isVerified(accountData.index)
                        .then(isVerified => {
                            if (isVerified) {
                                req.session.user = {
                                    id: new Aes256(accountData.id, 'encrypted').getPlain(),
                                    nickname: new Aes256(accountData.nickname, 'encrypted').getPlain(),
                                    email: new Aes256(accountData.email, 'encrypted').getPlain(),
                                    index: accountData.index
                                };

                                res.send('ok');
                            } else {
                                res.send('not-verified');
                            }
                        }).catch(error => {
                            console.error(error);

                            res.send('error');
                        }
                    );
                }
            }, () => {
                setTimeout(() => {
                    res.send('wrong');
                }, 3000);
            }).catch(error => {
                console.error(error);

                res.send('error');
            }
        );
    }
});

accountsRouter.post('/sign-out', cors({
    origin: (origin, callback) => {
        if (corsWhiteList.indexOf(origin) !== -1) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    }
}), (req, res) => {
    if (req.session.user) {
        req.session.destroy(error => {
            if (error) {
                res.send('cannot-sign-out');
            } else {
                res.send('ok');
            }
        });
    } else {
        res.send('not-signed-in');
    }
});

accountsRouter.get('/auth/:verificationCode', (req, res) => {
    const verificationCode = req.params.verificationCode;
    const nodemailerData = new NodemailerData();
    const account = new Account();
    const id = new Aes256(verificationCode, 'encrypted', nodemailerData.getUserCertificationKey(), nodemailerData.getUserCertificationIv()).getPlain();
    const __accounts = __('accounts');

    account
        .doIdExist(id)
        .then(() => {
            account
                .getIndexByEncryptedId(new Aes256(id, 'plain').getEncrypted())
                .then(index => {
                    account
                        .setToVerified(index)
                        .then(() => {
                            res.render('accounts/verification-success', {
                                title: __accounts.verificationSuccess.title,
                                isSignedIn: !!req.session.user
                            });
                        }).catch(error => {
                            console.error(error);
                            
                            res.render('error/500', {
                                title: '500 Internal Server Error',
                                isSignedIn: !!req.session.user
                            });
                        }
                    );
                }, () => {
                    res.render('accounts/verification-failure', {
                        title: __accounts.verificationFailure.title,
                        isSignedIn: !!req.session.user
                    });
                }).catch(error => {
                    console.error(error);

                    res.render('error/500', {
                        title: '500 Internal Server Error',
                        isSignedIn: !!req.session.user
                    });
                }
            );
        }, () => {
            res.render('accounts/verification-failure', {
                title: __accounts.verificationFailure.title,
                isSignedIn: !!req.session.user
            });
        }).catch(error => {
            console.error(error);

            res.render('error/500', {
                title: '500 Internal Server Error',
                isSignedIn: !!req.session.user
            });
        }
    );
});

accountsRouter.get('/find-id', (req, res) => {
    const __accounts = __('accounts');

    res.render('accounts/find-id', {
        'title': __accounts.findId.title,
        'isSignedIn': req.session.user
    });
});

accountsRouter.post('/id-lookup', (req, res) => {
    const account = new Account();
    const email = req.body.email;
    const __mail = __('mail');

    account
        .getIndexByEncryptedEmail(new Aes256(email, 'plain').getEncrypted())
        .then(index => {
            account
                .getDataByIndex(index)
                .then(data => {
                    const id = new Aes256(data.id, 'encrypted').getPlain();

                    transporter.sendMail({
                        from: nodemailerData.getEmailAddress(),
                        to: email,
                        subject: __mail.usernameFound.subject,
                        html: util.format(__mail.usernameFound.html.join(''), id)
                    });

                    res.send('ok');
                }, reason => {
                    transporter.sendMail({
                        from: nodemailerData.getEmailAddress(),
                        to: email,
                        subject: __mail.usernameNotFound.subject,
                        html: __mail.usernameNotFound.html.join('')
                    });

                    res.send(reason);
                }).catch(error => {
                    console.error(error);

                    res.send('error');
                }
            );
        }, reason => {
            transporter.sendMail({
                from: nodemailerData.getEmailAddress(),
                to: email,
                subject: __mail.usernameNotFound.subject,
                html: __mail.usernameNotFound.html.join('')
            });

            res.send(reason);
        }).catch(error => {
            console.error(error);

            res.send('error');
        }
    );
});

accountsRouter.get('/find-password', (req, res) => {
    const __accounts = __('accounts');

    res.render('accounts/find-password', {
        'title': __accounts.findPassword.title,
        'isSignedIn': req.session.user
    });
});

accountsRouter.post('/password-lookup', (req, res) => {
    const account = new Account();
    const verificationData = new VerificationData();
    const id = req.body.id;
    const encryptedId = new Aes256(id, 'plain').getEncrypted();
    const verificationEncryptedId = new Aes256(id, 'plain', verificationData.getEncryptionKey(), verificationData.getEncryptionIv()).getEncrypted();
    const email = req.body.email;
    const encryptedEmail = new Aes256(email, 'plain').getEncrypted();
    const resetPasswordAddress = "https://accounts.bhsjp.kro.kr/reset-password/" + verificationEncryptedId;

    const __mail = __('mail');

    account
        .getData({
            id: encryptedId,
            email: encryptedEmail
        }).then(result => {
            transporter.sendMail({
                from: nodemailerData.getEmailAddress(),
                to: email,
                subject: __mail.passwordReset.subject,
                html: util.format(__mail.passwordReset.html.join(''), resetPasswordAddress, resetPasswordAddress)
            });

            res.send('ok');

        }, reason => {
            transporter.sendMail({
                from: nodemailerData.getEmailAddress(),
                to: email,
                subject: __mail.accountNotFound.subject,
                html: __mail.accountNotFound.html.join('')
            });

            res.send(reason);

        }).catch(error => {
            console.error(error);

            res.send('error');
        }
    );
});
accountsRouter.get('/reset-password/:verificationCode', (req, res) => {
    const verificationCode = req.params.verificationCode;
    const account = new Account();
    const verificationData = new VerificationData();
    let encryptedId;

    const __accounts = __('accounts');
    
    try {
        encryptedId = new Aes256(new Aes256(verificationCode, 'encrypted', verificationData.getEncryptionKey(), verificationData.getEncryptionIv()).getPlain(), 'plain').getEncrypted()
    } catch (e) {
        res.render('accounts/verification-failure', {
            title: __accounts.verificationFailure.title,
            isSignedIn: !!req.session.user
        });
    }

    account
        .getData({
            id: encryptedId
        }).then(() => {
            res.render('accounts/reset-password', {
                title: __accounts.resetPassword.title,
                isSignedIn: req.session.user,
                verificationCode: verificationCode
            });
        }, () => {
            res.render('accounts/verification-failure', {
                title: __accounts.verificationFailure.title,
                isSignedIn: !!req.session.user
            });
        }).catch(error => {
            console.error(error);

            res.render('errors/500', {
                title: '500 Internal Server Error',
                isSignedIn: !!req.session.user
            });
        }
    );
});

accountsRouter.post('/change-password', (req, res) => {
    const verificationCode = req.body.verificationCode;
    const password = req.body.password;
    const account = new Account();
    const verificationData = new VerificationData();
    let encryptedId;

    if (password.length < 4) {
        res.send('password-short');

        return;
    }

    try {
        encryptedId = new Aes256(new Aes256(verificationCode, 'encrypted', verificationData.getEncryptionKey(), verificationData.getEncryptionIv()).getPlain(), 'plain').getEncrypted();
    } catch (e) {
        res.send('error');

        return;
    }

    account
        .getData({
            id: encryptedId
        }).then(data => {
            console.log(data);

            return account
                .setData({
                    password: new Sha512(password).getEncrypted()
                }, {
                    index: data[0].index
                }
            );
        }, () => {
            res.send('error');
        }).catch(error => {
            console.error(error);

            res.send('error');
        }).then(() => {
            res.send('ok');
        }).catch(error => {
            console.error(error);

            res.send('error');
        }
    );
});

accountsRouter.get('/privacy', (req, res) => {
    const __accounts = __('accounts');

    res.render('accounts/privacy', {
        title: __accounts.privacy.title,
        isSignedIn: !!req.session.user
    });
});

accountsRouter.post('/change-personal-information/nickname', (req, res) => {
    const account = new Account();
    const nickname = req.body.nickname;

    if (nickname === undefined) {
        res.send('no-nickname');
    } else {
        if (req.session.user) {
            if (nickname.length < 1) {
                res.send('short');
            } else if (nickname.length > 10) {
                res.send('long')
            } else {
                account
                    .doNicknameExist(nickname)
                    .then(() => {
                        res.send('exist');
                    }, () => {
                        account
                            .setData({
                                nickname: new Aes256(nickname, 'plain').getEncrypted()
                            }, {
                                'index': req.session.user.index
                            }).then(() => {
                                res.send('ok');

                                req.session.destroy();
                            }).catch(error => {
                                res.send('error');
                                console.error(error);
                            }
                        );
                    }).catch(error => {
                        res.send('error');

                        console.error(error);
                    }
                );
            }
        } else {
            res.send('not-signed-in');
        }
    }
});

accountsRouter.post('/change-personal-information/password', (req, res) => {
    const account = new Account();
    const password = req.body.password;

    if (password === undefined) {
        res.send('no-password');
    } else {
        if (req.session.user) {
            if (password.length < 4) {
                res.send('short');
            } else {
                account
                    .setData({
                        password: new Sha512(password).getEncrypted()
                    }, {
                        'index': req.session.user.index
                    }).then(() => {
                        res.send('ok');

                        req.session.destroy();
                    }).catch(error => {
                        res.send('error');
                        console.error(error);
                    }
                );
            }
        } else {
            res.send('not-signed-in');
        }
    }
});

accountsRouter.post('/change-personal-information/email', (req, res) => {
    const account = new Account();
    const email = req.body.email;

    if (email === undefined) {
        res.send('no-email');
    } else {
        if (req.session.user) {
            if (email.length < 3) {
                res.send('short');
            } else if (email.match(/^[^@]{1,64}@[^@]{1,255}$/) === null) {
                res.send('template-not-match')
            } else {
                account
                    .doEmailExist(email)
                    .then(() => {
                        res.send('exist');
                    }, () => {
                        account
                            .setData({
                                email: new Aes256(email, 'plain').getEncrypted()
                            }, {
                                'index': req.session.user.index
                            }).then(() => {
                                res.send('ok');

                                req.session.destroy();
                            }).catch(error => {
                                res.send('error');
                                console.error(error);
                            }
                        );
                    }).catch(error => {
                        res.send('error');

                        console.error(error);
                    }
                );
            }
        } else {
            res.send('not-signed-in');
        }
    }
});

accountsRouter.get('/*', (req, res) => {
    res.render('errors/404', {
        'title': '404 Not Found',
        'isSignedIn': req.session.user
    });
});

module.exports = {
    router: accountsRouter
};
