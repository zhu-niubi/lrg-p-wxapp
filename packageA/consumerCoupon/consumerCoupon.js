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
        pageSize: 999,
        pageNumber: 1,
        totalNumber: 0,
        tabActive: 0,
        orderTabList: [
            { id: 1, name: '未使用' },
            { id: 2, name: '已使用' },
            { id: 3, name: '已过期' },
        ],
        consumerCouponList: [],
        show: false,
        renderImg: '',
        isMask: false,
        code: ''


    },
    // WebSocket
    handleWebSocket: function (val) {
        let that = this,
            cardObj = val;

        // console.log(cardObj, 'cardObj')

        that.socket = wx.connectSocket({
            url: `wss://api.ngj.nkdppf.com/wss?token=${wx.getStorageSync('token')}`,
            success() {
                console.log("connection success");
            },
            fail() {
                console.log("connection fail");
            }
        });

        that.socket.onOpen(res => {
            console.log(res, '连接成功')
        });


        that.socket.onClose(res => {
            console.log(res, '连接失败')
            that.handleWebSocket()
        });


        that.socket.onMessage(res => {
            // console.log(res, '接受消息')
            // console.log(cardObj, '卡券信息')

            let { event, data, status } = JSON.parse(res.data)

            if (status === 1 && event == 'usedCoupon' && data === cardObj.id) {
                that.setData({
                    isSend: true,
                    isMask: true
                })
            } else if (status === 2 && event == 'usedCoupon' && data === cardObj.id) {
                wx.showToast({
                    title: '消费成功',
                    icon: 'success',
                    duration: 2000
                })

                that.setData({
                    isMask: true,
                    isSend: false
                })
            }
        });
    },
    handleExchange(event) {
        let that = this,
            code = event.currentTarget.dataset.code,
            cardObj = event.currentTarget.dataset.obj;
        // console.log("itemCoupon.code:", code);
        that.setData({
            code: code
        })
        that.getQrcodeImg(code); // 将 code 作为参数传递给 getQrcodeImg 函数
        that.handleWebSocket(cardObj) // 监听二维码使用
        that.showPopup(); // 调用 showPopup 函数

    },
    // 获取二维码图片
    getQrcodeImg(code) {
        let that = this
        // 根据不同的卡类型获取不同的卡信息
        let bodyData = {
            code,
        }
        request({
            url: `/qrcode/toImage`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { url } = res.data
            //   console.log( url)
            that.setData({
                renderImg: url
            })
        })
    },
    showPopup() {
        this.setData({ show: true });
    },

    onClose() {
        this.setData({ show: false });
    },
    // 点击导航栏
    onTabChange(e) {
        const that = this,
            { index } = e.detail;
        that.setData({
            tabActive: index,
            pageNumber: 1
        })
        that.getConsumerCouponList()

    },

    getConsumerCouponList: function (params) {
        let that = this,
            pageSize = that.data.pageSize,
            pageNumber = that.data.pageNumber,
            // 1：未使用；2：已使用；3：已过期
            // status = that.data.tabActive == 0 ? 1 : 2;
            status;
            if (that.data.tabActive == 0 || that.data.tabActive == undefined || that.data.tabActive == null) {
                status = 1; // 未使用
            } else if (that.data.tabActive == 1) {
                status = 2; // 已使用
            } else if (that.data.tabActive == 2) {
                status = 3; // 已过期
            }

        // console.log('status', status)
        let bodyData = {
            pageSize,
            pageNumber,
            status
        };
        request({
            url: `/coupon`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { list, totalNumber } = res.data;
            if (list) {
                for (let item of list) {
                    item.deadline = formatTime(item.deadline);

                }
                // console.log('消费券list', list)
                that.setData({
                    consumerCouponList: list
                })
            }

        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad(options) {
        let that = this,
            index = options.index ? Number(options.index) : '';
        // console.log('点击消费券icon',index)

        // 查询所有状态的消费券
        // that.getConsumerCouponList()

        that.setData({
            tabActive: index
        })
        that.getConsumerCouponList()
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