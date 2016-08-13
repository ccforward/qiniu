
var imgs = document.getElementsByTagName('img');
for(var i=0;i<imgs.length;i++ ){
    var src = imgs[i].src;
    if(src.indexOf('developer.chrome.com')>0){
        imgs[0].dataset.origin = src;
        src = src.replace('cc.taobao.com/','');
        imgs[i].src = src;
    }
}






window.getATA = {
    init: function(){
        this.element();
    },
    element: function(){
        var style = '#J_ATACollect{\
            position:fixed;top:100px;right:100px;width:100px;height:30px;\
            text-align:center;line-height:30px;background:#333;color:#fff;font-size:16px;}';
        var css = document.createElement('style');
        css.innerHTML = style;
        document.body.appendChild(css);

        var a = document.createElement('a');
        a.href= "javascript:;";
        a.innerHTML = 'Collect it';
        a.id = "J_ATACollect";
        document.body.appendChild(a);

        this.event();
    },
    event: function(){
        var _self = this;
        document.getElementById('J_ATACollect').addEventListener('click',function(){
            _self.saveData();
        }, false);
    },
    saveData: function(){
        var title = document.title;
        var content = document.querySelector('.content').innerHTML;
        var data = {
            title: title,
            content: content
        }
        // console.log(content);return;
        chrome.runtime.sendMessage({
            method: 'save',
            data: data
        }, function(d){
            // alert(d.result);
        });
    }
}
if(location.href.indexOf('www.atatech.org')>=0){
    getATA.init() 
}