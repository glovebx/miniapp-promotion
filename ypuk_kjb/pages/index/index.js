const app = getApp();

Page({
    data: {
        activityList: [],
        swiperList: [],
        categoryList: [],
        showcategoryList: [],
        showAllCategoryHidden: true,
        showHideCategoryHidden: true,
        page: 1,
        noMoreHidden: true,
        topBarItems: [ {
            id: "open",
            name: "正在进行",
            selected: true
        }, {
            id: "ready",
            name: "即将开始",
            selected: false
        }, {
            id: "",
            name: "全部活动",
            selected: false
        } ],
        tab: "open",
        fixedopen: 0,
        fixedarr: [],
        toptipopen: 0,
        toptiparr: [],
        // loginModelHidden: true
    },

    onLoad: function(query) {
        // let that = this;
      //   var userInfo = wx.getStorageSync("userInfo");
      // userInfo && 0 != userInfo.memberInfo.uid && "" != userInfo.memberInfo ? (that.setData({
      //   userId: userInfo.memberInfo.uid
      //   }), that.GetIndexMoreSetting()) : wx.getSetting({
      //       success: function(res) {
      //           0 == res.authSetting["scope.userInfo"] ? wx.showModal({
      //               title: "提示",
      //               content: "允许小程序获取您的用户信息后才可参与砍价哦",
      //               showCancel: false,
      //               success: function(res) {
      //                   res.confirm && wx.openSetting({
      //                       success: function(res) {
      //                           1 == res.authSetting["scope.userInfo"] && (that.setData({
      //                               loginModelHidden: false
      //                           }), wx.removeStorageSync("userInfo"));
      //                       }
      //                   });
      //               }
      //           }) : (wx.removeStorageSync("userInfo"), that.setData({
      //               loginModelHidden: false
      //           }));
      //       }
      //   });
      this.GetIndexMoreSetting();
      this.initData();      
      this.GetList();
    },

    initData: function() {
      let that = this;
      // banner列表
      wx.request({
        url: app.config.URI + "/banner/list",
        header: {
          "Content-Type": "json"
        },
        success: function (res) {
          that.setData({
            swiperList: res.data.data,
          });
        }
      });

      // notice列表
      wx.request({
        url: app.config.URI + "/notice/list",
        header: {
          "Content-Type": "json"
        },
        success: function (res) {
          that.setData({
            noticeList: res.data.data,
          });
        }
      });
    },

    // updateUserInfo: function(event) {
    //     var that = this;
    //     app.util.getUserInfo(function(userInfo) {
    //       userInfo = wx.getStorageSync("userInfo"), that.setData({
    //           userId: userInfo.memberInfo.uid,
    //             loginModelHidden: true
    //         }), that.GetIndexMoreSetting();
    //     }, event.detail);
    // },

    onShow: function() {
        // var that = this;
        // wx.getStorage({
        //     key: "toptipHidden",
        //     success: function(res) {
        //         res.data < Date.parse(new Date()) ? (that.setData({
        //             "toptiparr.toptiphidden": false
        //         }), wx.removeStorage({
        //             key: "toptipHidden"
        //         })) : that.setData({
        //             "toptiparr.toptiphidden": true
        //         });
        //     },
        //     fail: function(a) {
        //         that.setData({
        //             "toptiparr.toptiphidden": false
        //         });
        //     }
        // });

    },

  previewImage: function (event) {
    let url = event.currentTarget.dataset.url;
    let urls = []
    for (var i = 0; i < this.data.swiperList.length; i++) {
      urls[i] = this.data.swiperList[i].picUrl;
    }
    wx.previewImage({
      current: url,
      urls: urls
    });
  },

    onReachBottom: function() {
        var that = this;
        var a = that.data.page;
        var e = that.data.tab;
        that.setData({
            page: a + 1
        }), that.GetList(e);
    },

    onTapTag: function(event) {
      var a = this;
      var e = event.currentTarget.id;
      var i = a.data.topBarItems;
      for (var o = 0; o < i.length; o++) e == i[o].id ? i[o].selected = true : i[o].selected = false;
      a.setData({
            topBarItems: i,
            tab: e,
            page: 1,
            activityList: [],
            noMoreHidden: true
        }), 0 !== e ? a.GetList(e) : a.GetList("open");
    },

    CloseTopTip: function() {
        this.setData({
            "toptiparr.toptiphidden": true
        }), wx.setStorage({
            key: "toptipHidden",
            data: parseInt(Date.parse(new Date())) + parseInt(1728e5)
        });
    },

    ToSwiperApp: function(event) {
      // var a = event.currentTarget.id;
      //   wx.navigateToMiniProgram({
      //       appId: this.data.swiperList[a].swiper_mappid,
      //       path: this.data.swiperList[a].swiper_mapppath
      //   });
    },

    ToToptipApp: function() {
        // wx.navigateToMiniProgram({
        //     appId: this.data.toptiparr.toptipmappid,
        //     path: this.data.toptiparr.toptipmapppath
        // });
    },

    ToFixedApp: function() {
        // wx.navigateToMiniProgram({
        //     appId: this.data.fixedarr.fixedmappid,
        //     path: this.data.fixedarr.fixedmapppath
        // });
    },

    // GetCategory: function() {
    //     var that = this;
    //     app.util.request({
    //         url: "entry/wxapp/categorylist",
    //         cachetime: "0",
    //         data: {
    //             type: 1
    //         },
    //         success: function(res) {
    //             var e = that.data.showcategoryList;
    //             var i = that.data.showAllCategoryHidden;
    //             if (res.data.data && 3 < res.data.data.length && res.data.data.length <= 4) for (var o = 0; o < 4; o++) e.push(res.data.data[o]); else if (res.data.data && 4 < res.data.data.length) {
    //                 for (o = 0; o < 3; o++) e.push(res.data.data[o]);
    //                 i = false;
    //             } else e = res.data.data;
    //             a.setData({
    //                 showcategoryList: e,
    //                 categoryList: res.data.data,
    //                 showAllCategoryHidden: i
    //             });
    //         }
    //     });
    // },

    showAllCategory: function() {
        var that = this;
      var a = (that.data.showcategoryList, that.data.categoryList);
      that.setData({
            showcategoryList: a,
            showAllCategoryHidden: true,
            showHideCategoryHidden: false
        });
    },

    hideAllCategory: function() {
        var t = [];
        var a = this.data.categoryList;
        if (3 < a.length && a.length <= 4) for (var e = 0; e < 4; e++) t.push(a[e]);
        if (4 < a.length) for (e = 0; e < 3; e++) t.push(a[e]);
        this.setData({
            showcategoryList: t,
            showAllCategoryHidden: false,
            showHideCategoryHidden: true
        });
    },

    GetIndexMoreSetting: function() {
      let token = wx.getStorageSync('token');
      if (!token) token = '';

      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/index/setting",
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

          1 == res.data.data.fixedico.fixedopen && that.setData({
            fixedopen: 1,
            fixedarr: res.data.data.fixedico
          });
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
        // app.util.request({
        //   url: app.config.URI + "/shop/promotion/getindexmoresetting",
        //   cachetime: "0",
        //   success: function(res) {
        //       1 == res.data.data.fixedico.fixedopen && that.setData({
        //           fixedopen: 1,
        //           fixedarr: res.data.data.fixedico
        //       }), 1 == res.data.data.toptip.toptipopen && (that.setData({
        //           toptipopen: 1,
        //           toptiparr: res.data.data.toptip
        //       }), wx.getStorage({
        //           key: "toptipHidden",
        //           success: function(res) {
        //               res.data < Date.parse(new Date()) ? (that.setData({
        //                   "toptiparr.toptiphidden": false
        //               }), wx.removeStorage({
        //                   key: "toptipHidden"
        //               })) : that.setData({
        //                   "toptiparr.toptiphidden": true
        //               });
        //           },
        //           fail: function(res) {
        //               that.setData({
        //                   "toptiparr.toptiphidden": false
        //               });
        //           }
        //       }))
        //     }
        // });
    },

    GetList: function() {
        let that = this;
        // app.util.request({
        //     url: "entry/wxapp/list",
        //     data: {
        //       page: that.data.page,
        //       tab: that.data.tab,
        //       uid: that.data.userId,
        //       version: "4.2"
        //     },
        //     cachetime: "0",
        //     success: function(res) {
        //         res.data.data && 0 < res.data.data.length ? that.setData({
        //             activityList: that.data.activityList.concat(res.data.data)
        //         }) : that.setData({
        //             noMoreHidden: false
        //         });
        //     }
        // });
      let token = wx.getStorageSync('token');
      if (!token) token = '';

      // 默认是所有正在进行的
      wx.request({
        url: app.config.URI + "/shop/promotion/list",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          status: that.data.tab,
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

  nav2Page: function(event) {
    wx.navigateTo({
      url: event.currentTarget.dataset.url,
    })
  },

  go2Detail: function (event) {
    wx.navigateTo({
      url: event.currentTarget.dataset.url,
    })
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
      // var that = this;
      // var i = event.detail.value.aid;
      // var o = event.detail.value.idx;
      // var d = event.detail.value.mod;
      // var n = event.detail.formId;
      // app.util.request({
      //     url: "entry/wxapp/setremind",
      //     data: {
      //         form_id: n,
      //         activityid: i,
      //         uid: that.data.userId,
      //         mod: d
      //     },
      //     cachetime: "0",
      //     success: function(res) {
      //         wx.showToast({
      //             title: "设置成功",
      //             icon: "success",
      //             duration: 1e3,
      //             mask: true
      //         });
      //       var activityList = res.data.activityList;
      //       activityList[o].remind = 2;
      //       that.setData({
      //         activityList: activityList
      //       });
      //     }
      // });
    }
});