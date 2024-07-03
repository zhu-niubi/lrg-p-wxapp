// 获取应用实例
const app = getApp();
import { request } from "../../../utils/request";
import { formatTime, phoneCheck } from "../../../utils/util.js";

Page({
  data: {
    navbarHeight: wx.getStorageSync("navbarHeight"),
  },

  onLoad() {
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
