const app = getApp();
const wxp = require("../../resource/wxParse/wxParse.js");

Page({
    data: {
        Notice: [],
        noticeId: ""
    },

  onLoad: function (query) {
        this.setData({
          noticeId: query.noticeid
        });
        this.GetNoticeDetail();
    },

    GetNoticeDetail: function() {
        // var a = this;
        // t.util.request({
        //     url: "entry/wxapp/getnotice",
        //     cachetime: "30",
        //     data: {
        //         noticeid: a.data.noticeId
        //     },
        //     success: function(t) {
        //         e.wxParse("noticeContent", "html", t.data.data.content, a, 10), a.setData({
        //             Notice: t.data.data
        //         });
        //     }
        // });
      let that = this;
      wx.request({
        url: app.config.URI + "/notice/detail",
        header: {
          "Content-Type": "json"
        },
        data: {
          notice_id: that.data.noticeId
        },
        success: function (res) {
          wxp.wxParse("noticeContent", "html", res.data.data.content, that, 10);
          that.setData({
              Notice: res.data.data
          });

        }
      });           
    },
});