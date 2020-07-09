const app = getApp();
var shareUid = '';

function showloading(e) {
  wx.showLoading && ("" == e && (e = "加载中"), wx.showLoading({
    title: e
  }));
}

function hideLoading() {
  wx.hideLoading && wx.hideLoading();
}

function commonRequest(url, data, cb, dialog) {
  var c = 5;
  console.log("即将获取到配置信息");
  var r = wx.getExtConfigSync ? wx.getExtConfigSync() : {};
  if (r && (console.log(r), console.log("获取到配置信息1"), void 0 != r.weappid && (console.log("获取到配置信息2"),
    c = r.weappid), void 0 != r.merchantid && !o("merchantid"))) {
    console.log("获取到配置信息2");

    var s = r.merchantid;
    void 0 == r.ver || 0 == r.ver || (2 == r.ver ? _.setmerchantid(0, this) : _.setmerchantid(s, this));
  }

  wx.request({
    url: url,
    data: data,
    header: {
      "Content-Type": "application/json",
      "User-Token": o("user_token"),
      Groupid: o("groupid"),
      Merchantid: o("merchantid"),
      InviterMid: o("invitermid"),
      weappid: c
    },
    success: function (res) {
      489999 == res.data.code ? d("店铺已打烊。") : 489998 == res.data.code ? d("店铺已打烊。") : 50001 == res.data.code ? (e("user_token", ""),
        "object" == (void 0 === dialog ? "undefined" : j(dialog)) && dialog.onShow()) : cb(res);
    },
    fail: function (res) {
      console.log("failed");
    }
  });
}

function saveimgque(e, o, t, n, a, i, c) {
  console.log("tttt");
  o.length > t ? wx.uploadFile({
    url: S.saveImg,
    filePath: o[t],
    name: n,
    header: {
      "content-type": "multipart/form-data"
    },
    formData: {},

    success: function (res) {
      var r = res.data;
      r = JSON.parse(r);
      console.log(r);
      1 == r.code ? (e.setData({
        imgurl: e.data.imgurl.concat(r.data.file)
      }), D(e, o, ++t, "imgone", a, i)) : (console.log("图片上传失败"), c.show({
        timer: 3e3,
        text: "只支持jpg,jpeg,png,gif格式的图片！请重新上传",
        success: function () {
          return false;
        }
      }), e.onShow());
    },

    fail: function (res) {
      c.show({
        timer: 3e3,
        text: "上传失败！",
        success: function () {
          return false;
        }
      }), e.onShow(), console.log(res);
    },

    complete: function (res) { }
  }) : (console.log("准备回调"), e.submit2server(e, a, i));
}

function validateInput(str, msg, dialog) {
  if (0 != str.length) return false;
  hideLoading();
  dialog.show({
    timer: 3e3,
    text: msg,
    success: function () {
      return false;
    }
  });
}

function t(that, gid) {
    var data = {
        gid: gid
    };
    void 0 != that.data.jumplogin && (data.jumplogin = that.data.jumplogin);
    void 0 != that.data.transtoken && (data.transtoken = that.data.transtoken), 
    0 != gid ? commonRequest(d.getGoodsinfo, data, function(res) {
      var e = [];
      var i = res.data.data;
      res.data.data.images && (e = res.data.data.images);
      var n = res.data.data.categoryname;
      null == n && (n = "请选择分类");
      var s = res.data.data.dispatchname;
      null == s && (s = "点击选择运费");

      var discountshow = {
            is_discount: i.is_discount,
            is_groupdeduct: i.is_groupdeduct,
            isnew: i.isnew,
            ishot: i.ishot,
            isrecommand: i.isrecommand,
            isdiscount: i.isdiscount
        };
      that.setData({
          goodsinfo: i,
          picimg: e,
          imgsrc: res.data.data.share_image,
          shareimg: res.data.data.share_image,
          category: n,
          categoryid: res.data.data.fk_typeid,
          freight: s,
          freightid: res.data.data.yunfei_id,
          store: res.data.data.storename,
          storeid: res.data.data.hexiao_id,
          isxxlx: res.data.data.is_hexiao,
          discountshow: discountshow
      });
    }) : getMerchant(that);
}

