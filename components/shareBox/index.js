Component({
  properties: {
    //属性值可以在组件使用时指定
    isCanDraw: {
      type: Boolean,
      value: false,
      observer(newVal, oldVal) {
        newVal && this.handleStartDrawImg();
      },
    },
    bannerData: {
      type: Object,
      value: {
        image: "",
        top: "32rpx",
        left: "30rpx",
        right: "32rpx",
        width: "688rpx",
        height: "420rpx",
        borderRadius: "16rpx",
      },
    },
    background: {
      type: String,
      value: "",
    },
    generateQrcode: {
      type: Object,
      value: {
        top: "734rpx",
        left: "470rpx",
        width: "200rpx",
        height: "200rpx",
        image: "",
      },
    },
    textData: {
      type: Object,
      value: {
        title: {
          text: "",
          top: "576rpx",
          left: "375rpx",
          align: "center",
          fontSize: "28rpx",
          color: "#3c3c3c",
          maxLines: "",
        },
        subTitle: {
          text: "",
          top: "644rpx",
          left: "375rpx",
          maxLines: 1,
          align: "center",
          fontWeight: "bold",
          fontSize: "44rpx",
          color: "#3c3c3c",
        },
        nickname: "",
        avatarUrl: "",
      },
    },
  },
  data: {
    imgDraw: {}, //绘制图片的大对象
    sharePath: "", //生成的分享图
  },
  methods: {
    handleStartDrawImg() {
      wx.showLoading({
        title: "生成中",
      });

      this.setData({
        imgDraw: {
          width: "750rpx",
          height: "1205rpx",
          background:
            this.data.background ||
            "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/1e8a5f46d86ca255d0bad6eef86f543c.png",
          views: [
            {
              type: "image",
              url:
                this.data.bannerData.image ||
                "https://backend-ngj.oss-cn-shanghai.aliyuncs.com/f11887f9e8b7d5f39d860256cf877b8a.png",
              css: {
                top: this.data.bannerData.top,
                left: this.data.bannerData.left,
                width: this.data.bannerData.width,
                height: this.data.bannerData.height,
                borderRadius: this.data.bannerData.borderRadius,
              },
            },
            {
              type: "image",
              url: this.data.textData.avatarUrl || "",
              css: {
                top: "404rpx",
                left: "328rpx",
                width: "96rpx",
                height: "96rpx",
                borderWidth: "6rpx",
                borderColor: "#FFF",
                borderRadius: "96rpx",
              },
            },
            {
              type: "text",
              text: this.data.textData.nickname || "",
              css: {
                top: "532rpx",
                fontSize: "28rpx",
                left: "375rpx",
                align: "center",
                color: "#3c3c3c",
              },
            },
            {
              type: "text",
              text: this.data.textData.title.text || ``,
              css: {
                top: this.data.textData.title.top,
                left: this.data.textData.title.left,
                align: this.data.textData.title.align,
                fontSize: this.data.textData.title.fontSize,
                color: this.data.textData.title.color,
                maxLines: this.data.textData.title.maxLines,
              },
            },
            {
              type: "text",
              text: this.data.textData.subTitle.text || ``,
              css: {
                top: this.data.textData.subTitle.top,
                left: this.data.textData.subTitle.left,
                align: this.data.textData.subTitle.align,
                fontSize: this.data.textData.subTitle.fontSize,
                color: this.data.textData.subTitle.color,
                maxLines: this.data.textData.subTitle.maxLines,
              },
            },
            {
              type: "image",
              fileType: "jpg",
              url: this.data.generateQrcode.image || "",
              css: {
                top: this.data.generateQrcode.top,
                left: this.data.generateQrcode.left,
                width: this.data.generateQrcode.width,
                height: this.data.generateQrcode.height,
              },
            },
          ],
        },
      });
    },
    onImgErr(e) {
      wx.hideLoading();
      wx.showToast({
        title: "生成分享图失败，请刷新页面重试",
      });
    },
    onImgOK(e) {
      wx.hideLoading();
      // 展示分享图
      console.log(e.detail.path)
      wx.showShareImageMenu({
        path: e.detail.path,
        fail: (err) => {
          console.log(err);
        },
      });
      //通知外部绘制完成，重置isCanDraw为false
      this.triggerEvent("initData");
    },
  },
});
