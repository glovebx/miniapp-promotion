wx.getStorageSync('token');

const config = require('config.js')
const wechat = require('./ypuk_kjb/resource/js/wechat.js')
const fetch = require('./ypuk_kjb/resource/js/fetch.js')

App({
  config: config,
  wechat: wechat,
  fetch: fetch,

  // 启动第一次会进入，关闭页面再打开（此时还未销毁），此处不会被调用！！！！！
  onLaunch: function(options) {
    if (Object.keys(options.query).length) {
      wx.setStorageSync('query', options.query);
    }

    // let that = this;
    let token = wx.getStorageSync('token');
    // if (!token) {
    //   // 缓存token不存在，且用户没有授权，说明可能是刚来的用户
    //   wx.getSetting({
    //     success(res) {
    //       if (!res.authSetting['scope.userInfo']) {
    //         console.log('no22222222 authSetting!!!!');
    //         // // 引导去授权页面
    //         // that.goLoginPageTimeOut();
    //       } else {
    //         // 缓存token不存在但是用户已经授权了，交给具体的启动页面处理逻辑
    //         console.log('has22222222 authSetting!!!!');
    //       }
    //     }, fail() {
    //       // 引导去授权页面
    //       console.log('no22222222 fail!!!!');
    //       // that.goLoginPageTimeOut();
    //     } 
    //   });
    //   return;
    // }
    if (token) {
      this.checkToken(token);
    }
  },

  checkToken: function (token) {
    let that = this;
    fetch(config.URI, '/user/check-token', {token: token})
    .then(res => {
      if (res.data.code != 0) {
        wx.removeStorageSync('token');
        wechat.getSetting()
        .then(res => {
          if (!res.authSetting['scope.userInfo']) {
            // 引导去授权页面
            that.goLoginPageTimeOut();
            // } else {
            //   // 缓存token存在但是失效了，并且用户已经授权，这里直接去登录
            //   // 子页面可能会提前判断缓存token 是否存在
            //   that.goLoginPageTimeOut();
          }
        });
      }
    });
    // wx.request({
    //   url: config.URI + '/user/check-token',
    //   data: {
    //     token: token
    //   },
    //   header: {
    //     "Content-Type": "json"
    //   },
    //   success: function (res) {
    //     if (res.data.code != 0) {
    //       wx.removeStorageSync('token');
    //       wx.getSetting({
    //         success(res) {
    //           if (!res.authSetting['scope.userInfo']) {
    //             // 引导去授权页面
    //             that.goLoginPageTimeOut();
    //           // } else {
    //           //   // 缓存token存在但是失效了，并且用户已经授权，这里直接去登录
    //           //   // 子页面可能会提前判断缓存token 是否存在
    //           //   that.goLoginPageTimeOut();
    //           }
    //         }
    //       });
    //     }
    //   }
    // });
  },

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "../../pages/tologin/tologin"
      })
    }, 1000)
  },

  onShow: function() {},
  onHide: function() {},
  onError: function(n) {
      // console.log(n);
  },
  globalData: {
    userInfo: null,
  },
});