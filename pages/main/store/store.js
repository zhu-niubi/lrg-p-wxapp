// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime, phoneCheck } from '../../../utils/util.js'

Page({
    data: {
        bannerList: [],
        benefitCardList: [],// 权益卡
        windowHeight: wx.getStorageSync('windowHeight'),
        navbarHeight: wx.getStorageSync('navbarHeight'),
        pageNumber: 1,
        pageSize: 999,
        totalNumber: 0,
        isSticky: false,
        ProductList: [], // 在售卡券数据
        FilmList: [], // 在售车膜数据
        PerimeterList: [],// 周边
        searchValL: '',
        isTouchGround: false, // 是否见底
        selectedStore: {},
        storeTabList: [
            {
                id: 1,
                name: "在售",
                num: 0,
            },
            {
                id: 2,
                name: "积分",
                num: 0,
            },
        ],
        show: false,
        userInfo: {},
        levelMapping: {
            1: '车衣小白',
            2: '车衣新人',
            3: '车衣潮人',
            4: '车衣达人',
            5: '车衣王者',
        },
        levelText: '',
        tabActive: 0,
        storeBgImg: ''
    },

    gotoProductDetail(e) {
        // console.log('e',e)
        const productInfo = JSON.stringify(e.currentTarget.dataset);
        if (productInfo){
            wx.navigateTo({
              url: '/pages/admin/productDetail/productDetail?productInfo='+productInfo,
            })
        }
    },
    chenge(event) {
        const id = event.currentTarget.dataset.id;
        // 使用 id 进行后续的操作
        // console.log(id);
    },
    // 获取商城背景图片 
    getStoreBgImg() {
        let bodyData = {
            pageSize: 10,
            pageNumber: 1,
            type: 18
        };

        request({
            url: `/image`,
            method: "GET",
            data: bodyData,
        }).then((res) => {
            let { list } = res.data;
            //  背景banner图
            // console.log(list[0]?.url);

            this.setData({
                storeBgImg: list[0]?.url,
            });
        });
    },
    // 更换storeTab
    onTabChange(e) {
        let that = this,
            { index } = e.detail;
        console.log(index,"????")
        // const types = 1
        that.setData({
            tabActive: index,
            pageNumber: 1
        })
        const selectedStore = wx.getStorageSync('selectedStore');

        const { id, name, region, address } = selectedStore;
        that.ProductInfo(id, index);
        that.FilmInfo(id, index);
        that.PerimeterInfo(id, index);
        // that.getCenefitCard(id,index)
    },
    showPopup() {
        this.setData({ show: true });
    },

    onClose() {
        this.setData({ show: false });
    },
    // 我的消费券页面
    goConsumerCouponPage(e) {
        // console.log('消费券页面')
        wx.navigateTo({
            url: "/packageA/consumerCoupon/consumerCoupon",
        });
    },

    // 我的权益卡页面
    goBenefitCardPage(e) {
        wx.navigateTo({
            url: "/packageA/cenefitCard/benefitCard",
        });
    },

    // 进入选择门店页面
    goChooseStore(e) {
        wx.navigateTo({
            url: '/packageA/selectStore/selectStore',
        })

    },

    // 搜索获取焦点
    gotoSearch() {
        wx.navigateTo({
            url: '/pages/admin/searchPage/searchPage',
        })
    },

    // 跳转商品详情页
    gotoProDetail(e) {
        let productId = e.currentTarget.dataset.id;
        wx.navigateTo({
            url: '/pages/admin/productDetail/productDetail?productId=' + productId,
        })
    },


    //   吸顶滑动事件
    handleSticky: function (e) {
        let { isFixed } = e.detail,
            isSticky = this.data.isFixed;

        isSticky = isFixed
        this.setData({
            isSticky
        })
    },
    // 获取在售车膜商品信息
    FilmInfo(storeId, types) {
        if(storeId == undefined){
            storeId == 0
        }
        let that = this,
            FilmList = that.data.FilmList,
            pageSize = that.data.pageSize,
            pageNumber = that.data.pageNumber,
            bodyData = {
                pageSize,
                pageNumber,
                type: 1,
                storeId: storeId,
            };
        if (types == 1) {
            bodyData.pointStatus = 1;
            // console.log('添加了积分条件')

        } 
        bodyData.saleStatus = 1;
        // console.log('车膜列表条件',bodyData)
        request({
            url: `/product`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { list, totalNumber } = res.data
            // console.log('车膜', list)
            list.map((lis) => {
                lis.price = parseFloat((lis.price / 100).toFixed(2))
                lis.deposit = lis.deposit ? parseFloat((lis.deposit / 100).toFixed(2)) : 0

                if (lis.payType == 2) {
                    lis.price = lis.price + lis.deposit
                }
            })

            list = pageNumber === 1 ? list : [...FilmList, ...list]
            // console.log(list)
            that.setData({
                FilmList: list,
                totalNumber
            })
        })
    },

    // 获取卡券商品信息
    ProductInfo(storeId, types) {
        // console.log('storeId', storeId)
        // console.log('types', types)
        if(storeId == undefined){
            storeId == 0
        }
        let that = this,
            bodyData = {
                pageSize: that.data.pageSize,
                pageNumber: that.data.pageNumber,
                type: 2,
                storeId: storeId,
            };
        if (types == 1) {
            bodyData.pointStatus = 1;
            // console.log('添加了积分条件')

        } 
        // 
        bodyData.saleStatus = 1;

        console.log('请求体',bodyData)
        // 获取登录信息
        request({
            url: `/product`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { list } = res.data
            console.log('卡券', list)

            list.map((lis) => {
                // lis.price = parseFloat((lis.price / 100).toFixed(2))
                lis.deposit = lis.deposit ? parseFloat((lis.deposit / 100).toFixed(2)) : 0
                if (lis.payType == 2) {
                    lis.price = lis.price + lis.deposit
                }
            })

            // console.log('tabActive',that.data.tabActive)
            that.setData({
                ProductList: list,
            })
        })
    },

    // 获取周边商品信息
    PerimeterInfo(storeId, types) {
        if(storeId == undefined){
            storeId == 0
        }
        let that = this,
            bodyData = {
                pageSize: that.data.pageSize,
                pageNumber: that.data.pageNumber,
                type: 3,
                storeId: storeId,
            };
        if (types == 1) {
            bodyData.pointStatus = 1;
            // console.log('添加了积分条件')

        } 
        bodyData.saleStatus = 1;
        // console.log('商品请求data', bodyData)
        // 获取登录信息
        request({
            url: `/product`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { list } = res.data

            list.map((lis) => {
                lis.price = parseFloat((lis.price / 100).toFixed(2))
                lis.deposit = lis.deposit ? parseFloat((lis.deposit / 100).toFixed(2)) : 0
                if (lis.payType == 2) {
                    lis.price = lis.price + lis.deposit
                }
            })
            // console.log(list)
            that.setData({
                PerimeterList: list,
            })
        })
    },
    // 获取门店权益卡
    getCenefitCard(id) {
        let that = this,

            bodyData = {
                storeId: id,
                pageSize: 10,
                pageNumber: 1,
                type: 2
            };

        request({
            url: `/product-pack`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            // console.log('benefitcardlist_store',res)
            if (res.code == 0) {
                const {list} = res.data
                that.setData({
                    benefitCardList: list
                })
            }

        })
    },

    // 获取banner图
    getBannerList: function (e) {
        let bodyData = {
            pageSize: 10,
            pageNumber: 1,
            type: 6
        }

        request({
            url: `/image`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            let { list } = res.data
            // console.log(list)

            this.setData({
                bannerList: list
            })
        })

    },
    // 获取用户信息
    getUserInfo: function (e) {
        let that = this;
        // that.data.userInfo = wx.getStorageSync('userInfo');
        request({
            url: `/profile`,
            method: 'GET',
        }).then((res) => {
            const userInfo = res.data
            // console.log('用户信息', userInfo)
            const levelText = that.data.levelMapping[userInfo.level] || ''

            this.setData({
                userInfo: userInfo,
                levelText: levelText

            })
        })
        // const userIF = that.data.userInfo;
        // // console.log(userIF);
        // // console.log(that.data.levelMapping[2] || '');
        // const levelText = that.data.levelMapping[userIF.level] || ''
        // // console.log(that.data.userInfo.levelText)
        // this.setData({
        //     levelText: levelText,
        //     userInfo: userIF
        // })
    },

    onLoad(options) {

        let that = this,
            selectedStore = wx.getStorageSync('selectedStore'),
            tabActive = that.data.tabActive;

        // console.log('onload_selectedStore',selectedStore)
        // console.log('tabActive',tabActive)

        that.getUserInfo()

        if (!selectedStore) {
            that.goChooseStore()
        } else if (selectedStore) {
            const {id} = selectedStore;
            that.getStoreBgImg()
            that.ProductInfo(id, tabActive)
            that.FilmInfo(id, tabActive)
            that.PerimeterInfo(id,tabActive)
            that.getBannerList()
            this.getCenefitCard(id)
        }

    },

    onShow: function () {
        let that = this;
        that.getTabBar().init();
        const selectedStore = wx.getStorageSync('selectedStore');
        if (!selectedStore) {
            that.goChooseStore()
        }
        that.onLoad();
        that.setData({
            selectedStore: selectedStore
        })
    },
    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let that = this,
            pageNumber = that.data.pageNumber,
            pageSize = that.data.pageSize,
            totalNumber = that.data.totalNumber;

        if (pageSize * pageNumber < totalNumber) {
            pageNumber = pageNumber + 1
            // console.log('触底')
            that.setData({
                pageNumber
            })

        } else {
            that.setData({
                isTouchGround: true
            })
        }

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: '纳管家'
        }
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh()
    },
})
