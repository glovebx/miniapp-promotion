function t(that, data, formId) {
    that.setData({
        buttondisabled: true
    });
    console.log(i);
    var u = {
      data: data
    };
    o.CommonRequest(n.setsimpleFreight, u, function(res) {
        1 == res.data.code ? (wx.showToast({
            title: "创建成功",
            icon: "success",
            duration: 3e3
        }), setTimeout(function() {
            o.setstorage("freightid", res.data.data.fid);
            wx.navigateBack({});
        }, 3e3)) : (that.setData({
            buttondisabled: false
        }), e.$wuxToptips.show({
            timer: 3e3,
            text: res.data.msg
        }));
    });
}

// var e = require("../../../utils/components/wux");
// var o = require("../../../lib/functions.js");
// var n = require("../../../config/api.js");

getApp();

Page({
    data: {
        buttondisabled: false
    },
    onLoad: function(t) {},
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {},

    userformSubmit: function(event) {
      let that = this;
      console.log("form发生了submit事件，携带数据为：", event.detail.value);
      if (!o.validateInput(event.detail.value.dispatchname, "请输入运费名称！", e.$wuxToptips)) return false;
      t(that, event.detail.value, event.detail.formId);
    }
});