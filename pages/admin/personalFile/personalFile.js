// 获取应用实例
const app = getApp();
import { request } from "../../../utils/request";
import { formatTime, phoneCheck } from "../../../utils/util.js";

Page({
  data: {
    bgImg: "",
    userInfo: {},
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
    genderList: [
      { id: 1, name: "男" },
      { id: 2, name: "女" },
    ], // 性别
    genderIndex: null,
    region: [], // 城市
    countryList: ["中国"], // 国家
    countryIndex: null,
  },

  // 头像更换
  onChooseAvatar: function (e) {
    const defaultAvatarUrl =
      "https://mmbiz.qpic.cn/mmbiz/icTdbqWNOwNRna42FI242Lcia07jQodd2FJGIYQfG0LAJGFxM4FbnQP6yfMxBgJ0F3YRqJCJ1aPAK2dQagdusBZg/0";
    let that = this;
    const { avatarUrl } = e.detail;

    wx.uploadFile({
      url: `${app.globalData.hostUri}/upload`,
      method: "POST",
      filePath: avatarUrl || defaultAvatarUrl,
      name: "file",
      header: {
        "content-type": "multipart/form-data",
        Authorization: `Bearer ${wx.getStorageSync("token")}`,
      },
      formData: {
        file: avatarUrl || defaultAvatarUrl,
      },
      success(res) {
        const data = JSON.parse(res.data);

        let value = data.data.url;
        let name = e.currentTarget.dataset.name;

        let bodyData = { name, value };
        // 修改用户头像
        that.handleUpdateUserInfo(bodyData);
      },
    });

    // wx.chooseMedia({
    //   count: 1,
    //   mediaType: ['image'],
    //   sourceType: ['album', 'camera'],
    //   camera: 'back',
    //   success(res) {
    //     let tempFiles = res.tempFiles[0]
    //     // console.log(res)

    //   },
    // })
  },

  // input失去焦点
  handleEdit: function (e) {
    let that = this;
    let value = e.detail.value;
    let name = e.currentTarget.dataset.name;

    let bodyData = { name, value };

    // 修改用户信息
    that.handleUpdateUserInfo(bodyData);
  },

  // 性别
  handleGender: function (e) {
    let index = e.detail.value,
      genderList = this.data.genderList;
    let name = e.currentTarget.dataset.name;
    let value = genderList[index].id;

    let bodyData = { name, value };
    // console.log(bodyData)
    // return
    // 修改用户信息
    this.handleUpdateUserInfo(bodyData);

    this.setData({
      countryIndex: index,
    });
  },

  // 生日
  handleBirthday: function (e) {
    let value = Number(new Date(e.detail.value) / 1000);
    let name = e.currentTarget.dataset.name;

    let bodyData = { name, value };

    // 修改用户信息
    this.handleUpdateUserInfo(bodyData);
  },

  // 国家
  handleCountry: function (e) {
    let index = e.detail.value,
      that = this,
      countryList = that.data.countryList;
    console.log('index',index)
    let name = e.currentTarget.dataset.name;
    let value = countryList[index];

    let bodyData = { name, value };
    // console.log(index,bodyData)
    // return
    // 修改用户信息
    this.handleUpdateUserInfo(bodyData);

    this.setData({
      countryIndex: index,
    });
  },

  // 城市
  bindRegionChange: function (e) {
    let region = e.detail.value;

    let bodyData = {
      province: region[0],
      city: region[1],
      area: region[2],
    };

    // 修改用户信息
    this.handleUpdateUserInfo(bodyData);

    this.setData({
      region,
    });
  },

  // 修改用户信息接口
  handleUpdateUserInfo: function (val) {
    let that = this;

    let bodyData = {};
    if (val.province || val.city || val.area) {
      bodyData = val;
    } else {
      bodyData = {
        [val.name]: val.value,
      };
    }
    // console.log(bodyData,'bodyData')
    // return
    request({
      url: `/profile`,
      method: "PUT",
      data: bodyData,
    }).then((res) => {
      const { code } = res;
      if (code !== 0) {
        wx.showToast({
          title: "修改失败",
          icon: "error",
          duration: 1000,
        });
      } else {
        wx.showToast({
          title: "修改成功",
          icon: "success",
          duration: 1000,
        });

        that.handleGetInfo();
      }
    });
  },

  // 获取用户信息
  handleGetInfo: function (e) {
    let that = this;
    let genderList = that.data.genderList;

    // 获取登录信息
    request({
      url: `/profile`,
      method: "GET",
    }).then((res) => {
      let userInfo = res.data;

      // 设置默认头像为微信头像
      userInfo.avatarUrl = userInfo.avatarUrl
        ? userInfo.avatarUrl
        : wx.getStorageSync("userInfo").avatarUrl;

      userInfo.birthday = formatTime(userInfo.birthday);

      // 设置加载初始化性别
      genderList.map((gender, index) => {
        if (userInfo.gender == gender.id) {
          that.setData({
            genderIndex: index,
          });
        }
      });
      console.log('userInfo',userInfo)

      // 初始化国家信息
      let countryList = [userInfo.country];

      // 设置城市信息初始化城市
      let region = [userInfo.province, userInfo.city, userInfo.area];

      that.setData({
        userInfo,
        region,
        countryList,
        countryIndex: 0,
      });
    });
  },

  // 加载背景图数据
  handleBjImage: function (e) {
    let bodyData = {
      pageSize: 10,
      pageNumber: 1,
      type: 4,
    };

    request({
      url: `/image`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { list } = res.data;
      let bgImg = list[0] ? list[0].url : "";
      let newBgImg = bgImg ? `background-image: url('${bgImg}')` : "";

      this.setData({
        bgImg: newBgImg,
      });
    });
  },

  onLoad() {
    this.handleGetInfo();
    this.handleBjImage(); // 背景图
  },

  onShow() {},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
});
