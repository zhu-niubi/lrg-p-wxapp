// 获取应用实例
const app = getApp()
import { request } from '../../utils/request'

Page({
  data: {
    myCarInfoList:[],
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    carInfoObj: {},
    switchValue: null,
    isTouchGround: false,
    pageSize: 15,
    pageNumber: 1,
    totalNumber:0,
  },
  // 设置默认
  switchChange: function (e) {
    let that = this,
      myCarInfoList = that.data.myCarInfoList,
      value = e.detail;
    

    myCarInfoList.map((car) => {
        if (car.id === value) {
          // 存储
          wx.setStorageSync('carInfoObj', car)
        }
      })
    that.setData({
      myCarInfoList,
      switchValue:value
    })
  },

  // 删除车辆信息
  handleDeleteCar: function (e) {
    let that = this
    let id = e.currentTarget.dataset.id
    wx.showModal({
      title: '提示',
      content: '此操作不可回退，请谨慎操作！',
      success (res) {
        if (res.confirm) {
          request({
            url: `/user_car/${id}`,
            method: 'DELETE'
          }).then((res) => {
            wx.showToast({
              title: '删除成功',
              icon: 'success',
              duration: 1000
            })
            that.handleCarInfo()
          })
        } else if (res.cancel) {
          // wx.showToast({
          //   title: '取消删除',
          //   icon: 'cancel',
          //   duration: 1000
          // })
        }
      }
    })
    
  },

  // 跳转添加页面
  handleAddCars: function (e) {
    let item = e.currentTarget.dataset.item
    if (item) {
      wx.navigateTo({
        url: '/packageB/addMyCars/addMyCars?item='+ JSON.stringify(item),
      })
    } else {
      wx.navigateTo({
        url: '/packageB/addMyCars/addMyCars',
      })
    }
    
  },

   // 获取车辆信息
  handleCarInfo: function () {
    let bodyData = {
      pageSize: this.data.pageSize,
      pageNumber: this.data.pageNumber,
    }
    
    request({
      url: `/user_car`,
      method: 'GET',
      data:bodyData
    }).then((res) => {
      console.log(res)
      let { data } = res
      let carInfoObj = wx.getStorageSync('carInfoObj') ? wx.getStorageSync('carInfoObj') : ''
      
      // 设置默认数据
      if (!carInfoObj && !carInfoObj.id) {
        wx.setStorageSync('carInfoObj', data[0])
      }

      // console.log(data)
      this.setData({
        myCarInfoList: data,
        switchValue:carInfoObj.id
      })
    })
  },

   // 触底加载
  onReachBottom: function () {
     return
    let that = this,
            pageNumber = that.data.pageNumber,
            pageSize = that.data.pageSize,
            totalNumber = that.data.totalNumber;
    
    if (pageSize * pageNumber < totalNumber) {
      pageSize = pageSize + pageSize
            console.log('触底')
            that.setData({
              pageSize
            })

            that.handleCarInfo()
        } else {
          that.setData({
            isTouchGround:true
          })
        }
  },


  onLoad() {
    this.handleCarInfo()
  },

  onShow() {
    this.handleCarInfo()
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
