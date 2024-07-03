// pages/admin/subPages/pay/pay.js
const app = getApp()
import WxmpRsa from 'wxmp-rsa'
import Dialog from "../../../../miniprogram_npm/@vant/weapp/dialog/dialog";
import {
  request
} from '../../../../utils/request'
import {
  formatTime,
  formatTimes,
  phoneCheck
} from '../../../../utils/util.js'
Page({

  /**
   * 页面的初始数据
   */
  data: {
    productData: {},
    orderInfo: {},
    code:null,
    renderImg:'',
    moreSku: false,

  },
  moreSku() {
    this.setData({
      moreSku: !this.data.moreSku
    })
  },
  deleteOrder(){
    Dialog.confirm({
      title: '是否取消订单？',

    }).then(() => {
        request({
          url: `/order/${this.data.orderInfo.id}`,
          method: 'DELETE',
        }).then((res) => {
          console.log('delete_order_res',res)
          if(res.data.status == 0){
            wx.showToast({
              title: '订单已取消',
              icon:'success'
            })
            this.getOrderDetail(this.data.orderInfo.id)
          }
        })
     })
      .catch(() => {
        // on cancel
      });
    
  },

  generateRandomString(length) {
    const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * characters.length);
      result += characters.charAt(randomIndex);
    }
    return result;
  },
  payNow() {
    const bodydata = {
      orderNumber: this.data.orderInfo?.orderNumber
    }
    request({
      url: `/payment`,
      method: 'POST',
      data: bodydata
    }).then((res) => {
      console.log('payment_res',res)
      wx.requestPayment({
          "signType":'RSA',
          "timeStamp": res.data.timeStamp.toString(),
          "nonceStr": res.data.nonceStr,
          "package": res.data.package,
          "paySign": res.data.paySign,
          "success":  (res) => {
              console.log(res)
              const intervalId = setInterval(() => {
                request({
                    url: `/order/${this.data.orderInfo.id}`,
                    method: 'GET',
                }).then(res => {
                    // if (res.data.payStage !== 3) {
                    //   wx.showLoading({
                    //     title: '请稍后',
                    //   })
                    // }
                    if (res.data.payStage === 3) {
                        // wx.hideLoading()
                        console.log('请求成功，取消定时器');
                        clearInterval(intervalId); 
                        this.getOrderDetail(this.data.orderInfo.id)
                        wx.showToast({
                          title: '支付成功',
                          icon:'success'
                        },1000)
                        
                    }
                }).catch(err => {
                    console.error('请求出错', err);
                });
            }, 1000);
            
          },
          "fail": function (res) {
            console.log(res)
            wx.showToast({
              title: '支付失败',
              icon:'error'
            })
          },
          "complete": function (res) {}
        })
    })

    // return
    
  },
  handleExchange(data) {
    let that = this,
        code = data.orderNumber,
        cardObj = data;
    // console.log("itemCoupon.code:", code);
    that.setData({
        code: code
    })
    that.getQrcodeImg(code);
    that.handleWebSocket(cardObj)


},
handleWebSocket: function (val) {
  let that = this,
      cardObj = val;


  that.socket = wx.connectSocket({
      url: `wss://api.ngj.nkdppf.com/wss?token=${wx.getStorageSync('token')}`,
      success() {
          console.log("connection success");
      },
      fail() {
          console.log("connection fail");
      }
  });

  that.socket.onOpen(res => {
      console.log(res, '连接成功')
  });


  that.socket.onClose(res => {
      console.log(res, '连接失败')
      that.handleWebSocket()
  });


  that.socket.onMessage(res => {
      // console.log(res, '接受消息')
      // console.log(cardObj, '卡券信息')

      let { event, data, status } = JSON.parse(res.data)

      if (status === 1 && event == 'usedCoupon' && data === cardObj.id) {
          that.setData({
              isSend: true,
              isMask: true
          })
      } else if (status === 2 && event == 'usedCoupon' && data === cardObj.id) {
          wx.showToast({
              title: '消费成功',
              icon: 'success',
              duration: 2000
          })

          that.setData({
              isMask: true,
              isSend: false
          })
      }
  });
},
// 获取二维码图片
getQrcodeImg(code) {
  console.log('getQrcodeImg_code',code)
  let that = this
  // 根据不同的卡类型获取不同的卡信息
  let bodyData = {
      code,
  }
  request({
      url: `/qrcode/toImage`,
      method: 'GET',
      data: bodyData
  }).then((res) => {
      let { url } = res.data
      //   console.log( url)
      that.setData({
          renderImg: url
      })
  })
},
  getOrderDetail(val) {
    let that = this,
      orderId = val;
    request({
      url: `/order/` + orderId,
      method: 'GET',
    }).then((res) => {
      let data = res.data;
      //   console.log(data)

      data.createdAt = formatTimes(data.createdAt)
      data.updatedAt = formatTimes(data.updatedAt)


      if (data.status !== 0) {
        data.payStageName = data.payStage === 3 ? '完成支付' : '等待支付'
      } else {
        data.payStageName = "订单已取消"
      }

      data.deadline = data.deadline * 1000 - new Date().getTime() + 2000 >= 0 ? data.deadline * 1000 - new Date().getTime() + 2000 : 0

      let amount = 0;
      let point = 0
      data.orderSku.map((item) => {
        item.amount = parseFloat((item.amount / 100).toFixed(2));
        item.point = parseFloat((item.point / 100).toFixed(2));
        amount += item.amount;
        point += item.point
      })
      data.t_amount = amount;
      data.t_point = point;
      let skuList = []
      for(const sku of data.orderSku){
        if(sku.useStatus == 0){
          skuList.push(sku)
        }
      }
      data.usedSkuList = skuList
      that.setData({
        orderInfo: data
      })
      if(data.payStage == 3){
        this.handleExchange(data);
      }
      
      console.log('订单详情', this.data.orderInfo)


    })

  },
  handleCopy(e) {
    let that = this,
      value = e.currentTarget.dataset.value;

    wx.setClipboardData({
      data: value
    })
  },

  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    console.log('options', options)
    if (parseInt(options.status) == 1) {
      let data = {};
      data.productImg = options.productImg;
     
      data.productSpecificate = options.productSpecificate;
      data.productType = parseInt(options.productType);
      data.discountedPrice = parseInt(options.discountedPrice);
      data.usePoint = parseInt(options.usePoint);
      const skuList = wx.getStorageSync('skuList')
      let proList = [];
      
      for(const s of skuList){
        const d = {};
        d.productName = s.skuName;
        d.productPoint = parseInt(s.point);
        d.productPrice = parseFloat((s.price).toFixed(2) );
        d.productId = s.skuId
        proList.push(d)
      }

      console.log('生成订单后的proList',proList)
      data.proList = proList;
      data.type = parseInt(options.status);
      const orderId = parseInt(options.orderId);
      this.getOrderDetail(orderId);
      console.log('生成订单后的data',data)
      this.setData({
        productData: data
      })
    }else{
      const data = {};
      //parseInt
      data.productImg = options.productImg;
      data.productName = options.productName;
      data.productPoint = parseInt(options.productPoint);
      data.productPrice = parseInt(options.productPrice);
      data.productSpecificate = options.productSpecificate;
      data.productType = parseInt(options.productType);
      data.discountedPrice = parseInt(options.discountedPrice);
  
      data.usePoint = parseInt(options.usePoint);
      data.type = parseInt(options.status);
  
      const orderId = parseInt(options.orderId);
      this.getOrderDetail(orderId);
     
      this.setData({
        productData: data
      })
      console.log('productData', this.data.productData)
    }
    
  },

  /**
   * 生命周期函数--监听页面初次渲染完成
   */
  onReady() {

  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {

  },

  /**
   * 生命周期函数--监听页面隐藏
   */
  onHide() {

  },

  /**
   * 页面相关事件处理函数--监听用户下拉动作
   */
  onPullDownRefresh() {

  },

  /**
   * 页面上拉触底事件的处理函数
   */
  onReachBottom() {

  },

  /**
   * 用户点击右上角分享
   */
  onShareAppMessage() {

  }
})