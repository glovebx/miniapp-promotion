const app = getApp();

Page({
    data: {
      // shopname: "",
      // shoptel: "",
      // shopaddress: "",
      contacts: "",
      contactstel: "",
      activityintro: "",
      starttime: "",
      endtime: "",
      StartDateStart: "",
      EndDateStart: ""
    },
    onLoad: function(t) {
        wx.getStorageSync("userInfo");
        var e = Date.parse(new Date());
        e /= 1e3;
        var a = new Date(), n = a.getFullYear(), i = a.getMonth() + 1, s = a.getDate(), o = new Date(1e3 * (e + 86400)), d = o.getFullYear(), c = o.getMonth() + 1, r = o.getDate();
        this.setData({
            starttime: n + "-" + i + "-" + s,
            StartDateStart: n + "-" + i + "-" + s,
            EndDateStart: n + "-" + i + "-" + r,
            endtime: d + "-" + c + "-" + r
        });
        //  this.GetApplyTip(), wx.hideShareMenu();
    },
    onShow: function() {
    },
    // GetApplyTip: function() {
    //     var t = this;
    //     a.util.request({
    //         url: "entry/wxapp/getsetting",
    //         cachetime: "0",
    //         success: function(e) {
    //             t.setData({
    //                 SettingInfo: e.data.data
    //             });
    //         }
    //     });
    // },
    // bindShopname: function(t) {
    //     this.setData({
    //         shopname: t.detail.value
    //     });
    // },
    // bindShoptel: function(t) {
    //     this.setData({
    //         shoptel: t.detail.value
    //     });
    // },
    // bindShopaddress: function(t) {
    //     this.setData({
    //         shopaddress: t.detail.value
    //     });
    // },
    bindContacts: function(t) {
        this.setData({
            contacts: t.detail.value
        });
    },
    bindContactstel: function(t) {
        this.setData({
            contactstel: t.detail.value
        });
    },
    bindActivityintro: function(t) {
        this.setData({
            activityintro: t.detail.value
        });
    },
    bindStartTime: function(t) {
        this.setData({
            starttime: t.detail.value
        });
    },
    bindEndTime: function(t) {
        this.setData({
            endtime: t.detail.value
        });
    },

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "../../pages/tologin/tologin"
      })
    }, 1000)
  },
    addOrderBtn: function(event) {
      let token = wx.getStorageSync('token');
      if (!token) {
        // 去登录
        this.goLoginPageTimeOut();
        return;
      }
      
      // shopname: t.data.shopname,
      //   shoptel: t.data.shoptel,
      //     shopaddress: t.data.shopaddress,
        var o = {
          token: wx.getStorageSync('token') || '',
          uname: this.data.contacts,
          utel: this.data.contactstel,
          content: this.data.activityintro,
          time_start: this.data.starttime,
          time_end: this.data.endtime,
          form_id: event.detail.formId,
        };

        console.log(o);

      if (!o.uname || !o.utel || !o.content || !o.time_start || !o.time_end) {
          return wx.showModal({
            title: "提示",
            content: "所有项均为必填项，请检查填写完整信息",
            showCancel: false
          });
        }

      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/apply",
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: o,
        success: function (res) {
          wx.hideToast();
          if (res.data.code != 0) {
            wx.showModal({
              title: "提示",
              content: res.data.msg,
              showCancel: false
            });
            return;
          }
          wx.showToast({
              title: "提交成功"
          });
          wx.navigateBack();
        }
      }); 
        // a.util.request({
        //     url: "entry/wxapp/addapply",
        //     cachetime: "0",
        //     method: "POST",
        //     data: e,
        //     success: function(t) {
        //         wx.hideToast(), 0 == t.data.errno && (wx.showToast({
        //             title: "提交成功"
        //         }), wx.navigateBack());
        //     },
        //     fail: function(t) {
        //         n = 0, wx.showModal({
        //             title: "提示",
        //             content: t.data.message,
        //             showCancel: !1
        //         });
        //     }
        // });
    }
});