// packageA/caseList/caseList.js
const app = getApp()
import {request} from '../../utils/request'
import {formatTime, phoneCheck} from '../../utils/util.js'

Page({

    /**
     * 页面的初始数据
     */
    data: {
        productTypelist: [
            {id: 1001, name: '产品类型'},
        ],

        productModelList: [
            {id: 1001, name: '产品系列'},
        ],
        caseList: [],
        typeIndex: 0,
        modelIndex: 0
    },
    gotoCaseDetail(e) {
        console.log('e.currentTarget.dataset.item', e.currentTarget.dataset.item)
        const data = JSON.stringify(e.currentTarget.dataset.item);
        console.log(data)
        wx.navigateTo({
            url: '/packageB/caseDetail/caseDetail?data=' + data,
        })
    },
    pickerChange(e) {
        // console.log(e);
        this.setData({
            typeIndex: e.detail.value,
            modelIndex: 0
        })
        if (this.data.typeIndex > 0) {
            const id = this.data.productTypelist[this.data.typeIndex].id;
            // console.log('产品类型id',id)
            const type = 1;
            this.onChange(id, type)

        } else {
            // console.log("xxxxxxxxxx")
            this.getAllCaseList();

        }

    },
    pickerChangeModel(e) {

        // console.log(e);
        this.setData({
            modelIndex: e.detail.value,
            typeIndex: 0,
        })
        if (this.data.modelIndex > 0) {
            const id = this.data.productModelList[this.data.modelIndex].id;
            // console.log('产品类型id',id)
            const type = 2;
            this.onChange(id, type)

        } else {
            // console.log("xxxxxxxxxx")
            this.getAllCaseList()
        }
    },
    onChange(ids, type) {
        // console.log('onChange',e.currentTarget)
        const id = ids;
        if (id) {
            this.getAllCaseList(id, type)
        }
    },

    getAllCaseList(options, type) {
        let bodyData;
        if (options == null) {
            bodyData = {
                pageSize: 999,
                pageNumber: 1,
            };
        } else {
            if (type == 1) {
                const productTypeId = options;
                bodyData = {
                    pageSize: 999,
                    pageNumber: 1,
                    productTypeId,
                };
            } else if (type == 2) {
                const productModel = options;
                bodyData = {
                    pageSize: 999,
                    pageNumber: 1,
                    productModel,
                };
            }
        }

        console.log('请求体', bodyData)
        request({
            url: `/construction-image`,
            method: 'GET',
            data: bodyData
        }).then((res) => {

            const {list} = res.data;
            // console.log('getAllCaseList', list )
            this.setData({
                caseList: list
            })
        })
    },
    getSelectCondition() {
        let bodyData = {
            pageNumber: 1,
            pageSize: 1000,
        };
        // 商品类型查询
        request({
            url: `/product_type`,
            method: 'GET',
            data: bodyData
        }).then((res) => {
            if (res.code == 0) {
                const {list} = res.data;
                // console.log('product_type',list)
                const typeres = this.data.productTypelist;
                typeres.push(list);
                let types = typeres.flat();
                // console.log('types',types)
                this.setData({
                    productTypelist: types
                })
            }
        })
        // 商品系列查询
        request({
            url: `/product_model`,
            method: 'GET',
            data: {
                pageNumber: 1,
                pageSize: 1000,
            }
        }).then((res) => {
            if (res.code == 0) {
                const {list} = res.data;
                // console.log('product_model',list)
                const modelres = this.data.productModelList;
                modelres.push(list);
                const models = modelres.flat();
                // console.log('models',models)
                this.setData({
                    productModelList: models
                })
            }
        })
    },

    /**
     * 生命周期函数--监听页面加载
     */
    onLoad() {
        // 获取所有筛选条件
        this.getSelectCondition();

        const options = null;
        // 获取所有案例
        this.getAllCaseList(options);
    },

    /**
     * 生命周期函数--监听页面初次渲染完成
     */
    onReady() {

    },

    /**
     * 生命周期函数--监听页面显示
     */
    onShow() {

    },

    /**
     * 生命周期函数--监听页面隐藏
     */
    onHide() {

    },

    /**
     * 生命周期函数--监听页面卸载
     */
    onUnload() {

    },

    /**
     * 页面相关事件处理函数--监听用户下拉动作
     */
    onPullDownRefresh() {

    },

    /**
     * 页面上拉触底事件的处理函数
     */
    onReachBottom() {

    },

    /**
     * 用户点击右上角分享
     */
    onShareAppMessage() {

    }
})