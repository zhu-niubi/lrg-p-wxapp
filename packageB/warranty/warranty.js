// packageB/warranty/warranty.js
import { request } from "../../utils/request";
import { formatTime, formatTimes } from "../../utils/util.js";
import Dialog from "@vant/weapp/dialog/dialog";
Page({
    data: {
        constructionInfo: {},
        combinedProductNames: '',
        warrantBgImg: '',
        showplace:false,
    },

    showplace(e){
        console.log(e)
        const sp = e.currentTarget.dataset.value;
        if (sp) {
            this.setData({
                showplace: !sp
            })
        }else{
            this.setData({
                showplace: !sp
            })
        }
    },
    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        this.warrant(options)
        this.getWarrantBgImg()
    },
    //获取质保数据
    warrant(options) {
        const oid = options.id;
        const wid = parseInt(wx.getStorageSync('wid'));
        const constructionId = wid ? wid : oid;
        console.log(constructionId);
        request({
            url: `/construction/${constructionId}`,
            method: "GET",
        }).then((res) => {
            let constructionInfo = res.data;
            //   console.log(constructionInfo,'constructionInfo');
            // 施工状态
            constructionInfo.statusName =
                constructionInfo.status === 1
                    ? "确认施工"
                    : constructionInfo.status === 5
                        ? "提车确认"
                        : "";
            // 施工部位
            let constructionSku = [...constructionInfo.constructionSku];

            let keyInx = {};
            for (var i = 0; i < constructionSku.length; i++) {
                var id = constructionSku[i].productId;
                constructionSku[i].productPosition = [
                    {
                        productSkuName: constructionSku[i].productSkuName,
                        rollNumber: constructionSku[i].rollNumber,
                        employeeName: constructionSku[i].employeeName,
                        length: constructionSku[i].length,
                    },
                ];

                if (keyInx[id] >= 0) {
                    var product1 = constructionSku[i].productPosition;
                    var product2 = constructionSku[keyInx[id]].productPosition;
                    constructionSku[keyInx[id]].productPosition = product1.concat(
                        product2
                    );
                    constructionSku.splice(i, 1);
                    i--;
                } else {
                    keyInx[id] = i;
                }
            }
            constructionInfo.expectComplete = formatTime(
                constructionInfo.expectComplete
            );
            constructionInfo.deadline = formatTime(
                constructionInfo.deadline
            );

            constructionInfo.newconstructionSku = constructionSku;
            console.log('constructionInfo',constructionInfo.newconstructionSku)
            this.setData({
                constructionInfo
            })
        });
    },

    // 获取背景图
    getWarrantBgImg: function (e) {
        let bodyData = {
            pageSize: 10,
            pageNumber: 1,
            type: 17
        };

        request({
            url: `/image`,
            method: "GET",
            data: bodyData,
        }).then((res) => {
            let { list } = res.data;
            //  背景banner图
            console.log(list[0]?.url);

            this.setData({
                warrantBgImg: list[0]?.url,
            });
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