var e = getApp();

Page({
    data: {
        orderList: [],
        userId: "",
        page: 1,
        noMoreHidden: !0,
        loginModelHidden: !0
    },
    onLoad: function(e) {
        var t = this, n = wx.getStorageSync("userInfo");
        n && 0 != n.memberInfo.uid && "" != n.memberInfo ? (t.setData({
            userId: n.memberInfo.uid
        }), t.GetList()) : wx.getSetting({
            success: function(e) {
                0 == e.authSetting["scope.userInfo"] ? wx.showModal({
                    title: "提示",
                    content: "允许小程序获取您的用户信息后才可参与砍价哦",
                    showCancel: !1,
                    success: function(e) {
                        e.confirm && wx.openSetting({
                            success: function(e) {
                                1 == e.authSetting["scope.userInfo"] && (t.setData({
                                    loginModelHidden: !1
                                }), wx.removeStorageSync("userInfo"));
                            }
                        });
                    }
                }) : (wx.removeStorageSync("userInfo"), t.setData({
                    loginModelHidden: !1
                }));
            }
        }), wx.hideShareMenu();
    },
    updateUserInfo: function(t) {
        var n = this;
        e.util.getUserInfo(function(e) {
            e = wx.getStorageSync("userInfo"), n.setData({
                userId: e.memberInfo.uid,
                loginModelHidden: !0
            }), n.GetList();
        }, t.detail);
    },
    onPullDownRefresh: function() {
        this.setData({
            orderList: [],
            page: 1
        }), this.GetList(), setTimeout(function() {
            wx.stopPullDownRefresh();
        }, 1e3);
    },
    onReachBottom: function() {
        var e = this, t = e.data.page;
        e.setData({
            page: t + 1
        }), e.GetList();
    },
    onShow: function() {},
    GetList: function() {
        var t = this;
        e.util.request({
            url: "entry/wxapp/verificationrecord",
            data: {
                page: t.data.page,
                uid: t.data.userId
            },
            cachetime: "0",
            success: function(e) {
                e.data.data && 0 < e.data.data.length ? t.setData({
                    orderList: t.data.orderList.concat(e.data.data)
                }) : t.setData({
                    noMoreHidden: !1
                });
            }
        });
    }
});