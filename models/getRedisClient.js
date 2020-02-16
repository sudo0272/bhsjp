const redis = require('redis');
const redisClient = redis.createClient();

redisClient.on('error', err => {
    if (err) {
        throw err;
    }
});

function getRedisClient() {
    return redisClient;
}

module.exports = {
    getRedisClient: getRedisClient
};
