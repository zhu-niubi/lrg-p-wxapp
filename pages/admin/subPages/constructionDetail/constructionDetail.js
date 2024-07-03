// 获取应用实例
const app = getApp();
import { request } from "../../../../utils/request";
import { formatTime, formatTimes } from "../../../../utils/util.js";
import Dialog from "@vant/weapp/dialog/dialog";

Page({
  data: {
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
    constructionId: null,
    constructionInfo: {},
    defectPartList: [
      { name: "整车", id: 0 },
      { name: "引擎盖", id: 1 },
      { name: "前保险杠", id: 2 },
      { name: "后保险杠", id: 3 },
      { name: "车顶", id: 4 },
      { name: "后翼", id: 5 },
      { name: "后盖箱", id: 6 },
      { name: "左前翼子板", id: 7 },
      { name: "右前翼子板", id: 8 },
      { name: "左后翼子板", id: 9 },
      { name: "右后翼子板", id: 10 },
      { name: "左后视镜", id: 11 },
      { name: "右后视镜", id: 12 },
      { name: "前左侧门", id: 13 },
      { name: "后左侧门", id: 14 },
      { name: "右前门", id: 15 },
      { name: "右后门", id: 16 },
      { name: "仪表号", id: 17 },
      { name: "车灯", id: 18 },
      { name: "座椅", id: 19 },
      { name: "车窗", id: 20 },
      { name: "轮眉", id: 21 },
      { name: "左下边梁", id: 22 },
      { name: "右下边梁", id: 23 },
      { name: "轮胎", id: 24 },
    ], // 缺陷部位的数据
    defectTypeList: [
      { name: "划痕", id: 1 },
      { name: "凹凸", id: 2 },
      { name: "脱漆", id: 3 },
      { name: "破损", id: 4 },
      { name: "补漆", id: 5 },
    ], // 缺陷原因数据
    steps: [],
    statusActive: 0,
    isExpand: false,
    isShowCarOk: false,
    carOKinfo: {},
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
      this.handleConstruction();
    });
  },
  handleSteps() {
    let isExpand = this.data.isExpand;
    isExpand = !isExpand;

    this.setData({
      isExpand,
    });

    this.handleConstruction();
  },

  // 预览图片
  previewImage(e) {
    let url = e.currentTarget.dataset.url,
      constructionInfo = this.data.constructionInfo;

    wx.previewImage({
      current: url, // 当前显示图片的 http 链接
      urls: constructionInfo.defectImages, // 需要预览的图片 http 链接列表
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

            that.handleConstruction();
          });
        })
        .catch(() => {
          // on cancel
        });
    }
  },

  // 获取施工单详情
  handleConstruction() {
    let that = this,
      constructionId = that.data.constructionId,
      defectPartList = that.data.defectPartList,
      steps = that.data.steps,
      isExpand = that.data.isExpand,
      statusActive = that.data.statusActive;

    // 获取信息
    request({
      url: `/construction/${constructionId}`,
      method: "GET",
    }).then((res) => {
      let constructionInfo = res.data;
      //   console.log(constructionInfo,'constructionInfo');
      // 施工状态
      constructionInfo.statusName =
        constructionInfo.status === 1
          ? "确认施工"
          : constructionInfo.status === 5
          ? "提车确认"
          : "";
      // 施工部位
      let constructionSku = [...constructionInfo.constructionSku];

      let keyInx = {};
      for (var i = 0; i < constructionSku.length; i++) {
        var id = constructionSku[i].productId;
        constructionSku[i].productPosition = [
          {
            productSkuName: constructionSku[i].productSkuName,
            rollNumber: constructionSku[i].rollNumber,
            employeeName: constructionSku[i].employeeName,
            length: constructionSku[i].length,
          },
        ];

        if (keyInx[id] >= 0) {
          var product1 = constructionSku[i].productPosition;
          var product2 = constructionSku[keyInx[id]].productPosition;
          constructionSku[keyInx[id]].productPosition = product1.concat(
            product2
          );
          constructionSku.splice(i, 1);
          i--;
        } else {
          keyInx[id] = i;
        }
      }

      constructionInfo.newconstructionSku = constructionSku;

      // 施工时间处理
      constructionInfo.expectComplete = formatTime(
        constructionInfo.expectComplete
      );

      // 缺陷部位
      constructionInfo.defectPart = constructionInfo.defectPart
        ? constructionInfo.defectPart.split(",")
        : [];
      if (constructionInfo.defectPart.length === defectPartList.length - 1) {
        constructionInfo.defectPart = ["0"];
      }

      // 缺陷原因
      constructionInfo.defectType =
        constructionInfo.defectType !== ""
          ? constructionInfo.defectType.split(",")
          : [];

      // 处理进度条数据
      steps = [
        { text: "待确认", desc: "", status: 1 },
        { text: "已确认", desc: "", status: 2 },
        { text: "质检员已确认", desc: "", status: 3 },
        { text: "开始施工", desc: "", status: 4 },
        { text: "施工完成", desc: "", status: 5 },
        { text: "已提车确认", desc: "", status: 6 },
        { text: "店长已确认", desc: "", status: 7 },
      ];

      if (isExpand) {
        statusActive = constructionInfo.status - 1;
        steps[statusActive].desc = formatTimes(constructionInfo.updatedAt);
      } else {
        statusActive = constructionInfo.status - 1;
        steps[statusActive].desc = formatTimes(constructionInfo.updatedAt);
        steps = steps[statusActive + 1]
          ? [steps[statusActive], steps[statusActive + 1]]
          : [steps[statusActive]];

        steps.map((s, index) => {
          if (s.status === constructionInfo.status) {
            statusActive = index;
          }
        });
      }

      console.log('constructionInfo',constructionInfo)
      that.setData({
        constructionInfo,
        steps,
        statusActive,
      });
    });
  },

  onLoad(options) {
    let constructionId = options.id ? options.id : "";

    if (constructionId) {
      this.setData({
        constructionId,
      });

      this.handleConstruction(); // 获取施工单详情
    }
  },

  onShow() {},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh();
  },
});
