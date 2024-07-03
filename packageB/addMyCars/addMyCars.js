// 获取应用实例
const app = getApp();
import { request } from "../../utils/request";
import { formatTime, phoneCheck } from "../../utils/util.js";

Page({
  data: {
    carInfo: {},
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
    carId: null,
    carName: '',
    drivingLicense: {},
    vin:'',
    plate_num:'',
  },
  
  // 行驶证识别
  driverSuccess(e){
      let that = this;
      
      that.setData({
        vin : e.detail.vin.text,
        // carName : e.detail.model.text,
        plate_num : e.detail.plate_num.text,
        drivingLicense : e.detail,
      })
  },

  //  选择车型跳转车品牌页面
  changeCar: function () {
    wx.navigateTo({
      url: "/packageB/carList/carList",
    });
  },

  // 提交信息
  formSubmit: function (e) {
    let that = this;
    let badyData = e.detail.value;
    let carInfo = that.data.carInfo;
    badyData.carId = that.data.carId ? Number(that.data.carId) : carInfo.carId;

    if (carInfo.id) {
      if (!badyData || !badyData.color) {
        wx.showToast({
          title: "数据不完整",
          icon: "error",
          duration: 1000,
        });
      } else {
        request({
          url: `/user_car/${carInfo.id}`,
          method: "PUT",
          data: badyData,
        }).then((res) => {
          wx.showToast({
            title: "修改成功",
            icon: "success",
            duration: 1000,
          });

          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            });
          }, 1000);
        });
      }
    } else {
      if (
        !badyData ||
        !badyData.carId ||
        !badyData.carNumber ||
        !badyData.color
      ) {
        wx.showToast({
          title: "数据不完整",
          icon: "error",
          duration: 1000,
        });
      } else {
        request({
          url: `/user_car`,
          method: "POST",
          data: badyData,
        }).then((res) => {
          wx.showToast({
            title: "添加成功",
            icon: "success",
            duration: 1000,
          });

          setTimeout(() => {
            wx.navigateBack({
              delta: 1,
            });
          }, 1000);
        });
      }
    }
  },

  onLoad(options) {
    let carInfo = options?.item ? JSON.parse(options.item) : "";
    console.log('onload_carInfo',carInfo)
    if (carInfo) {
        

      this.setData({
        carInfo,
      });
    }
  },

  onShow() {},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
});
