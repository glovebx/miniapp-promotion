module.exports = {
  wxpay: function (app, money, order_no, redirect_url) {
    var remark = "在线支付",
    next = {};
    if (!order_no) {  
      remark = "支付订单 ：" + order_no;
      next = { type: 0, order_no: order_no }
    }
    wx.request({
      url: app.config.URI + "/pay/wxapp/get-pay-data",
      method: "POST",
      data: {
        token: wx.getStorageSync('token'),
        order_no: order_no,
        money: money,
        remark: remark,
        payName: "在线支付",
        nextAction: next
      },
      header: {
        "content-type": "application/x-www-form-urlencoded"
      }, 
      success: function(res) {
        0 == res.data.code ? wx.requestPayment({
          timeStamp: res.data.data.timeStamp,
          nonceStr: res.data.data.nonceStr,
          package: "prepay_id=" + res.data.data.prepayId,
          signType: "MD5",
          paySign: res.data.data.sign,
          fail: function(f) {
            if (f.errMsg == 'requestPayment:fail cancel') {
              wx.showToast({
                title: "支付取消"
              });
            } else {
              wx.showToast({
                title: "支付失败"
              });
            }
          },
          success: function() {
            wx.showToast({
              title: "支付成功"
            }), wx.redirectTo({
              url: redirect_url
            });
          }
        }) : wx.showToast({
            title: "服务器忙" + res.data.code + res.data.msg
        });
      }
    });
  },

  wxpay2: function (app, money, order_no) {
    return new Promise((resolve, reject) => {
      const remark = order_no ? "支付订单:" + order_no : "在线充值";
      const nextAction = order_no ? { type: 0, order_no: order_no } : {};

      app.fetch(app.config.URI, "/pay/wxapp/get-pay-data", {
        token: wx.getStorageSync('token'),
        order_no: order_no,
        money: money,
        remark: remark,
        payName: "在线支付",
        nextAction: nextAction
      }, "POST", {
          "content-type": "application/x-www-form-urlencoded"
        }).then(res => {
          if (res.data.code != 0) {
            return reject(res);
          }

          wx.requestPayment({
            timeStamp: res.data.data.timeStamp,
            nonceStr: res.data.data.nonceStr,
            package: "prepay_id=" + res.data.data.prepayId,
            signType: "MD5",
            paySign: res.data.data.sign,
            success: resolve,
            fail: reject
          });
        });
    })
  } 
};