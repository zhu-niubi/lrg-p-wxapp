// 获取应用实例
const app = getApp();
import { request } from "../../../utils/request";
import { formatTime, phoneCheck } from "../../../utils/util.js";
import Dialog from "../../../miniprogram_npm/@vant/weapp/dialog/dialog";

Page({
  data: {
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
    pageSize: 15,
    pageNumber: 1,
    totalNumber: 0,
    myCarInfoList: [],
    myCarValue: 0,
    proPriceOption: [
      { text: "默认排序", value: "a" },
      { text: "预计完成时间升序", value: "b" },
      { text: "预计完成时间降序", value: "c" },
    ],
    proPriceValue: "a",
    constructionList: [],
    isTouchGround: false, // 是否触底
    isLoading: false, // 刷新
    isShowCarOk: false, // 提车确认
    carOKinfo: {},
  },

  gotoDamageAssessment(event){
    const construction = event.currentTarget.dataset.data;
    // console.log('construction',construction);
    let userId = construction.userId;
    let constructionId = construction.id;
    request({
        url: `/construction/${constructionId}`,
        method: "GET",
      }).then((res) => {
        // console.log(res);
        const constructionDetail = res.data;

        let warrantyId = constructionDetail.warrantyId;
        
        let productId = constructionDetail.constructionSku[0].productId;
        wx.navigateTo({
            url: `/pages/admin/inquiryLossAssessment/inquiryLossAssessment?userId=${userId}&warrantyId=${warrantyId}&productId=${productId}`,
        });
        
      })
    // return;

  },

  // 一键分享
  handleShare(e) {
    const {id} = e.currentTarget.dataset;
    // console.log('obj',obj)
    wx.navigateTo({
      url: `/pages/admin/subPages/shareMaterial/shareMaterial?id=${id}`,
    });
  },

  // 转到质保查询页面
  handleQualityAssuranceQuery(event) {
    const id = event.currentTarget.dataset.id;
    wx.navigateTo({
      url: `/packageB/warranty/warranty?id=${id}`,
    });
  },
  //  交车确认
  handleCarOkConfirm(e) {
    let { id, status } = this.data.carOKinfo;
    let bodyData = {
      status: status + 1,
    };
    request({
      url: `/construction/${id}`,
      method: "PUT",
      data: bodyData,
    }).then((res) => {
      wx.showToast({
        title: "确认完成",
        icon: "success",
        duration: 2000,
      });

      // 重新加载数据获取最新状态
      this.handleConstructionList();
    });
  },

  // 跳转施工单详情
  handleDetail: function (e) {
    return
    // console.log(e)
    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url:
        "/pages/admin/subPages/constructionDetail/constructionDetail?id=" + id,
    });
  },

  // 获取车辆信息
  handleCarInfo: function () {
    let bodyData = {
      pageSize: this.data.pageSize,
      pageNumber: this.data.pageNumber,
    };

    request({
      url: `/user_car`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      // console.log(res)
      let { data } = res;

      data.map((d) => {
        d.text = d.carBrand + " " + d.carName;
        d.value = d.id;
      });
      // console.log(data)
      data = [{ text: "车库信息", value: 0 }, ...data];

      this.setData({
        myCarInfoList: data,
      });
    });
  },

  // 确认施工单
  constructionStartOk(e) {
    // console.log(e)
    let that = this,
      { id, status } = e.currentTarget.dataset;
    //
    this.setData({
      carOKinfo: {
        id,
        status,
      },
    });

    if (status === 5) {
      that.setData({
        isShowCarOk: true,
      });
    } else if (status === 1) {
      Dialog.confirm({
        title: "温馨提示",
        message:
          "1.本人对此检查无异议，车内无现金、贵重物品，其他物品已得到妥善处理，如有丢失，与NKD体验中心无关。2.施工及撕膜过程中，后喷漆车辆将会有车漆脱落的风险，不属于本产品质量问题，商家和门店均不承担责任。",
      })
        .then(() => {
          // on confirm
          let bodyData = {
            status: status + 1,
          };
          request({
            url: `/construction/${id}`,
            method: "PUT",
            data: bodyData,
          }).then((res) => {
            //   console.log(res)
            wx.showToast({
              title: "确认完成",
              icon: "success",
              duration: 2000,
            });

            that.handleConstructionList();
          });
        })
        .catch(() => {
          // on cancel
        });
    }
  },

  // 搜索订单订单编号
  onFilterChange(e) {
    let that = this,
      value = e.detail,
      name = e.currentTarget.dataset.name;

    if (name == "userCarId") {
      that.setData({
        myCarValue: value,
      });
    } else if (name == "proPriceValue") {
      that.setData({
        proPriceValue: value,
      });
    }

    that.setData({
      pageNumber: 1,
    });

    this.handleConstructionList();
  },

  // 获取全部施工单
  handleConstructionList: function () {
    let that = this,
      pageSize = that.data.pageSize,
      pageNumber = that.data.pageNumber,
      myCarValue = that.data.myCarValue !== 0 ? that.data.myCarValue : "",
      userCarId = myCarValue !== "" ? "userCarId" : "",
      proPriceValue = that.data.proPriceValue,
      isLoading = that.data.isLoading,
      constructionList = that.data.constructionList;

    let bodyData = {
      pageSize,
      pageNumber,
      [userCarId]: myCarValue,
    };
    // 获取信息
    request({
      url: `/construction`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      let { list, totalNumber } = res.data;

      // 时间排序
      if (proPriceValue == "a") {
        list.sort((a, b) => {
          return a - b;
        });
      } else if (proPriceValue == "b") {
        list.sort((a, b) => {
          return a.expectComplete - b.expectComplete;
        });
      } else if (proPriceValue == "c") {
        list.sort((a, b) => {
          return b.expectComplete - a.expectComplete;
        });
      }

      //   console.log(list)

      list.map((lis) => {
        lis.expectComplete = formatTime(lis.expectComplete); //预计完成时间
        lis.status === 1
          ? (lis.statusName = "确认施工")
          : lis.status === 5
          ? (lis.statusName = "提车确认")
          : "";
      });

      if (isLoading) {
        setTimeout(() => {
          wx.stopPullDownRefresh();
          that.setData({
            isLoading: false,
          });
        }, 1000);
      }

      list = pageNumber === 1 ? list : [...constructionList, ...list];
      that.setData({
        constructionList: list,
        totalNumber,
      });
    });
  },

  // 点击搜索框左侧按钮
  onClickLeft: function () {
    wx.navigateBack({
      delta: 1,
    });
  },

  // 触底加载
  onReachBottom: function () {
    let that = this,
      pageNumber = that.data.pageNumber,
      pageSize = that.data.pageSize,
      totalNumber = that.data.totalNumber;

    if (pageSize * pageNumber < totalNumber) {
      pageSize = pageSize + 15;
      console.log("触底");
      that.setData({
        pageSize,
      });

      that.handleConstructionList();
    } else {
      that.setData({
        isTouchGround: true,
      });
    }
  },

  onLoad(options) {
    // 施工单
    this.handleConstructionList();

    // 用户车辆信息
    this.handleCarInfo();
  },

  onShow() {
    this.handleConstructionList();
  },
  onPullDownRefresh: function () {
    this.setData({
      isLoading: true,
    });

    // 施工单
    this.handleConstructionList();
  },
});
