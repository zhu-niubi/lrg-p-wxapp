// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime,phoneCheck } from '../../../utils/util.js'

Page({
  data: {
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    orderId:undefined
  },

  gotoDetail:function () {;
    let orderId = this.data.orderId;

    wx.redirectTo({
        url: "/pages/admin/subPages/orderDetail/orderDetail?orderId=" + orderId,
      })
  },


  onLoad(options) {
    let orderId = options.orderId

    this.setData({
      orderId
    })
  },

  onShow() {
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