function e(that, cb) {
    var data = {};
    commonRequest(d.getGoodsCategorys, data, function(res) {
        var i = res.data.data;
        var n = that.data.categorys;
        if (that.setData({
            categorys: i
        }), "function" == typeof cb && cb(res), n.length != i.length && 0 != i.length && 0 != n.length) {
            n.length;
            console.log("2221", i), console.log("222", n), console.log("222", n.length - 1);
        }
        if (0 == n.length && 0 != i.length) i.length;
    });
}

function i(that) {
    var data = {};
    commonRequest(d.getfreighttemp, data, function(res) {
        var e = res.data.data;
        var i = that.data.freights;
        if (that.setData({
            freights: e
        }), i.length != e.length && 0 != e.length) e.length;
    });
}

function n(that) {
    var data = {};
    commonRequest(d.gethexiaostore, data, function(res) {
      var e = res.data.data;
      var i = that.data.stores;
      if (that.setData({
            stores: e
        }), i.length != e.length && 0 != e.length) {
            var data = {
                target: {
                    dataset: {
                        id: e.length - 1
                    }
                }
            };
          that.setstore(data);
        }
    });
}

function s(filePath, name, that, n, s, dialog) {
  showloading("图片上传中");
  that.setData({
        buttondisabled: true
  });

  wx.uploadFile(a({
        url: d.saveImg_thumb2pt,
    filePath: filePath,
        name: name,
        header: {
            "content-type": "multipart/form-data"
        },
        formData: {},
        success: function(res) {
            var t = res.data;
          if (t.length > 1e3) return dialog.show({
                timer: 3e3,
                text: "图片上传失败,请重试"
            }), hideLoading(), 0;
            t = JSON.parse(t), console.log(t);

            1 == t.code ? that.setData({
                imgsrc: t.data.file
            }) : (console.log("图片上传失败"), dialog.show({
                timer: 3e3,
                text: "图片上传失败,请重试"
            }), hideLoading());
        },

        fail: function(res) {
            console.log(res);
          dialog.show({
                timer: 3e3,
                text: "图片上传失败,请重试"
            });
            hideLoading();
        },

        complete: function(res) {
          var picimg = that.data.picimg;
          that.setData({
              imgurlbak: that.data.imgurl
          }), picimg.length > 0 ? saveimgque(that, filePath, 0, "imgone", n, s, dialog) : (hideLoading(), 
            that.submit2server(i, n, s));
        }
    }, "fail", function(res) {}));
}

function getMerchant(that) {
    var data = {};
    commonRequest(d.getMerchant, data, function(res) {});
}

// var g = require("../../../utils/components/wux");
// var u = require("../../../lib/functions.js");
// var d = require("../../../config/api.js");
var r = getApp();

