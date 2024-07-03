// packageB/pDetail/pDetail.js

const app = getApp();
import { request } from "../../utils/request";
import { formatTime, phoneCheck } from "../../utils/util.js";

Page({

    /**
     * 页面的初始数据
     */
    data: {
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
  
        dImg: null,
    },

    // 更换storeTab
    onTabChange(e) {
        let that = this,
            { index } = e.detail;
        // console.log(index)
        // const types = 1
        that.setData({
            tabActive: index,
            pageNumber: 1
        })

    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let dImg = options?.dImg ? JSON.parse(options.dImg) : "";
        console.log('onload_dImg', dImg)
        this.setData({
            dImg: dImg,
        });

    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

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