const app = getApp();
import { request } from "../../../utils/request";
import { byteToString, formatNullCharacter, throttle, stringToBuffer } from '../../../utils/nfcutils';

// pages/admin/NFCWarranty/NFCWarranty.js
Page({
  NFCAdapter: null,

  /**
   * 页面的初始数据
   */
  data: {
    bgImgGif: null,
    qualityAssuranceData: {},
    combinedProductNames: '',
    read: {},
    vs: false
  },
  getBgImg() {
    let bodyData = {
      pageSize: 10,
      pageNumber: 1,
      type: 22
    };
    request({
      url: `/image`,
      method: "GET",
      data: bodyData,
    }).then((res) => {
      console.log('res', res)
      if (res.code == 0) {
        const { list } = res.data;
        this.setData({
          bgImgGif: list[0].url,
        });
      }

    });
  },
  validateDiscoverHandler(callback) {
    console.log('==================== START ====================')
    console.log('onDiscovered callback=>', callback)
    if (callback?.messages.length > 0) {
      let cordsArray = callback.messages[0].records;
      cordsArray.forEach(item => {
        const read = {
          payload: formatNullCharacter(byteToString(new Uint8Array(item.payload))),
          id: byteToString(new Uint8Array(item.id)),
          type: byteToString(new Uint8Array(item.type))
        }
        console.log('NFC buffer 转字符串 =>', read.payload)
        wx.setStorageSync('wid', read.payload)
        if (wx.getStorageSync('wid')) {
          wx.navigateTo({
            url: '/packageB/warranty/warranty',
          })
        }
        // const d = wx.getStorageSync('wid');
        // console.log('d',d)
      })
    }
    if (callback.techs.length != 0) {
      wx.showToast({
        title: '识别成功',
        icon: 'success',
        duration: 2000
      })
      this.setData({
        vs: true
      })
    } else {
      wx.showToast({
        title: '无效设备',
        icon: 'error',
        duration: 2000
      })
    }

    this.NFCAdapter.offDiscovered(this.validateDiscoverHandler)
    console.log('===================== END =====================')
  },

  NFClistener() {
    this.NFCAdapter.startDiscovery({
      success: () => {
        wx.showToast({
          title: '开启NFC适配器成功，请靠近NFC',
          icon: 'success',
        })
      },
      fail: error => {
        wx.showToast({
          title: '开启适配器失败',
          icon: 'error'
        })
      }
    })
  },
  onValidate: throttle(function (e) {
    setTimeout(() => {
      // 监听 NFC 标签
      this.NFCAdapter.onDiscovered(this.validateDiscoverHandler)
    }, "3000")
  }),

  initTab() {
    const NFCTab = this.NFCAdapter.getNdef()
    return new Promise((resolve, reject) => {
      NFCTab.connect({
        success: () => {
          this.setData({
            title: '连接设备成功',
          })
          resolve(NFCTab)
        },
        fail: error => {
          console.log('error', error)
          wx.showToast({
            title: '连接设备失败',
            icon: 'error'
          })
          this.setData({
            title: '连接设备失败',
          })
          this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
          reject()
        }
      })
    })
  },
  closeConnect(NFCTab) {
    NFCTab.close({
      complete: res => {
        console.log('清除标签连接：res', res)
        this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
      }
    })
  },
  closeNFC() {
    if (this.NFCAdapter) {
      this.NFCAdapter.offDiscovered(this.writeDiscoverHandler)
      this.NFCAdapter.offDiscovered(this.validateDiscoverHandler)
      this.NFCAdapter.stopDiscovery()
      this.NFCAdapter = null
    }
  },
  /**
   * 生命周期函数--监听页面加载
   */
  onLoad(options) {
    this.getBgImg()
  },

  /**
   * 生命周期函数--监听页面显示
   */
  onShow() {
    // 获取NFC实例
    this.NFCAdapter = wx.getNFCAdapter();
    // 监听NFC靠近
    this.NFClistener();

    this.onValidate();

  },

  onHide: function () {
    this.closeNFC()
  },
  onUnload: function () {
    this.closeNFC()
  }
})