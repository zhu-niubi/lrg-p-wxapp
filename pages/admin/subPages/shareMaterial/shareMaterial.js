// pages/admin/putMaterial/putMaterial.js
const app = getApp();
import { request } from "../../../../utils/request";
import { formatTime } from "../../../../utils/util";
Page({
  /**
   * 页面的初始数据
   */
  data: {
    constructionInfo: null,
    materialImg: {}, // 图片
    isCanDraw: false,
    generateQrcode: {
      image:
        wx.getStorageSync("userInfo").avatarUrl ||
        "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/e8b414b2457c93678559cc39be03650c.png",
      top: "834rpx",
      left: "470rpx",
      width: "200rpx",
      height: "200rpx",
    }, // 生成的二維碼
    inviteBgImg: "",
    sharePosterBg: "", //海报背景
    bannerData: {
      top: "200rpx",
      left: "54rpx",
      right: "0",
      width: "640rpx",
      height: "580rpx",
      image: "",
    }, //海报banner
    shareTextData: {
      title: {
        text: "",
        top: "830rpx",
        left: "68rpx",
        align: "left",
        fontSize: "44rpx",
        fontWeight: "bold",
        color: "#3c3c3c",
        maxLines: 1,
      },
      subTitle: {
        text: "",
        top: "900rpx",
        left: "68rpx",
        align: "left",
        fontSize: "26rpx",
        color: "#3c3c3c",
      },
    },
  },

  onShareAppMessage: function (e) {
    let { id } = that.data.constructionInfo;

    return {
      title: "精美实贴案例！",
      path: `/pages/admin/subPages/shareMaterial/shareMaterial?id=${id}`,
    };
  },

  //   选择需要生成海报的图片
  //   handleMitoImg(){
  //       this.setData({

  //       })
  //   },

  // 生成图片弹框
  handleMito() {
    let that = this;
    let generateQrcode = that.data.generateQrcode;
    let { id } = that.data.constructionInfo;
    let bodyData = {
      page: "pages/admin/subPages/shareMaterial/shareMaterial",
      scene: id,
      is_hyaline: true,
      env_version: "release", // release,trial,develop 正式版，体验版，开发版
    };

    request({
      url: `/qrcode`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { url } = res.data;

      generateQrcode.image = url;
      that.setData({
        generateQrcode,
        isCanDraw: true,
      });
    });
  },

  createShareImage() {
    this.setData({
      isCanDraw: !this.data.isCanDraw,
    });
  },

  // 预览图片
  previewImage(e) {
    let { url, list } = e.currentTarget.dataset;

    wx.previewImage({
      current: url, // 当前显示图片的 http 链接
      urls: list, // 需要预览的图片 http 链接列表
    });
  },

  // 根据施工单id获取施工案例
  handleConstruction(id) {
    let that = this,
      constructionId = id,
      shareTextData = that.data.shareTextData;
    let bannerData = this.data.bannerData;
    // 获取信息
    request({
      url: `/construction-image`,
      method: "GET",
      data: {
        constructionId,
      },
    }).then((res) => {
      let { list } = res.data;
      let constructionInfo = {};

      if (list && list.length) {
        //   时间
        constructionInfo.createdAt = formatTime(list[0].createdAt);
        // 施工单id
        constructionInfo.id = list[0].constructionId;
        // 车型号
        constructionInfo.carBrandName = list[0].carBrandName;
        constructionInfo.carName = list[0].carName;
        constructionInfo.storeName = list[0].storeName;
        constructionInfo.constructionSku = list;

        //   海报标题数据
        shareTextData.title.text = constructionInfo.carName;
        shareTextData.subTitle.text =
          constructionInfo.constructionSku[0].productName +
          "-" +
          constructionInfo.constructionSku[0].productModelName;

        //   海报图
        bannerData.image = constructionInfo.constructionSku[0].src[0] || "";
        // console.log(bannerData,"bannerData");
        that.setData({
          constructionInfo,
          shareTextData,
          bannerData,
        });
      }
    });
  },

  // 获取背景图
  getInviteBgImg: function (e) {
    let bodyData = {
      pageSize: 1000,
      pageNumber: 1,
    };

    let bannerData = this.data.bannerData;

    request({
      url: `/image`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { list } = res.data;
      //  分享背景图
      let shareBgImgList = list.filter((o) => {
        return o.type === 19;
      });

      //   海报背景
      let sharePosterBgList = list.filter((o) => {
        return o.type === 20;
      });

      //   海报banner
      let sharePosterBannerList = list.filter((o) => {
        return o.type === 21;
      });

      bannerData.image = bannerData.image || sharePosterBannerList[0]?.url;

      this.setData({
        inviteBgImg: shareBgImgList[0]?.url,
        sharePosterBg: sharePosterBgList[0]?.url,
        bannerData,
      });
    });
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    let that = this,
      id = options.scene ? decodeURIComponent(options.scene) : options.id;

    if (id) {
      that.handleConstruction(id); // 获取施工单详情
      that.getInviteBgImg();
    }
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {},

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {},

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {},

  /**
   * 生命周期函数--监听页面卸载
   */
  onUnload() {},

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {},

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {},

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {},
});
