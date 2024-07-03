// 获取应用实例
const app = getApp();
import { request } from "../../../utils/request";
import { formatTime } from "../../../utils/util";
import Dialog from "../../../miniprogram_npm/@vant/weapp/dialog/dialog";


Page({
  data: {
    recommenderId: undefined, // 推荐人id
    userToken: null,
    bgImg: "",
    userInfo: {},
    myCarInfo: {}, // 用户车辆
    windowHeight: wx.getStorageSync("windowHeight"),
    navbarHeight: wx.getStorageSync("navbarHeight"),
    isExpand: true,
    insuranceDocs: [
      {
        brand: "宝马",
        plateNumber: "12345",
        dateDay: "2022-05-24",
      },
    ],
    couponList: [],
    equityList: [],
    orderList: [
      {
        id: 1,
        name: "待付款",
        icon: "pending-payment",
        num: 0,
      },
      {
        id: 2,
        name: "待使用",
        icon: "todo-list-o",
        num: 0,
      },
      {
        id: 3,
        name: "已使用",
        icon: "comment-o",
        num: 0,
      },
      // {
      //   id: 4,
      //   name: "退货/售后",
      //   icon: "notes-o",
      //   num: 0,
      // },
    ],
    unpaidList: {}, // 待支付数据
    constructionList: [
      {
        id: 1,
        name: "施工单",
        icon: "todo-list-o",
        num: 0,
      },
      {
        id: 2,
        name: "NFC查询质保",
        icon: "http://backend-ngj.oss-cn-shanghai.aliyuncs.com/nfc.png",
        num: 0
      },
    //   {
    //     id: 3,
    //     name: "查询定损记录",
    //     icon: "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/dingsun.png",
    //     num: 0
    //   }
    ], 
    hasPhoneNumber: false, // 是否绑定手机号
    timeData:{}
  },
  
  deleteOrder(){
    Dialog.confirm({
      title: '是否取消订单？',

    }).then(() => {
        request({
          url: `/order/${this.data.unpaidList.id}`,
          method: 'DELETE',
        }).then((res) => {
          console.log('delete_order_res',res)
          if(res.data.status == 0){
            wx.showToast({
              title: '订单已取消',
              icon:'success'
            })
            this.handleOrderList()
          }
        })
     })
      .catch(() => {
        // on cancel
      });
    
  },
  // 获取手机号
  getPhoneNumber: function (e) {
    let { code } = e.detail,
      bodyData = {
        code,
      };

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
            console.log(res, "手机号绑定,成功");
            let { token } = res.data;
            wx.setStorageSync("token", token);

            wx.showToast({
              title: "登录成功！",
            });
            // return
            // 跳转到显示页面
            this.loaData();
          }
        })
        .catch((e) => {
          console.log(e, "err");
        });
    } else {
      wx.showToast({ title: "授权失败", icon: "none" });
    }
  },
  // 事件处理函数
  getUserProfile: function (e) {
    let that = this;
    //   授权获取用户信息
    wx.getUserProfile({
      desc: "展示用户信息", // 声明获取用户个人信息后的用途，后续会展示在弹窗中，请谨慎填写
      success: (res) => {
        const wxUserInfo = res.userInfo;

        wx.setStorageSync("wxUserInfo", wxUserInfo);

        // 获取openid
        wx.login({
          success(loginRes) {
            if (!loginRes.code) {
              return;
            } else {
              let bodyData = {
                nickname: wxUserInfo.nickName,
                jsCode: loginRes.code,
                avatarUrl: wxUserInfo.avatarUrl,
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
                  }
                  that.loaData();
                }
              });
            }
          },
        });
      },
    });
  },

  // 跳转车主服务页面
  gotoServePage(e) {
    if (!wx.getStorageSync("subscribeConstruction")) {
      wx.requestSubscribeMessage({
        tmplIds: ["tP7rhr3kWhKbE8O9JzXC0YR1u62aUuJz4NnLwJ38sUw"],
        success(res) {
          console.log(res);
        },
        fail(err) {
          console.log(err);
        },
      });
    }
    // console.log('e',e.currentTarget.dataset.id)
    const type = e.currentTarget.dataset?.id;
    if( type == 1 ){
      wx.navigateTo({
        url: "/pages/admin/construction/construction",
      });
    }
    if( type == 2 ) {
      wx.navigateTo({
        url: "/pages/admin/NFCWarranty/NFCWarranty",
      })
    }
    // if( type == 3 ) {
    //     wx.navigateTo({
    //         url: "/pages/admin/inquiryLossAssessment/inquiryLossAssessment",
    //     })
    // }
    
    
  },

  // 跳转订单支付页面
  gotoPay(){
    
    let that = this;
    console.log('unpaidList_gotopay',that.data.unpaidList)
    let 
        orderId = that.data.unpaidList.id,
        productImg = that.data.unpaidList.orderSku[0].productBanner[0],
        productName = that.data.unpaidList.orderSku[0].productName,
        productSpecificate = that.data.unpaidList.orderSku[0].productSkuName,
        productPrice = that.data.unpaidList.amount,
        productPoint = that.data.unpaidList.orderSku[0].point,
        discountedPrice = 0,
        productType = 0,
        usePoint = 0;

        wx.navigateTo({
          url: '/pages/admin/subPages/pay/pay?orderId='+orderId + '&productImg=' + productImg + '&productName=' + productName + '&productSpecificate=' + productSpecificate + '&productPrice=' + productPrice + '&productPoint=' + productPoint + '&productType=' + productType + '&discountedPrice=' +discountedPrice + '&usePoint=' + usePoint,
        })
        // console.log('orderId',orderId)
        // wx.navigateTo({
        //   url: '/pages/admin/subPages/pay/pay?orderId='+orderId,
        // })
  },

  // 跳转我的订单页面
  gotoOrderPage(e) {
    console.log(e);
    let index = e.currentTarget.dataset.index;

    // return
    wx.navigateTo({
      url: "/pages/admin/order/order?index=" + index,
    });
  },

  // 订单时间到时 自动取消订单/刷新订单信息
  orderFinish() {
    this.handleOrderList();
  },
  onchange(e){
    // console.log(e)
    this.setData({
      timeData:e.detail
    })
  
  },
  // 获取待付款信息
  handleOrderList() {
    let that = this,
      orderList = that.data.orderList;

    request({
      url: `/order`,
      method: "GET",
      data: {
        pageSize: 1000,
        pageNumber: 1,
        status: 1,
        payStage: 1,
      },
    }).then((res) => {
      let { list } = res.data;

      if (list?.length > 0) {
        list?.map((lis) => {
                // data.price = parseFloat((data.price / 100).toFixed(2))

          lis.amount = parseFloat((lis.amount / 100).toFixed(2))
          lis.deposit = (lis.deposit / 100) * lis.productCount;
          // lis.deadline = lis.deadline* 1000 - new Date().getTime() + 2000
          lis.deadline =
            lis.deadline * 1000 - new Date().getTime() >= 0
              ? lis.deadline * 1000 - new Date().getTime() + 2000
              : 0;

              
        });

        // 根据订单截止时间排序
        list.sort((a, b) => {
          return a.deadline !== 0
            ? a.deadline - b.deadline
            : a.payBalanceAt - b.payBalanceAt;
        });

        
        // 处理尾款时间
        list[0].payBalanceAt = formatTime(list[0].payBalanceAt);
      }
      //待付款图标
      orderList[0].num = list.length;
      let timeData ={};
      if (list.length > 0) {
        console.log('unpaidList',list[0])
      timeData = {
      seconds : Math.floor((list[0].deadline / 1000) % 60),
      lminutes : Math.floor((list[0].deadline / (1000 * 60)) % 60),
      hours : Math.floor((list[0].deadline / (1000 * 60 * 60)) % 24),
     }
      }
      
   console.log('unpaidList', list[0])
      that.setData({
        unpaidList: list?.length > 0 ? list[0] : "",
        orderList,
        timeData
      });
    });
  },

  // 获取订单使用信息
  handleUseOrderList() {
    let that = this,
      orderList = that.data.orderList;

    request({
      url: `/order`,
      method: "GET",
      data: {
        pageSize: 1000,
        pageNumber: 1,
        status: 1,
        payStage: 2,
      },
    }).then((res) => {
      let { list } = res.data;
      if (list?.length) {
        list.map((lis) => {
          lis.price = (lis.price / 100) * lis.productCount;
          lis.deposit = (lis.deposit / 100) * lis.productCount;
          lis.deadline = lis.deadline * 1000 - new Date().getTime() + 2000;
        });

        // 根据订单截止时间排序
        list.sort((a, b) => {
          return a.deadline - b.deadline;
        });

        //待付款图标
        orderList[1].num = list.length;
      }

      that.setData({
        orderList,
      });
    });
  },
  // 获取公告
  handleUseNotice() {
    let that = this;
    request({
      url: `/notice`,
      method: "GET",
    }).then((res) => {
      let noticeData = res.data;

      that.setData({
        noticeData,
      });
    });
  },

  // 获取车辆信息
  handleCarInfo() {
    let carInfoObj = wx.getStorageSync("carInfoObj")
      ? wx.getStorageSync("carInfoObj")
      : "";
    if (carInfoObj && carInfoObj.id) {
      this.setData({
        myCarInfo: carInfoObj,
      });
    } else {
      request({
        url: `/user_car`,
        method: "GET",
      }).then((res) => {
        let { data } = res;

        this.setData({
          myCarInfo: data[0],
        });
      });
    }
  },
  // 跳转我的车辆页面
  handleToMyCar: function () {
    wx.navigateTo({
      url: "/packageA/myCars/myCars",
    });
  },

  // 加载背景图数据
  handleBjImage: function (e) {
    let bodyData = {
      pageSize: 10,
      pageNumber: 1,
      type: 3,
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

  // 获取用户信息
  handleGetInfo: function (e) {
    let that = this;

    // 获取登录信息
    request({
      url: `/profile`,
      method: "GET",
    }).then((res) => {
      let userInfo = res.data;
      wx.setStorageSync("userInfo", userInfo);

      //   if (userInfo.id) {
      //     wx.setStorageSync("userId", userInfo.id);
      //   }

      let hasPhoneNumber =
        userInfo.phoneNumber && userInfo.phoneNumber.length !== 11
          ? false
          : true;
      // userInfo.hasOpenId = false
      that.setData({
        userInfo,
        hasPhoneNumber,
      });
    });
  },

  // 获取我的卡券信息
  handleCoupon: function () {
    wx.showNavigationBarLoading();
    request({
      url: `/coupon_class`,
      method: "GET",
    }).then((res) => {
      //   console.log(res)
      this.setData({
        couponList: res.data,
      });

      setTimeout(function () {
        wx.hideNavigationBarLoading();
        //停止下拉刷新
        wx.stopPullDownRefresh();
      }, 2000);
    });
  },

  // 获取会员权益信息
  handleWelfare: function () {
    request({
      url: `/welfare`,
      method: "GET",
    }).then((res) => {
      this.setData({
        equityList: res.data,
      });
    });
  },

  // 订阅卡券信息
  handleCouponMessage() {
    wx.getSetting({
      withSubscriptions: true,
      success(res) {
        var itemSettings = res.subscriptionsSetting.itemSettings;
        if (itemSettings) {
          if (
            itemSettings["Yqf5NbM1teijfyCkEUJHJ2ASGK8FVw5-YA9toGell5U"] ==
            "accept"
          ) {
            // 卡券到账
            wx.setStorageSync("subscribeCouponAccount", true);
          }
          if (
            itemSettings["yekvnJmuFKHB4SD1icxJiw1fYCGJ3hzMb6xZRhcEX6I"] ==
            "accept"
          ) {
            // 卡券过期
            wx.setStorageSync("subscribeCouponPast", true);
          }
          if (
            itemSettings["tP7rhr3kWhKbE8O9JzXC0YR1u62aUuJz4NnLwJ38sUw"] ==
            "accept"
          ) {
            // 施工单
            wx.setStorageSync("subscribeConstruction", true);
          }
        }
      },
    });
  },

  // 我的卡券,跳转
  gotoCouponPage: function (e) {
    if (!wx.getStorageSync("subscribeCouponPast")) {
      wx.requestSubscribeMessage({
        tmplIds: ["yekvnJmuFKHB4SD1icxJiw1fYCGJ3hzMb6xZRhcEX6I"],
        success(res) {
          console.log(res);
        },
        fail(err) {
          console.log(err);
        },
      });
    }

    let id = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: "/pages/admin/cardCoupon/cardCoupon?cardId=" + id,
    });
  },

  // 会员权益弹框
  gotoWelfarePage: function (e) {
    let index = e.currentTarget.dataset.index;
    wx.navigateTo({
      url: "/pages/admin/welfare/welfare?index=" + index,
    });
  },

  // 修改用户信息
  gotoUserInfo: function (e) {
    wx.navigateTo({
      url: "/pages/admin/personalFile/personalFile",
    });
  },

  // 点击展开质保
  handleIsExpand: function (e) {
    let that = this;
    let isExpand = that.data.isExpand;
    isExpand = !isExpand;
    that.setData({
      isExpand,
    });
  },

  //  加载初始数据
  loaData: function (e) {
    // console.log('index---------------')
    this.handleBjImage(); // 背景
    this.handleGetInfo(); // 用户信息
    this.handleCoupon(); // 卡券信息
    this.handleWelfare(); // 会员权益信息
    this.handleCarInfo(); // 我的爱车
    this.handleOrderList(); // 我的待付款订单
    this.handleUseOrderList(); // 我的待使用
    this.handleUseNotice(); // 公告

    // 获取token
    this.setData({
      userToken: wx.getStorageSync("token"),
    });
  },

  onLoad(options) {
    // console.log('index===================')
    let recommenderId =
      options?.recommenderId !== undefined
        ? Number(options?.recommenderId)
        : undefined;

    // console.log(recommenderId,"onload")

    this.setData({
      recommenderId,
    });

    this.loaData(); // 加载数据
  },

  onShow: function () {
    // console.log('++++++++++++++++++++')
    this.handleGetInfo(); // 用户信息
    this.handleCarInfo(); // 我的爱车
    this.handleCoupon(); // 卡券信息
    this.handleWelfare(); // 会员权益信息
    this.handleUseOrderList(); // 待使用订单
    this.handleUseNotice(); // 公告
    this.handleOrderList(); // 待付款订单
    this.handleCouponMessage(); // 订阅消息

    // 获取token
    this.setData({
      userToken: wx.getStorageSync("token"),
    });

    // 初始化点击下标
    this.getTabBar().init();
  },

  onShareAppMessage: function () {
    return {
      title: "纳管家",
    };
  },
  onPullDownRefresh: function () {
    this.handleCoupon();
  },
});
