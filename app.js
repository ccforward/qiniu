var API = require('./api');
var md5 = require('md5');
var http = require('http'),
    https = require('https'),
    fs = require('fs'),
    url = require('url');
const CONFIG = require('./config');


const HTTP_OPTIONS = {
    hostname: 'localhost',
    port: CONFIG.http.port,
    path: CONFIG.http.path
}

var server = http.createServer(function(req, res){
    var urlData = url.parse(req.url),
        path = urlData.pathname,
        uploadURL = '';
    if(path == HTTP_OPTIONS.path){
        var queryArr = urlData.query.split('&')
        for(query of queryArr){
            var q = query.split('=');
            if(q[0] == 'url'){
                uploadURL = q[1];
                break;
            }
        }
        // 调用上传接口
        fileProcess.uploadWebImage(uploadURL,function(d){
            res.writeHead(200,{'Content-Type':'text/plain'});
            res.end(d);
        });
    }
});

server.listen(HTTP_OPTIONS.port);
console.log('@http://' + HTTP_OPTIONS.hostname + ':' + HTTP_OPTIONS.port);



var fileProcess = {
    uploadWebImage: function(url, callback){
        var _self = this;
        _self._download(url, function(err, tmpFile){
            if(err){
                callback(err);
            }else {
                console.log(tmpFile)
                var qiniuURL = 'img/' + md5(url) + '.' + tmpFile.format;
                API.uploadFile(API.uptoken(qiniuURL), qiniuURL, tmpFile.localPath, function(err, d){
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
    },
    _download: function(url, upFileFn){
        var requestType = http;
        if(url.split(':')[0] == 'https') {
            requestType = https;
        }
        requestType.get(url, function(res){
            // 限制文件类型大小
            // content-type对照表 http://tool.oschina.net/commons
            var headers = res.headers,
                format = headers['content-type'].split('/')[1],
                size = headers['content-length'] / (1024*1024);

            if(size > CONFIG.upload.size || CONFIG.upload.types.indexOf(format) == -1){
                upFileFn('too large or not support file type');
            }else {
                var imgData = '';
                res.setEncoding('binary');
                res.on('data', function(chunk){
                    imgData += chunk;
                });
                res.on('end', function(){ 
                    var tmpFile = {
                        localPath: './tmp/tmp_' + new Date().getTime() + '.' + format,
                        format: format
                    };
                    fs.writeFile(tmpFile.localPath, imgData, 'binary', function(err){
                        upFileFn(err, tmpFile);
                    });
                })
            }
        });
    }
}