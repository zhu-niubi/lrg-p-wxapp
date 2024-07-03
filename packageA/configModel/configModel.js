// pages/main/configModel/configModel.js
const app = getApp()
import { request } from '../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        modelList:[]
    },

    // 获取模型
    getModelList: function (e) {
        let that = this;
            
        request({
        url: `/config_model`,
        method: 'GET'
        }).then((res) => {
        let {code,data} = res
            // console.log(data)
            
            if (code !== 0) {
                wx.showToast({
                    title: '获取失败！请重试！',
                    icon: 'error',
                    duration: 2000
                })
            } else {
                that.setData({
                    modelList:data
                })
            }
        })
    
  },

  binderror(err){
      console.log(err)
      this.getModelList()
  },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        // 获取模型
        this.getModelList()
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
        // this.getTabBar().init();
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {
        wx.switchTab({
          url: '/pages/main/home/home',
        })
    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})