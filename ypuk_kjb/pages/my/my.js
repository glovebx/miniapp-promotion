const app = getApp();

Page({
    data: {
        userInfo: [],
        setting: [],
        menutext: [ "我的砍价", "我的砍价订单" ],
        menudata: [ {
            imgsrc: "../../resource/images/bargain.png",
            url: "../../pages/mybargain/mybargain",
            id: "bargainlist"
        }, {
            imgsrc: "../../resource/images/order.png",
            url: "../../pages/myorder/myorder",
            id: "orderlist"
        } ],
        // loginModelHidden: !0
    },

    onLoad: function() {
        // var e = this, t = wx.getStorageSync("userInfo");
        // t && 0 != t.memberInfo.uid && "" != t.memberInfo ? (e.setData({
        //     userId: t.memberInfo.uid
        // }), e.GetUserInfo()) : wx.getSetting({
        //     success: function(t) {
        //         0 == t.authSetting["scope.userInfo"] ? wx.showModal({
        //             title: "提示",
        //             content: "允许小程序获取您的用户信息后才可参与砍价哦",
        //             showCancel: !1,
        //             success: function(t) {
        //                 t.confirm && wx.openSetting({
        //                     success: function(t) {
        //                         1 == t.authSetting["scope.userInfo"] && (e.setData({
        //                             loginModelHidden: !1
        //                         }), wx.removeStorageSync("userInfo"));
        //                     }
        //                 });
        //             }
        //         }) : (wx.removeStorageSync("userInfo"), e.setData({
        //             loginModelHidden: !1
        //         }));
        //     }
        // }), wx.hideShareMenu();
      let that = this;  
      let token = wx.getStorageSync('token');
      if (!token) {
        // 仅在本地token 不存在，且用户已经授权的情况下(本地token被清理了)，尝试自动登录
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userInfo']) {
              // 直接获取userInfo然后登录  
              that.autoLogin();
            // } else {
            //   // 去登录授权页面
            //   that.goLoginPageTimeOut();
            }
          }
        });
        return;
      } 
    },

  autoLogin: function () {
    let that = this;
    wx.getUserInfo({
      success: function (res) {
        app.globalData.userInfo = res.userInfo;
        wx.setStorageSync('userInfo', res.userInfo);

        wx.login({
          success: function (res) {
            wx.request({
              url: app.config.URI + '/user/wxapp/login',
              data: {
                code: res.code
              },
              header: {
                "Content-Type": "json"
              },
              success: function (res) {
                if (res.data.code != 0) {
                  // 自动登录失败，直接去登录页面
                  that.goLoginPageTimeOut();
                  return;
                }
                wx.setStorageSync('token', res.data.token);
                wx.setStorageSync('uid', res.data.uid);
              }
            })
          }
        });

      }
    })
  },

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "../../pages/tologin/tologin"
      })
    }, 1000)
  },

  onShow: function () {
    let userInfo = wx.getStorageSync('userInfo');
    if (userInfo) {
      this.setData({
        userInfo: userInfo
      });

      let token = wx.getStorageSync('token');
      if (token) {
        // 获取额外数据
        let that = this;
        // banner列表
        wx.request({
          url: app.config.URI + "/user/amount",
          data: {
            token: token
          },
          header: {
            "Content-Type": "json"
          },
          success: function (res) {
            that.setData({
              extraInfo: res.data.data,
            });
          }
        });
      }
    }
  },  
    // updateUserInfo: function(t) {
    //     var n = this;
    //     e.util.getUserInfo(function(e) {
    //         e = wx.getStorageSync("userInfo"), n.setData({
    //             userId: e.memberInfo.uid,
    //             loginModelHidden: !0
    //         }), n.GetUserInfo();
    //     }, t.detail);
    // },

    // GetSetting: function() {
    //     var t = this;
    //     e.util.request({
    //         url: "entry/wxapp/getsetting",
    //         cachetime: "0",
    //         success: function(e) {
    //             t.setData({
    //                 setting: e.data.data
    //             });
    //         }
    //     });
    // },

    // GetUserInfo: function() {
    //     var t = this;
    //     e.util.request({
    //         url: "entry/wxapp/getuserinfo",
    //         cachetime: "0",
    //         data: {
    //             uid: t.data.userId
    //         },
    //         success: function(e) {
    //             t.setData({
    //                 userInfo: e.data.data
    //             }), t.GetSetting();
    //         }
    //     });
    // },

    GoKefuQr: function() {
        wx.previewImage({
            current: this.data.setting.kefuqr,
            urls: this.data.setting.kefuqr
        });
    }
});