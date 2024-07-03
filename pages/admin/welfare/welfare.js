// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime,phoneCheck } from '../../../utils/util.js'

Page({
  data: {
    welfareInfoList: [],
    bgImg:'',
    activeTab: 0,
    activeKey: 0,
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    heightArr:[],
  },

  // 获取每个元素的高
  getHeight() {
    let that = this;
      let query = wx.createSelectorQuery().in(this);

       query.selectAll('.welfare').boundingClientRect(rect=>{
  
         that.setData({
           heightArr:rect
         })

        }).exec();
  },


  scroll(e) {
    let that = this,
      scrollTop = e.detail.scrollTop,
      heightArr = that.data.heightArr;

      let newInfo = ''
      heightArr.map((h) => {
        
          if (h.top - h.height <= scrollTop ) {
            newInfo = h.id
          }
      })
    
    if (this.data.activeTab !== newInfo.split('w')[1]) {
      that.setData({
        activeTab:newInfo.split('w')[1]
      })
    }
    
      
  },


  onClickNav(e) {
    let { index } = e.detail;

    this.setData({
      activeTab: index,
      activeKey: index
    });
  },

   // 获取权益信息
  handleWelfareInfo: function (val) {
    let that = this;
    
    request({
      url: `/welfare`,
      method: 'GET'
    }).then((res) => {
      let { data } = res
      
      // 设置默认数据
    //   console.log(data)

      data.map((d) => {
        d.text = d.name
        d.describe = d.describe.replace(/\<img/gi, '<img class="imgs" ')
      })

      that.setData({
        welfareInfoList: data,
        activeTab: val ?val :0,
        activeKey: val ?val :0
      })

      this.getHeight() // 获取每个元素高度
    })
  },

  onLoad(options) {
    let index = options.index

    this.handleWelfareInfo(index)

  },

  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },

  onShow() {
  },
})
