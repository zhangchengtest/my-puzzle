import wx from "weixin-js-sdk"

/*
 * 微信分享
 * 获取微信加签信息
 * @param{data}:获取的微信加签
 * @param{shareData}:分享配置参数
 */
export const wexinShare = (data, shareData) => {
    // var wx = require('weixin-js-sdk') || window['wx'];
    let appId = data.appId;
    let timestamp = data.timestamp;
    let nonceStr = data.nonceStr;
    let signature = data.signature;
    wx.config({
        debug: false, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。（测试记得关掉）
        appId: appId, // 必填，公众号的唯一标识
        timestamp: timestamp, // 必填，生成签名的时间戳
        nonceStr: nonceStr, // 必填，生成签名的随机串
        signature: signature, // 必填，签名，见附录1
        jsApiList: [
            'updateAppMessageShareData', 'updateTimelineShareData', 'onMenuShareAppMessage','onMenuShareTimeline', 'onMenuShareQQ', 'onMenuShareQZone'
            ] // 必填，需要使用的JS接口列表，所有JS接口列表见附录2
    });
   
    wx.ready(function() {

        //“分享给朋友”及“分享到QQ”
        wx.updateAppMessageShareData({
            title: shareData.title, // 分享标题
            desc: shareData.desc, // 分享描述
            link: shareData.link, // 分享链接 该链接域名或路径必须与当前页面对应的公众号JS安全域名一致
            imgUrl: shareData.imgUrl, // 分享图标
            success: function(res) {
                console.log("分享朋友成功返回的信息为:", res);;
            }
        })

    });
    wx.error(function(res) {
        // config信息验证失败会执行error函数，如签名过期导致验证失败，具体错误信息可以打开config的debug模式查看，也可以在返回的res参数中查看，对于SPA可以在这里更新签名。
        console.log('验证失败返回的信息:', res);
    });
}