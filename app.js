var API = require('./api');
var md5 = require('md5');
var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    path = require('path'),
    url = require('url');
const CONFIG = require('./config');


const HTTP_OPTIONS = {
    hostname: 'localhost',
    port: CONFIG.http.port,
    path: CONFIG.http.path
}

var server = http.createServer((req, res) => {
    var urlData = url.parse(req.url),
        pathName = urlData.pathname,
        uploadURL = '';
    if(pathName == HTTP_OPTIONS.path){
        var queryArr = urlData.query.split('&')
        for(query of queryArr){
            var q = query.split('=');
            if(q[0] == 'url'){
                uploadURL = q[1];
                break;
            }
        }
        // 调用上传接口
        FileProcess.uploadWebImage(uploadURL, (d) => {
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.end(d);
        });
    }
});

server.listen(HTTP_OPTIONS.port);
console.log('@http://' + HTTP_OPTIONS.hostname + ':' + HTTP_OPTIONS.port);



var FileProcess = {
    uploadWebImage: (url, callback) => {
        var _self = this;
        if(url.startsWith('file://')){
            var localURL = decodeURI(url.replace('file://','')),
                size = fs.statSync(localURL).size / (1024*1024),
                format = path.extname(localURL).split('.').pop();
            if(size > CONFIG.upload.size || CONFIG.upload.types.indexOf(format) == -1){
                callback(CONFIG.upload.errMessage);
            }else {
                var qiniuURL = CONFIG.qiniu.folder + '/' + md5(localURL) + '.' + (localURL.split('.')[1] || '');
                API.uploadFile(API.uptoken(qiniuURL), qiniuURL, localURL, (err, d)=>{
                    if(err){
                        callback(err);
                    }else {
                        console.log(d);
                        callback(CONFIG.qiniu.host + qiniuURL);
                    }
                });
            }
        }else {
            FileProcess._download(url, (err, tmpFile) => {
                if(err){
                    callback(err);
                }else {
                    var qiniuURL = CONFIG.qiniu.folder + '/' + md5(url) + '.' + tmpFile.format;
                    API.uploadFile(API.uptoken(qiniuURL), qiniuURL, tmpFile.localPath, (err, d) => {
                        fs.unlink(tmpFile.localPath);
                        if(err){
                            callback(err);
                        }else {
                            console.log(d);
                            callback(CONFIG.qiniu.host + qiniuURL);
                        }
                    });
                }
            })
        }
    },
    _download: (url, upFileFn) => {
        var requestType = http;
        if(url.startsWith == 'https') {
            requestType = https;
        }
        requestType.get(url, (res) => {
            // 限制文件类型大小
            // content-type对照表 http://tool.oschina.net/commons
            var headers = res.headers,
                format = headers['content-type'].split('/')[1],
                size = headers['content-length'] / (1024*1024);
            if(size > CONFIG.upload.size || CONFIG.upload.types.indexOf(format) == -1){
                upFileFn(CONFIG.upload.errMessage);
            }else {
                var imgData = '';
                res.setEncoding('binary');
                res.on('data', (chunk) => {
                    imgData += chunk;
                });
                res.on('end', () => { 
                    var tmpFile = {
                        localPath: './tmp/tmp_' + new Date().getTime() + '.' + format,
                        format: format
                    };
                    fs.writeFile(tmpFile.localPath, imgData, 'binary', (err) => {
                        upFileFn(err, tmpFile);
                    });
                })
            }
        }).on('error', (e) => {
            upFileFn('can not find this file: ' + e.message);
            console.log(`${e.message}`);
        });;
    }
}