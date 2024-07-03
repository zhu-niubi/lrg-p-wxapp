// app.js

App({
    onLaunch() {
        //   检查版本更新
        const updateManager = wx.getUpdateManager()

        updateManager.onCheckForUpdate(function (res) {
            // 请求完新版本信息的回调
            // console.log(res.hasUpdate)
        })

        updateManager.onUpdateReady(function () {
            wx.showModal({
                title: '更新提示',
                content: '新版本已经准备好，是否重启应用？',
                success: function (res) {
                    if (res.confirm) {
                        // 新的版本已经下载好，调用 applyUpdate 应用新版本并重启
                        updateManager.applyUpdate()
                    }
                }
            })
        })

        updateManager.onUpdateFailed(function () {
            // 新版本下载失败
        })
        // 导航栏高度
        const {
            windowHeight,
            windowWidth,
            statusBarHeight,
            safeArea
        } = wx.getSystemInfoSync()
        let navbarHeight = safeArea.top + statusBarHeight
        wx.setStorageSync('navbarHeight', navbarHeight)
        wx.setStorageSync('statusBarHeight', statusBarHeight)
        wx.setStorageSync('windowHeight', windowHeight)
        wx.setStorageSync('windowWidth', windowWidth)

        // wx.request({
        //   url: 'https://api.ngj.nkdppf.com/real_url',
        //   success: (result) => {
        //     //   console.log('result',result)
        //       let url = result.data
        //     //   console.log('url',url)
        //       wx.setStorageSync('url', url)
        //   },
        //   fail: (err) => {},
        //   complete: (res) => {},
        // })

        // 登录
        wx.login({
            success: res => {
                // 发送 res.code 到后台换取 openId, sessionKey, unionId
            }
        })
    },
    globalData: {
        userToken: null,
        hostUri: 'https://api.ngj.nkdppf.com', // https://wxapp.ngj.nkdppf.com ,https://api.ngj.nkdppf.com, http://192.168.1.188:8089/
        userInfo: wx.getStorageSync('userInfo'),
        appid: wx.getAccountInfoSync().miniProgram.appId
    }
})