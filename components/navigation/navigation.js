// 获取应用实例
const app = getApp()
Component({
  data: {
    statusBarHeight: wx.getStorageSync('statusBarHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight')
  },
  properties: {
    backgroud:{
     // type 要接收的数据的类型
     type:String,
     // value 默认值
     value:""
    },
    color:{
        type:String,
        // value 默认值
        value:""
    },
    backNum:{
      type:Number,
      value:0
    }
 },
  methods: {
    // 这里是一个自定义方法
    gotoBack: function () {
      let _this = this,
        pageLength = getCurrentPages();
      console.log('_this.properties.backNum',_this.properties.backNum)
      if (_this.properties.backNum !== 0) {
        wx.navigateBack({
          delta:_this.properties.backNum
        })
      }
      // 判断返回的页面
      if (pageLength.length > 1) {
        wx.navigateBack({
          changed: true
        })
      } else {
        wx.switchTab({
          url: '/pages/main/home/home',
        })
      }
    }
  },
})