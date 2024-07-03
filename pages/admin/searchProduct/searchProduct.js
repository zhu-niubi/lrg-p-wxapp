// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime,phoneCheck } from '../../../utils/util.js'

Page({
  data: {
    productList:[],
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    pageSize:15,
    pageNumber: 1,
    totalNumber:0,
    proTypeOption: [{ text: '全部商品', value: 0 }],
    proTypeValue: 0,
    proPriceOption: [
      { text: '默认排序', value: 'a' },
      { text: '价格升序', value: 'b' },
      { text: '价格降序', value: 'c' },
    ],
    proPriceValue: 'a',
    searchVal: '', // 商品名
    isTouchGround:false, // 是否触底
  },

  // 点击搜索框左侧按钮
  onClickLeft:function() {
    wx.navigateBack({
      delta: 1
    })
  },

    // 跳转商品详情页
    gotoProDetail(e) {
    //   console.log(e)
      let productId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/admin/productDetail/productDetail?productId='+ productId,
      })
    },


  // 筛选
  onFilterChange(e) {
    let value = e.detail,
      name = e.currentTarget.dataset.name

    this.setData({
      [name]:value,
      pageNumber:1
    })
    this.handleProductInfo()
  },

// 获取产品类型
  handleProTypeVal(e) {
    let that = this;
    let bodyData = {
      pageSize: 1000,
      pageNumber:1,
      type:2
    }
    // 获取信息
    request({
      url: `/product`,
      method: 'GET',
      data:bodyData
  }).then((res) => {
    let { list } = res.data
    
    list.map((lis) => {
      lis.text = lis.name
      lis.value = lis.id
    })

    list = [{ text: '全部商品', value: 0 },...list]

      that.setData({
        proTypeOption:list
      })
  })
  },

    // 获取商品信息
    handleProductInfo: function () {
      let that = this,
      productList = that.data.productList,
          pageSize = that.data.pageSize,
        pageNumber = that.data.pageNumber,
        proPriceValue = that.data.proPriceValue,
        proTypeValue = that.data.proTypeValue ? that.data.proTypeValue : '',
        proTypeName = proTypeValue ? 'productTypeId' : '',
        searchVal = that.data.searchVal ? that.data.searchVal : "",
        searchName = searchVal ? 'name' : '',

          bodyData = {
            pageSize,
            pageNumber,
            [proTypeName]: proTypeValue,
            [searchName] : searchVal,
            type:2
        };

        // 获取信息
        request({
            url: `/product`,
            method: 'GET',
            data:bodyData
        }).then((res) => {
          let { list, totalNumber } = res.data
          
          list.map((lis) => {
            lis.price = parseFloat((lis.price / 100).toFixed(2))
          })

          
          if (proPriceValue == 'b') {
            list.sort((a,b) => {
              return b.price - a.price
            })

          } else {
            list.sort((a,b) => {
              return a.price - b.price
            })
          }

          list = pageNumber === 1 ? list : [...productList,...list]

          that.setData({
              productList:list,
              totalNumber
          })
            // console.log(list)
            
        })
    },

  onLoad(options) {
    let value = options.value ?options.value : '',
      proTypeId = options.proTypeId ? Number(options.proTypeId) : 0;

    
     // 产品类型
    //  this.handleProTypeVal()
     
    this.setData({
      searchVal: value,
      proTypeValue: proTypeId,
      pageNumber:1
    })

    this.handleProductInfo(value) // 商品信息

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

            that.handleProductInfo()
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
