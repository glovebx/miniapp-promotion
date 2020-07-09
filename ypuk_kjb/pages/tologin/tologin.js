const app = getApp();

Page({
  data: {},
  onLoad: function (query) {
    // let that = this;
    // wx.getSetting({
    //   success(res) {
    //     if (res.authSetting['scope.userInfo']) {
    //       // 说明用户已经授权，直接获取userInfo然后登录
    //       that.autoLogin();
    //     }
    //   }
    // })    
  },

  // autoLogin: function () {
  //   let that = this;
  //   wx.getUserInfo({
  //     success: function (res) {
  //       app.globalData.userInfo = res.userInfo;
  //       wx.setStorageSync('userInfo', res.userInfo);

  //       wx.login({
  //         success: function (res) {
  //           wx.request({
  //             url: app.config.URI + '/user/wxapp/login',
  //             data: {
  //               code: res.code
  //             },
  //             header: {
  //               "Content-Type": "json"
  //             },
  //             success: function (res) {
  //               if (res.data.code != 0) {
  //                 return;
  //               }
  //               wx.setStorageSync('token', res.data.token);
  //               // 回到原来的地方
  //               wx.navigateBack();                
  //             }
  //           })
  //         }
  //       });
  //     }
  //   })
  // },

  onReady: function() {},
  onShow: function() {},
  onHide: function() {},
  onUnload: function() {},
  onPullDownRefresh: function() {},
  onReachBottom: function() {},
  
  login: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    if (token) {
      wx.request({
        url: app.config.URI + '/user/check-token',
        data: {
          token: token
        },
        header: {
          "Content-Type": "json"
        },
        success: function (res) {
          if (res.data.code != 0) {
            wx.removeStorageSync('token')
            that.login();
          } else {
            // 回到原来的地方
            wx.navigateBack();
          }
        }
      })
      return;
    }
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
            // console.log(res);
            if (res.data.code == 10000) {
              // 去注册
              that.registerUser();
              return;
            }
            if (res.data.code != 0) {
              // 登录错误
              wx.hideLoading();
              wx.showModal({
                title: '提示',
                content: '无法登录，请重试',
                showCancel: false
              })
              return;
            }
            wx.setStorageSync('token', res.data.token);
            wx.setStorageSync('uid', res.data.uid);
            // 回到原来的地方
            wx.navigateBack();
          }
        })
      }
    })
  },
  registerUser: function () {
    var that = this;
    wx.login({
      success: function (res) {
        var code = res.code; // 微信登录接口返回的 code 参数，下面注册接口需要用到
        wx.getUserInfo({
          success: function (res) {
            var iv = res.iv;
            var encryptedData = res.encryptedData;
            
            var shareUid = '';
            var transUid = '';
            // 如果有query
            var query = wx.getStorageSync('query');
            if (query) {
              if (query.scene) {
                const params = decodeURIComponent(query.scene).split('-');
                shareUid = params[0] || '';
                transUid = params[1] || '';
              } else {
                shareUid = query.shareUid || '';
                transUid = query.transUid || '';
              }
            }
            // 下面开始调用注册接口
            wx.request({
              url: app.config.URI + '/user/wxapp/register/complex',
              data: {
                code: code,
                encrypted_data: encryptedData,
                iv: iv,
                share_uid: shareUid,
                trans_uid: transUid
              }, // 设置请求的 参数
              header: {
                "Content-Type": "json"
              },
              success: (res) => {
                wx.hideLoading();
                wx.setStorage({
                  key: 'new_user',
                  data: parseInt(Date.parse(new Date())),
                });
                that.login();
              }
            })
          }
        })
      }
    })
  },

  bindGetUserInfo: function (event) {
    if (!event.detail.userInfo) {
      return;
    }
    wx.setStorageSync('userInfo', event.detail.userInfo);
    app.globalData.userInfo = event.detail.userInfo;
    this.login();
  },

});