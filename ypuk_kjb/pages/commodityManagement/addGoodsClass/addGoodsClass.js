const app = getApp();

// function e(that, data, formid) {
//   that.setData({
//         buttondisabled: 1
//   });
//   data.thumb = that.data.imgsrc;
//   console.log(data);

//     var c = {
//       data: data,
//       formid: formid
//     };
//     i.CommonRequest(n.setCategory, c, function(res) {
//         1 == res.data.code ? (wx.showToast({
//             title: "创建成功",
//             icon: "success",
//             duration: 3e3
//         }), setTimeout(function() {
//             var cid = res.data.data.cid;
//             i.setstorage("categoryid", cid), wx.navigateBack({});
//         }, 3e3)) : (o.$wuxToptips.show({
//             timer: 3e3,
//             text: res.data.msg
//           }), that.setData({
//             buttondisabled: 0
//         }));
//     });
// }

// function uploadImage(filePath, name, that, s, formid) {
//     wx.showloading();

//     wx.uploadFile({
//       url: app.config.URI + "/shop/goods/category/cover/upload",
//       filePath: filePath,
//       name: name,
//       header: {
//           "content-type": "multipart/form-data"
//       },
//       formData: {},
//       success: function(res) {
//         if (res.data.code != 0) {
//           wx.showModal({
//             title: "提示",
//             content: res.data.msg,
//             showCancel: false
//           });
//         } else {
//           // 返回图片url
//           that.setData({
//             imgsrc: res.data.file
//           }) 
//         }
//       },
//       fail: function(res) {
//         wx.hideLoading();
//         console.log(res);
//       },
//       complete: function(res) {
//         // 记录formid
//         e(that, s, formid);
//       }
//   });
// }

Page({
    data: {
        buttondisabled: false,
        picimg: []
    },
    onLoad: function(options) {},
    onReady: function() {},
    onShow: function() {},
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},
    onShareAppMessage: function() {},

  goLoginPageTimeOut: function () {
    setTimeout(function () {
      wx.navigateTo({
        url: "../../../pages/tologin/tologin"
      })
    }, 1000)
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
                that.userformSubmit(event);
              }
            })
          }
        });

      }
    })
  },

  chooseImage: function(t) {
      let that = this;
      wx.chooseImage({
          sizeType: [ "compressed" ],
          sourceType: [ "album", "camera" ],
          success: function(res) {
              that.setData({
                  picimg: res.tempFilePaths
              });
          }
      });
  },

  userformSubmit: function(event) {
    let that = this;
    let token = wx.getStorageSync('token');
    if (!token) {
      // 去登录
      that.goLoginPageTimeOut();
      return;
    }

    let name = event.detail.value.name;
    if (!name) {
      wx.showToast({
        title: "请输入分类名称"
      });
      return;
    }
    if (0 == that.data.picimg.length) {
      that.data.picimg = [""]
    }
    // uploadImage(that.data.picimg[0], "imgone", that, event.detail.value, event.detail.formId);
    wx.showLoading({
      title: '提交中',
    });

    wx.uploadFile({
      url: app.config.URI + "/shop/goods/category/cover/upload",
      filePath: filePath,
      name: 'file',
      header: {
        "content-type": "multipart/form-data"
      },
      formData: {
        'category_name': name,
        'formId': event.detail.formId
      },
      success: function (res) {
        if (res.data.code != 0) {
          wx.showModal({
            title: "提示",
            content: res.data.msg,
            showCancel: false
          });
        } else {
          // 创建成功的cid保存到本地

          // 回退
          wx.navigateBack({});
        }
      },
      fail: function (res) {
        console.log(res);
      },
      complete: function (res) {
        wx.hideLoading();
      }
    });
  }
});