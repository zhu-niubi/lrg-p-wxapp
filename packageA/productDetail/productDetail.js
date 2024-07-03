// packageA/productDetail/productDetail.js
const app = getApp();
import {
    request
} from "../../utils/request";
import {
    formatTime,
    phoneCheck
} from "../../utils/util.js";


Page({

    /**
     * 页面的初始数据
     */
    data: {
        productFilmList: [], // 车膜数据
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        tabActive: 0,
        productType: [],
    },

    // 更换storeTab
    onTabChange(e) {
        let that = this,
            {
                index
            } = e.detail;
        // console.log(index)
        // const types = 1
        that.setData({
            tabActive: index,
            pageNumber: 1
        })

        that.handleFilmProductInfo(index);
    },

    goDetail(e) {
        // console.log(e)
        let dImg = JSON.stringify(e.currentTarget.dataset.dimg);
        // console.log('dImg',dImg)
        if (dImg) {
            wx.navigateTo({
                url: "/packageB/pDetail/pDetail?dImg=" + dImg,
            });
        } else {
            wx.navigateTo({
                url: "/packageB/pDetail/pDetail",
            });
        }

    },

    // 获取车膜商品信息
    async handleFilmProductInfo(e) {
        let that = this;
        console.log('e', e)
        //先获取产品类型
        await request({
            url: `/product_type`,
            method: "GET",
            data: {
                pageSize: 999,
                pageNumber: 1,
            },
        }).then((res) => {
            let {
                list
            } = res.data;
            console.log('producttype_list', list)
            that.setData({
                productType: list
            })
        });

        let productTypeId;
        if (e == 0) {
            productTypeId = that.data.productType.find(item => item.name === "隐形车衣").id;
        } else if (e == 1) {
            productTypeId = that.data.productType.find(item => item.name === "窗膜").id;
        } else {
            productTypeId = that.data.productType.find(item => item.name === "真漆车衣").id;
        }
        const bodyData = {
            pageSize: 999,
            pageNumber: 1,
            type: 1,
            productTypeId,
            saleStatus: 1
        };
        // 获取登录信息
        request({
            url: `/product`,
            method: "GET",
            data: bodyData,
        }).then((res) => {
            let {
                list
            } = res.data;
            console.log('res.data', res.data)
            //   let firstFiveItems = list.slice(0, 2);
            that.setData({
                productFilmList: list
            });
        });
    },



    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this,
            tabActive = that.data.tabActive;
        // console.log(tabActive)
        // this.getProduct_type();
        this.handleFilmProductInfo(tabActive); // 获取车膜商品信息


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