Page({
    data: {
        zhezhao_show1: true,
        shangpin: [ "商品分类1", "商品分类2" ],
        zhezhao_show: true,
        isshangpintuwen: false,
        fenlei: "",
        focus: "",
        picimgbak: [],
        picimg: [],
        imgsrc: "",
        current: "",
        showView: false,
        imgurl: [],
        imgurlbak: [],
        shareimg: [],
        freights: [],
        gid: 0,
        shangpinInfo: {
            zhutu: "../../imgs/ttttt.jpg",
            fenxiangtu: [ "../../imgs/rrrr.jpg", "../../imgs/ttttt.jpg" ],
            jianjie: "这些都是商品简介这些都是商品简介",
            tuanjia: "55.55",
            danmaijia: "60.66",
            kucun: 99999,
            zutuanrenshu: 60,
            zutuanshixian: 48,
            tuwenmiaoshu: "已添加",
            shangpinfenlei: "",
            showjinxingzhong: false,
            tuanzhangyouhui: false,
            shangpinZhuangtai: [ {
                name: "shangjia",
                checked: true,
                value: "上架"
            }, {
                name: "ruku",
                checked: false,
                value: "放入仓库"
            } ],
            shangpinguige: {
                guigexiang: "",
                shangpinguige: [ {
                    guige: "",
                    jiage: "",
                    kucun: ""
                } ]
            },
            shangpinguigexiang: []
        },
        categorys: [],
        category: "选择分类",
        categoryid: 0,
        stores: [],
        store: "点击选择门店",
        storeid: 0,
        freight: "点击选择运费",
        freightid: 0,
      buttondisabled: false,
        isxxlx: false,
        ismendianxz: false,
        biaoqian: [ {
            cname: "上新",
            name: "isnew",
            value: 0
        }, {
            cname: "疯抢",
            name: "ishot",
            value: 0
        }, {
            cname: "推荐",
            name: "isrecommand",
            value: 0
        }, {
            cname: "优惠",
            name: "isdiscount",
            value: 0
        } ],
        discountshow: {
          is_discount: false,
          is_groupdeduct: false,
          isnew: false,
          ishot: false,
          isrecommand: false,
          isdiscount: false
        }
    },
    
  onLoad: function (query) {
      var that = this;
    query.gid && (query.gid, that.setData({
      gid: query.gid
      }));
      that.setData({
        jumplogin: a.jumplogin ? query.jumplogin : "",
        transtoken: query.transtoken ? query.transtoken : ""
      });
        //  r.getUSERTOKEN(function() {
        //     console.log("发起getusertoken--start"), t(that, that.data.gid), console.log("发起getusertoken--end");
        // });
    },

    onReady: function() {},
    onShow: function() {
        // var that = this;
        // r.getUSERTOKEN(function() {
        //     console.log("发起getusertoken--start"), e(a, function(a) {
        //         var t = u.getstorage("categoryid");
        //         if (u.removestorage("categoryid"), console.log(t), "" != t) {
        //             var e = {
        //                 target: {
        //                     dataset: {
        //                         id: a.data.categorys.length - 1
        //                     }
        //                 }
        //             };
        //             a.setcategory(e);
        //         }
        //     }), i(a), n(a), console.log("发起getusertoken--end");
        // });
    },
    onHide: function() {},
    onUnload: function() {},
    onPullDownRefresh: function() {},
    onReachBottom: function() {},

    chooseImage1: function(a) {
        let that = this;
        wx.chooseImage({
            sizeType: [ "compressed" ],
            sourceType: [ "album", "camera" ],
            count: 1,
            success: function(res) {
              that.setData({
                    shareimg: res.tempFilePaths
                });
            }
        });
    },

    chooseImage2: function(a) {
        let that = this;
        wx.chooseImage({
            sizeType: [ "compressed" ],
            sourceType: [ "album", "camera" ],
            success: function(res) {
              var fenxiangtu = that.data.shangpinInfo.fenxiangtu;
              fenxiangtu.push(that.data.picimg.concat(res.tempFilePaths));
              that.setData({
                "shangpinInfo.fenxiangtu": fenxiangtu
              });
            }
        });
    },

    chooseImage: function(event) {
        var that = this;
        var e = [];
        var i = 9 - that.data.picimg.length;
        i < 0 && (i = 1), wx.chooseImage({
            sizeType: [ "compressed" ],
            sourceType: [ "album", "camera" ],
            count: i,
            success: function(res) {
                console.log(res.tempFilePaths);
                e = that.data.picimg.concat(res.tempFilePaths);
                e = JSON.stringify(e), 
                e = JSON.parse(e);
                console.log(e);
                that.setData({
                    picimg: that.data.picimg.concat(res.tempFilePaths)
                });
            }
        });
    },

  romoveimg: function (event) {
    var that = this;
    var picimg = that.data.picimg;
    picimg.splice(event.currentTarget.dataset.imgid, 1);
    that.setData({
      picimg: picimg
    });
  },

  lookpic: function (event) {
        wx.previewImage({
          current: event.currentTarget.dataset.url,
          urls: event.currentTarget.dataset.url
        });
    },

  switch2Change: function (event) {
    console.log("switch2 发生 change 事件，携带值为", event.detail.value);
    this.setData({
      "discountshow.is_discount": event.detail.value
        });
    },

  switch3Change: function (event) {
      console.log("switch2 发生 change 事件，携带值为", event.detail.value);
      this.setData({
        "discountshow.is_groupdeduct": event.detail.value
        });
    },

    switch4Change: function(event) {
      console.log("switch4 发生 change 事件，携带值为", event.detail.value);
      this.setData({
          gaoji_show: event.detail.value
        });
    },

    addguigexiang: function() {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      var shangpinguige = this.data.shangpinInfo.shangpinguige;
      shangpinguigexiang.push(shangpinguige);
      console.log(shangpinguigexiang);
      this.setData({
        "shangpinInfo.shangpinguigexiang": shangpinguigexiang
        });
    },

    addguige: function(event) {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      var data = {
            guige: "",
            jiage: "",
            kucun: ""
        };
      shangpinguigexiang[event.currentTarget.dataset.guigexiangid].shangpinguige.push(data);
      console.log(shangpinguigexiang);
      this.setData({
        "shangpinInfo.shangpinguigexiang": shangpinguigexiang
      });
    },

    removeguigexiang: function(event) {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      shangpinguigexiang.splice(event.currentTarget.dataset.guigexiangid, 1);
      this.setData({
        "shangpinInfo.shangpinguigexiang": shangpinguigexiang
        });
    },

    removeguige: function(a) {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      var shangpinguige = shangpinguigexiang[event.currentTarget.dataset.ggindex].shangpinguige;
      console.log(event.currentTarget.id);
      console.log(event.currentTarget.dataset.ggindex);
      shangpinguige.splice(event.currentTarget.id, 1), 
        this.setData({
        "shangpinInfo.shangpinguigexiang": shangpinguigexiang
        });
    },

    obtainGuigexiang: function(event) {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      shangpinguigexiang[event.currentTarget.dataset.guigexiangid].guigexiang = event.detail.value, console.log(event.detail.value), 
        console.log(shangpinguigexiang[event.currentTarget.dataset.guigexiangid].guigexiang);
        this.setData({
        "shangpinInfo.shangpinguigexiang": shangpinguigexiang
        });
    },

    obtainGuige: function(event) {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      shangpinguigexiang[event.currentTarget.dataset.guigexiangid].shangpinguige[event.currentTarget.dataset.guigeid].guige = event.detail.value, 
        this.setData({
          "shangpinInfo.shangpinguigexiang": shangpinguigexiang
        });
    },

    obtainJiage: function(event) {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      shangpinguigexiang[event.currentTarget.dataset.guigexiangid].shangpinguige[event.currentTarget.dataset.jiageid].jiage = event.detail.value, 
        this.setData({
        "shangpinInfo.shangpinguigexiang": shangpinguigexiang
        });
    },

    obtainkucun: function(event) {
      var shangpinguigexiang = this.data.shangpinInfo.shangpinguigexiang;
      shangpinguigexiang[event.currentTarget.dataset.guigexiangid].shangpinguige[event.currentTarget.dataset.kucunid].kucun = event.detail.value, 
        console.log(shangpinguigexiang[a.currentTarget.dataset.guigeid].kucun);
        this.setData({
          "shangpinInfo.shangpinguigexiang": shangpinguigexiang
        });
    },

    userformSubmit: function(a) {
        var t = this;
        return wx.hideKeyboard(), console.log("form发生了submit事件，携带数据为：", a.detail.value), 
        !!validateInput(a.detail.value.gname, "请输入商品名称！", g.$wuxToptips, t, "gname") && (a.detail.value.gname.length > 30 ? (g.$wuxToptips.show({
            timer: 3e3,
            text: "商品标题不能超过30个字!"
        }), false) : !!validateInput(0 == t.data.shareimg.length, "请上传商品主图！", g.$wuxToptips) && (!!validateInput(0 == t.data.picimg.length, "请上传商品图集！", g.$wuxToptips) && (!!validateInput(a.detail.value.gdesc, "请输入商品简介！", g.$wuxToptips, t, "gdesc") && (!!validateInput(a.detail.value.oprice, "请填写购买价格！", g.$wuxToptips, t, "oprice") && (!!u.validatenum(a.detail.value.oprice, "填写的购买价格有误！", g.$wuxToptips, t, "ngprice") && (!!u.validatenum(a.detail.value.mprice, "填写的市场价格有误！", g.$wuxToptips, t, "mprice") && (!!validateInput(a.detail.value.gnum, "请填写库存数量！", g.$wuxToptips, t, "gnum") && (0 == t.data.freightid && 0 == a.detail.value.is_hexiao ? (g.$wuxToptips.show({
            timer: 3e3,
            text: "请选择运费!"
        }), false) : (u.dealFormIds(a.detail.formId, "pages/commodityManagement/commoditiesEditor/commoditiesEditor"), 
        void s(t.data.shareimg[0], "imgone", t, a.detail.value, a.detail.formId, g.$wuxToptips))))))))));
    },
    
    submit2server: function(a, t, e) {
        t.share_image = a.data.imgsrc, t.images = a.data.imgurl, t.fk_typeid = a.data.categoryid, 
        t.yunfei_id = a.data.freightid, t.hexiao_id = a.data.storeid, console.log(t);
        var i = {
            data: t,
            gid: a.data.gid
        };
        commonRequest(d.editwscGoods, i, function(t) {
            if (1 == t.data.code) {
                if (a.data.gid) e = "商品修改成功"; else var e = "商品创建成功";
                wx.showToast({
                    title: e,
                    icon: "success",
                    duration: 3e3
                }), setTimeout(function() {
                    wx.navigateBack({});
                }, 3e3);
            } else a.setData({
                buttondisabled: 0,
                imgurl: a.data.imgurlbak
            }), g.$wuxToptips.show({
                timer: 3e3,
                text: t.data.msg
            });
        });
    },

    changecategory: function(a) {
        this.setData({
            zhezhao_show1: false
        });
    },

    quxiao1: function() {
        this.setData({
            zhezhao_show1: true
        });
    },

    setfreight: function(event) {
      var that = this;
      console.log(event);
      var e = event.target.dataset.id;
      that.setData({
        freight: that.data.freights[e].dispatchname,
        freightid: that.data.freights[e].id,
        zhezhao_show1: true,
        zhezhao_show: true
      });
    },

    setcategory: function(a) {
        var t = this;
        console.log(a);
        var e = a.target.dataset.id;
        -1 != e && t.setData({
            category: t.data.categorys[e].name,
            categoryid: t.data.categorys[e].id,
            zhezhao_show1: true
        });
    },

    setstore: function(data) {
      let that = this;
      console.log(data);
      var e = data.target.dataset.id;
      that.setData({
        store: that.data.stores[e].storename,
        storeid: that.data.stores[e].id,
            ismendianxz: false
        });
    },

    goAddGoodsClass: function() {
        console.log(11111);
        wx.navigateTo({
            url: "../commodityManagement/addGoodsClass/addGoodsClass"
        }), this.setData({
            zhezhao_show1: true
        });
    },

    choosefreight: function() {
        this.setData({
            zhezhao_show: false
        });
    },

    quxiao: function() {
        this.setData({
            zhezhao_show: true
        });
    },

    goAddFreightTemplate: function() {
        wx.navigateTo({
            url: "../commodityManagement/addFreightTemplate/addFreightTemplate"
        }), this.setData({
            zhezhao_show: true
        });
    },

    sptwadd: function() {
        1 == this.data.isshangpintuwen ? wx.navigateTo({
            url: "/pages/commodityManagement/commodityDisplay/commodityDisplay"
        }) : g.$wuxDialog.alert({
            title: "",
            content: "图文描述,请电脑访问www.openp.cn,在商品管理中编辑。"
        });
    },

    radioChange1: function(a) {
        1 == a.detail.value ? this.setData({
            isxxlx: true
        }) : this.setData({
            isxxlx: false
        });
    },

    hexiaomendian: function() {
        this.setData({
            ismendianxz: true
        });
    },

    quxiao2: function() {
        this.setData({
            ismendianxz: false
        });
    },

    gostoreAdd: function() {
        wx.navigateTo({
            url: "/pages/soreVerification/storeAdd/storeAdd"
        });
    },

    shangxin: function(event) {
        var that = this;
        1 == event.currentTarget.dataset.active ? that.setData({
            "discountshow.isnew": 0
        }) : that.setData({
            "discountshow.isnew": 1
        });
    },

    fengqiang: function(event) {
        var that = this;
        1 == event.currentTarget.dataset.active ? that.setData({
            "discountshow.ishot": 0
        }) : that.setData({
            "discountshow.ishot": 1
        });
    },

    tuijian: function(event) {
        var that = this;
        1 == event.currentTarget.dataset.active ? that.setData({
            "discountshow.isrecommand": 0
        }) : that.setData({
            "discountshow.isrecommand": 1
        });
    },

    youhui: function(event) {
        var that = this;
        1 == event.currentTarget.dataset.active ? that.setData({
            "discountshow.isdiscount": 0
        }) : that.setData({
            "discountshow.isdiscount": 1
        });
    }
});