// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime,phoneCheck } from '../../../utils/util.js'
import Dialog from "../../../miniprogram_npm/@vant/weapp/dialog/dialog";


Page({
  data: {
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    pageSize: 15,
    pageNumber: 1,
    totalNumber:0,
    searchVal: '', // 订单号
    orderTabList: [
      {id:1,name:'全部',icon:'pending-payment'},
      {id:2,name:'待付款',icon:'pending-payment'},
      {id:3,name:'待使用',icon:'todo-list-o'},
      {id:4, name: '已使用', icon: 'comment-o'},
      // {id:5,name:'售后',icon:'notes-o'}, 
    ],
    tabActive: 0,
    orderList: [],
    isTouchGround:false, // 是否触底
    detail:false,
  },

  gotoDetail(e){
    console.log('gotoDetail(e)_e',e,this.data.detail)
    const index = e.currentTarget.dataset.index;
    const orderList = this.data.orderList;
    const orderItem = orderList[index];
    orderItem.detail = !orderItem.detail
    this.setData({
      orderList
    })
  },
  // 跳转订单支付页面
  gotoPay(e){
    console.log('gotoPay_e',e.currentTarget.dataset.obj)
    const payInfo = e.currentTarget.dataset.obj

    let 
        orderId = payInfo.id,
        productImg = payInfo.orderSku[0].productBanner[0],
        productName = payInfo.orderSku[0].productName,
        productSpecificate = payInfo.orderSku[0].productSkuName,
        productPrice = parseFloat((payInfo.amount / 100).toFixed(2)),
        productPoint = payInfo.orderSku[0].point,
        discountedPrice = 0,
        productType = 0,
        usePoint = 0;

        wx.navigateTo({
          url: '/pages/admin/subPages/pay/pay?orderId='+orderId + '&productImg=' + productImg + '&productName=' + productName + '&productSpecificate=' + productSpecificate + '&productPrice=' + productPrice + '&productPoint=' + productPoint + '&productType=' + productType + '&discountedPrice=' +discountedPrice + '&usePoint=' + usePoint,
        })

  },
  deleteOrder(e){
    console.log('deleteOrder_e',e)
    Dialog.confirm({
      title: '是否取消订单？',

    }).then(() => {
        request({
          url: `/order/${e.currentTarget.dataset.orderid}`,
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

  // 跳转订单详情页面
  gotoOrderDetail(e) {
    let { orderid } = e.currentTarget.dataset;
    
    wx.navigateTo({
      url: "/pages/admin/subPages/orderDetail/orderDetail?orderId=" + orderid,
    })
  },

  // 点击导航栏
  onTabChange(e) {
    let that = this,
      {index} = e.detail;
    
      that.setData({
        tabActive:index,
        pageNumber:1
      })
    that.handleOrderList()
  },

  // 搜索订单订单编号
  onFilterChange(e) {
    let value = e.detail

    this.setData({
      searchVal:value,
      pageNumber:1
    })

    this.handleOrderList()
  },

  // 获取全部订单
  handleOrderList: function () {
    let that = this,
      orderList = that.data.orderList,
      pageSize=that.data.pageSize,
      pageNumber = that.data.pageNumber,
      tabActive  = that.data.tabActive,
      payStageName = tabActive !== 0 ? 'payStage' : '',
      payStage = tabActive == 1 ? 1 : 3,
      status = tabActive === 1 || tabActive === 2 ? 1 : tabActive === 3 ? 2 : '',

      statusName = tabActive !== 0 ? 'status' : '',
      // status = tabActive === 3 ? 2 : (tabActive === 2 ? 1 : ''),
      orderNumberName = that.data.searchVal ? Number.isInteger(Number(that.data.searchVal)) ? 'orderNumber' : 'productName' : '',
      orderNumber = that.data.searchVal ? that.data.searchVal : '';
      
    console.log('tabActive',tabActive)
    let bodyData = {
      pageSize,
      pageNumber,
      [statusName]:status,
      [payStageName]: payStage,
      [orderNumberName] :orderNumber
    }
  
    // 获取信息
    request({
      url: `/order`,
      method: 'GET',
      data: bodyData
    }).then((res) => {
      let { list,totalNumber } = res.data
      // console.log('res=======================',res)
      // list.map((lis) => {
      //     lis.actualPrice = 0
      //     lis.orderSku.map((s)=>{
      //         s.productSkuPrice = (s.productSkuPrice / 100) //sku价格
      //         s.amount = (s.amount / 100) //订单金额
      //         //   总价
      //       lis.actualPrice += s.amount
      //     })
      // })
      console.log('???list',list)
      if (tabActive == 4) {
        list=[]
      }else if (tabActive == 1) {
        // 根据订单截止时间排序
        list.sort((a, b) => {
          return a.payBalanceAt - b.payBalanceAt
        })
      }
      
      list = pageNumber === 1 ? list : [...orderList,...list]
      for(const item of list){

          item.detail = false;
        
      }
      that.setData({
        orderList: list,
        totalNumber
      })
      console.log('orderlist',list)
    })
  },

    // 点击搜索框左侧按钮
    onClickLeft:function() {
      wx.navigateBack({
        delta: 1
      })
  },
    




    // 跳转商品详情页
    gotoBuy(e) {
    //   console.log(e)
      let productId = e.currentTarget.dataset.productid;
      wx.navigateTo({
        url: '/pages/admin/productDetail/productDetail?productId='+ productId,
      })
  },
    
      // 触底加载
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

            that.handleOrderList()
        } else {
          that.setData({
            isTouchGround:true
          })
        }
  },



  onLoad(options) {
    let index = options.index ? Number(options.index) : '';
    console.log(index)

     this.setData({
      tabActive:index
    })


    // 订单
    this.handleOrderList()

  },

  onShow() {
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
