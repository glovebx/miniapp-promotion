const app = getApp();
const wxp = require("../../resource/wxParse/wxParse.js");
var shareUid = '';
var transUid = '';

Page({
    data: {
      activityInfo: [],
      activityId: "",
      progressWidth: 1,
      bargainModelHidden: true,
      bargainText: "0",
      bargainPrice: "0",
      bargainIcoPrice: "0",
      progressEndicoColor: "#bbb",
      progressNowpriceLeft: 7,
      shareMenuHidden: true,
      fixedopen: 0,
      fixedarr: [],
      toptipopen: 0,
      toptiparr: [],
      ulatitude: "",
      ulongitude: "",
      interval: 0,
      showLoginBtn: false,
    },

  onLoad: function (query) {
    let that = this;
    const params = query.scene ? decodeURIComponent(query.scene).split('-') :
      [query.shareUid || '', query.transUid || '', query.activityid];
    shareUid = params[0];
    transUid = params[1];
    that.setData({
      activityId: params[2],
    });

    this.GetFixedOrTipSetting();

    let token = wx.getStorageSync('token');
    if (!token) {
      // 仅在本地token 不存在，且用户已经授权的情况下(本地token被清理了)，尝试自动登录
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 直接获取userInfo然后登录  
            that.autoLogin(false);
          } else {
            that.setData({
              showLoginBtn: true
            });
          }
        }, fail: function (res) {
          console.log('has fail!!!!');
          that.setData({
            showLoginBtn: true
          })
        }
      });
      return;
    }
  },

  autoLogin: function (event) {
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
                if (!event) {
                  that.GetActivityDetail();
                } else {
                  that.AddBargain(event);
                }
              }
            })
          }
        });

      }
    })
  },
  // toLoginPage: function () {
  //   wx.navigateTo({
  //     url: "../../pages/tologin/tologin"
  //   })
  // },
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

    // GetLocation: function() {
    //     var t = this;
    //     wx.getLocation({
    //         type: "gcj02",
    //         success: function(a) {
    //             t.setData({
    //                 ulatitude: a.latitude,
    //                 ulongitude: a.longitude
    //             });
    //         }
    //     });
    // },

    onShareAppMessage: function() {
      let that = this;
      let uid = wx.getStorageSync('uid');
      if (!uid) uid = '';

      let title = "我正在参加" + that.data.activityInfo.shareName + " 砍价活动，快来帮我砍一刀！";
      let url = that.data.activityInfo.shareImageUrl ? that.data.activityInfo.shareImageUrl : that.data.activityInfo.coverPic;
        
      return {
        title: title,
        imageUrl: url,
        path: "ypuk_kjb/pages/bargain/bargain?activityid=" + that.data.activityId + "&shareUid=" + (shareUid || uid) + "&transUid=" + uid,
        success: function(t) {
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

    CloseShareMenu: function() {
        this.setData({
            shareMenuHidden: true
        });
    },

    GetBargainPoster: function() {
      let token = wx.getStorageSync('token');
      if (!token) token = '';

      wx.showLoading({
        title: '加载中',
      });
      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/poster",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          share_uid: shareUid,
          promotion_id: that.data.activityId,
          page: 'ypuk_kjb/pages/bargain/bargain'
        },
        success: function (res) {
          wx.hideLoading();

          if (res.data.code == 0) {            
            let url = res.data.data.url;
            if (!url) {
              wx.showToast({
                title: '暂时没有海报哦',
              })
              return;
            }
            wx.showModal({
              title: "提示",
              content: "海报可能加载时间较长，请您耐心等待",
              showCancel: true,
              success: function (res) {
                res.confirm && wx.previewImage({
                  current: url,
                  urls: [url]
                });
              }
            });
          }
        }, fail: function () {
          wx.hideLoading();
        }
      });          
    },

    previewImage: function (event) {
      let url = event.currentTarget.dataset.url;
      let urls = []
      for (var i = 0; i < this.data.activityInfo.pics.length; i++) {
        urls[i] = this.data.activityInfo.pics[i].pic;
      }
      wx.previewImage({
        current: url,
        urls: urls
      });
    },

  // 两个浮点数相加
  accAdd: function (arg1, arg2) {
    var r1, r2, m;
    try { r1 = arg1.toString().split(".")[1].length; } catch (e) { r1 = 0; }
    try { r2 = arg2.toString().split(".")[1].length; } catch (e) { r2 = 0; }
    m = Math.pow(10, Math.max(r1, r2));
    res = (arg1 * m + arg2 * m) / m;
    return res.toFixed(2);
  },

  GetBargainDetail: function (token) {
    let that = this;
    wx.request({
      url: app.config.URI + "/shop/promotion/bargain/detail",
      header: {
        "Content-Type": "json"
      },
      data: {
        token: token,
        share_uid: shareUid,
        promotion_id: that.data.activityId,
      },
      success: function (res) {
        if (res.data.code == 0) {
          var o = that.data.progressEndicoColor;
          var d = that.data.activityInfo.originalPrice;
          var s = that.data.activityInfo.floorPrice;
          var currentPrice = res.data.data.currentPrice;

          var n = ((d - currentPrice) / (d - s) * 100).toFixed(2);
          if (n == '100.00') {
            o = "#f60";
          }
          var r = n < 86 ? n : 86; 

          that.setData({
            progressWidth: n,
            progressEndicoColor: o,
            progressNowpriceLeft: r,
            'activityInfo.currentPrice': currentPrice,
            'activityInfo.orderInfo': res.data.data.orderInfo
          });
        }
      }
    });
  },    

    GetActivityDetail: function() {
      let token = wx.getStorageSync('token');
      if (!token) return;

      if (this.data.showLoginBtn) {
        this.setData({
          showLoginBtn: false
        });
      }

        // a.util.request({
        //     url: "entry/wxapp/getbargain",
        //     cachetime: "0",
        //     data: {
        //         uid: i.data.userId,
        //         activityId: i.data.bargainId
        //     },
        //     success: function(a) {
        //       // 第一次进入，系统帮砍一刀
        //       // 改成后台异步砍一刀，然后通过消息通知
        //         1 == t && 1 == a.data.data.isinitiator && 1 == a.data.data.activity.status && a.data.data.price == a.data.data.activity.oldprice && i.SystemBargain(), 

        //         1 == a.data.data.isinitiator && i.GetBargainPoster("hide"), 1 == a.data.data.activity.status && i.OpenCountDown(a.data.data.activity.status, a.data.data.activity.endyear, a.data.data.activity.endmonth, a.data.data.activity.endday, a.data.data.activity.endhours, a.data.data.activity.endminutes, a.data.data.activity.endseconds), 

        //         a.data.data.alreadyprice = a.data.data.activity.oldprice - a.data.data.price;
        //         var n = i.data.progressWidth, o = i.data.progressEndicoColor, r = i.data.progressNowpriceLeft, d = a.data.data.activity.oldprice, s = a.data.data.activity.lowprice;
        //         "100.00" == (n = (n = (d - a.data.data.price) / (d - s) * 100).toFixed(2)) && (o = "#f60"), 
        //         r = n < 86 ? n : 86, wxp.wxParse("activityDesc", "html", a.data.data.activity.goodsDesc, i, 20), 

        //         i.setData({
        //             progressWidth: n,
        //             bargainInfo: a.data.data,
        //             progressEndicoColor: o,
        //             progressNowpriceLeft: r
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
        },
        success: function (res) {
          if (res.data.data.countdownTimes) {
            let countdowns = res.data.data.countdownTimes.split(',');
            that.OpenCountDown(res.data.data.status, countdowns[0], countdowns[1], countdowns[2]
              , countdowns[3], countdowns[4], countdowns[5]);
          }

          wxp.wxParse("activityDesc", "html", res.data.data.goodsDesc, that, 20);
          that.setData({
            activityInfo: res.data.data
          });

          // 获取额外的砍价信息
          that.GetBargainDetail(token);
        }
      });
    },

    ShowCountDown: function(status, year, month, day, hour, minute, second) {
      var s = new Date(year, month - 1, day, hour, minute, second).getTime() - (new Date()).getTime();
      var c = (day = Math.floor(s / 1e3 / 60 / 60 / 24)) + "天" 
        + (hour = Math.floor(s / 1e3 / 60 / 60 % 24)) + "小时" 
        + (minute = Math.floor(s / 1e3 / 60 % 60)) + "分" 
        + (second = Math.floor(s / 1e3 % 60)) + "秒";

      if (status == 'open' && day == -1 && hour == -1 && minute == -1 && second == -2) {
        // 已经到截止时间了，更新画面1次
        this.GetActivityDetail();
      } else {
        this.setData({
          CountDown: c
        });
      }
    },

  OpenCountDown: function (status, year, month, day, hour, minute, second) {
    let that = this;
    let interval = setInterval(function() {
      that.ShowCountDown(status, year, month, day, hour, minute, second);
    }, 1000);
    that.setData({
        interval: interval
      })
    },

    onUnload: function () {
      if (this.data.interval) {
        clearInterval(this.data.interval);
      }
    }, 

    // HelpBargain: function() {
    //     var t = this, e = wx.getStorageSync("userInfo");
    //     e && 0 != e.memberInfo.uid && "" != e.memberInfo ? (t.setData({
    //         userId: e.memberInfo.uid
    //     }), t.GetHelpBargain()) : wx.getSetting({
    //         success: function(i) {
    //             0 == i.authSetting["scope.userInfo"] ? wx.showModal({
    //                 title: "提示",
    //                 content: "允许小程序获取您的用户信息后才可参与砍价哦",
    //                 showCancel: false,
    //                 success: function(i) {
    //                     i.confirm && wx.openSetting({
    //                         success: function(i) {
    //                             1 == i.authSetting["scope.userInfo"] && (wx.removeStorageSync("userInfo"), a.util.getUserInfo(function() {
    //                                 e = wx.getStorageSync("userInfo"), t.setData({
    //                                     userId: e.memberInfo.uid
    //                                 }), t.GetHelpBargain();
    //                             }));
    //                         }
    //                     });
    //                 }
    //             }) : (wx.removeStorageSync("userInfo"), a.util.getUserInfo(function() {
    //                 e = wx.getStorageSync("userInfo"), t.setData({
    //                     userId: e.memberInfo.uid
    //                 }), t.GetHelpBargain();
    //             }));
    //         }
    //     });
    // },

    // GetHelpBargain: function() {
    //     var t = this;
    //     a.util.request({
    //         url: "entry/wxapp/helpbargain",
    //         data: {
    //             uid: t.data.userId,
    //             bargainid: t.data.bargainId
    //         },
    //         success: function(a) {
    //             t.showBargainModel(a.data.data, 0);
    //         },
    //         fail: function(t) {
    //             wx.showModal({
    //                 title: "提示",
    //                 content: t.data.message,
    //                 showCancel: false
    //             });
    //         }
    //     });
    // },

    // SystemBargain: function() {
    //     var t = this;
    //     a.util.request({
    //         url: "entry/wxapp/systembargain",
    //         data: {
    //             uid: t.data.userId,
    //             bargainid: t.data.bargainId
    //         },
    //         success: function(a) {
    //             t.showBargainModel(a.data.data, 1);
    //         }
    //     });
    // },

  // 帮助好友砍价
  AddBargain: function(event) {
    let that = this;
    let token = wx.getStorageSync('token');
    if (!token) {
      // 去登录
      that.goLoginPageTimeOut();
      return;
    }
    
    wx.request({
      url: app.config.URI + "/shop/promotion/bargain/join",
      header: {
        "Content-Type": "json"
      },
      data: {
        token: token,
        share_uid: shareUid,
        promotion_id: that.data.activityId,
        form_id: event.detail.formId
      },
      success: function (res) {
        if (res.data.code == 10002) {
          wx.showModal({
            title: "提示",
            content: "当前活动您已经帮TA砍过价，是否跳转到详情页面",
            success: function (res) {
              res.confirm && wx.navigateTo({
                url: "../../pages/bargain/bargain?activityid=" + that.data.activityId + "&shareUid=" + shareUid
              });
            }
          })
        } else if (res.data.code == 901) {
          wx.getSetting({
            success(res) {
              if (res.authSetting['scope.userInfo']) {
                // 直接获取userInfo然后登录  
                that.autoLogin(event);
              } else {
                // 去登录授权页面
                that.goLoginPageTimeOut();
              }
            }
          });
        } else if (res.data.code != 0) {
          wx.showModal({
            title: "提示",
            content: res.data.msg,
            showCancel: false
          });
        } else {
          that.showBargainModel(res.data.data.amount);
          // wx.navigateTo({
          //   url: "../../pages/bargain/bargain?activityid=" + res.data.data.promotion_id + "&shareUid=" + shareUid
          // });
        }      
      }
    });        
  },

    hideBargainModel: function(event) {
        // 1 == this.data.ModelisSystem && this.AddFormid(t.detail.formId), this.setData({
        //     bargainModelHidden: true,
        //     bargainPrice: "",
        //     bargainIcoPrice: "",
        //     bargainText: "",
        //     ModelisSystem: 0
        // }), this.GetActivityDetail();
      this.setData({
        bargainModelHidden: true,
        bargainPrice: "",
        bargainIcoPrice: "",
        bargainText: "",
        // ModelisSystem: 0
      });
      this.GetActivityDetail();
    },

    showBargainModel: function(amount) {
        var title = "小手一甩，成功帮TA砍下一刀";
        this.setData({
          bargainModelHidden: false,
          bargainPrice: "砍掉" + amount + "元",
          bargainIcoPrice: amount + "元",
          bargainText: title,
          // ModelisSystem: e
        });
    }
});