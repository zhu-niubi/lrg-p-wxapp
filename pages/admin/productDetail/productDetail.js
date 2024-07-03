// 获取应用实例
const app = getApp()
import { request } from '../../../utils/request'
import { formatTime,phoneCheck } from '../../../utils/util.js'

Page({
    data: {
    productType: null,
    productInfo: {},
    tagList: [
      {title:'正品',count:770, isChoose:true},
      {title:'产品好',count:3452,isChoose:false},
      {title:'性价比高',count:890,isChoose:false},
      {title:'下次还来',count:45,isChoose:false},
      {title:'服务好',count:127,isChoose:false},
    ],
    windowHeight: wx.getStorageSync('windowHeight'),
    navbarHeight: wx.getStorageSync('navbarHeight'),
    explainList: [
      {title: '官方自营',icon:'medal-o'},
      {title: '正品保障',icon:'good-job-o'},
      {title: '专业安装',icon:'completed'},
      {title: '售后无忧',icon:'label-o'}
    ],
    isShowPurchase: false, // 是否够买
    shoppingNum: 1, // 够买数量
    productId:null, // 商品id
    bgColor:[],
    bgColor2:{},
    checked: true,
  },
  onChange({ detail }) {
    console.log('onChange({ detail })',detail)
    
    if (!detail) {
      this.setData({
        bgColor:[]
      })
    }else{

      const skuList = this.data.productInfo.productSku;
      let bgColor = this.data.bgColor;

      bgColor = Array(skuList.length).fill('#ff7416');
      this.setData({
        bgColor
      })

    }
    this.setData({ checked: detail });
  },
  // 跳转购买界面
  onClickShopping() {
    let productId = this.data.productId,
        productType = this.data.productType;
    

        if (this.data.productInfo.type !== 1) {
          const  key = Object.keys(this.data.bgColor2);
          const value = this.data.bgColor2[key]
          const selectSku = this.data.productInfo.productSku[key];
          console.log('const selectSku = this.data.productInfo.productSku[key];=====',selectSku)
          if (selectSku == undefined || value == null) {
            wx.showToast({
              title: '请选择规格',
              icon:'none'
            })
            return
          }
          console.log('selectSku',selectSku)
          const skuName = selectSku.name;
          const point = selectSku.point;
          const skuId = selectSku.id;
          const price = selectSku.price;
          

          wx.navigateTo({
            url: '/pages/admin/payment/payment?productId='+ productId  + '&productType=' + productType +'&skuName=' + skuName + '&point=' + point+ '&price=' + price + '&skuId=' + skuId +'&status='+this.data.productInfo.type,
          })
        }else{
            const selectList = this.data.bgColor;
            const nonEmptyIndices = selectList.map((element, index) => {
              if (element !== null && element !== "") {
                return index;
              }
            }).filter(element => element !== undefined);
            
            console.log(nonEmptyIndices);
            let skuList = [];
            for(const i of nonEmptyIndices){
              const sl = {};
              const selectSku = this.data.productInfo.productSku[i];
              sl.skuName = selectSku.name;
              sl.point = selectSku.point;
              sl.skuId = selectSku.id;
              
              sl.price = parseFloat((selectSku.price / 100).toFixed(2));
              skuList.push(sl);
            }

          
          
          if (skuList.length === 0) {
            wx.showToast({
              title: '请选择规格',
              icon:'none'
            })
            return
          }
          wx.setStorageSync('skuList', skuList)
          wx.navigateTo({
            url: '/pages/admin/payment/payment?productId='+ productId  + '&productType=' + productType+'&status='+this.data.productInfo.type,
          })

        }

      
  },

  selected(e){
    // console.log(e)
    const color = '#ff7416';
    const key = e.currentTarget.dataset.key;
    const data = this.data.bgColor;
    if(data[key]){
      data[key] = null
      this.setData({
        checked:false
      })
    }else{
      data[key] = color;
    }
    this.setData({
      bgColor:data
    })
    console.log('bgColor',this.data.bgColor)
  },
  selected2(e){
    // console.log(e)
    const color = '#ff7416';
    const key = e.currentTarget.dataset.key;
    const data = this.data.bgColor2;
    if (data[key]) {
      data[key] = null
    }else{
      data[key] = color;
    }
    
    this.setData({
      bgColor2:data
    })
    console.log('bgColor',this.data.bgColor2)
  },

  // 够买数量
  onChangeNum(e) {
    let value = e.detail

    this.setData({
      shoppingNum : value
    })
  },


  onClickPurchase() {
    const skuList = this.data.productInfo.productSku;
    let bgColor = this.data.bgColor;
    console.log('skuList.length',skuList.length)
    bgColor = Array(skuList.length).fill('#ff7416');
    this.setData({
      isShowPurchase:true,
      bgColor
    })
  },
  onClosePurchase() {
    this.setData({
      isShowPurchase:false
    })
  },

  // 标签
  handleTag:function(e) {
    // console.log(e)
    let index = e.currentTarget.dataset.index,
      tagList = this.data.tagList;
    
    tagList.map((tag,idx) => {
        if (index === idx) {
          tag.isChoose = true
        } else {
          tag.isChoose = false
        }
      })
    this.setData({
      tagList
    })
    
  },

  // 获取商品信息
  handleProductInfo: function (val) {
    let that = this,
      id = val ? val :6;
        // 获取登录信息
        request({
            url: `/product/`+id,
            method: 'GET',
        }).then((res) => {
          console.log('该商品详情=>', res.data)
          let data = res.data
          
            data.price = parseFloat((data.price / 100).toFixed(2))
            data.deposit = data.deposit ? parseFloat((data.deposit / 100).toFixed(2)) : 0
          
            data.price = data.price + data.deposit
            if ( this.data.productType !== 0 ){
              data.productSku = data.productSku.filter(item => item.pointStatus === 1);
            }
            

            
            that.setData({
              productInfo:data
            })
        })
  },

  // 获取推荐产品
  handleProRecommend: function (e) {
    let that = this,
        bodyData = {
          pageSize:6,
          pageNumber:1,
          type:2
        };
      // 获取登录信息
      request({
          url: `/product`,
          method: 'GET',
          data:bodyData
      }).then((res) => {
        let { list } = res.data
        
        list.map((lis) => {
          lis.price = parseFloat((lis.price / 100).toFixed(2))
        })

          // console.log(list)
          that.setData({
              proRecommendList:list,
          })
      })
  },

    // 跳转推荐商品详情页
    gotoProDetail(e) {
    //   console.log(e)
      let productId = e.currentTarget.dataset.id;
      wx.navigateTo({
        url: '/pages/admin/productDetail/productDetail?productId='+ productId,
      })
    },


  onLoad(options) {
    const productInfo = JSON.parse(options.productInfo);
    // console.log('productInfo',productInfo)
    // productType=0，商品类型为可购买；productType=1，商品类型为可
    const productType = productInfo.type;
    const productId = productInfo.productid;
    this.handleProductInfo(productId);
    // this.handleProRecommend();
    this.setData({
      productType,
      productId
    })
  },

  onShow: function () {
    },
  
  onShareAppMessage: function () {
    return {
			title: '纳管家'
		}
  },
  onPullDownRefresh:function() {
    wx.stopPullDownRefresh()
  },
})
