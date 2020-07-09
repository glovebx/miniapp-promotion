function login() {
  return new Promise((resolve, reject) => {
    wx.login({ success: resolve, fail: reject })
  })
}

function logon(data) {
  wx.setStorageSync('token', data.token);
  wx.setStorageSync('uid', data.uid);
  // return new Promise((resolve, reject) => {
  //   wx.setStorageSync('token', res.data.token);
  //   wx.setStorageSync('uid', res.data.uid);

  //   wx.login({ success: resolve, fail: reject })
  // })
}

function logoff() {
  wx.removeStorageSync('token');
  wx.removeStorageSync('uid');
}

function getSetting(withSubscriptions) {
  return new Promise((resolve, reject) => {
    wx.getSetting({ withSubscriptions: withSubscriptions || false, success: resolve, fail: reject })
  })
}

// function getSettingWithSubscriptions() {
//   return new Promise((resolve, reject) => {
//     wx.getSetting({ withSubscriptions: true, success: resolve, fail: reject })
//   })
// }

function openSetting() {
  return new Promise((resolve, reject) => {
    wx.openSetting({ success: resolve, fail: reject })
  })
}

function getUserInfo() {
  return new Promise((resolve, reject) => {
    wx.getUserInfo({ success: resolve, fail: reject })
  })
}

function chooseAddress() {
  return new Promise((resolve, reject) => {
    wx.chooseAddress({ success: resolve, fail: reject })
  })
}

function setStorage(key, value) {
  return new Promise((resolve, reject) => {
    wx.setStorage({ key: key, data: value, success: resolve, fail: reject })
  })
}

function getStorage(key) {
  return new Promise((resolve, reject) => {
    wx.getStorage({ key: key, success: resolve, fail: reject })
  })
}

function getLocation(type) {
  return new Promise((resolve, reject) => {
    wx.getLocation({ type: type, success: resolve, fail: reject })
  })
}

function uploadImage(url, filePath, formData) {
  return new Promise((resolve, reject) => {
    wx.uploadFile({
      url: url, filePath: filePath, name: 'media', formData: formData,
      header: {
        "content-type": "multipart/form-data"
      },
      success: resolve, fail: reject
    })
  })
}

// 用户发生点击行为或者发起支付回调后，才可以调起订阅消息界面
function requestSubscribeMessage(tmplIds) {
  return new Promise((resolve, reject) => {
    wx.requestSubscribeMessage({ tmplIds: tmplIds, success: resolve, fail: reject })
  })
}

module.exports = {
  login,
  logon,
  logoff,
  getSetting,
  openSetting,
  getUserInfo,
  setStorage,
  getStorage,
  getLocation,
  uploadImage,
  chooseAddress,
  requestSubscribeMessage,
  original: wx
}