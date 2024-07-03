// 获取应用实例
const app = getApp()
import { request } from '../../../../utils/request'
import { formatTime,formatTimes,phoneCheck } from '../../../../utils/util.js'

Page({
  data: {
    isMask: false,
    isSend: false,
    renderImg:'',
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    shoppingNum: 1,
    productId: null,
    orderId:null,
    isLoading: false,
    orderInfo: {},
    productInfo: {},
    isExpand: false,
    copyValue: undefined,
    stepsList: [
      {id:1,title:'联系我们',icon:'chat-o'},
      {id:2,title:'拨打电话',icon:'phone-o'},
    ],
    productLikeList: [],
    pageNumber: 1,
    pageSize: 15,
    totalNumber: 0,
    productType: undefined, // 商品类型
    isTouchGround:false, 
  },
      // 获取喜欢的商品信息
    handleLikeProductInfo: function (e) {
      let that = this,
      productLikeList = that.data.productLikeList,
          pageSize = that.data.pageSize,
          pageNumber = that.data.pageNumber,
          productType = that.data.productType,
          bodyData = {
            pageSize,
            pageNumber,
            type:productType
          };
        // 获取登录信息
        request({
            url: `/product`,
            method: 'GET',
            data:bodyData
        }).then((res) => {
          let { list,totalNumber } = res.data
          
          list.map((lis) => {
            lis.price = parseFloat((lis.price / 100).toFixed(2))
            lis.deposit = lis.deposit ? parseFloat((lis.deposit / 100).toFixed(2)) : 0
  
            if (lis.payType == 2) {
              lis.price = lis.price + lis.deposit
            }
          })
          
          list = pageNumber === 1 ? list : [...productLikeList,...list]
            // console.log(list)
            that.setData({
              productLikeList: list,
              totalNumber
            })
        })
    },

  // 复制订单编号
  handleCopy(e) {
    let that = this,
      value = e.currentTarget.dataset.value;

    wx.setClipboardData({
      data: value
    })
  },
  // 展开商品详情
  handleOrderExpand() {
    let isExpand = this.data.isExpand

    this.setData({
      isExpand:!isExpand
    })
  },

    // 订单时间到时 自动取消订单/刷新订单信息
  orderFinish() {
    this.handleOrderInfo()
  },
  
  // 如果是继续支付
  onPaySubmit: function () {
    let that = this;
    
    wx.showModal({
      title: '提示',
      content: '确认支付？',
      success (res) {
        if (res.confirm) {
           // 支付订单
            that.handlePayOrder()
        } else if (res.cancel) {
          that.orderFinish()
        }
      }
    })
  },

  // 支付订单
  handlePayOrder() {
    let { orderNumber,id } = this.data.orderInfo,
      badyData = {
      orderNumber
    };
    
    request({
      url: `/order/payment`,
      method: 'POST',
      data: badyData
    }).then((res) => {
      wx.redirectTo({
        url: '/pages/admin/success/success?orderId=' + id,
      })
    })
  },

  // 获取商品信息
  handleProductInfo: function () {
    let that = this, orderInfo = that.data.orderInfo,
      productId = orderInfo.productId || undefined;
        // 获取登录信息
        request({
            url: `/product/`+ productId,
            method: 'GET',
        }).then((res) => {
          let data = res.data;
          
          data.price = parseFloat((data.price / 100).toFixed(2))
          data.deposit = parseFloat((data.deposit / 100).toFixed(2))

          
          // 价格 = 定金+尾款
            data.price = data.price + data.deposit

        
          // console.log(data)
          that.setData({
            productInfo: data,
            productType : data.type,
            pageNumber:1
          })

          this.handleLikeProductInfo() // 获取喜欢的产品信息
        })
  },

  // 获取订单信息
  handleOrderInfo: function (e) {
    let that = this,
      orderId = that.data.orderId;
    request({
      url: `/order/` + orderId,
      method: 'GET',
    }).then((res) => {
      let data = res.data;
    //   console.log(data)

      data.createdAt = formatTimes(data.createdAt)
      data.updatedAt = formatTimes(data.updatedAt)

      // 判断支付状态 payStage ： 0 等待支付全额 1 等待支付定金 2 等待支付尾款 3 完成支付
      // if (data.status !== 0) {
      //   data.payStageName = data.payStage === 0 ? '等待您支付全额' : data.payStage === 1 ? '等待您支付定金' : data.payStage === 2 ? '等待您支付尾款': data.payStage === 3 ? '完成支付' : ''
      // } else {
      //   data.payStageName="订单已取消"
      // }
      if (data.status !== 0) {
        data.payStageName = data.payStage === 0 ? '等待您支付' : data.payStage === 1 ? '等待您支付定金' : data.payStage === 2 ? '等待您支付尾款': data.payStage === 3 ? '完成支付' : ''
      } else {
        data.payStageName="订单已取消"
      }
      
      data.deadline = data.deadline * 1000 - new Date().getTime() + 2000 > 0 ? data.deadline * 1000 - new Date().getTime() + 2000 : 0

      // data.payment.map((p) => {
      //   p.billTypeName = p.billType === 1 ? '全额支付' : p.billType === 2 ? '定金' : p.billType === 3 ? '尾款' : ''
      //   p.paymentMethodName = p.paymentMethod === 1 ? '在线支付' : '线下支付'
      //   p.payStatusName = p.payStatus === 0 ? '未支付' : '已支付'
      //   if ( p.paymentAt !== 0) {
      //     p.paymentAt = formatTimes(p.paymentAt)
      //   }
      //   p.amount = parseFloat((p.amount / 100).toFixed(2))
      // })

      // // 卡券信息
      // data.coupon.map((c) => {
      //   c.statusName = c.status == 1 ? '未使用' : c.status == 2 ? '已使用' : '已过期'
      // })

      // data.deposit = parseFloat((data.deposit / 100).toFixed(2))
      // list.map((lis) => {
      //     lis.actualPrice = 0
      //     lis.orderSku.map((s)=>{
      //         s.productSkuPrice = (s.productSkuPrice / 100) //sku价格
      //         s.amount = (s.amount / 100) //订单金额
      //         //   总价
      //       lis.actualPrice += s.amount
      //     })
      // })
      let amount = 0;
      let point = 0
      data.orderSku.map((item)=> {
        item.amount = parseFloat((item.amount / 100).toFixed(2));
        item.point = parseInt(item.point);
        amount += item.amount;
        point += item.point
      })
      data.t_amount = amount;
      data.t_point = point;

      // data.price = parseFloat((data.price / 100).toFixed(2))

      // // 尾款
      // data.finalPrice = data.price * data.productCount

      // // 实付款
      // data.actualPay = data.payStage == 0 ? data.price * data.productCount : data.payStage == 1 ? data.deposit * data.productCount : data.payStage == 2 ? data.price * data.productCount : data.payStage == 3 ? data.amount : 0
      
      // // 合计
      // data.actualPrice = data.actualPay * 100

      // // 商品总额
      // data.totalPrice = data.amount
      
      that.setData({
        orderInfo: data
      })
      console.log('订单详情orderDetail',data)
      if (data.status == 1) {
        this.getQrcodeImg(data.orderNumber);
        this.handleWebSocket(data.id) // 监听二维码使用
      }
      
      // this.handleProductInfo() // 获取产品信息
      
    })
  },
  handleWebSocket: function (val) {
    let that = this;
    let id = val;

    
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

        let { event, data, status } = JSON.parse(res.data)

        if (status === 1 && event == 'usedCoupon' && data === id) {
            that.setData({
                isSend: true,
                isMask: true
            })
        } else if (status === 2 && event == 'usedCoupon' && data === id) {
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
  getQrcodeImg (code) {
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

  // 跳转商品详情页
  gotoProDetail(e) {
    let productId = e.currentTarget.dataset.id;
    wx.navigateTo({
      url: '/pages/admin/productDetail/productDetail?productId='+ productId,
    })
  },

  onLoad(options) {
    let orderId = options.orderId || 132;

    this.setData({
      orderId
    })

    
    if (orderId) {
      this.handleOrderInfo() // 获取订单信息
    }

    
  },

      /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
      let that = this,
      pageNumber = that.data.pageNumber,
      pageSize = that.data.pageSize,
      totalNumber = that.data.totalNumber;

      if (pageSize * pageNumber < totalNumber) {
        pageNumber = pageNumber + 1
            console.log('触底')
            that.setData({
                pageNumber
            })

            that.handleLikeProductInfo()
        } else {
          that.setData({
            isTouchGround:true
          })
        }

  },

  onShow() {
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
