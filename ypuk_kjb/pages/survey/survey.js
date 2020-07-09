// var city = require("../../resource/js/city.js");
const app = getApp();
const wxp = require("../../resource/wxParse/wxParse.js");

let shareUid = '';
let transUid = '';

Page({
    data: {
      surveyId: "",
      surveyMode: "",
      // 注意，survey中只允许有1条address记录!!
      survey: {},
      // 默认 submit 是显示的
      submitProps: { visible: true},
      surveyUserInput: {},
      // 额外处理，防止更新整个surveyUserInput
      datetimeUserInput: {},
      // 额外处理，防止更新整个surveyUserInput
      addressUserInput: {},

      today: "",

      // provinces: [],
      // citys: [],
      // districts: [],
      // selProvince: "请选择",
      // selCity: "请选择",
      // selDistrict: "请选择",
      // selProvinceIndex: -1,
      // selCityIndex: -1,
      // selDistrictIndex: -1,

      goodsSkuIndex: 0,
      goodsPropertyNames: [],
      goodsPropertyValues: [],

      localTokenAlreadyExists: true,
    },

  onLoad: function (query) {
    let that = this;

    const params = query.scene ? decodeURIComponent(query.scene).split('-') :
      [query.shareUid || '', query.transUid || '', query.surveyId || '', query.surveyMode || 'aitu'];
    shareUid = params[0];
    transUid = params[1];

    let date = new Date();
    let year = date.getFullYear();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let today = year + '-' + ((month < 10 ? '0' : '') + month) + '-' + ((day < 10 ? '0' : '') + day)

    that.setData({
      surveyId: params[2],
      surveyMode: params[3],
      today: today
    });

    // this.initCityData(1);
    // 获得投票的基本信息
    this.getSurveyDetail();

    let token = wx.getStorageSync('token');
    if (!token) {
      // 仅在本地token 不存在，且用户已经授权的情况下(本地token被清理了)，尝试自动登录
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 直接获取userInfo然后登录  
            that.autoLogin(null, that.getSurveyUserInput);
          } else {
            that.setData({
              localTokenAlreadyExists: false
            });
              // 去登录授权页面
            that.goLoginPageTimeOut();
          }
        }
      });
      return;
    } else {
      this.getSurveyUserInput();
    }
  },

  onShow: function() {
    // 如果是登录页面返回的
    if (!this.data.localTokenAlreadyExists) {
      this.getSurveyUserInput();
    }
  },

  autoLogin: function (event, cb) {
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
                // 获取该投票本人已经填写的数据
                if (cb && typeof cb == "function") {
                  cb(event);
                }
              }
            })
          }
        });

      }
    })
  },

  bindGoodsPropertyChange: function (event) {
    this.setData(
      {
        goodsSkuIndex: event.detail.value
      }
    )
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
    if (this.data.selProvinceIndex < 0) return;

    var a = city.cityData[this.data.selProvinceIndex].cityList[event.detail.value];
    this.setData({
      selCity: a.name,
      selCityIndex: event.detail.value,
      selDistrict: "请选择",
      selDistrictIndex: 0
    }), this.initCityData(3, a);
  },

  bindPickerDistrictChange: function (event) {
    if (this.data.selProvinceIndex < 0 || this.data.selCityIndex < 0) return;

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

  bindDatePicker: function (event) {
    let questionId = event.currentTarget.dataset.questionId;
    let datetimeUserInput = this.data.datetimeUserInput;
    if (!datetimeUserInput[questionId]) datetimeUserInput[questionId] = {}

    datetimeUserInput[questionId]["valueDate"] = event.detail.value;
    this.setData({
      datetimeUserInput: datetimeUserInput
    });
    // console.log('picker发生change事件，携带value值为：', event.detail.value);    
  },

  getSurveyDetail: function() {
    let that = this;
    let token = wx.getStorageSync('token') || '';

    wx.request({
      url: app.config.URI + "/survey/detail",
      header: {
        "Content-Type": "json"
      },
      data: {
        token: token,
        share_uid: shareUid,
        trans_uid: transUid,
        survey_id: that.data.surveyId,
        mode: that.data.surveyMode
      },
      success: function (res) {
        if (res.data.code != 0) {
          // error
          wx.showModal({
              title: "提示",
              content: res.data.msg,
              showCancel: false,
          });
          return;
        } 
        wxp.wxParse("surveyDesc", "html", res.data.data.description, that, 10);
        
        // 判断一下有没有submit属性的设置
        let submitProps = {visible: true};
        const survey = res.data.data;
        for (var i in survey.questions) {
          if (survey.questions[i]['type'] == 'submit') {
            submitProps = survey.questions[i];
            break;
          }
        }

        // 请求正常
        that.setData({
          submitProps: submitProps,
          survey: survey,
        });
        // 更改页面标题
          if (survey.pageTitle) {
          wx.setNavigationBarTitle({
            title: survey.pageTitle
          });
        }

        // if (token) {
        //   that.getSurveyUserInput(token);
        // }
      }
    });
  },

  getSurveyUserInput: function (event) {
    let token = wx.getStorageSync('token');
    if (!token) return;

    this.setData({
      localTokenAlreadyExists: true
    });      

    let that = this;
    wx.request({
      url: app.config.URI + "/survey/user/input",
      header: {
        "Content-Type": "json"
      },
      data: {
        token: token,
        survey_id: that.data.surveyId,
        mode: that.data.surveyMode
      },
      success: function (res) {
        if (res.data.code != 0) {
          // // error
          // wx.showModal({
          //   title: "提示",
          //   content: res.data.msg,
          //   showCancel: false,
          // });
          console.log(res.data.msg);
          return;
        }
        let userInputLine = res.data.data.userInputLine;
        let datetimeUserInput = {};
        let addressUserInput = {};
        for (var key in userInputLine) {
          // key 就是每个题目
          if (userInputLine.hasOwnProperty(key)) {
            // 获得答案的字典
            let answer = userInputLine[key];
            if (answer.questionType == 'datetime') {
              // 额外处理
              datetimeUserInput[key] = answer;
            } else if (answer.questionType == 'address') {
              // 额外处理
              addressUserInput[key] = answer;
              // // 这个答案里面应该有省市区
              // let provinceName = answer.province;
              // let cityName = answer.city;
              // if (provinceName && cityName) {
              //   // 重新选择省市区
              //   that.reselectCities(provinceName, cityName, answer.district);
              // }
            } 
          }
        }
        
        // 请求正常
        that.setData({
          surveyUserInput: userInputLine,
          datetimeUserInput: datetimeUserInput,
          addressUserInput: addressUserInput
        });
      }
    });
  },

  reselectCities: function (provinceName, cityName, districtName) {
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

            // 区有可能没有的
            if (districtName) {
              for (var r = 0; r < city.cityData[d].cityList[l].districtList.length; r++) {
                if (districtName == city.cityData[d].cityList[l].districtList[r].name) {
                  c = {
                    detail: {
                      value: r
                    }
                  };
                  that.bindPickerDistrictChange(c);

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
  },

  getWechatAddress: function (event) {
    let that = this;
    wx.getSetting({
      success(res) {
        // console.log(res);
        // 用户允许=1、用户明确禁止=-1、未向用户询问授权=0等3种状态
        if (res.authSetting.hasOwnProperty('scope.address')) {
          if (res.authSetting['scope.address']) {
            // 允许获取微信关联的地址
            that.getWechatAddress2(event);
          } else {
            // 禁止获取微信关联的地址，需要引导打开设置
            // 去地址授权页面
            wx.openSetting({
              success(res) {
                console.log(res.authSetting);
              }
            });
          }
        } else {
          // 还未明确授权
          that.getWechatAddress2(event);
        }
      }
    });
  },

  getWechatAddress2: function(event) {
    let that = this;
    wx.chooseAddress({
        success: function(res) {
          // let provinceName = res.provinceName;
          // let cityName = res.cityName;
          // let districtName = res.countyName;
          // // 重新选择省市区
          // that.reselectCities(provinceName, cityName, districtName);

          let questionId = event.currentTarget.dataset.questionId;
          let addressUserInput = that.data.addressUserInput;
          if (!addressUserInput[questionId]) addressUserInput[questionId] = {}

          let address = res.provinceName + " " + res.cityName + " " + res.countyName + " " + res.detailInfo + " " + res.userName + " " + res.telNumber;
          addressUserInput[questionId]["valueText"] = address;
          addressUserInput[questionId]["dirty"] = true;
          // json字符串化之后的值
          let json = { "province": res.provinceName, "city": res.cityName, "county": res.countyName, "address": res.detailInfo, "userName": res.userName, "telNumber": res.telNumber};
          addressUserInput[questionId]["valueFreeText"] = JSON.stringify(json);

          that.setData({
            addressUserInput: addressUserInput,
          });

        },
        fail: function(res) {
          // 
          console.log(res);
        }
    });
  },

  getLastAddress: function () {
    let that = this;
    let token = wx.getStorageSync('token');
    if (!token) return;

    wx.request({
      url: app.config.URI + "/survey/last/address",
      header: {
        "Content-Type": "json"
      },
      data: {
        token: token,
      },
      success: function (res) {
        if (res.data.code == 0) {
          let selProvinceIndex = -1;
          let selCityIndex = -1;
          let selDistrictIndex = -1;
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

  onShareAppMessage: function () {
    let that = this;
    let uid = wx.getStorageSync('uid');
    if (!uid) uid = '';

    let title = that.data.survey.shareTitle ? that.data.survey.shareTitle : '邀请您参与[' + that.data.survey.title + ']小调查';
    let url = that.data.survey.shareImageUrl ? that.data.survey.shareImageUrl : '';
    return {
      title: title,
      imageUrl: url,
      path: "ypuk_kjb/pages/survey/survey?surveyId=" + that.data.surveyId
        + "&shareUid=" + (shareUid || uid) + "&transUid=" + uid + "&surveyMode=aitu",
      success: function (res) {
        wx.showToast({
          title: "转发成功",
          icon: "success",
          duration: 1e3,
          mask: true
        });
      }
    };
  },

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "../../pages/tologin/tologin"
      })
    }, 1000)
  },  

  goHomePage: function () {
    setTimeout(function () {
      // navigateTo跳转到应用内的某个页面。但是不能跳到 tabbar 页面
      // switchTab 可以跳到 tabbar 页面
      wx.switchTab({
        url: "../../pages/index/index"
      })
    }, 1000)
  },  

  copyValue: function(event) {
    let value = event.currentTarget.dataset.value;
    wx.setClipboardData({
      data: value,
      success(res) {
        wx.showToast({
          title: "复制成功",
          icon: "success",
          duration: 1e3
        });
      }
    })
  },

  fillSurvey: function(event) {
    let that = this;

    let token = wx.getStorageSync('token');
    if (!token) {
      // 仅在本地token 不存在，且用户已经授权的情况下(本地token被清理了)，尝试自动登录
      wx.getSetting({
        success(res) {
          if (res.authSetting['scope.userInfo']) {
            // 直接获取userInfo然后登录  
            that.autoLogin(event, that.fillSurvey);
          } else {
            // 去登录授权页面
            that.goLoginPageTimeOut();
          }
        }
      });
      return;
    }

    // if (event) {
    //   if (!this.data.uname || !this.data.utel) {
    //     wx.showModal({
    //       title: "提示",
    //       content: "姓名和电话均为必填项，请检查填写完整信息",
    //       showCancel: false
    //     });
    //     return;
    //   }

    //   if ("请选择" == this.data.selProvince 
    //       || "请选择" == this.data.selCity) {
    //     wx.showModal({
    //       title: "提示",
    //       content: "请选择地区",
    //       showCancel: false
    //     });

    //     return;
    //   }

    //   if (!this.data.uaddress) {        
    //     wx.showModal({
    //       title: "提示",
    //       content: "地址为必填项，请检查填写完整信息",
    //       showCancel: false
    //     })
    //     return;
    //   }
    // }
    wx.showLoading({
      title: '报名中，请稍候',
    });

    var o = {
      token: token,
      survey_id: this.data.surveyId,
      form_id: event && event.detail.formId,
      mode: this.data.surveyMode
    };
    let addressUserInput = that.data.addressUserInput;
    // 从addressUserInput中获取 answerType="address" 类别的数据
    for (var key in addressUserInput) {
      if (addressUserInput.hasOwnProperty(key)) {
        let prop = addressUserInput[key];
        // 说明有更新
        if (prop['dirty']) {
          o['address' + key] = prop['valueFreeText']
        }
      }
    }
    let formValues = event.detail.value;
    for (var key in formValues) {
      if (formValues.hasOwnProperty(key)) {
        o[key] = formValues[key]
      }
    }

    // if (this.data.selProvinceIndex >= 0) {
    //   o.province = this.data.selProvince;
    //   o.province_id = city.cityData[this.data.selProvinceIndex].id;
    //   if (this.data.selCityIndex >= 0) {
    //     o.city = this.data.selCity;
    //     o.city_id = city.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].id;
    //   }    
    //   if ("请选择" != this.data.selDistrict && this.data.selDistrict) {
    //     o.district = this.data.selDistrict;
    //     o.district_id = city.cityData[this.data.selProvinceIndex].cityList[this.data.selCityIndex].districtList[this.data.selDistrictIndex].id;
    //   }
    // }

    if (this.data.goodsPropertyValues.length > 0) {
      o.property_child_ids = this.data.goodsPropertyValues[this.data.goodsSkuIndex];
    }

    wx.request({
      url: app.config.URI + "/survey/fill",
      method: "POST",
      header: {
        "content-type": "application/x-www-form-urlencoded"
      },
      data: o,
      success: function (res) {
        wx.hideLoading();

        if (res.data.code == 901) {
          wx.getSetting({
            success(res) {
              if (res.authSetting['scope.userInfo']) {
                // 直接获取userInfo然后登录  
                that.autoLogin(event, that.fillSurvey);
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

          wx.showModal({
            title: "提示",
            content: "报名成功",
            showCancel: false,
            complete(res) {
              // let survey = that.data.survey;
              // survey.disabled = true;

              // // let surveyUserInput = that.data.surveyUserInput;
              // // for (var i=0; i < survey.questions.length; i++) {
              // //   let question = survey.questions[i];
              // //   question.disabled = true;
              // //   // surveyUserInput[question.questionId]
              // // }

              // // console.log(that.data.surveyUserInput);

              // // 回到主页面
              // that.setData({
              //   survey: survey
              // });
            }
          });
        }
      },
      fail: function (res) {
        wx.hideLoading();

        wx.showModal({
          title: "提示",
          content: res.errMsg,
          showCancel: false
        });
      }
    });
  },

  previewImage: function(event) {
    let url = event.currentTarget.dataset.url;
    let urls = []
    const questions = this.data.survey.questions;
    for (var i = 0; i < questions.length; i++) {
      if (questions[i].type === 'image') {
        urls[urls.length] = questions[i].url;
      }
    }
    wx.previewImage({
      current: url,
      urls: urls
    });    
  }
});