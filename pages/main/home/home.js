// 获取应用实例
const app = getApp();
import { request } from "../../../utils/request";
import { formatTime, phoneCheck } from "../../../utils/util.js";

Page({
    data: {
        bgImg: "", // 首页背景底图
        productTypeList: [], // 产品类型数据,首页banner
        productFilmList: [], // 车膜数据
        caseList: [
            {
                name: "奔驰GLK300｜NKD车衣",
                image:
                    "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/ac13505565e625905c41e8b2b3b8a143.png",
                type: 1,
            },
            {
                name: "奔驰GLK300｜NKD车衣",
                image:
                    "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/d1eb717880a52e891f61fd1d165eb658.png",
            },
            {
                name: "奔驰GLK300｜NKD车衣",
                image:
                    "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/3ff5e0ca9b959313b5e5a68cbd99305c.png",
            },
        ], // 案例中心
        shareImg: "", // 活动分享背景
        technicianImg: "", //技师默认
        technicianOpenImg: "", //技师展开
        isShowTechnician: false, // 是否展开技术
        brandVideo: "", // 品牌故事
        footerImg: "", // footer
        active: 0
    },
    gotoCaseList(e) {
        wx.navigateTo({
            url: "/packageA/caseList/caseList",
        });
    },
    gotoTechnicianDetails(e) {
        wx.navigateTo({
          url: "/pages/admin/technicianDetails/technicianDetails",
        })
    },
    goProductDetailPage(e) {
        wx.navigateTo({
            url: "/packageA/productDetail/productDetail",
        });
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
    binderror: function (e) {
        console.log("视频报错", e);
    },

    //   点击放大公司介绍扫描二维码
    footerPreviewImage() {
        let url = this.data.footerImg;
        wx.previewImage({
            current: url, // 当前显示图片的http链接
            urls: [url], // 需要预览的图片http链接列表
        });
    },
    //   点击展开技师图片
    onClickTech() {
        let isShowTechnician = this.data.isShowTechnician;
        this.setData({
            isShowTechnician: !isShowTechnician,
        });
    },

    // 获取图片
    getImgs: function (e) {
        let bodyData = {
            pageSize: 100,
            pageNumber: 1,
        };
        request({
            url: `/image`,
            method: "GET",
            data: bodyData,
        }).then((res) => {
            let { list } = res.data;

            //   首页背景地图
            let bgImgList = list.filter((o) => {
                return o.type === 9;
            });

            //   活动分享
            let shareList = list.filter((o) => {
                return o.type === 7;
            });

            //   技师默认图片
            let technicianList = list.filter((o) => {
                return o.type === 11;
            });

            //   技师展开图片
            let technicianOpenList = list.filter((o) => {
                return o.type === 12;
            });

            //   品牌故事视频
            let brandList = list.filter((o) => {
                return o.type === 10;
            });
            console.log('brandList[0]?.url',brandList[0]?.url)

            //   footer
            let footerList = list.filter((o) => {
                return o.type === 13;
            });

            this.setData({
                bgImg: bgImgList[0]?.url,
                shareImg: shareList[0]?.url,
                technicianImg: technicianList[0]?.url,
                technicianOpenImg: technicianOpenList[0]?.url,
                brandVideo: brandList[0]?.url,
                footerImg: footerList[0]?.url,
            });
        });
    },

    //   获取产品类型
    getProductType: function (e) {
        let bodyData = {
            pageSize: 100,
            pageNumber: 1,
        };
        request({
            url: `/product_type`,
            method: "GET",
            data: bodyData,
        }).then((res) => {
            let { list } = res.data;
            // console.log("product_type",list);
            this.setData({
                productTypeList: list,
            });
        });
    },

    // 获取车膜商品信息
    handleFilmProductInfo: function (e) {
        let that = this;
        let bodyData = {
            pageSize: 2,
            pageNumber: 1,
            type: 1,
        };
        // 获取登录信息
        request({
            url: `/product`,
            method: "GET",
            data: bodyData,
        }).then((res) => {
            let { list } = res.data;
            // console.log('res.data', res.data)
            //   let firstFiveItems = list.slice(0, 2);
            that.setData({
                // productFilmList: firstFiveItems,
                productFilmList: list
            });
        });
    },


    // 跳转邀请界面
    gotoInvitePage: function () {
        wx.navigateTo({
            url: "/pages/admin/subPages/activityShare/activityShare",
        });
    },
    // 获取热门案例
    getHotCase() {

        const bodyData = {}
        request({
            url: ``,
            method: 'GET',
            data: bodyData
        }).then((res) => {

        })
    },

    onLoad() {
        this.getImgs(); // 获取图片
        this.getProductType(); // 产品类型
        this.handleFilmProductInfo(); // 获取车膜商品信息
        this.getHotCase(); // 获取热门案例
    },

    onShow: function () {
        this.getTabBar().init();
    },
    /**
     * 用户点击右上角分享
     */
    onShareAppMessage: function () {
        return {
            title: "纳管家",
        };
    },
    onPullDownRefresh: function () {
        wx.stopPullDownRefresh();
    },
});
