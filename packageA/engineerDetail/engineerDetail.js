// packageA/engineerDetail/engineerDetail.js
const app = getApp();
import {
    request
} from "../../utils/request";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        dData:{},
        level:3
    },
    
    getDetail(id){
        console.log('id',id)
        request({
            url: `/employee/${id}`,
            method: 'GET',
        }).then((res) => {
            console.log('getStar_res',res)
            if(res.code == 0){
                this.setData({
                    dData:res.data
                })
                
            }
        })
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        console.log('options',options)
        const id = parseInt(options.id)
        this.getDetail( id );
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