// 获取应用实例
const app = getApp()
import {
  request
} from '../../../utils/request'
import {
  formatTime,
  phoneCheck
} from '../../../utils/util.js'
const CryptoJS = require('crypto-js');
Page({
  data: {
    productType: null,
    productInfo: {},
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    myPoint: 0,
    // shoppingNum: 1,
    productId: null,
    orderId: null,
    isLoading: false,
    skuName: '',
    point: null,
    price: null,
    skuId: null,
    usePoint: null,
    discountedPrice: 0,
    skuList: [],
    moreSku: false,
    s_status: null
  },
  moreSku() {
    this.setData({
      moreSku: !this.data.moreSku
    })
  },
  inputPoint(e) {

    console.log('inputPoint_e', e)
    // const point = e.detail;

    this.setData({
      usePoint: e.detail
    })
  },
  calculatePoint() {
    wx.showToast({
      title: '请稍后...',
      icon: 'loading'
    }, 500)

    setTimeout(() => {
      const point = this.data.usePoint;
      if (point > this.data.myPoint) {
        wx.showToast({
          title: '您的积分不足',
          icon: 'none'
        }, 500)
        this.setData({
          usePoint: null
        })
        return
      }
      if (point % 10 === 0) {
        console.log('const discountedPrice = point / 100_point',point)
        console.log(' this.data.price', this.data.price)

        const discountedPrice = point / 100
        if (discountedPrice > (this.data.price == null ? this.data.productInfo.totalPrice : this.data.price)) {
          wx.showToast({
            title: '抵扣金额大于商品总额',
            icon: 'none'
          }, 500)
          return
        }
        this.setData({
          discountedPrice
        })
      } else {
        wx.showToast({
          title: '请输入10的倍数',
          icon: 'none'
        }, 500)
      }

    }, 800)
  },

  // 提交订单
  onSubmit: function () {
    console.log('this.data.s_status',typeof this.data.s_status)
    
    if (this.data.s_status !== 1) {
      let that = this,
        skuOrders = [],
        productType = that.data.productType,
        pointQuantity = parseInt(that.data.point);
      const selectSku = {};
      selectSku.productSkuId = that.data.skuId;
      selectSku.productCount = 1;
      skuOrders.push(selectSku);
      let bodyData = {};
      //isPoint=>1：积分购买；0：普通购买
      let isPoint = productType == 1 ? 1 : 0;
      if (isPoint == 1) {
        if (that.data.myPoint < pointQuantity) {
          wx.showToast({
            title: '积分不足',
            icon: 'error'
          }, 2000)
          return
        }
        bodyData = {
          isPoint,
          skuOrders,
        };
      }
      if (isPoint == 0) {
        const usePOint = parseInt(that.data.usePoint);
        bodyData = {
          isPoint,
          skuOrders,
          pointQuantity: usePOint || 0
        };
      }

      console.log('bodyData券和周边积分抵扣', bodyData)
      // 创建订单
      request({
        url: `/order`,
        method: 'POST',
        data: bodyData,
        // header: {
        //   'Authorization': 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MTUyODIsIndlYnNpdGUiOiJjbGllbnQiLCJpYXQiOjE2OTcxMDA3ODEsImV4cCI6MTY5NzcwNTU4MX0.AnQgl0aAQfz1WXNE7Lw668jrTcsjqYO3rmEGuuruWLc', // 替换 your_token_here 为你的实际用户令牌
        // }
      }).then((res) => {
        console.log('提交订单返回=>', res)


          let
            orderId = res.data.id,
            product = that.data.productInfo,
            productImg = product.banners[0],
            productName = product.name,
            productSpecificate = that.data.skuName,
            productPrice = that.data.price,
            productPoint = that.data.point,
            discountedPrice = that.data.discountedPrice,
            usePoint = that.data.usePoint;

          wx.navigateTo({
            url: '/pages/admin/subPages/pay/pay?orderId=' + orderId + '&productImg=' + productImg + '&productName=' + productName + '&productSpecificate=' + productSpecificate + '&productPrice=' + productPrice + '&productPoint=' + productPoint + '&productType=' + productType + '&discountedPrice=' + discountedPrice + '&usePoint=' + usePoint + '&status=' + this.data.s_status,
          })
      })
    } else if(this.data.s_status == 1) {
      let that = this,
        skuOrders = [],
        productType = that.data.productType,
        pointQuantity = parseInt(that.data.point);

      const select_list = wx.getStorageSync('skuList');
      console.log('select_list',select_list)
      for (const j of select_list) {
        const selectSku = {};
        selectSku.productSkuId = j.skuId;
        selectSku.productCount = 1;
        skuOrders.push(selectSku);
      }

      let bodyData = {};
      //isPoint=>1：积分购买；0：普通购买
      let isPoint = productType == 1 ? 1 : 0;
      if (isPoint == 1) {
        if (that.data.myPoint < pointQuantity) {
          wx.showToast({
            title: '积分不足',
            icon: 'error'
          }, 2000)
          return
        }
        bodyData = {
          isPoint,
          skuOrders,
        };
      }
      if (isPoint == 0) {
        const usePOint = parseInt(that.data.usePoint);
        bodyData = {
          isPoint,
          skuOrders,
          pointQuantity: usePOint || 0
        };
      }

      console.log('bodyData', bodyData)
      // 创建订单
      request({
        url: `/order`,
        method: 'POST',
        data: bodyData,
      }).then((res) => {
        console.log('提交订单返回=>', res)

          let
            orderId = res.data.id,
            product = that.data.productInfo,
            productImg = product.banners[0],
            productName = product.name,

            discountedPrice = that.data.discountedPrice,
            usePoint = that.data.usePoint;
            console.log('discountedPrice',discountedPrice)
            console.log('车衣订单提交')
          wx.navigateTo({
            url: '/pages/admin/subPages/pay/pay?orderId=' + orderId + '&productImg=' + productImg + '&productName=' + productName + '&productType=' + productType + '&discountedPrice=' + discountedPrice + '&usePoint=' + usePoint + '&status=' + that.data.productInfo.status,
          })
        


      })
    }




  },

  // 获取订单信息
  handleOrderInfo: function (val) {

    request({
      url: `/order`,
      method: 'GET',
      data: {
        orderNumber: val
      }
    }).then((res) => {
      let {
        list
      } = res.data;
      // console.log(list)

      wx.redirectTo({
        url: '/pages/admin/success/success?orderId=' + list[0].id,
      })
    })
  },

  // 支付订单
  handlePayOrder(val) {
    let that = this,
      badyData = {
        orderNumber: val
      };

    request({
      url: `/order/payment`,
      method: 'POST',
      data: badyData
    }).then((res) => {

      that.handleOrderInfo(val)
    })
  },

  // 获取商品信息
  handleProductInfo: function () {
    let that = this,
      productId = that.data.productId ? that.data.productId : undefined;
    // shoppingNum = that.data.shoppingNum ? that.data.shoppingNum : 1;
    // 获取登录信息
    request({
      url: `/product/` + productId,
      method: 'GET',
    }).then((res) => {
      let data = res.data;

      data.payBalanceAt = formatTime(data.payBalanceAt)

      // data.price = parseFloat((data.price / 100).toFixed(2))
      // data.deposit = parseFloat((data.deposit / 100).toFixed(2))

      // 总尾款 尾款 * 数量
      // data.finalPrice = data.price * shoppingNum

      // 总价格 = 定金+尾款
      // data.amount = data.price + data.deposit

      // 总价格 单价 * 数量
      // data.totalPrice = data.amount * shoppingNum

      // 实际需支付的定金价格 定金 * 数量
      // data.actualPrice = (data.deposit !== 0 ? data.deposit * shoppingNum : data.totalPrice) * 100
      data.totalPrice = this.data.skuList.reduce((accumulator, currentValue) => accumulator + currentValue.price, 0);
      console.log('商品信息', data)



      that.setData({
        productInfo: data
      })
    })
  },
  getPoint() {
    request({
      url: `/profile`,
      method: 'GET',
    }).then((res) => {
      console.log('getPoint_res', res)
      this.setData({
        myPoint: res.data.pointQuantity
      })
    })
  },

  onLoad(options) {

    console.log('options', options)
    let productId = options.productId ? options.productId : undefined,
      status = options.status,
      // shoppingNum = options.num ? options.num : 1,
      productType = options.productType;
      console.log('status----',status)
    if (status == 1) {
      const skuList = wx.getStorageSync('skuList')
      this.setData({
        s_status:parseInt(status),
        skuList,
        productId,
        productType,
      })
      
    } else {
      
      let p_name = options.skuName,
        p_point = parseInt(options.point),
        p_price = parseFloat((options.price / 100).toFixed(2)),
        p_skuId = parseInt(options.skuId);
        console.log('p_name,p_point,p_price,p_skuId=>',p_name,p_point,p_price,p_skuId)
      this.setData({
        s_status:parseInt(status),
        productId,
        // shoppingNum,
        productType,
        skuName: p_name,
        point: p_point,
        price: p_price,
        skuId: p_skuId,
        // type:p_type
      })

    }


    this.getPoint();
    this.handleProductInfo() // 获取产品信息
    // 获取当前时间的秒数
    const currentSeconds = Math.floor(new Date().getTime() / 1000);
    console.log('当前时间（秒数）:', currentSeconds);


  },

  onShow() {},
  onPullDownRefresh: function () {
    wx.stopPullDownRefresh()
  },
})