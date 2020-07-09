var e = getApp(), t = require("../../resource/wxParse/wxParse.js");

Page({
    data: {
        businessInfo: [],
        userId: "",
        businessId: "",
        ulatitude: "",
        ulongitude: "",
        loginModelHidden: !0
    },
    onLoad: function(e) {
        var t = this;
        t.setData({
            businessId: e.businessid
        });
        var s = wx.getStorageSync("userInfo");
        s && 0 != s.memberInfo.uid && "" != s.memberInfo ? (t.setData({
            userId: s.memberInfo.uid
        }), t.GetLocation()) : wx.getSetting({
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
        });
    },
    updateUserInfo: function(t) {
        var s = this;
        e.util.getUserInfo(function(e) {
            e = wx.getStorageSync("userInfo"), s.setData({
                userId: e.memberInfo.uid,
                loginModelHidden: !0
            }), s.GetLocation();
        }, t.detail);
    },
    onShow: function() {},
    GetLocation: function() {
        var e = this;
        wx.getLocation({
            type: "gcj02",
            success: function(t) {
                e.setData({
                    ulatitude: t.latitude,
                    ulongitude: t.longitude
                });
            },
            complete: function(t) {
                e.GetBusinessDetail();
            }
        });
    },
    toHome: function() {
        wx.switchTab({
            url: "../../pages/index/index"
        });
    },
    onShareAppMessage: function() {
        var e = this;
        return {
            title: e.data.businessInfo.name,
            imageUrl: e.data.businessInfo.logo,
            path: "ypuk_kjb/pages/business_detail/business_detail?businessid=" + e.data.businessId,
            success: function(e) {
                wx.showToast({
                    title: "转发成功",
                    icon: "success",
                    duration: 1e3,
                    mask: !0
                });
            }
        };
    },
    OpenMap: function() {
        wx.openLocation({
            latitude: Number(this.data.businessInfo.latitude),
            longitude: Number(this.data.businessInfo.longitude),
            scale: 28
        });
    },
    CallBusiness: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.businessInfo.tel
        });
    },
    GetBusinessDetail: function() {
        var s = this;
        e.util.request({
            url: "entry/wxapp/getbusinessdetail",
            cachetime: "0",
            data: {
                uid: s.data.userId,
                businessid: s.data.businessId,
                ulat: s.data.ulatitude,
                ulng: s.data.ulongitude
            },
            success: function(e) {
                t.wxParse("businessDesc", "html", e.data.data.intro, s, 20), s.setData({
                    businessInfo: e.data.data
                });
            }
        });
    }
});