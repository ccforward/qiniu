var qiniu = require('qiniu');
const CONFIG = require('./config');


qiniu.conf.ACCESS_KEY = CONFIG.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = CONFIG.qiniu.SECRET_KEY;

var API = {
    //构建上传策略函数
    uptoken: (key) => {
        var putPolicy = new qiniu.rs.PutPolicy(CONFIG.qiniu.bucketname + ":" + key);
        return putPolicy.token();
    },
    //构造上传函数
    uploadFile: (uptoken, key, localFile, callback) => {
        var extra = new qiniu.io.PutExtra();
        qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
            if(!err) {
                callback(undefined, ret.hash);       
            } else {
                // 上传失败， 处理返回代码
                console.log(err);
                callback(err);
            }
        });
    } 
}

module.exports = API;

