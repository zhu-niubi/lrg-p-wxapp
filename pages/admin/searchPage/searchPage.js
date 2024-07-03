// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime,phoneCheck } from '../../../utils/util.js'

Page({
  data: {
    historyList:[],
    hotList: [
      {title:'咖啡卡'},
      {title:'洗车卡'},
      {title:'保养卡'},
    ],
    hotClassList:[],
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    searchVal:'', // 商品名
  },
  // 点击热门分类
  onClickHotClass(e) {
    let id = e.currentTarget.dataset.id
    wx.navigateTo({
      url: '/pages/admin/searchProduct/searchProduct?proTypeId=' + id,
    })
  },

  // 点击历史记录/热门搜索查询相应的数据
  onClickSearch(e) {
    // console.log(e)
    let index = e.currentTarget.dataset.index,
      name = e.currentTarget.dataset.name,
      value = '',
      historyList = this.data.historyList,
      hotList = this.data.hotList;
    
    if (name == 'history') {
      value = historyList[index]
    }else if (name == 'hot') {
      value = hotList[index].title
    }
    
      wx.navigateTo({
        url: '/pages/admin/searchProduct/searchProduct?value=' + value,
      })
  },

  // 清除历史记录
  onResetHistory() {
    wx.removeStorageSync('historyList')

    this.setData({
      historyList:[]
    })
  },

  // 搜索
  onFilterChange(e) {
    let value = e.detail

    // console.log(value)
    
    wx.navigateTo({
      url: '/pages/admin/searchProduct/searchProduct?value=' + value,
    })

    // 搜索历史
    let historyList = wx.getStorageSync('historyList') ? wx.getStorageSync('historyList') :[];
    historyList.push(value)

    let newHistoryList = [...new Set(historyList)];
    wx.setStorageSync('historyList', newHistoryList)

    this.setData({
      searchVal: value
    })
  },

  // 获取产品类型
  handleProTypeVal(e) {
    let that = this;
    let bodyData = {
      pageSize: 1000,
      pageNumber:1
    }
    // 获取信息
    request({
      url: `/product_type`,
      method: 'GET',
      data:bodyData
  }).then((res) => {
    let { list } = res.data
    
    list.map((lis) => {
      lis.image = "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/5c125805213d9600e24e5a1eed968886.png"
    })

    // console.log(list)
      that.setData({
        hotClassList:list
      })
  })
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


  onLoad() {
    // 产品类型
    // this.handleProTypeVal()

    this.setData({
      historyList:wx.getStorageSync('historyList')
    })
  },

  onShow() {
    this.setData({
      historyList:wx.getStorageSync('historyList')
    })
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
