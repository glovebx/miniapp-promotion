const app = getApp();

Page({
    data: {
        noticeList: [],
        page: 1,
        noMoreHidden: !0
    },
    
    onLoad: function() {
        this.GetList();
    },

    onPullDownRefresh: function() {
        this.setData({
            noticeList: [],
            page: 1
        }), this.GetList(), setTimeout(function() {
            wx.stopPullDownRefresh();
        }, 1e3);
    },

    onReachBottom: function() {
        var t = this, a = t.data.page;
        t.setData({
            page: a + 1
        }), t.GetList();
    },

    GetList: function() {
      let that = this;
      wx.request({
        url: app.config.URI + "/notice/list",
        header: {
          "Content-Type": "json"
        },
        data: {
          // page: that.data.page
          page_size: 10
        },
        success: function (res) {
          res.data.data && 0 < res.data.data.length ? that.setData({
              noticeList: that.data.noticeList.concat(res.data.data)
          }) : that.setData({
              noMoreHidden: !1
          });
        }
      });        
        // var a = this;
        // t.util.request({
        //     url: "entry/wxapp/getnoticelist",
        //     data: {
        //         page: a.data.page
        //     },
        //     cachetime: "0",
        //     success: function(t) {
        //         t.data.data && 0 < t.data.data.length ? a.setData({
        //             noticeList: a.data.noticeList.concat(t.data.data)
        //         }) : a.setData({
        //             noMoreHidden: !1
        //         });
        //     }
        // });
    }
});