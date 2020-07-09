const app = getApp();
const wxp = require("../../resource/wxParse/wxParse.js");

let shareUid = '';
let transUid = '';

Page({
    data: {
      activityInfo: [],
      activityList: [],
      activityId: "",
      page: 1,
      fixedopen: 0,
      fixedarr: [],
      toptipopen: 0,
      toptiparr: [],
      ulatitude: "",
      ulongitude: "",
      shareMenuHidden: true,
      interval: 0,
      coupons: [],
      freeLucky: false,
    },
  onLoad: function (query) {
    let that = this;
    const params = query.scene ? decodeURIComponent(query.scene).split('-') :
      [query.shareUid || '', query.transUid || '', query.activityid];
    shareUid = params[0];
    transUid = params[1];
    this.setData({
      activityId: params[2],
    });

      this.GetRecommendList();
      this.GetFixedOrTipSetting();

    let token = wx.getStorageSync('token');
    if (!token) {
        // 仅在本地token 不存在，且用户已经授权的情况下(本地token被清理了)，尝试自动登录
        wx.getSetting({
          success(res) {
            if (res.authSetting['scope.userInfo']) {
              // 直接获取userInfo然后登录  
              that.autoLogin();
            // } else {
            //   // 去登录授权页面
            //   that.goLoginPageTimeOut();
            }
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

    showFreeLucky: function() {
      let that = this;
      // 获取优惠券
      setTimeout(function () {
        wx.request({
          url: app.config.URI + "/discounts/scene",
          data: {
            token: '',
            scene: 'entry'
          },
          header: {
            "Content-Type": "json"
          },
          success: function (res) {
            that.setData({
              coupons: res.data.data
            });
            if (res.data.data && res.data.data.length > 0) {
              that.setData({
                freeLucky: true
              });
            }
          }
        })
      }, 1000);
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
            },
            complete: function(a) {
                t.GetActivityDetail();
            }
        });
    },

    toHome: function() {
        wx.switchTab({
            url: "../../pages/index/index"
        });
    },

    onShareAppMessage: function() {
      let uid = wx.getStorageSync('uid');
      if (!uid) uid = '';

      let that = this;
      let title = that.data.activityInfo.shareTitle ? that.data.activityInfo.shareTitle : "我正在疯狂抢购" + that.data.activityInfo.shareName + "，你也来抢吧！";
      let url = that.data.activityInfo.shareImageUrl ? that.data.activityInfo.shareImageUrl : that.data.activityInfo.converPic;
      return {
          title: title,
          imageUrl: url,
          path: "ypuk_kjb/pages/panicbuy_detail/panicbuy_detail?activityid=" + that.data.activityId 
            + "&shareUid=" + (shareUid || uid) + "&transUid=" + uid,
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

    shareMenu: function() {
        this.setData({
            shareMenuHidden: false
        });
    },

    CloseShareMenu: function() {
        this.setData({
            shareMenuHidden: true
        });
    },

    showActivityPoster: function() {
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
          page: 'ypuk_kjb/pages/panicbuy_detail/panicbuy_detail'
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
  
    CloseTopTip: function() {
        this.setData({
            "toptiparr.toptiphidden": true
        }), wx.setStorage({
            key: "toptipHidden",
            data: parseInt(Date.parse(new Date())) + parseInt(172800000)
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

    GetRecommendList: function() {
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
            activityList: that.data.activityList.concat(res.data.data)
          }) : that.setData({
            noMoreHidden: false
          });
        }
      }); 
    },

    OpenBusiness: function() {
        wx.navigateTo({
            url: "../../pages/business_detail/business_detail?businessid=" + this.data.activityInfo.businessid
        });
    },

    toBuy: function() {
      let token = wx.getStorageSync('token');
      if (!token) {
        // 去登录
        this.goLoginPageTimeOut();
        return;
      }      
        let that = this;
        // t.util.request({
        //     url: "entry/wxapp/checkstock",
        //     data: {
        //         id: a.data.activityId,
        //         type: 2
        //     },
        //     cachetime: "0",
        //     success: function(t) {
        //         wx.navigateTo({
        //             url: "../../pages/panicbuy_addorder/panicbuy_addorder?activityid=" + a.data.activityId
        //         });
        //     }
        // });
      wx.navigateTo({
        url: "../../pages/panicbuy_addorder/panicbuy_addorder?activityid=" + that.data.activityId
      });        
    },

    OpenMap: function() {
        wx.openLocation({
            latitude: Number(this.data.activityInfo.business.latitude),
            longitude: Number(this.data.activityInfo.business.longitude),
            scale: 28
        });
    },

    CallBusiness: function() {
        wx.makePhoneCall({
            phoneNumber: this.data.activityInfo.business.tel
        });
    },

  // submitFormId: function (token) {
  //   let formids = wx.getStorageSync("formid");
  //   if (formids.length > 0) {
  //     let formidTimes = wx.getStorageSync("formidTime");
  //     let data = [];
  //     for (let i = 0; i < formids.length; i++) {
  //       let obj = new Object();
  //       obj.formid = formids[i];
  //       obj.timestamp = formidTimes[i];
  //       data[i] = obj;
  //     }
  //     // formids = [];
  //     // formidTimes = [];
  //     // wx.setStorageSync("formid", formids);
  //     // wx.setStorageSync("formidTime", formidTimes);
  //     // 清除
  //     wx.setStorageSync("formid", []);
  //     wx.setStorageSync("formidTime", []);
  //     let params = JSON.stringify(data);
  //     wx.request({
  //       url: app.config.URI + "/shop/promotion/init_form_id",
  //       data: {
  //         token: token,
  //         promotion_id: this.data.activityId,
  //         params: params
  //       },
  //       header: {
  //         "content-type": "application/x-www-form-urlencoded"
  //       },
  //       method: "POST",
  //       success: function (res) {
  //       }
  //     });
  //   }
  // },

    GetActivityDetail: function() {
      let that = this;
      let token = wx.getStorageSync('token');
      if (token == undefined) token = '';

      if ((!token || wx.getStorageSync('new_user')) && !this.data.freeLucky) {
        let noFreeLucky = wx.getStorageSync('no_free_lucky') || 0;
        if (noFreeLucky - parseInt(Date.parse(new Date())) <= 0) {
          this.showFreeLucky();
          wx.removeStorage({
            key: 'no_free_lucky',
            success: function (res) { },
          });
        }
        wx.removeStorage({
          key: 'new_user',
          success: function (res) { },
        });
      }
      // if (this.data.coupons && this.data.coupons.length > 0 
      //   && (!token || wx.getStorageSync('new_user'))) {
      //   if (!this.data.freeLucky) {
      //     this.setData({
      //       freeLucky: true
      //     });
      //   }
      //   wx.removeStorage({
      //     key: 'new_user',
      //     success: function(res) {},
      //   });
      // }

      wx.request({
        url: app.config.URI + "/shop/promotion/detail",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          share_uid: shareUid,
          promotion_id: that.data.activityId,
          ulat: that.data.ulatitude,
          ulng: that.data.ulongitude
        },
        success: function (res) {
          if (res.data.data.countdownTimes) {
            let countdowns = res.data.data.countdownTimes.split(',');
            that.OpenCountDown(countdowns[0], countdowns[1], countdowns[2]
              , countdowns[3], countdowns[4], countdowns[5]);
          }
          
          // 'ready' == res.data.data.status && that.OpenCountDown(res.data.data.startyear, res.data.data.startmonth, res.data.data.startday, res.data.data.starthours, res.data.data.startminutes, res.data.data.startseconds),
          //   'open' == res.data.data.status && that.OpenCountDown(res.data.data.endyear, res.data.data.endmonth, res.data.data.endday, res.data.data.endhours, res.data.data.endminutes, res.data.data.endseconds);
          wxp.wxParse("goodDesc", "html", res.data.data.goodsDesc, that, 20);
          that.setData({
            activityInfo: res.data.data
          });
        }
      });

    },


  ShowCountDown: function (year, month, day, hour, minute, second) {
    var s = new Date(year, month - 1, day, hour, minute, second).getTime() - (new Date()).getTime();
    day = Math.floor(s / 1000 / 60 / 60 / 24);
    hour = Math.floor(s / 1000 / 60 / 60 % 24);
    minute = Math.floor(s / 1000 / 60 % 60);
    second = Math.floor(s / 1000 % 60);
    if (day == -1 && hour == -1 && minute == -1 && second == -2) {
      // 倒计时结束，刷新页面，明确写-1和-2是为了防止循环刷新页面
      this.GetActivityDetail();
    } else {
      this.setData({
        CountDown_day: day > 9 ? day : '0' + day,
        CountDown_hour: hour > 9 ? hour : '0' + hour,
        CountDown_minute: minute > 9 ? minute : '0' + minute,
        CountDown_second: second > 9 ? second : '0' + second
      });
    }
    // "-1" == day && "-1" == hour && "-1" == minute && "-2" == second ? this.GetActivityDetail() : this.setData({
    //   CountDown_day: day,
    //   CountDown_hour: hour,
    //   CountDown_minute: minute,
    //   CountDown_second: second
    // });
  },

  OpenCountDown: function (year, month, day, hour, minute, second) {
    let that = this;
    let interval = setInterval(function () {
      that.ShowCountDown(year, month, day, hour, minute, second);
    }, 1000);
    that.setData({
      interval: interval
    });
  },

  onUnload: function () {
    if (this.data.interval) {
      clearInterval(this.data.interval);
    }
  }, 

  // 领取优惠券
  getFreeLucky: function(event) {
    // console.log(event);
    let token = wx.getStorageSync('token');
    if (!token) {
      // 去登录
      this.goLoginPageTimeOut();
      return;
    }
    // 领取优惠券
    this.getCoupons(event);
  },

  getCoupons: function (event) {
    wx.request({
      url: app.config.URI + "/discounts/fetch",
      data: {
        token: wx.getStorageSync('token'),
        coupon_id: event.currentTarget.dataset.id,
        form_id: event.detail.formId
      },
      header: {
        "Content-Type": "json"
      },
      success: function (res) {
        0 == res.data.code ? wx.showToast({
          title: "领取成功",
          icon: "success",
          image: "../../resource/images/coupons-icon-o.png",
          duration: 2e3
        }) : wx.showToast({
          title: "已经领取过了",
          icon: "success",
            image: "../../resource/images/coupons-icon-f.png",
          duration: 2e3
        });
      }
    });
  },

  // 关闭领取红包
  closeDialog: function() {
    this.setData({
      freeLucky: false
    });
    wx.setStorage({
      key: "no_free_lucky",
      data: parseInt(Date.parse(new Date())) + parseInt(1728e5)
    });
  },
    // ShowCountDown: function(t, a, e, i, n, o) {
    //     var d = new Date(), s = new Date(t, a - 1, e, i, n, o).getTime() - d.getTime();
    //     e = Math.floor(s / 1e3 / 60 / 60 / 24), i = Math.floor(s / 1e3 / 60 / 60 % 24), 
    //     n = Math.floor(s / 1e3 / 60 % 60), o = Math.floor(s / 1e3 % 60), "-1" == e && "-1" == i && "-1" == n && "-2" == o ? this.GetActivityDetail() : this.setData({
    //         CountDown_day: e,
    //         CountDown_hour: i,
    //         CountDown_minute: n,
    //         CountDown_second: o
    //     });
    // },

    // OpenCountDown: function(t, a, e, i, n, o) {
    //     var d = this;
    //     setInterval(function() {
    //         d.ShowCountDown(t, a, e, i, n, o);
    //     }, 1e3);
    // },

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
          promotion_id: that.data.activityId,
          form_id: event.detail.formId,
        },
        success: function (res) {
          wx.showToast({
            title: "设置成功",
            icon: "success",
            duration: 1e3,
            mask: true
          }), that.setData({
            "activityInfo.remindMe": 2
          });
        }
      });
    }
});