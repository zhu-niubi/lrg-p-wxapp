// packageA/consumerCoupon/consumerCoupon.js
// 获取应用实例
const app = getApp()
import { request } from '../../utils/request'
import { formatTime, phoneCheck } from '../../utils/util.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        pageSize: 10,
        pageNumber: 1,
        totalNumber: 0,
        benefitCardList: [],
        isExpand: false

    },

    handleIsExpand(e) {
        let that = this;
        const index = e.currentTarget.dataset.index; 
        const updatedBenefitCardList = that.data.benefitCardList.map((item, i) => ({
          ...item,
          isExpand: i === index ? !item.isExpand : item.isExpand,
        }));
        that.setData({
          benefitCardList: updatedBenefitCardList,
        });
      },

    getbenefitCardList: function (params) {
        let that = this,
            pageSize = that.data.pageSize,
            pageNumber = that.data.pageNumber,
            bodyData = {
                pageSize,
                pageNumber,
            };

        request({
            url: `/user-product-pack`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { list, totalNumber } = res.data;
           
            for (let item of list) {
                item.deadline = formatTime(item.deadline);
            }
            const updatedBenefitCardList = list.map(item => ({
                ...item,
                isExpand: false,
            }));
            console.log('权益卡',updatedBenefitCardList)
            that.setData({
                benefitCardList: updatedBenefitCardList
            })
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this;

        that.getbenefitCardList();
       

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