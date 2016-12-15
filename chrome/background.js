chrome.contextMenus.create({
    "type": "normal",
    "title": "上传图片(向我曾经的cdn插件致敬)",
    "contexts": ["image"],
    "onclick": evt
});


function evt(info, tab){
    ajax(info.srcUrl, (data) => {
        alert(data);
    });
}
function ajax(url, callback){
    if(url){
        var xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if(xhr.readyState == 4 && xhr.status == 200){
                callback(xhr.responseText);
            }
        };
        xhr.open('GET', 'http://localhost:8003/upload?url=' + url, true);
        xhr.send();
    }else {
        callback('no image');
    }
}

// TODO  保存上传的原图和行cdn地址到本地





