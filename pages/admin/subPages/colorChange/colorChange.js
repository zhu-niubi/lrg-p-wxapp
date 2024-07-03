// 获取应用实例
const app = getApp()
import { request } from '../../../../utils/request'
import { formatTime,phoneCheck } from '../../../../utils/util.js'

Page({
  data: {
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
  },




  onLoad(options) {

  },

  onShow() {
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
