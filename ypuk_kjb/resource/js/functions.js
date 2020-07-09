function i(url, data, cb) {
  var weappid = 2;
    console.log("即将获取到配置信息");
    var s = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
    s && (console.log(s), console.log("获取到配置信息1"), void 0 != s.weappid && (console.log("获取到配置信息2"), 
      weappid = s.weappid)), wx.request({
        url: url,
        data: data,
        header: {
            "Content-Type": "application/json",
            "User-Token": wx.getStorageSync("user_token"),
            Merchantid: wx.getStorageSync("merchantid"),
          weappid: weappid,
            Groupid: 0
        },
        success: function(res) {
            499999 == res.data.code ? r() : 499998 == res.data.code ? wx.showModal({
                title: "请先创建商城",
                confirmText: "好的",
                showCancel: false,
                success: function(res) {
                    res.confirm && (wx.setStorageSync("createshop", 1), wx.switchTab({
                        url: "/pages/index/index"
                    }));
                }
            }) : 50001 == res.data.code ? (wx.setStorageSync("user_token", ""), c("身份验证失效,请重新打开小程序。")) : "用户不存在!" == res.data.msg ? r() : cb(res);
        },
        fail: function(res) {
            console.log("failed");
        }
    });
}

function r() {
  1 == wx.getStorageSync("newuser") ? wx.showModal({
    title: "很抱歉您的登录状态已失效",
    confirmText: "重新登录",
    showCancel: !1,
    success: function (e) {
      e.confirm && wx.redirectTo({
        url: "/pages/user/register/register"
      });
    }
  }) : wx.redirectTo({
    url: "/pages/user/register/register"
  });
}

function c(e) {
  wx.showModal({
    content: e,
    confirmText: "好的",
    showCancel: !1,
    success: function (e) {
      e.confirm && wx.switchTab({
        url: "/pages/index/index"
      });
    }
  });
}

function n(e, o, t) {
    var n = arguments.length > 3 && void 0 !== arguments[3] ? arguments[3] : "";
    var a = arguments.length > 4 && void 0 !== arguments[4] ? arguments[4] : "";
    if (0 != e.length) return !0;
    s(), console.log("77777777"), console.log(n), console.log(a), "" != a && n.setData({
        focus: a
    }), t.show({
        timer: 3e3,
        text: o,
        success: function() {
            return false;
        }
    });
}

function a(t) {
    var n = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
    console.log("new formids"), t = JSON.stringify(t);
  var a = wx.getStorageSync("formidtodaynum");
    console.log(a), console.log("odihofjigfdgdfsgdsfg");
    var r = parseInt(new Date().getTime() / 1e3), c = new Date().setHours(0, 0, 0, 0) / 1e3;
    if ("" == a || a.num <= 7 || a.time < c) {
        var s = {
            formids: t,
            url: n
        };
        i(b.saveFormIds, s, function(o) {
          1 == o.data.code && (console.log(o.data.data), wx.setStorageSync("formidtodaynum", {
                num: o.data.data.todaynum,
                time: r
            }));
        });
    }
}

module.exports = {
    showloading: function(msg) {
        wx.showLoading && ("" == msg && (msg = "加载中"), wx.showLoading({
            title: msg
        }));
    },
    hideLoading: function() {
    	wx.hideLoading && wx.hideLoading();
    },
    commonRequest: i,
    validateInput: n,
    validatenum: function(e, o, t, n, a) {
        var i = 0;
        if ("" === e || null == e || isNaN(e) || (i = 1), 1 == i) return !0;
        s(), "" != a && n.setData({
            focus: a
        }), t.show({
            timer: 3e3,
            text: o,
            success: function() {
                return false;
            }
        });
    },
    dealFormIds: function(e) {
        var o = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "";
        if ("" == e || "undefined" == e) return console.log("获取表单id为无效"), 0;
        var data = {
            formid: e,
            expiretime: parseInt(new Date().getTime() / 1e3) + 604800
        };
        var n = [];
        n.push(data);
        a(n, o);
    },    
}