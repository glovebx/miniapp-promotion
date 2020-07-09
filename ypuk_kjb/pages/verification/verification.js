var e = getApp();

Page({
    data: {
        orderno: "",
        vpass: "",
        orderInfo: [],
        userId: "",
        loginModelHidden: !0
    },
    onLoad: function(e) {
        var t = this, n = wx.getStorageSync("userInfo");
        n && 0 != n.memberInfo.uid && "" != n.memberInfo ? (t.setData({
            userId: n.memberInfo.uid
        }), t.GetClerkInfo()) : wx.getSetting({
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
            }), n.GetClerkInfo();
        }, t.detail);
    },
    scanQr: function() {
        var e = this;
        wx.scanCode({
            success: function(t) {
                e.setData({
                    orderno: t.result
                }), e.GetOrderInfo();
            }
        });
    },
    bindOrderNo: function(e) {
        this.setData({
            orderno: e.detail.value
        }), 18 != e.detail.value.length && "e" != e.detail.value.substr(e.detail.value.length - 1, 1) || (console.log(1), 
        this.GetOrderInfo());
    },
    bindVPass: function(e) {
        this.setData({
            vpass: e.detail.value
        });
    },
    GetClerkInfo: function() {
        var t = this;
        e.util.request({
            url: "entry/wxapp/getclerkinfo",
            data: {
                uid: t.data.userId
            },
            cachetime: "0",
            success: function(e) {
                t.setData({
                    clerkInfo: e.data.data
                });
            }
        });
    },
    GetOrderInfo: function() {
        var t = this;
        e.util.request({
            url: "entry/wxapp/orderdetail",
            data: {
                uid: t.data.userId,
                orderno: t.data.orderno,
                type: "verification"
            },
            cachetime: "0",
            success: function(e) {
                t.setData({
                    orderInfo: e.data.data
                });
            }
        });
    },
    VerificationOrder: function() {
        var e = this;
        0 == e.data.orderInfo.validitystatus ? wx.showModal({
            title: "提示",
            content: "此订单已超出使用有效期，是否继续核销？",
            success: function(t) {
                t.confirm && e.VerificationOrderPost();
            }
        }) : e.VerificationOrderPost();
    },
    VerificationOrderPost: function() {
        var t = this;
        e.util.request({
            url: "entry/wxapp/verificationorder",
            cachetime: "0",
            data: {
                orderno: t.data.orderno,
                vpass: t.data.vpass,
                userid: t.data.userId
            },
            success: function(e) {
                wx.showToast({
                    title: "订单核销成功"
                }), t.GetOrderInfo();
            },
            fail: function(e) {
                wx.showModal({
                    title: "提示",
                    content: e.data.message,
                    showCancel: !1
                });
            }
        });
    }
});