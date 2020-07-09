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
        noMoreHidden: true,
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
        // loginModelHidden: true
    },

    onLoad: function(t) {
        var that = this;
        // a.setData({
        //     nowCatid: t.catid
        // });
        // var e = wx.getStorageSync("userInfo");
        // e && 0 != e.memberInfo.uid && "" != e.memberInfo ? (a.setData({
        //     userId: e.memberInfo.uid
        // }), a.GetBargainInfo()) : wx.getSetting({
        //     success: function(t) {
        //         0 == t.authSetting["scope.userInfo"] ? wx.showModal({
        //             title: "提示",
        //             content: "允许小程序获取您的用户信息后才可参与砍价哦",
        //             showCancel: false,
        //             success: function(t) {
        //                 t.confirm && wx.openSetting({
        //                     success: function(t) {
        //                         1 == t.authSetting["scope.userInfo"] && (a.setData({
        //                             loginModelHidden: false
        //                         }), wx.removeStorageSync("userInfo"));
        //                     }
        //                 });
        //             }
        //         }) : (wx.removeStorageSync("userInfo"), a.setData({
        //             loginModelHidden: false
        //         }));
        //     }
        // }), a.GetFixedOrTipSetting();
      that.GetFixedOrTipSetting();
      that.GetList();
    },

    // updateUserInfo: function(a) {
    //     var e = this;
    //     t.util.getUserInfo(function(t) {
    //         t = wx.getStorageSync("userInfo"), e.setData({
    //             userId: t.memberInfo.uid,
    //             loginModelHidden: true
    //         }), e.GetCategory();
    //     }, a.detail);
    // },

    onShow: function() {
        // var that = this;
        // wx.getStorage({
        //     key: "toptipHidden",
        //     success: function(res) {
        //       res.data < Date.parse(new Date()) ? (that.setData({
        //             "toptiparr.toptiphidden": false
        //         }), wx.removeStorage({
        //             key: "toptipHidden"
        //         })) : that.setData({
        //             "toptiparr.toptiphidden": true
        //         });
        //     },
        //     fail: function(res) {
        //       that.setData({
        //             "toptiparr.toptiphidden": false
        //         });
        //     }
        // });
    },

  stopBubble: function () {
    console.log('ooooooooooooo');
  },

    onReachBottom: function() {
        var that = this;
        var a = that.data.page;
        // t.data.tab;
        that.setData({
            page: a + 1
        }), that.GetList();
    },

    GetFixedOrTipSetting: function() {
        var that = this;
        // t.util.request({
        //     url: "entry/wxapp/fixedortipsetting",
        //     cachetime: "0",
        //     success: function(t) {
        //         1 == t.data.data.toptip.toptipopen && (a.setData({
        //             toptipopen: 1,
        //             toptiparr: t.data.data.toptip
        //         }), wx.getStorage({
        //             key: "toptipHidden",
        //             success: function(t) {
        //                 t.data < Date.parse(new Date()) ? (a.setData({
        //                     "toptiparr.toptiphidden": false
        //                 }), wx.removeStorage({
        //                     key: "toptipHidden"
        //                 })) : a.setData({
        //                     "toptiparr.toptiphidden": true
        //                 });
        //             },
        //             fail: function(t) {
        //                 a.setData({
        //                     "toptiparr.toptiphidden": false
        //                 });
        //             }
        //         }));
        //     }
        // });
      let token = wx.getStorageSync('token');
      if (token == undefined) token = '';

      wx.request({
        url: app.config.URI + "/shop/promotion/setting",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
        },
        success: function (res) {
          if (res.data.code != 0) {
            return;
          }
          1 == res.data.data.toptip.toptipopen && (that.setData({
            toptipopen: 1,
            toptiparr: res.data.data.toptip
          }), wx.getStorage({
            key: "toptipHidden",
            success: function (res) {
              res.data < Date.parse(new Date()) ? (that.setData({
                "toptiparr.toptiphidden": false
              }), wx.removeStorage({
                key: "toptipHidden"
              })) : that.setData({
                "toptiparr.toptiphidden": true
              });
            },
            fail: function (res) {
              that.setData({
                "toptiparr.toptiphidden": false
              });
            }
          }));
        }
      });        
    },

    CloseTopTip: function() {
        this.setData({
            "toptiparr.toptiphidden": true
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

    bindTypeChange: function(event) {
        this.setData({
          page: 1,
          typeIndex: event.detail.value,
            activityList: []
        }), this.GetList();
    },

    bindCategoryChange: function(event) {
        this.setData({
          page: 1,
          catIndex: event.detail.value,
            activityList: []
        }), this.GetList();
    },

    // GetCategory: function() {
    //     var a = this;
    //     t.util.request({
    //         url: "entry/wxapp/categorylist",
    //         cachetime: "0",
    //         data: {
    //             type: 3
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
        var that = this;
        // t.util.request({
        //     url: "entry/wxapp/catgroupbuy",
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
        //             noMoreHidden: false
        //         });
        //     }
        // });
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
          category: 'group_buy',
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

    setRemind: function(event) {
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
        //         mod: "groupbuy"
        //     },
        //     cachetime: "0",
        //     success: function(t) {
        //         wx.showToast({
        //             title: "设置成功",
        //             icon: "success",
        //             duration: 1e3,
        //             mask: true
        //         });
        //         var a = e.data.activityList;
        //         a[n].remind = 2, e.setData({
        //             activityList: a
        //         });
        //     }
        // });
    }
});