const app = getApp();
let regionData = require("../../utils/region.js");
let QQMapWX = require("../../utils/qqmap-wx-jssdk1.2/qqmap-wx-jssdk");
let { request } = require("../../utils/request");

Page({
    /**
     * 页面的初始数据
     */
    data: {
        hasChose: false, // 是否显示查询后的信息
        operMsg: [], // 门店数据
        partnerList: [], //经销商数据
        chose: 0,
        nearList: [],
        region: regionData.regionList,
        province: regionData.regionList, // 省
        provinceIndex: null,
        town: [], // 市
        townIndex: null,
        district: [], // 区
        districtIndex: null,
        address: "",
        show: false,
        LocationRes: null, //地理位置
        subShow: false,
        subscribeStore: "",
        formData: null,
        pageSize: 10,
        pageNumber: 1,
        totalNumber: 0,
        navbarHeight: wx.getStorageSync('navbarHeight'),
        currentStoreLocation: {}
    },
    //  去门店
    goStore(event) {
        const { name, region, address, id } = event.currentTarget.dataset;
        const selectedStore = { name, region, address, id }
        wx.setStorageSync('selectedStore', selectedStore);

        // console.log(selectedStore)

        wx.switchTab({
            url: `/pages/main/store/store`,
        });
    },

    //   关闭
    onClose() {
        this.setData({
            show: false,
            subShow: false,
        });
    },

    //   点击搜索门店
    onSearchStore(e) {
        let value = e.detail;

        this.setData({
            storeName: value,
            pageNumber: 1
        });

        this.getStoreList();
    },
    // 点击选择地图
    bindAddress() {
        this.setData({
            show: true,
        });
    },
    // 获取省信息
    getRegion: function (e) {
        let region = regionData.regionList;
        let province = regionData.regionList;
        this.setData({
            region,
            province,
        });
    },
    // 选择省级时的change事件
    bindProvinceChange: function (e) {
        let value = e.detail.value;
        let province = this.data.province;
        // console.log(province)
        // 市级数据
        let town = province[value].children;

        this.setData({
            provinceIndex: value,
            town,
            townIndex: null,
            districtIndex: null,
        });
    },
    // 选择市级时的change事件
    bindTownChange: function (e) {
        let value = e.detail.value;
        let town = this.data.town;
        // 市级数据
        let district = town[value].children;

        this.setData({
            townIndex: value,
            district,
            districtIndex: null,
        });
    },
    // 选择市级时的change事件
    bindDistrictChange: function (e) {
        let value = e.detail.value;

        this.setData({
            districtIndex: value,
        });
    },

    bindStoreList() {
        //   this.getPartnerList();
        this.getStoreList()
    },



    // 点击查询门店信息
    getStoreList() {
        wx.showLoading({
            title: "加载中",
        });
        let that = this;
        
        let { latitude, longitude } = that.data.LocationRes || {
            latitude: null,
            longitude: null,
        };
        let storeName = that.data.storeName;
        let regionList = that.data.region; // 城市数据
        let provinceIndex = that.data.provinceIndex; // 省级下标
        let townIndex = that.data.townIndex; // 市级下标
        let districtIndex = that.data.districtIndex; // 区级下标

        let province = provinceIndex ? regionList[provinceIndex] : "";
        let town =
            townIndex || townIndex == 0
                ? regionList[provinceIndex].children[townIndex]
                : "";
        let district =
            districtIndex || districtIndex == 0
                ? regionList[provinceIndex].children[townIndex].children[districtIndex]
                : "";

        let region =
            province.value + town.value + district.value
                ? (province.value || "") + (town.value || "") + (district.value || "")
                : "";
        let regionParmas = (region ? "&region=" : "") + region || "";
        let params = storeName ? "&name=" + storeName?.trim() : "";

        let address =
            province.label === town.label
                ? province.label + " " + (district.label || "")
                : (province.label || "") +
                " " +
                (town.label || "") +
                " " +
                (district.label || "");

        let pageNumber = that.data.pageNumber,
            pageSize = that.data.pageSize,
            nearList = that.data.nearList;

        if (regionParmas || params) {
            that.setData({
                show: false,
                address,
            });
            request({
                url: `/store?` + regionParmas + params,
                method: 'GET',
                data: {
                    pageNumber,
                    pageSize,
                    status: 1
                },
            }).then((res) => {
                console.log('getStoreList_res', res)
                let { data,code } = res;
                if (code !== 0) {
                    wx.showToast({
                        title: "查询失败！",
                        icon: "error",
                        duration: 2000,
                    });
                } else {
                    let {totalNumber,list} = data;
                
                    wx.hideLoading();
                    if (list.length == 0) {
                        wx.showToast({
                            title: "暂无门店相关数据",
                            icon: "success",
                            duration: 2000,
                        });
                    } else {
                        

                        list.map((lis) => {
                            lis.straightLine = that.getLocationLine(
                                latitude,
                                longitude,
                                parseFloat(lis.lon),
                                parseFloat(lis.lat)
                            );

                            let addr = "";
                            let province = lis.region.slice(0, 2);
                            let town = lis.region.slice(2, 6);
                            let district = lis.region.slice(6, 12);

                            regionData.regionList.map((item1) => {
                                if (item1.value === province) {
                                    addr += item1.label;
                                    item1.children.map((item2) => {
                                        if (item2.value === town) {
                                            addr += item2.label;
                                            item2.children.map((item3) => {
                                                if (item3.value === district) {
                                                    addr += item3.label;
                                                }
                                            });
                                        }
                                    });
                                }
                            });

                            lis.regionName = addr;
                        });

                        list.sort((a, b) => a.straightLine - b.straightLine);

                        list = pageNumber === 1 ? list : [...nearList, ...list]
                        console.log('nearList',list)
                    }
                    that.setData({
                        nearList: list,
                        hasChose: true,
                        totalNumber
                    });
                }
            })
        }
    },

    // 查询附近门店
    getStore() {
        wx.showLoading({
            title: "加载中",
        });
        let that = this;
        // 可以通过 wx.getSetting 先查询一下用户是否授权了 "scope.userLocation" 这个 scope
        wx.getSetting({
            success(res) {
                const hasLocation = res.authSetting["scope.userLocation"];

                if (typeof hasLocation === "undefined" || hasLocation) {
                    // 获取地理位置
                    wx.getLocation({
                        success(LocationRes) {
                            let {latitude, longitude} = LocationRes;
                            console.log('LocationRes', LocationRes)
                            that.setData({
                                LocationRes,
                            });

                            new QQMapWX({
                                key: "QGZBZ-NZF6U-ZRMVP-BJQ7I-IAUG5-6XBCI",
                            }).reverseGeocoder({
                                location: {
                                    latitude,
                                    longitude,
                                },
                                success(res) {
                                    let { province, city, district, adcode } = res.result.ad_info;
                                    let address =
                                        province === city
                                            ? province + " " + district
                                            : province + " " + city + " " + district;

                                    let region = that.data.region;

                                    if (region && region.length) {
                                        //   省级
                                        const provinceIndex = region.findIndex(
                                            (i) => i.value === adcode.slice(0, 2)
                                        );
                                        if (provinceIndex) {
                                            that.setData({
                                                provinceIndex,
                                                town: region[provinceIndex].children,
                                                pageNumber: 1
                                            });

                                            // 市级
                                            const townIndex = region[
                                                provinceIndex
                                            ].children.findIndex(
                                                (i) => i.value === adcode.slice(0, 4)
                                            );

                                            if (townIndex || townIndex === 0) {
                                                that.setData({
                                                    townIndex,
                                                    district:
                                                        region[provinceIndex].children[townIndex].children,
                                                });

                                                //   区
                                                const districtIndex = region[provinceIndex].children[
                                                    townIndex
                                                ].children.findIndex((i) => i.value === adcode);

                                                if (districtIndex || districtIndex === 0) {
                                                    that.setData({
                                                        districtIndex,
                                                    });
                                                }
                                            }

                                            //   重新调用获取门店接口
                                            that.getStoreList();
                                        }
                                    }
                                    that.setData({
                                        address,
                                    });
                                },
                            });
                        },
                    });
                } else {
                    wx.showModal({
                        title: "提示",
                        content: "位置未允许授权请设置允许使用位置消息",
                        success(res) {
                            if (res.confirm) {
                                wx.openSetting({
                                    success(res) { },
                                });
                                // console.log('用户点击确定')
                            } else if (res.cancel) {
                                // console.log('用户点击取消')
                            }
                        },
                    });
                }
            },
            fail(err) { },
        });

        that.getStoreList();
    },


    // 获取经纬度直线距离的
    getLocationLine: function (lat1, lng1, lat2, lng2) {
        lat1 = parseFloat(lat1.toFixed(4));
        lng1 = parseFloat(lng1.toFixed(4));
        lat2 = parseFloat(lat2.toFixed(4));
        lng2 = parseFloat(lng2.toFixed(4));
        var radLat1 = (lat1 * Math.PI) / 180.0;
        var radLat2 = (lat2 * Math.PI) / 180.0;
        var a = radLat1 - radLat2;
        var b = (lng1 * Math.PI) / 180.0 - (lng2 * Math.PI) / 180.0;
        var s =
            2 *
            Math.asin(
                Math.sqrt(
                    Math.pow(Math.sin(a / 2), 2) +
                    Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2)
                )
            );
        s = s * 6378.137;
        // s = Math.round(s * 10000) / 10000;
        s = s.toFixed(1);
        // console.log(s)
        return s;
    },

    // 根据经纬度查询附近门店
    getRequryNearStore: function (val) {
        let that = this;
        let LocationRes = val ? val : null;
        // console.log(LocationRes)

        let params = {
            lat: LocationRes.latitude,
            lon: LocationRes.longitude,
            pageNumber: 1,
            pageSize: 1000,
            status: 1
        };
        request({
            url: '/store',
            data: params,
            method: 'GET',
        }).then((res) => {
            console.log('getRequryNearStore_res', res)
            let { data } = res.data;
            let { code } = res;
            if (code !== 0) {
                wx.showToast({
                    title: "查询失败！",
                    icon: "error",
                    duration: 2000,
                });
            } else {
                // let { list } = data;
                wx.hideLoading();
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad: function (options) {
        let that = this;
        // 获取省信息
        that.getRegion();
        // 获取附近门店
        that.getStore();
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady: function () { },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow: function () {
    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide: function () { },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload: function () { },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh: function () { },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom: function () {
        let pageNumber = that.data.pageNumber,
            pageSize = that.data.pageSize,
            totalNumber = that.data.totalNumber;

        if (pageSize * pageNumber < totalNumber) {
            pageNumber = pageNumber + 1;

            that.setData({
                pageNumber,
            });

            that.getStoreList();
        }
    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {
        return {
            title: "纳管家质保系统",
            path: "/packageB/warranty/warranty",
        };
    },

    goThtre (event) {
        const { lat,lon } = event.currentTarget.dataset
        console.log('goThtre_event.currentTarget',event.currentTarget.dataset)
        wx.chooseLocation({
            //​使用微信内置地图查看位置。
            latitude: Number(lat), //要去的纬度-地址
            longitude: Number(lon), //要去的经度-地址
            // name: e.currentTarget.dataset.name,
            // address: e.currentTarget.dataset.address,
        }).then((res)=>{
            console.log(res)
        })
    },
});
