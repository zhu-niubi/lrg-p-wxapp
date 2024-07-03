// index.js
const app = getApp();
import { request } from "../../utils/request";

Page({
  data: {
    userToken: null,
    isSubscribeCoupon: false,
    bgImg: "https://www.mogutech.cn/wxapp/bg-login.jpg?t=20220222",
    windowHeight: wx.getStorageSync("windowHeight"),
    recommenderId: undefined,
  },

  // 事件处理函数
  getUserProfile: function (e) {
    let that = this;
    //   授权获取用户信息
    wx.getUserProfile({
      desc: "展示用户信息", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        const userInfo = res.userInfo;
        wx.setStorageSync("userInfo", userInfo);

        // 获取openid
        wx.login({
          success(loginRes) {
            if (!loginRes.code) {
              return;
            } else {
              let bodyData = {
                nickname: userInfo.nickName,
                jsCode: loginRes.code,
                avatarUrl: userInfo.avatarUrl,
              };
              // return
              // 登录
              request({
                url: `/user/bind_openId`,
                method: "POST",
                data: bodyData,
              }).then((res) => {
                let { code, data } = res;
                if (code !== 0) {
                  wx.showModal({
                    title: "提示",
                    content: "绑定失败，请重新授权！",
                    showCancel: false,
                  });
                } else {
                  console.log(data, "merge");
                  if (data.merge) {
                    wx.removeStorageSync("token");
                    wx.setStorageSync("token", data.token);
                    const updateManager = wx.getUpdateManager();
                    updateManager.onUpdateReady(function () {
                      wx.showModal({
                        title: "更新提示",
                        content: "新版本已经准备好，是否重启应用？",
                        success: function (res) {
                          if (res.confirm) {
                            // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                            updateManager.applyUpdate();
                          }
                        },
                      });
                    });

                    wx.showToast({
                      title: "您已获得一张免费卡券",
                      icon: "success",
                      duration: 2000,
                    });

                    // 跳转到显示页面
                    wx.switchTab({
                      url: "/pages/main/index/index",
                    });
                  }
                }
              });
            }
          },
        });
      },
    });
  },

  //   加载数据背景图
  loaData: function (e) {
    let bodyData = {
      pageSize: 10,
      pageNumber: 1,
      type: 2,
    };

    request({
      url: `/image`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { list } = res.data;
      this.setData({
        bgImg: list[0].url,
      });
    });
  },

  onLoad(options) {
    let recommenderId =
      options.recommenderId !== undefined
        ? Number(options.recommenderId)
        : undefined;

    // console.log(recommenderId)

    this.setData({
      recommenderId,
    });

    this.loaData();
  },

  onShow() {
    this.loaData();
  },

  onShareAppMessage: function () {},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
});
