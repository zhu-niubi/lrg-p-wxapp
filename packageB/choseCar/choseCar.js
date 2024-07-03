// packageA/type/type.js
const app = getApp()
import { request } from '../../utils/request'

Page({

  /**
   * 页面的初始数据
   */
  data: {
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    carTypeList:[], // 车型数据
    showLoading:true,
    carBrandName:''
  },

    // 获取车型
    getCarTypeList(carId){
        let that = this;
      let carBrandId = carId
      
      let bodyData = {
        pageSize: 1000,
        pageNumber: 1,
        carBrandId
      }
    
      request({
        url: `/car`,
        method: 'GET',
        data:bodyData
      }).then((res) => {
        let { list } = res.data
        // console.log(list)
          that.setData({
            carTypeList:list,
            showLoading:false
        })
      })
    },

    // 跳转
    jump(e){
      let carId = e.currentTarget.dataset.id
      let carName = e.currentTarget.dataset.name
      var pages = getCurrentPages();
      var prevPage = pages[pages.length - 3]; //上一个页面
      prevPage.setData({
        carId,
        carName
      })
      wx.navigateBack({
        delta: 2
      })
    },

    /**
   * 生命周期函数--监听页面加载
   */
  onLoad: function (options) {
    let carBrandId = options.carBrandId
    let carBrandName = options.carBrandName

    this.setData({
      carBrandName
    })
    
    // 获取车型
    this.getCarTypeList(carBrandId)
  },


  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady: function () {
    
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow: function () {
    
  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide: function () {

  },

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload: function () {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom: function () {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage: function () {

  }
})