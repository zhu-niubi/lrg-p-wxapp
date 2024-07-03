// pages/admin/technicianDetails/technicianDetails.js
const app = getApp();
import {
    request
} from "../../../utils/request";
Page({

    /**
     * 页面的初始数据
     */
    data: {
        allStarList:[],
    },
    gotoRules(){
        wx.navigateTo({
          url: '/packageA/evaluationRules/evaluationRules',
        })
    },

    gotoEngineerDetail(e){
        console.log('e',e)
        const id = e.currentTarget.dataset.id
        wx.navigateTo({
          url: '/packageA/engineerDetail/engineerDetail?id='+id ,
        })
    },
    getAllStar() {

        const bodyData = {
            pageSize: 999,
            pageNumber: 1,
            star:1,

        };
        request({
            url: `/employee`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            console.log('getAllStar_res',res)

            if ( res.code == 0 ){
                const { list } = res.data;
                this.setData({
                    allStarList:list
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.getAllStar();

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