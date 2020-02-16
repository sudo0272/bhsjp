const fs = require('fs');
const path = require('path');
const sessionData = {
    secret: "f%*JNsNn!tFfdqog#Ba7oITKgLW0YYKOm1ARil6MW#BKlmMSrC@LSZnA5E#0!EY63#R%U!NH1#PM4AV80PVDGQDuQbHgZ%&5BEN",
    resave: false,
    saveUninitialized: true,
    cookie: {
        secure: true,
        domain: "bhsjp.kro.kr",
        httpOnly: true,
        maxAge: 3600000
    }
};


function getSessionData() {
    return sessionData;
}

module.exports = {
    getSessionData: getSessionData
};
