// 获取应用实例
const app = getApp();
import { request } from "../../../../utils/request";
Page({
  data: {
    inviteBgImg: "",
    mitoBackground: "", // 生成美图的背景图
    nShareImg: "",
    myAwardImg: "",
    noticeImg: "",
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
    stepsList: [
      { id: 1, title: "分享链接", icon: "share" },
      { id: 2, title: "好友注册，并使用", icon: "manager" },
      { id: 3, title: "好友完成，首单", icon: "checked" },
      { id: 4, title: "邀请达成，获得奖励！", icon: "point-gift" },
    ],
    userList: [],
    showPopup: false,
    isLogin: false,
    productCouponList: [],
    recommenderId: undefined,
    recommendList: [],
    totalSuccess: 0,
    totalNumber: 0,
    isCanDraw: false,
    generateQrcode: {
      image: "",
      top: "734rpx",
      left: "470rpx",
      width: "200rpx",
      height: "200rpx",
    }, // 生成的二維碼
    shareTextData: {
      title: {
        text: "邀请您参与免费活动",
        top: "576rpx",
        left: "375rpx",
        align: "center",
        fontSize: "28rpx",
        color: "#3c3c3c",
      },
      subTitle: {
        text: "立即分享，即可获得",
        top: "644rpx",
        left: "375rpx",
        maxLines: 1,
        align: "center",
        fontWeight: "bold",
        fontSize: "44rpx",
        color: "#3c3c3c",
      },
      nickname:
        wx.getStorageSync("userInfo").nickName ||
        wx.getStorageSync("userInfo").nickname ||
        "纳管家",
      avatarUrl:
        wx.getStorageSync("userInfo").avatarUrl ||
        "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/a52feb05474f6b0f1c0fbe4c46b70e4b.png",
    },
  },

  // 获取手机号
  getPhoneNumber: function (e) {
    let that = this,
      recommenderId = that.data.recommenderId
        ? parseInt(that.data.recommenderId)
        : undefined,
      token = wx.getStorageSync("token") ? wx.getStorageSync("token") : "",
      userId = wx.getStorageSync("userInfo")
        ? wx.getStorageSync("userInfo")?.id
        : undefined;

    if (!token && !userId && recommenderId !== parseInt(userId)) {
      let { code } = e.detail,
        bodyData = {
          code,
          recommenderId,
        };
      //   console.log(bodyData, "bodyData");
      if (code) {
        request({
          url: `/login/phoneNumber`,
          method: "POST",
          data: bodyData,
        })
          .then((res) => {
            if (res.code !== 0) {
              wx.showModal({
                title: "提示",
                content: "手机号绑定失败，请重新授权！",
                showCancel: false,
              });
            } else {
              //   console.log(res, "手机号绑定,成功");
              let { token } = res.data;
              wx.setStorageSync("token", token);

              wx.showToast({
                title: "登录成功！",
              });
              // return
              // 跳转到index页面
              wx.switchTab({
                url: "/pages/main/index/index",
              });
            }
          })
          .catch((e) => {
            console.log(e, "err");
          });
      } else {
        wx.showToast({ title: "授权失败", icon: "none" });
      }
    }
  },

  // 生成图片弹框
  handleMito() {
    let that = this,
      generateQrcode = that.data.generateQrcode,
      userId = wx.getStorageSync("userInfo")?.id || undefined,
      bodyData = {
        page: "pages/admin/subPages/activityShare/activityShare",
        scene: userId,
        env_version: "release", // release,trial,develop 正式版，体验版，开发版
      };

    request({
      url: `/qrcode`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
        console.log(res)
      let { url } = res.data;
      generateQrcode.image = url;
      if (url) {
        that.setData({
          generateQrcode,
          isCanDraw: true,
        });
      }
    });
  },

  handleClose() {
    this.setData({
      isCanDraw: !this.data.isCanDraw,
    });
  },

  // 获取背景图
  getInviteBgImg: function (e) {
    let bodyData = {
      pageSize: 1000,
      pageNumber: 1,
    };

    request({
      url: `/image`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { list } = res.data;
      //  背景banner图
      let bannerList = list.filter((o) => {
        return o.type === 8;
      });

      //   纳分享有好礼
      let shareList = list.filter((o) => {
        return o.type === 14;
      });

      //   纳分享有好礼
      let myAwardList = list.filter((o) => {
        return o.type === 15;
      });

      //   纳分享有好礼
      let noticeList = list.filter((o) => {
        return o.type === 16;
      });

      this.setData({
        inviteBgImg: bannerList[0]?.url,
        mitoBackground: bannerList[1]?.url,
        nShareImg: shareList[0]?.url,
        myAwardImg: myAwardList[0]?.url,
        noticeImg: noticeList[0]?.url,
      });
    });
  },

  onShareAppMessage: function (e) {
    const userId = wx.getStorageSync("userInfo")
      ? wx.getStorageSync("userInfo")?.id
      : "";
    // console.log("分享userId", userId);

    return {
      title: "分享立得一张免费洗车券!!!",
      path:
        "/pages/admin/subPages/activityShare/activityShare?userId=" + userId,
    };
  },

  // 获取邀请记录
  handleInvite() {
    request({
      url: `/recommend`,
      method: "GET",
    }).then((res) => {
      let { totalSuccess, totalNumber } = res.data;

      this.setData({
        totalSuccess,
        totalNumber,
      });
    });
  },

  // 获取卡券商品信息
  handleCouponProductInfo: function (e) {
    let that = this,
      bodyData = {
        pageSize: 1000,
        pageNumber: 1,
        type: 2,
      };
    // 获取登录信息
    request({
      url: `/product`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { list } = res.data;

      list.map((lis) => {
        lis.price = parseFloat((lis.price / 100).toFixed(2));
        lis.deposit = lis.deposit
          ? parseFloat((lis.deposit / 100).toFixed(2))
          : 0;

        if (lis.payType == 2) {
          lis.price = lis.price + lis.deposit;
        }
      });

      // console.log(list)
      that.setData({
        productCouponList: list,
      });
    });
  },

  onLoad(options) {
    let recommenderId = options?.userId || decodeURIComponent(options?.scene);

    let that = this,
      token = wx.getStorageSync("token") ? wx.getStorageSync("token") : "",
      userId = wx.getStorageSync("userInfo")
        ? wx.getStorageSync("userInfo")?.id
        : undefined;

    that.getInviteBgImg(); // 获取背景图
    that.handleInvite(); //获取邀请记录

    that.setData({
      recommenderId,
    });
    // console.log(userId, "userId");
    // 判断是否登录
    if (token && userId) {
      that.setData({
        isLogin: true,
      });
    } else {
      that.handleCouponProductInfo(); // 新人首杯专享
    }
  },

  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },

  onShow() {},
});
