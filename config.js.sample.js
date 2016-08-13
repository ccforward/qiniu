var config = {
    qiniu: {
        host: '',
        ACCESS_KEY: '',
        SECRET_KEY: '',
        bucketname: ''
    },
    upload: {
        size: '5', // 单位 MB
        types: ['x-jpg', 'jpeg', 'jpg', 'gif', 'png', 'x-png', 'webp']
    },
    http: {
        port: 5502,
        path: '/upload'
    }
}

module.exports = config