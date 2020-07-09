const app = getApp();
var shareUid = '';

Page({
    data: {
        recordList: [],
        activityId: "",
        page: 1,
        noMoreHidden: true
    },

  onLoad: function (query) {
    this.setData({
      activityId: query.activityid
    });
    shareUid = query.shareUid || '';

    this.GetRecordList();
    wx.hideShareMenu();
  },

    onPullDownRefresh: function() {
        this.setData({
            recordList: [],
            page: 1
        }), this.GetRecordList(), setTimeout(function() {
            wx.stopPullDownRefresh();
        }, 1e3);
    },

    onReachBottom: function() {
        var that = this;
        var page = that.data.page;
        that.setData({
          page: page + 1
        });
        that.GetRecordList();
    },

    GetRecordList: function() {
        let that = this;
        // a.util.request({
        //     url: "entry/wxapp/bargainrecord",
        //     cachetime: "0",
        //     data: {
        //         bargainid: t.data.bargainId,
        //         page: t.data.page
        //     },
        //     success: function(e) {
        //         if (e.data.data && 0 < e.data.data.length) {
        //             for (var d = 0; d < e.data.data.length; d++) 0 == e.data.data[d].uid && (e.data.data[d].nickname = a.siteInfo.name + "(系统)"), 
        //             "" == e.data.data[d].avatar && (e.data.data[d].avatar = "../../resource/images/default_avatar.png");
        //             t.setData({
        //                 recordList: t.data.recordList.concat(e.data.data)
        //             });
        //         } else t.setData({
        //             noMoreHidden: false
        //         });
        //     }
        // });
      let token = wx.getStorageSync('token');
      if (!token) {
        // 去登录
        that.goLoginPageTimeOut();
        return;
      }

      wx.request({
        url: app.config.URI + "/shop/promotion/members",
        header: {
          "Content-Type": "json"
        },
        data: {
          token: token,
          share_uid: shareUid,
          promotion_id: that.data.activityId,
          page: that.data.page
        },
        success: function (res) {
          if (res.data.data && 0 < res.data.data.length) {
              that.setData({
                  recordList: that.data.recordList.concat(res.data.data)
              });
          } else that.setData({
              noMoreHidden: false
          });
        }
      });    
    }
});