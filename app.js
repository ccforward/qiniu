var qiniu = require('qiniu');
var config = require('./config');


qiniu.conf.ACCESS_KEY = config.qiniu.ACCESS_KEY;
qiniu.conf.SECRET_KEY = config.qiniu.SECRET_KEY;

const bucket = config.qiniu.bucketname;

// console.log(qiniu);


function PutPolicy(scope, callbackUrl, callbackBody, returnUrl, returnBody, asyncOps, endUser, expires) {
    this.scope = scope || null;
    this.callbackUrl = callbackUrl || null;
    this.callbackBody = callbackBody || null;
    this.returnUrl = returnUrl || null;
    this.returnBody = returnBody || null;
    this.asyncOps = asyncOps || null;
    this.endUser = endUser || null;
    this.expires = expires || 3600;
}

function uptoken(bucketname) {
    var putPolicy = new qiniu.rs.PutPolicy(bucketname);
    //putPolicy.callbackUrl = callbackUrl;
    //putPolicy.callbackBody = callbackBody;
    //putPolicy.returnUrl = returnUrl;
    //putPolicy.returnBody = returnBody;
    //putPolicy.asyncOps = asyncOps;
    //putPolicy.expires = expires;

    return putPolicy.token();
}


function PutExtra(params, mimeType, crc32, checkCrc) {
    this.paras = params || {};
    this.mimeType = mimeType || null;
    this.crc32 = crc32 || null;
    this.checkCrc = checkCrc || 0;
}

function uploadBuf(body, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    //extra.mimeType = mimeType;
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.put(uptoken, key, body, extra, function(err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret.key, ret.hash);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err)
                // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
    });
}


function uploadFile(localFile, key, uptoken) {
    var extra = new qiniu.io.PutExtra();
    //extra.params = params;
    // extra.mimeType = 'png';
    //extra.crc32 = crc32;
    //extra.checkCrc = checkCrc;

    qiniu.io.putFile(uptoken, key, localFile, extra, function(err, ret) {
        if (!err) {
            // 上传成功， 处理返回值
            console.log(ret);
            // ret.key & ret.hash
        } else {
            // 上传失败， 处理返回代码
            console.log(err);
            // http://developer.qiniu.com/docs/v6/api/reference/codes.html
        }
    });
}

uploadFile('0.js', '0.js', uptoken(config.qiniu.bucketname));

// console.log(uptoken('ccforward'));