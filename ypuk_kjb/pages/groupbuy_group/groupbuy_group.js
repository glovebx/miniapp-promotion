const pay = require("../../resource/js/pay.js");
const wxp = require("../../resource/wxParse/wxParse.js");
const app = getApp();

let shareUid = '';
let transUid = '';

Page({
    data: {
        activityInfo: [],
        activityId: "",
        unit: "",
        page: 1,
        interval: 0,
        bargainModelHidden: true,
        shareMenuHidden: true,
        fixedopen: 0,
        fixedarr: [],
        toptipopen: 0,
        toptiparr: [],
        ulatitude: "",
        ulongitude: "",
        showLoginBtn: false,
      tmplIds: []
    },

  onLoad: function (query) {
    let that = this;
    const params = query.scene ? decodeURIComponent(query.scene).split('-') :
      [query.shareUid || '', query.transUid || '', query.activityid, query.unit || ''];
    shareUid = params[0];
    transUid = params[1];
    this.setData({
      activityId: params[2],
      unit: params[3]
    });

      
    this.GetRecommendList();
    this.GetFixedOrTipSetting();
    this.getSubscribeTmpls();

      let token = wx.getStorageSync('token');
      if (!token) {
        console.log('no tokan!!!!');
        // 仅在本地token 不存在，且用户已经授权的情况下(本地token被清理了)，尝试自动登录
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userInfo']) {
              console.log('has authSetting!!!!');
              // 直接获取userInfo然后登录  
              that.autoLogin();
            } else {
              // 去登录授权页面
              // that.goLoginPageTimeOut();
              console.log('no authSetting!!!!');
              that.setData({
                showLoginBtn: true
              })
            }
          }, fail: function(res) {
            console.log('has fail!!!!');
            that.setData({
              showLoginBtn: true
            })            
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
                // 获取详情
                that.GetActivityDetail();
              }
            })
          }
        });

      }
    })
  },

  toLoginPage: function() {
    wx.navigateTo({
      url: "../../pages/tologin/tologin"
    })
  },

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "../../pages/tologin/tologin"
      })
    }, 1000)
  },

    onShow: function() {
      this.GetActivityDetail();
    },
  stopBubble: function () {
    console.log('ooooooooooooo');
  },
    GetLocation: function() {
        var t = this;
        wx.getLocation({
            type: "gcj02",
            success: function(a) {
                t.setData({
                    ulatitude: a.latitude,
                    ulongitude: a.longitude
                });
            }
        });
    },

    onShareAppMessage: function() {
      let that = this;
      let uid = wx.getStorageSync('uid');
      if (!uid) uid = '';
      
      let title = that.data.activityInfo.shareTitle ? that.data.activityInfo.shareTitle : "原价"
        + that.data.activityInfo.originalPrice + "元的"
        + that.data.activityInfo.shareName
        + "，拼团后只需" + that.data.activityInfo.unitPrice.unitPrice
        + "元，快来一起拼啊";

      let url = that.data.activityInfo.shareImageUrl ? that.data.activityInfo.shareImageUrl : that.data.activityInfo.coverPic;        
        return {
            title: title,
            imageUrl: url,
          path: "ypuk_kjb/pages/groupbuy_group/groupbuy_group?activityid=" + that.data.activityId 
            + "&unit=" + that.data.unit + "&shareUid=" + (shareUid || uid) + "&transUid=" + uid,
            success: function(res) {
                wx.showToast({
                    title: "转发成功",
                    icon: "success",
                    duration: 1e3,
                    mask: true
                });
            }
        };
    },

    shareMenu: function() {
        this.setData({
            shareMenuHidden: false
        });
    },

    toHome: function() {
        wx.switchTab({
            url: "../../pages/index/index"
        });
    },

    GetFixedOrTipSetting: function() {
        // var a = this;
        // t.util.request({
        //     url: "entry/wxapp/fixedortipsetting",
        //     cachetime: "0",
        //     success: function(t) {
        //         1 == t.data.data.fixedico.fixedopen && a.setData({
        //             fixedopen: 1,
        //             fixedarr: t.data.data.fixedico
        //         }), 1 == t.data.data.toptip.toptipopen && (a.setData({
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
      if (!token) token = '';

      let that = this;
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

    ToFixedApp: function() {
        // wx.navigateToMiniProgram({
        //     appId: this.data.fixedarr.fixedmappid,
        //     path: this.data.fixedarr.fixedmapppath
        // });
    },

  GetGroupDetail: function (token) {
    let that = this;
    wx.request({
      url: app.config.URI + "/shop/promotion/group_buy/detail",
      header: {
        "Content-Type": "json"
      },
      data: {
        token: token,
        share_uid: shareUid,
        promotion_id: that.data.activityId,
        unit: that.data.unit,
      },
      success: function (res) {
        that.setData({
          'activityInfo.extraInfo': res.data.data
        });
      }
    });
  },    

  GetActivityDetail: function() {
        // var e = this;
        // t.util.request({
        //     url: "entry/wxapp/getgroup",
        //     cachetime: "0",
        //     data: {
        //         uid: e.data.userId,
        //         gid: e.data.activityId
        //     },
        //     success: function(t) {
        //         e.OpenCountDown(t.data.data.endyear, t.data.data.endmonth, t.data.data.endday, t.data.data.endhours, t.data.data.endminutes, t.data.data.endseconds), 

        //         a.wxParse("activityDesc", "html", t.data.data.activity.intro, e, 20), e.setData({
        //             activityInfo: t.data.data
        //         });
        //     },
        //     fail: function(t) {
        //         1 == t.data.errno && wx.showModal({
        //             title: "提示",
        //             content: t.data.message,
        //             showCancel: false,
        //             success: function(t) {
        //                 t.confirm && wx.navigateBack();
        //             }
        //         });
        //     }
        // });
      let token = wx.getStorageSync('token');
      if (!token) return;

    if (this.data.showLoginBtn) {
      this.setData({
        showLoginBtn: false
      });
    }
      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/detail",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          share_uid: shareUid,
          promotion_id: that.data.activityId,
          unit: that.data.unit,
        },
        success: function (res) {
          if (res.data.data.countdownTimes) {
            let countdowns = res.data.data.countdownTimes.split(',');
            that.OpenCountDown(countdowns[0], countdowns[1], countdowns[2]
              , countdowns[3], countdowns[4], countdowns[5]);
          }

          wxp.wxParse("activityDesc", "html", res.data.data.goodsDesc, that, 20);
          that.setData({
            activityInfo: res.data.data
          });

          // 获取额外的砍价信息
          that.GetGroupDetail(token);
        }
      });           
    },

  ShowCountDown: function (year, month, day, hour, minute, second) {
    var s = new Date(year, month - 1, day, hour, minute, second).getTime() - (new Date()).getTime();
    var c = (day = Math.floor(s / 1e3 / 60 / 60 / 24)) + "天"
      + (hour = Math.floor(s / 1e3 / 60 / 60 % 24)) + "小时"
      + (minute = Math.floor(s / 1e3 / 60 % 60)) + "分"
      + (second = Math.floor(s / 1e3 % 60)) + "秒";    
    if (day == -1 && hour == -1 && minute == -1 && second == -2) {
      // 倒计时结束，刷新页面，明确写-1和-2是为了防止循环刷新页面
      this.GetActivityDetail();
    } else {
      this.setData({
        CountDown: c
      });
    }
  },

  OpenCountDown: function (year, month, day, hour, minute, second) {
    let that = this;
    let interval = setInterval(function () {
      that.ShowCountDown(year, month, day, hour, minute, second);
    }, 1000);
    that.setData({
      interval: interval
    })
  },

  onUnload: function () {
    // 停止计时器
    if (this.data.interval) {
      clearInterval(this.data.interval);
    }
  },
    // ShowCountDown: function(t, a, e, i, o, n) {
    //     var d = new Date(), r = new Date(t, a - 1, e, i, o, n).getTime() - d.getTime(), p = (e = Math.floor(r / 1e3 / 60 / 60 / 24)) + "天" + (i = Math.floor(r / 1e3 / 60 / 60 % 24)) + "小时" + (o = Math.floor(r / 1e3 / 60 % 60)) + "分" + (n = Math.floor(r / 1e3 % 60)) + "秒";
    //     "-1" == t && "-1" == a && "-1" == e && "-1" == i && "-1" == o && "-2" == o ? this.GetGroupDetail() : this.setData({
    //         CountDown: p
    //     });
    // },

    // OpenCountDown: function(t, a, e, i, o, n) {
    //     var d = this;
    //     setInterval(function() {
    //         d.ShowCountDown(t, a, e, i, o, n);
    //     }, 1e3);
    // },

  HelpGroup: function() {
      wx.navigateTo({
        url: "../../pages/groupbuy_add/groupbuy_add?activityid=" + this.data.activityId + "&unit=" + this.data.unit + "&shareUid=" + shareUid
      });
  },

    GetRecommendList: function() {
        // var a = this;
        // t.util.request({
        //     url: "entry/wxapp/groupbuyrecommendlist",
        //     cachetime: "0",
        //     success: function(t) {
        //         t.data.data && 0 < t.data.data.length ? a.setData({
        //             activityList: t.data.data
        //         }) : a.setData({
        //             noMoreHidden: false
        //         });
        //     }
        // });
      let token = wx.getStorageSync('token');
      if (!token) token = '';

      let that = this;
      // 推荐的
      wx.request({
        url: app.config.URI + "/shop/promotion/recommend",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          promotion_id: that.data.activityId,
          page: that.data.page,
        },
        success: function (res) {
          res.data.data && 0 < res.data.data.length ? that.setData({
            activityList: res.data.data
          }) : that.setData({
            noMoreHidden: false
          });
        }
      });            
    },

    ToOrder: function(event) {
        wx.navigateTo({
          url: "../../pages/groupbuy_orderdetail/groupbuy_orderdetail?orderno=" + event.currentTarget.dataset.order_no
        });
    },

    Pay: function(event) {
      let that = this;
      // pay.wxpay(app
      //   , event.currentTarget.dataset.price
      //   , event.currentTarget.dataset.order_no
      //   , "../../pages/groupbuy_group/groupbuy_group?activityid=" + that.data.activityId + "&unit=" + that.data.unit);

      const orderNo = event.currentTarget.dataset.order_no;
      // Promise版支付
      pay.wxpay2(app, event.currentTarget.dataset.price, orderNo).then(res => {
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
        // console.log(res);
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
      url: "../../pages/groupbuy_group/groupbuy_group?activityid=" + this.data.activityId + "&unit=" + this.data.unit
    });
  },    
});