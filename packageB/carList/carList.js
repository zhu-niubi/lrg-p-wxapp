// pages/zimu_nav/zimu_nav.js
const app = getApp()
import { request } from '../../utils/request'

Page({
	/**
	 * 页面的初始数据
	 */
	data: {
		windowHeight: wx.getStorageSync('windowHeight'),
    	navbarHeight: wx.getStorageSync('navbarHeight'),
		scroll: '',
		touchmove: 0,
		nav_height: '',
		hiddenn: true,
		nav_text: '',
		idx: 0,
		carBrandList: [
			{ alphabet: 'A', datas: [] },
			{ alphabet: 'B', datas: [] },
			{ alphabet: 'C', datas: [] },
			{ alphabet: 'D', datas: [] },
			{ alphabet: 'E', datas: [] },
			{ alphabet: 'F', datas: [] },
			{ alphabet: 'G', datas: [] },
			{ alphabet: 'H', datas: [] },
			{ alphabet: 'I', datas: [] },
			{ alphabet: 'J', datas: [] },
			{ alphabet: 'K', datas: [] },
			{ alphabet: 'L', datas: [] },
			{ alphabet: 'M', datas: [] },
			{ alphabet: 'N', datas: [] },
			{ alphabet: 'O', datas: [] },
			{ alphabet: 'P', datas: [] },
			{ alphabet: 'Q', datas: [] },
			{ alphabet: 'R', datas: [] },
			{ alphabet: 'S', datas: [] },
			{ alphabet: 'T', datas: [] },
			{ alphabet: 'U', datas: [] },
			{ alphabet: 'V', datas: [] },
			{ alphabet: 'W', datas: [] },
			{ alphabet: 'X', datas: [] },
			{ alphabet: 'Y', datas: [] },
			{ alphabet: 'Z', datas: [] }
		],
		showLoading: true // 加载页面
    },
    // 获取车品牌
    getCarBrand(e){
		let _this = this
		let bodyData = {
			pageSize: 1000,
            pageNumber:1
		}
	
		request({
		  url: `/car_brand`,
		  method: 'GET',
		  data:bodyData
		}).then((res) => {
			let { list } = res.data
			// console.log(list)
			let carBrandList = _this.data.carBrandList
                    list.map((list)=>{
                        carBrandList.map((carlist)=>{
                            if (list.initial === carlist.alphabet) {
                                carlist.datas.push(list)
                            }
                        }) 
                    })
                    var arr = _this.data.carBrandList
                    for (var i = arr.length - 1; i >= 0; i--) {
                        if (arr[i].datas.length == 0) {
                            _this.data.carBrandList.splice(i, 1)
                        }

                    }


                    _this.setData({
                        carBrandList: arr,
                        showLoading: false
                    })

                    
                    // 获取高度
                    _this.get_height()
		})

    },

    // 通过大写字母查询相应品牌
    set_scroll: function (e) {
        var page_y = e.changedTouches[0].pageY
		// console.log(page_y,"------------------")
		var nav_height = this.data.nav_height
        var idx = Math.floor((page_y - this.data.nav_height) / nav_height)
        
        if ( this.data.carBrandList[idx-13]) {
            let initial = this.data.carBrandList[idx-13].alphabet
            if (initial) {
                this.setData({
                    touchmove: 1,
                    nav_text: initial,
                    hiddenn: false,
                    scroll : initial
                })
            }
        }
	},
    // 点击字母查询相应信息
    touchstart: function (e) {
        this.set_scroll(e)
		this.getscroll = null
    },
    // 移动字母索引时
    touchmove: function (e) {
		this.set_scroll(e)
		this.getscroll = null
    },
    // 移动结束时
    touchend: function () {
		this.setData({
			touchmove: 0,
			hiddenn: true
		})
	},

    //取高度
	get_height: function () {
		var that = this
		var query = wx.createSelectorQuery()
		query.select('#nav_item').boundingClientRect()
		query.exec(function (res) {
			that.setData({
				nav_height: res[0].height
			})
		})
		query
			.select('.nav')
			.boundingClientRect(function (rect) {
				// console.log((parseInt(that.data.windowHeight) - rect.height) / 2)
				that.setData({
					h: (parseInt(that.data.windowHeight) - rect.height) / 2
				})
			})
			.exec()
    },
    
    onLoad: function (options) {
        var that = this
        that.getCarBrand() // 获取车品牌
	},

    // 点击汽车品牌
	handleToCarType: function (e) {
        let carBrandId = e.currentTarget.dataset.id
        let carBrandName = e.currentTarget.dataset.name

		wx.navigateTo({
			url: '/packageB/choseCar/choseCar?carBrandId=' + carBrandId +
			'&carBrandName=' + carBrandName 
		})
    },
    // 分享
	onShareAppMessage: function (res) {
	},

	/**
	 * 生命周期函数--监听页面初次渲染完成
	 */
	onReady: function () {
	},
})
