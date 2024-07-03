// index.js
const app = getApp()
import { request } from '../../utils/request'
import { formatTime } from '../../utils/util.js'

Page({
  data: {
    userToken: wx.getStorageSync('token'),
    slideList: [],
    windowHeight: wx.getStorageSync('windowHeight')
  },


  //  登录时直接跳转页面
  gotopage: function (e) {
    // 跳转到显示页面
    wx.switchTab({
        url: '/pages/main/home/index',
    })
  },

  //   加载数据
  loaData: function (e) {
    let bodyData = {
        pageSize: 10,
        pageNumber: 1,
        type:1
    }

    request({
      url: `/image`,
      method: 'GET',
      data:bodyData
    }).then((res) => {
      let {list} = res.data
      this.setData({
        slideList:list,
      })
    })
    
  },

  onLoad() {
    this.loaData()
  },

  onShow() {
    this.loaData()
  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {
    return {
			title: '纳管家'
		}
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
