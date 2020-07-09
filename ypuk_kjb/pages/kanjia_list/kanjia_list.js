const app = getApp();

Page({
    data: {
        activityList: [],
        categoryList: [ {
            id: 0,
            name: "全部"
        } ],
        catIndex: 0,
        nowCatid: 0,
        page: 1,
        noMoreHidden: !0,
        typeList: [ {
            id: "open",
            name: "正在进行"
        }, {
            id: "ready",
            name: "即将开始"
        }, {
            id: "",
            name: "全部活动"
        } ],
        typeIndex: 0,
        toptipopen: 0,
        toptiparr: [],
    },
    onLoad: function(query) {
      this.GetList();
      this.GetFixedOrTipSetting();        
    },

    // updateUserInfo: function(a) {
    //     var e = this;
    //     t.util.getUserInfo(function(t) {
    //         t = wx.getStorageSync("userInfo"), e.setData({
    //             userId: t.memberInfo.uid,
    //             loginModelHidden: !0
    //         }), e.GetCategory();
    //     }, a.detail);
    // },
    onShow: function() {

    },

    onReachBottom: function() {
        var t = this, a = t.data.page;
        t.data.tab, t.setData({
            page: a + 1
        }), t.GetList();
    },

    GetFixedOrTipSetting: function() {
       
    },

    CloseTopTip: function() {
        this.setData({
            "toptiparr.toptiphidden": !0
        }), wx.setStorage({
            key: "toptipHidden",
            data: parseInt(Date.parse(new Date())) + parseInt(1728e5)
        });
    },

    ToToptipApp: function() {
        // wx.navigateToMiniProgram({
        //     appId: this.data.toptiparr.toptipmappid,
        //     path: this.data.toptiparr.toptipmapppath
        // });
    },

    bindTypeChange: function(t) {
        this.setData({
          page: 1,
          typeIndex: t.detail.value,
          activityList: []
        }), this.GetList();
    },
    bindCategoryChange: function(t) {
        this.setData({
          page: 1,
          catIndex: t.detail.value,
          activityList: []
        }), this.GetList();
    },
    // GetCategory: function() {
    //     var a = this;
    //     t.util.request({
    //         url: "entry/wxapp/categorylist",
    //         cachetime: "0",
    //         data: {
    //             type: 1
    //         },
    //         success: function(t) {
    //             if (0 != a.data.nowCatid && "" != a.data.nowCatid) for (var e = 0; e < t.data.data.length; e++) t.data.data[e].id == a.data.nowCatid && a.setData({
    //                 catIndex: e + 1
    //             });
    //             a.setData({
    //                 categoryList: a.data.categoryList.concat(t.data.data)
    //             }), a.GetList();
    //         }
    //     });
    // },
    GetList: function() {
        // var a = this;
        // t.util.request({
        //     url: "entry/wxapp/catkanjia",
        //     data: {
        //         page: a.data.page,
        //         catid: a.data.categoryList[a.data.catIndex].id,
        //         type: a.data.typeList[a.data.typeIndex].id,
        //         uid: a.data.userId
        //     },
        //     cachetime: "0",
        //     success: function(t) {
        //         t.data.data && 0 < t.data.data.length ? a.setData({
        //             activityList: a.data.activityList.concat(t.data.data)
        //         }) : a.setData({
        //             noMoreHidden: !1
        //         });
        //     }
        // });
      let that = this;
      let token = wx.getStorageSync('token');
      if (token == undefined) token = '';

      // 默认是所有正在进行的
      wx.request({
        url: app.config.URI + "/shop/promotion/list",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          catid: that.data.categoryList[that.data.catIndex].id,
          status: that.data.typeList[that.data.typeIndex].id,
          category: 'bargain',
          page: that.data.page,
        },
        success: function (res) {
          res.data.data && 0 < res.data.data.length ? that.setData({
            activityList: that.data.activityList.concat(res.data.data)
          }) : that.setData({
            noMoreHidden: false
          });
        }
      });         
    },
    setRemind: function(a) {
      let that = this;
      let token = wx.getStorageSync('token');
      if (!token) {
        that.goLoginPageTimeOut();
        return;
      }
      // 设置提醒
      wx.request({
        url: app.config.URI + "/shop/promotion/remind",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          promotion_id: event.detail.value.aid,
          form_id: event.detail.formId,
        },
        success: function (res) {
          wx.showToast({
            title: "设置成功",
            icon: "success",
            duration: 1e3,
            mask: true
          });

          let activityList = that.data.activityList;
          activityList[event.detail.value.idx].remindMe = 2;
          that.setData({
            activityList: activityList
          });
        }
      });      
        // var e = this, i = a.detail.value.aid, n = a.detail.value.idx, o = a.detail.formId;
        // t.util.request({
        //     url: "entry/wxapp/setremind",
        //     data: {
        //         form_id: o,
        //         activityid: i,
        //         uid: e.data.userId,
        //         mod: "kanjia"
        //     },
        //     cachetime: "0",
        //     success: function(t) {
        //         wx.showToast({
        //             title: "设置成功",
        //             icon: "success",
        //             duration: 1e3,
        //             mask: !0
        //         });
        //         var a = e.data.activityList;
        //         a[n].remind = 2, e.setData({
        //             activityList: a
        //         });
        //     }
        // });
    }
});