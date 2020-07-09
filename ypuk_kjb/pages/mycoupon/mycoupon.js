const app = getApp();

Page({
    data: {
      couponList: [],
      page: 1,
      noMoreHidden: true,
      openSettingBtnHidden: true
    },
    onLoad: function(e) {
        // var t = this, n = wx.getStorageSync("userInfo");
        // n && 0 != n.memberInfo.uid && "" != n.memberInfo ? (t.setData({
        //     userId: n.memberInfo.uid
        // }), t.GetList()) : wx.getSetting({
        //     success: function(e) {
        //         0 == e.authSetting["scope.userInfo"] ? wx.showModal({
        //             title: "提示",
        //             content: "允许小程序获取您的用户信息后才可参与砍价哦",
        //             showCancel: !1,
        //             success: function(e) {
        //                 e.confirm && wx.openSetting({
        //                     success: function(e) {
        //                         1 == e.authSetting["scope.userInfo"] && (t.setData({
        //                             loginModelHidden: !1
        //                         }), wx.removeStorageSync("userInfo"));
        //                     }
        //                 });
        //             }
        //         }) : (wx.removeStorageSync("userInfo"), t.setData({
        //             loginModelHidden: !1
        //         }));
        //     }
        // }), wx.hideShareMenu();
        this.GetList();
    },

    onPullDownRefresh: function() {
        this.setData({
            couponList: [],
            page: 1
        }), this.GetList(), setTimeout(function() {
            wx.stopPullDownRefresh();
        }, 1e3);
    },
    onReachBottom: function() {
        var e = this, t = e.data.page;
        e.setData({
            page: t + 1
        }), e.GetList();
    },
    onShow: function() {},

    GetList: function() {
      let token = wx.getStorageSync('token');
      if (!token) return;

      let that = this;
      wx.request({
        url: app.config.URI + "/discounts/my",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          page: that.data.page,
          activity: true,
        },
        success: function (res) {
          res.data.data && 0 < res.data.data.length ? that.setData({
            couponList: that.data.couponList.concat(res.data.data)
          }) : that.setData({
            noMoreHidden: false
          });
        }
      });
    },

    goActivity: function(e) {
      let category = e.currentTarget.dataset.category;
      let activityId = e.currentTarget.dataset.id;
      if (category == 'panic_buy') {
        wx.navigateTo({
          url: "../../pages/panicbuy_detail/panicbuy_detail?activityid=" + activityId
        })
      } else if (category == 'group_buy') {
        wx.navigateTo({
          url: "../../pages/groupbuy_detail/groupbuy_detail?activityid=" + activityId
        })
      } else if (category == 'bargain') {
        wx.navigateTo({
          url: "../../pages/detail/detail?activityid=" + activityId
        })
      }
    },

  goBind: function (e) {
    let that = this;
    let url = e.currentTarget.dataset.url;
    let inviteCode = e.currentTarget.dataset.inviteCode;
    if (!url || !inviteCode) return;

    // 拷贝到剪贴板
    wx.setClipboardData({
      data: inviteCode,
      success(res) {
        wx.showToast({
          title: '邀请码已复制',
        });
        // // 获得相册授权
        // wx.getSetting({
        //   success(res) {
        //     if (!res.authSetting['scope.writePhotosAlbum']) {
        //       wx.authorize({
        //         scope: 'scope.writePhotosAlbum',
        //         success() {//这里是用户同意授权后的回调
        //           that.savaImageToPhoto(url);
        //         },
        //         fail() {//这里是用户拒绝授权后的回调
        //           that.setData({
        //             openSettingBtnHidden: false
        //           })
        //         }
        //       })
        //     } else {//用户已经授权过了
        //       that.savaImageToPhoto(url);
        //     }
        //   }
        // });
      }
    });
    wx.showModal({
      title: "提示",
      content: "二维码图片加载完成后长按保存，打开微信扫一扫，点右上角按钮从相册选择保存的二维码图片，加好友时备注邀请码",
      showCancel: true,
      success: function (res) {
        res.confirm && wx.previewImage({
          current: url,
          urls: [url]
        });
      }
    });
  },

  savaImageToPhoto: function(url) {
    wx.downloadFile({
      url: url,
      success: function (res) {
        // console.log(res);
        //图片保存到本地
        wx.saveImageToPhotosAlbum({
          filePath: res.tempFilePath,
          success: function (data) {
            // console.log(data);
            // wx.showToast({
            //   title: '图片保存成功',
            // });
            wx.showModal({
              title: "提示",
              content: '打开微信扫一扫，点右上角按钮从相册选择保存的二维码图片，加好友时备注邀请码',
              showCancel: false
            });
          },
          fail: function (err) {
            wx.showToast({
              title: '图片保存失败',
            });            
            // console.log(err);
            // if (err.errMsg === "saveImageToPhotosAlbum:fail auth deny") {
            //   wx.openSetting({
            //     success(settingdata) {
            //       console.log(settingdata)
            //       if (settingdata.authSetting['scope.writePhotosAlbum']) {
            //         console.log('获取权限成功，给出再次点击图片保存到相册的提示。')
            //       } else {
            //         console.log('获取权限失败，给出不给权限就无法正常使用的提示')
            //       }
            //     }
            //   });
            // }
          }
        });
      }
    });
  },

  handleSetting: function (e) {
    let that = this;
    // 对用户的设置进行判断，如果没有授权，即使用户返回到保存页面，显示的也是“去授权”按钮；同意授权之后才显示保存按钮
    if (!e.detail.authSetting['scope.writePhotosAlbum']) {
      wx.showModal({
        title: '警告',
        content: '若不打开授权，则无法将图片保存到相册！',
        showCancel: false
      })
      that.setData({
        openSettingBtnHidden: false
      })
    } else {
      wx.showModal({
        title: '提示',
        content: '您已授权，再次点击图片保存到相册！',
        showCancel: false
      })
      that.setData({
        openSettingBtnHidden: true
      })
    }
  },
});