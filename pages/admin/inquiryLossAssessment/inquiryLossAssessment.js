const app = getApp();
import {
    request
} from '../../../utils/request'
Page({

    /**
     * 页面的初始数据
     */
    data: {
        userId: undefined,
        warrantyId: undefined,
        productId: undefined,
        defectPartList: [{
                name: '引擎盖',
                id: 1
            },
            {
                name: '前保险杠',
                id: 2
            },
            {
                name: '后保险杠',
                id: 3
            },
            {
                name: '车顶',
                id: 4
            },
            {
                name: '后翼',
                id: 5
            },
            {
                name: '后盖箱',
                id: 6
            },
            {
                name: '左前翼子板',
                id: 7
            },
            {
                name: '右前翼子板',
                id: 8
            },
            {
                name: '左后翼子板',
                id: 9
            },
            {
                name: '右后翼子板',
                id: 10
            },
            {
                name: '左后视镜',
                id: 11
            },
            {
                name: '右后视镜',
                id: 12
            },
            {
                name: '前左侧门',
                id: 13
            },
            {
                name: '后左侧门',
                id: 14
            },
            {
                name: '右前门',
                id: 15
            },
            {
                name: '右后门',
                id: 16
            },
            {
                name: '仪表号',
                id: 17
            },
            {
                name: '车灯',
                id: 18
            },
            {
                name: '座椅',
                id: 19
            },
            {
                name: '车窗',
                id: 20
            },
            {
                name: '轮眉',
                id: 21
            },
            {
                name: '左下边梁',
                id: 22
            },
            {
                name: '右下边梁',
                id: 23
            },
            {
                name: '轮胎',
                id: 24
            },
        ],
        //缺陷部位
        defectPart: [],
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),

        lossAssessmentList: []

    },

    getLossAssessmentList(){
        let { userId, warrantyId} = this.data;
        const bodyData = {
            userId,
            warrantyId
        };
        request({
            url: `/service-record`,
            data:bodyData,
            method: "GET",
        }).then((res) => {
            // console.log('getLossAssessmentList=>',res);
            

            if(res.code === 0){
                const lossAssessmentList = res.data.list.map(item => {

                    const part = this.data.defectPartList.find(part => part.id === item.productPositionId);
                    const createdAt = new Date(item.createdAt * 1000);
                    return {
                        productPositionId:item.productPositionId,
                        productPosition: part ? part.name : '', // 如果找不到对应的部位，使用 'Unknown'
                        createdAt: `${createdAt.getFullYear()}年${createdAt.getMonth() + 1}月${createdAt.getDate()}日 ${createdAt.getHours()}:${createdAt.getMinutes()}:${createdAt.getSeconds()}`,
                        memo: item.memo
                    };
                });
                // console.log(lossAssessmentList);
                //过滤掉已经定损的部位
                const filteredDefectPartList = this.data.defectPartList.filter(defectPart =>
                    !lossAssessmentList.some(lossAssessment =>
                        lossAssessment.productPositionId === defectPart.id
                    )
                );
                // console.log(filteredDefectPartList)
                this.setData({
                    lossAssessmentList,
                    defectPartList:filteredDefectPartList
                })
            }
            
        })
    },

    onLoad(options) {
        console.log(options);
        this.setData({
            userId: parseInt(options.userId),
            warrantyId: parseInt(options.warrantyId),
            productId: parseInt(options.productId)
        });
        // console.log(this.data.productId)

        //获取定损记录
        this.getLossAssessmentList();
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