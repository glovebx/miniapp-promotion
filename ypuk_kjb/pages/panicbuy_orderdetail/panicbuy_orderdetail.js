const pay = require("../../resource/js/pay.js");
const app = getApp();

Page({
    data: {
      orderNo: "",
      orderInfo: {},
      tmplIds: []
        // orderInfo: [],
        // loginModelHidden: !0
    },
  onLoad: function (query) {
      this.setData({
        orderNo: query.orderno
      });

      this.GetOrderInfo();
      this.getSubscribeTmpls();
      wx.hideShareMenu();
    },

    GetOrderInfo: function() {
        // var t = this;
        // e.util.request({
        //     url: "entry/wxapp/orderdetail",
        //     data: {
        //         uid: t.data.userId,
        //         orderno: t.data.orderNo
        //     },
        //     cachetime: "0",
        //     success: function(e) {
        //         t.setData({
        //             orderInfo: e.data.data
        //         });
        //     }
        // });
      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/order/detail",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: wx.getStorageSync('token'),
          order_no: that.data.orderNo,
        },
        success: function (res) {
          that.setData({
            orderInfo: res.data.data
          });
        }
      });   
    },

    ConfirmOrder: function() {
        // var t = this;
        // e.util.request({
        //     url: "entry/wxapp/confirmorder",
        //     data: {
        //         orderno: t.data.orderNo,
        //         uid: t.data.userId
        //     },
        //     cachetime: "0",
        //     success: function(e) {
        //         wx.showToast({
        //             title: "确认成功"
        //         }), t.GetOrderInfo();
        //     }
        // });
      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/order/confirm",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: wx.getStorageSync('token'),
          order_no: that.data.orderNo,
        },
        success: function (res) {
          wx.showToast({
            title: "确认成功"
          });
          that.GetOrderInfo();
        }
      });         
    },

    pay: function() {
      // pay.wxpay(app
      // , this.data.orderInfo.totalPrice
      // , this.data.orderNo
      //   , "../../pages/mypanicbuy/mypanicbuy");
      const that = this;
      // Promise版支付
      pay.wxpay2(app, this.data.orderInfo.totalPrice, this.data.orderNo).then(res => {
        // console.log(res);
        // 唤起订阅
        wx.showToast({
          title: "支付成功"
        });
        if (that.data.tmplIds && that.data.tmplIds.length > 0) {
          that.subscribe();
        } else {
          that.reLaunchMy();
        }
      }).catch(res => {
        // console.log(res);
        if (res && res.errMsg == 'requestPayment:fail cancel') {
          wx.showToast({
            title: "支付取消"
          });
        } else {
          let errMsg = res && res.data && res.data.msg ? res.data.msg : "支付失败";
          wx.showModal({
            title: "错误",
            content: errMsg,
            showCancel: false
          });
        }
      });   
  },

  getSubscribeTmpls: function () {
    const that = this;
    app.wechat.getStorage('token').then(res => {
      // 该用户在支付回调时未订阅的消息
      app.fetch(app.config.URI, '/user/subscribe/list', {
        token: res.data,
        scene: 'pay'
      }).then(res2 => {
        // console.log(res2);
        if (res2.data.code == 0) {
          that.setData({
            tmplIds: res2.data.data.templIds
          })
        }
      });
    }).catch(res => { });
  },

  // 弹出订阅消息提示
  subscribe: function () {
    const that = this;
    app.wechat.requestSubscribeMessage(this.data.tmplIds).then(res => {
      // errMsg: "requestSubscribeMessage:ok"
      // console.log(res);
      if (res.errMsg == "requestSubscribeMessage:ok") {
        delete res['errMsg'];
        // 结果提交到服务器
        app.wechat.getSetting(true).then(res2 => {
          // console.log(res2);
          that.submitSubscriptionsSetting(res, res2.subscriptionsSetting || {});
        }).catch(res => {
          that.reLaunchMy();
        });
      } else {
        // 回到到个人主页
        that.reLaunchMy();
      }
    }).catch(res => {
      // console.log(res);
      if (res.errCode == 20004) {
        // 用户关闭了主开关，无法进行订阅
        // // 无法在这里调用openSetting！只能在点击按钮后
        // app.wechat.openSetting().then(res2 => {
        //   console.log(res2);
        // });
      }
      // 回到到个人主页
      that.reLaunchMy();
    });
  },

  // 提交到服务器
  submitSubscriptionsSetting: function (res, res2) {
    wx.showLoading();

    const that = this;
    // const token = wx.getStorageSync('token');
    let data = {
      token: wx.getStorageSync('token'),
      params: JSON.stringify({ 'res': res, 'res2': res2 }),
    };
    app.fetch(app.config.URI, '/user/subscribe', data, 'POST',
      { 'content-type': "application/x-www-form-urlencoded" })
      .then(res => {
        wx.hideLoading();
        // 回到个人主页
        that.reLaunchMy();
      }).catch(res => {
        wx.hideLoading();
        // 不管错误与否，回到个人主页
        that.reLaunchMy();
      });
  },

  reLaunchMy: function () {
    // 回到到个人主页
    wx.reLaunch({
      url: "../../pages/mypanicbuy/mypanicbuy"
    });
  },
});