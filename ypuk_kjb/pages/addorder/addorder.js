const pay = require("../../resource/js/pay.js");
const city = require("../../resource/js/city.js");
const app = getApp();

Page({
    data: {
      activityId: "",
      uname: "",
      utel: "",
      uaddress: "",
      remark: "",
      goodsSkuIndex: 0,

      provinces: [],
      citys: [],
      districts: [],
      selProvince: "请选择",
      selCity: "请选择",
      selDistrict: "请选择",
      selProvinceIndex: 0,
      selCityIndex: 0,
      selDistrictIndex: 0,

      goodsPropertyNames: [],
      goodsPropertyValues: [],
      orderNo: null,
      tmplIds: []
    },

    onLoad: function(query) {
      this.setData({
        activityId: query.activityid
      });

      this.initCityData(1);
      this.GetActivityInfo();
      this.getSubscribeTmpls();

      wx.hideShareMenu();      
    },

    onShow: function() {
        
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
        promotion_id: that.data.activityId,
      },
      success: function (res) {
        let currentPrice = res.data.data.currentPrice;
        that.setData({
          'activityInfo.currentPrice': currentPrice,
          'activityInfo.totalPrice': currentPrice + Number(that.data.activityInfo.freight), 
        });
      }
    });
  },    

    GetActivityInfo: function() {
        let that = this;
        // e.util.request({
        //     url: "entry/wxapp/getbargain",
        //     data: {
        //         uid: a.data.userId,
        //         bargainid: a.data.bargainId
        //     },
        //     cachetime: "0",
        //     success: function(e) {
        //         e.data.data.totalprice = Number(e.data.data.price) + Number(e.data.data.activity.freight), 
        //         a.setData({
        //             bargainInfo: e.data.data
        //         });
        //     }
        // });
      let token = wx.getStorageSync('token');
      if (!token) return;

      wx.request({
        url: app.config.URI + "/shop/promotion/detail",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          promotion_id: that.data.activityId,
        },
        success: function (res) {
          var goodsProperties = res.data.data.goodsProperties;
          var names = [];
          var propertyChildIds = []
          if (goodsProperties) {
            for (var i = 0; i < goodsProperties.length; i++) {
              names[i] = goodsProperties[i].name;
              propertyChildIds[i] = goodsProperties[i].propertyChildIds;
            }
          }
          // res.data.data.totalPrice = Number(res.data.data.floorPrice) + Number(res.data.data.freight);
          that.setData({
            activityInfo: res.data.data,
            goodsPropertyNames: names,
            goodsPropertyValues: propertyChildIds,
          });

          that.GetBargainDetail(token);
          that.GetLastAddress();
        }
      });        
    },

  bindGoodsPropertyChange: function (event) {
    this.setData(
      {
        goodsSkuIndex: event.detail.value
      }
    )
  },   

  bindUname: function(event) {
      this.setData({
          uname: event.detail.value
      });
  },

  bindTel: function(event) {
      this.setData({
          utel: event.detail.value
      });
  },

  bindAddress: function(event) {
      this.setData({
          uaddress: event.detail.value
      });
  },

  bindRemark: function (event) {
    this.setData({
      remark: event.detail.value
    });
  },

  bindPickerProvinceChange: function (event) {
    var a = city.cityData[event.detail.value];
    this.setData({
      selProvince: a.name,
      selProvinceIndex: event.detail.value,
      selCity: "请选择",
      selCityIndex: 0,
      selDistrict: "请选择",
      selDistrictIndex: 0
    }), this.initCityData(2, a);
  },
  bindPickerCityChange: function (event) {
    var a = city.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: a.name,
      selCityIndex: event.detail.value,
      selDistrict: "请选择",
      selDistrictIndex: 0
    }), this.initCityData(3, a);
  },
  bindPickerChange: function (event) {
    var a = city.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[event.detail.value];
    a && a.name && event.detail.value && this.setData({
      selDistrict: a.name,
      selDistrictIndex: event.detail.value
    });
  },

  initCityData: function (i, a) {
    if (1 == i) {
      for (var e = [], s = 0; s < city.cityData.length; s++) e.push(city.cityData[s].name);
      this.setData({
        provinces: e
      });
    } else if (2 == i) {
      for (var e = [], n = a.cityList, s = 0; s < n.length; s++) e.push(n[s].name);
      this.setData({
        citys: e
      });
    } else if (3 == i) {
      for (var e = [], n = a.districtList, s = 0; s < n.length; s++) e.push(n[s].name);
      this.setData({
        districts: e
      });
    }
  },

  reselectCities: function (provinceName, cityName, countyName) {
    let that = this;
    for (var d = 0; d < city.cityData.length; d++) {
      if (provinceName == city.cityData[d].name) {
        var c = {
          detail: {
            value: d
          }
        };
        that.bindPickerProvinceChange(c);
        that.data.selProvinceIndex = d;

        for (var l = 0; l < city.cityData[d].cityList.length; l++) {
          if (cityName == city.cityData[d].cityList[l].name) {
            c = {
              detail: {
                value: l
              }
            };
            that.bindPickerCityChange(c);

            for (var r = 0; r < city.cityData[d].cityList[l].districtList.length; r++) {
              if (countyName == city.cityData[d].cityList[l].districtList[r].name) {
                c = {
                  detail: {
                    value: r
                  }
                };
                that.bindPickerChange(c);

                break;
              }
            }

            break;
          }
        }
        break;
      }
    }
  },

  GetWechatAdr: function () {
    let that = this;
    wx.chooseAddress({
      success: function (res) {
        var provinceName = res.provinceName;
        var cityName = res.cityName;
        var countyName = res.countyName;

        that.reselectCities(provinceName, cityName, countyName);
        
        that.setData({
          uname: res.userName,
          utel: res.telNumber,
          uaddress: res.detailInfo
        });
      }
    });
  },

  GetLastAddress: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    if (!token) return;

    wx.request({
      url: app.config.URI + "/shop/promotion/last/address",
      header: {
        "Content-Type": "json"
      },
      data: {
        token: token,
      },
      success: function (res) {
        if (res.data.code == 0) {
          let selProvinceIndex = 0;
          let selCityIndex = 0;
          let selDistrictIndex = 0;
          for (var i = 0; i < city.cityData.length; i++) {
            if (city.cityData[i].id == res.data.data.provinceId) {
              selProvinceIndex = i;

              let cityList = city.cityData[i].cityList;
              for (var j = 0; j < cityList.length; j++) {
                if (cityList[j].id == res.data.data.cityId) {
                  selCityIndex = j;

                  if (res.data.data.districtId) {
                    let districtList = cityList[j].districtList;
                    for (var k = 0; k < districtList.length; k++) {
                      if (districtList[k].id == res.data.data.districtId) {
                        selDistrictIndex = k;
                        break;
                      }
                    }
                  }
                  break;
                }
              }

              break;
            }
          }

          that.setData({
            uname: res.data.data.linkMan,
            utel: res.data.data.mobile,
            uaddress: res.data.data.address,

            selProvince: res.data.data.provinceStr,
            selCity: res.data.data.cityStr,
            selDistrict: res.data.data.areaStr,
            selProvinceIndex: selProvinceIndex,
            selCityIndex: selCityIndex,
            selDistrictIndex: selDistrictIndex,
          });
        }
      }
    });
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
                // 重新提交一次
                that.addOrderBtn(event);
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

    addOrderBtn: function(event) {

      if (!this.data.uname || !this.data.utel) {
        wx.showModal({
          title: "提示",
          content: "姓名和电话均为必填项，请检查填写完整信息",
          showCancel: false
        });
        return;
      }

      if ("请选择" == this.data.selProvince
        || "请选择" == this.data.selCity) {
        wx.showModal({
          title: "提示",
          content: "请选择地区",
          showCancel: false
        });

        return;
      }

      // if ('service' != that.data.activityInfo.goodsType && "" == this.data.uaddress) {
      if (!this.data.uaddress) {
        wx.showModal({
          title: "提示",
          content: "地址为必填项，请检查填写完整信息",
          showCancel: false
        })
        return;
      }

      var o = {
        token: wx.getStorageSync('token'),
        promotion_id: this.data.activityId,
        linkman: this.data.uname,
        mobile: this.data.utel,
        province_id: city.cityData[this.data.selProvinceIndex].id,
        city_id: city.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id,
        address: this.data.uaddress,
        remark: this.data.remark,
        form_id: event.detail.formId,
        role: 'player'
      };
      if ("请选择" != this.data.selDistrict && this.data.selDistrict) {
        o.district_id = city.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
      }
      if (this.data.goodsPropertyValues.length > 0) {
        o.property_child_ids = this.data.goodsPropertyValues[this.data.goodsSkuIndex];
      }

      let that = this;
      wx.request({
        url: app.config.URI + "/shop/promotion/order/create",
        method: "POST",
        header: {
          "content-type": "application/x-www-form-urlencoded"
        },
        data: o,
        success: function (res) {
          wx.hideToast();
          if (res.data.code == 901) {
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
            return;
          } 
          // pay.wxpay(app
          //   , that.data.activityInfo.totalPrice
          //   , res.data.data.orderNo
          //   , "../../pages/orderdetail/orderdetail?orderno=" + res.data.data.orderNo);

          const orderNo = res.data.data.orderNo;
          that.data.orderNo = orderNo;
          // Promise版支付
          pay.wxpay2(app, that.data.activityInfo.totalPrice, orderNo).then(res => {
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
          
          // wx.redirectTo({
          //   url: "../../pages/orderdetail/orderdetail?orderno=" + res.data.data.orderNo
          // })          
        },
        fail: function (res) {
          wx.showModal({
            title: "提示",
            content: res.data.message,
            showCancel: false
          });
        }
      });      

        // return "" == d.uname || "" == d.tel || "" == d.goodmodel ? (wx.showModal({
        //     title: "提示",
        //     content: "所有项均为必填项，请检查填写完整信息",
        //     showCancel: !1
        // }), a = 0, !1) : 0 == n.data.bargainInfo.activity.type && "" == d.address ? (wx.showModal({
        //     title: "提示",
        //     content: "所有项均为必填项，请检查填写完整信息",
        //     showCancel: !1
        // }), a = 0, !1) : void e.util.request({
        //     url: "entry/wxapp/addorder",
        //     cachetime: "0",
        //     method: "POST",
        //     data: d,
        //     success: function(e) {
        //         wx.hideToast(), 0 == e.data.errno && (wx.showToast({
        //             title: "提交订单成功"
        //         }), wx.redirectTo({
        //             url: "../../pages/orderdetail/orderdetail?orderno=" + e.data.data
        //         }));
        //     },
        //     fail: function(e) {
        //         a = 0, wx.showModal({
        //             title: "提示",
        //             content: e.data.message,
        //             showCancel: !1
        //         });
        //     }
        // });
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
      url: "../../pages/orderdetail/orderdetail?orderno=" + this.data.orderNo
    });
  },
});