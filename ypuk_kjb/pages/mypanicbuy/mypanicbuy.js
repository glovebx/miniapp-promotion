const app = getApp();

Page({
    data: {
        orderList: [],
        page: 1,
        noMoreHidden: !0,
    },
    onLoad: function(e) {
        // var t = this, n = wx.getStorageSync("userInfo");
        // n && 0 != n.memberInfo.uid && "" != n.memberInfo ? (t.setData({
        //     userId: n.memberInfo.uid
        // }), t.GetList()) : wx.getSetting({
        //     success: function(e) {
        //         0 == e.authSetting["scope.userInfo"] ? wx.showModal({
        //             title: "提示",
        //             content: "允许小程序获取您的用户信息后才可参与砍价哦",
        //             showCancel: !1,
        //             success: function(e) {
        //                 e.confirm && wx.openSetting({
        //                     success: function(e) {
        //                         1 == e.authSetting["scope.userInfo"] && (t.setData({
        //                             loginModelHidden: !1
        //                         }), wx.removeStorageSync("userInfo"));
        //                     }
        //                 });
        //             }
        //         }) : (wx.removeStorageSync("userInfo"), t.setData({
        //             loginModelHidden: !1
        //         }));
        //     }
        // }), wx.hideShareMenu();
      // let that = this;
      // let token = wx.getStorageSync('token');
      // if (!token) {
      //   // 仅在本地token 不存在，且用户已经授权的情况下(本地token被清理了)，尝试自动登录
      //   wx.getSetting({
      //     success(res) {
      //       if (res.authSetting['scope.userInfo']) {
      //         // 直接获取userInfo然后登录  
      //         that.autoLogin();
      //       } else {
      //         // 去登录授权页面
      //         that.goLoginPageTimeOut();
      //       }
      //     }
      //   });
      //   return;
      // }    
      this.GetList();    
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
    onShow: function() {

    },

    GetList: function() {
      let token = wx.getStorageSync('token');
      if (!token) return;

      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/order/list",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          category: 'panic_buy',
          page: that.data.page,
        },
        success: function (res) {
          res.data.data && 0 < res.data.data.length ? that.setData({
            orderList: that.data.orderList.concat(res.data.data)
          }) : that.setData({
            noMoreHidden: false
          });
        }
      });         
        // var t = this;
        // e.util.request({
        //     url: "entry/wxapp/userdata",
        //     data: {
        //         page: t.data.page,
        //         mod: "panicbuy",
        //         uid: t.data.userId
        //     },
        //     cachetime: "0",
        //     success: function(e) {
        //         e.data.data && 0 < e.data.data.length ? t.setData({
        //             orderList: t.data.orderList.concat(e.data.data)
        //         }) : t.setData({
        //             noMoreHidden: !1
        //         });
        //     }
        // });
    }
});