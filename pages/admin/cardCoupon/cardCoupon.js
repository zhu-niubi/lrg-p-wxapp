// index.js
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime } from '../../../utils/util'
import drawQrcode from '../../../utils/weapp.qrcode.esm.js'

Page({
    data: {
        bgImg: '',
        isMask: false,
        isSend: false,
        cardType: null, // 卡券类型
        // cardStatus: 2, // 卡片状态 1有效/未使用 2已使用 3已失效
        cardInfo: {},
        storeInfo: {}, // 已使用数据
        cardUseInfo: [], // 已使用数据
        cardPastInfo: [], // 已过期数据
        isExpand: false,
        navbarHeight: wx.getStorageSync('navbarHeight'),
        spotMap: {
            y2022m5d9: 'deep-spot',
            y2022m5d10: 'spot',
        }, // 日历
        renderImg: '',
        active: 2
    },

    onChange(e) {
        console.log(e.detail.name)
        let status = e.detail.name;

        this.setData({
            active: status
        })

        this.handleUseCoupon()
    },

    handleUseCoupon: function (val) {
        let that = this
        let cardType = that.data.cardType,
            active = that.data.active;

        let bodyData = {
            pageSize: 1000,
            pageNumber: 1,
            productId: cardType ? cardType : 1,
            status: active
        }
        request({
            url: `/coupon`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            const list = res.data.list.map((card) => {
                return {...card,createdAt: formatTime(card.createdAt),deadline:formatTime(card.deadline)}
            })
            that.setData({
                cardUseInfo: list
            })
        })

    },


    //   加载卡片数据
    loadCoupon: function (val) {
        let that = this
        // 根据不同的卡类型获取不同的卡信息
        let bodyData = {
            pageSize: 1000,
            pageNumber: 1,
            productId: val ? val : 1,
            status: 1,
            // 'order[field]': 'deadline',
            // 'order[order]': 'asc',
            // order: [{ field: 'deadline', order: 'asc' }],
            // sortField: 'deadline', // 排序字段
            // sortOrder: 'asc',
        }
        console.log('bodyData', bodyData)
        request({
            url: `/coupon`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let cardInfo = res.data
            console.log('cardInfo',cardInfo)
            if (cardInfo.list.length) {
                cardInfo.list.map((card) => {
                    card.createdAt = formatTime(card.createdAt)
                    card.deadline = formatTime(card.deadline)
                })
                cardInfo.cardObj = cardInfo.list[0]
                let cardCode = cardInfo?.cardObj?.code || 'abc123'
                that.getQrcodeImg(cardCode) // 二维码
                that.getStoreMessgae(cardCode) //门店信息

                that.setData({
                    cardInfo,
                    isMask: false
                })

                that.handleWebSocket(cardInfo.cardObj) // 监听二维码使用
            } else {
                setTimeout(() => {
                    wx.navigateBack({
                        delta: 1
                    })
                }, 1000)
            }

        })

    },
    //   加载门店信息
    getStoreMessgae: function (code) {
        let that = this
        // 根据不同的卡类型获取不同的门店信息
        let bodyData = {
            pageSize: 10,
            pageNumber: 1,
        }
        request({
            url: `/store`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let storeInfo = res.data
            console.log(storeInfo.list, 'storeInfo.list');
            that.setData({
                storeInfo,
                isMask: false
            })

        })

    },


    // 获取二维码图片
    getQrcodeImg: function (code) {
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

    // 点击展开卡片内容
    handleIsExpand: function (e) {
        let that = this
        let isExpand = that.data.isExpand

        isExpand = !isExpand
        that.setData({
            isExpand,
        })
    },
    socket: null,
    handleMask: function (e) {
        let cardId = this.data.cardType
        this.loadCoupon(cardId) // 加载有效期数据
        this.handleUseCoupon(cardId) // 加载已使用卡券
    },
    onUnload() {
        console.log(this.socket)
        this.socket.close()
    },
    // WebSocket
    handleWebSocket: function (val) {
        let that = this
        let cardObj = val ? val : that.data.cardInfo.cardObj

        console.log(cardObj, 'cardObj')
        
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
            console.log(res, '接受消息')
            console.log(cardObj, '卡券信息')

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

    // 加载背景图数据
    handleBjImage: function (e) {
        let bodyData = {
            pageSize: 10,
            pageNumber: 1,
            type: 5
        }

        request({
            url: `/image`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { list } = res.data
            let bgImg = list[0] ? list[0].url : ''
            let newBgImg = bgImg ? `background-image: url('${bgImg}')` : ''

            this.setData({
                bgImg: newBgImg
            })
        })
    },

    onLoad(options) {
        let cardId = options ? options.cardId : 1
        this.loadCoupon(cardId) // 加载有效期数据
        this.getStoreMessgae()//加载门店信息
        this.handleBjImage() // 加载背景图

        this.setData({
            cardType: cardId
        })

        this.handleUseCoupon() // 加载已使用卡券
    },

    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },


    onShow() {
    },



    onShareAppMessage: function () { },


    // 日历
    // getDateList({ detail }) {
    //   // console.log(detail,'getDateList detail');
    // },
    // selectDay({ detail }) {
    //   // console.log(detail,'selectDay detail');
    // },
    //   draw: function (cardCode) {
    //       console.log(cardCode,'二维码')
    //     let that = this
    //     setTimeout(() => {
    //         drawQrcode({
    //         width: 150,
    //         height: 150,
    //         canvasId: 'myQrcode',
    //         // ctx: wx.createCanvasContext('myQrcode'),
    //         text: cardCode,
    //         callback(e) { // 非必须，绘制完成后的回调函数
    //             console.log('e:绘制成功： ', e)
    //             if (e.errMsg == 'drawCanvas:ok') { // 新增转图片
    //             wx.canvasToTempFilePath({
    //                 x: 0,
    //                 y: 0,
    //                 width: 150,
    //                 height: 150,
    //                 canvasId: 'myQrcode',
    //                 success: function (res) {
    //                     that.setData({ renderImg: res.tempFilePath });
    //                 }
    //             });
    //             }
    //         }
    //         })
    //     },500)
    //   },

})
