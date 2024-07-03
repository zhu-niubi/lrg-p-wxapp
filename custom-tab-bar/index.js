Component({
  data: {
    active: 2,
    list: [
      {
        url: "/pages/main/threeConfig/threeConfig",
        iconPath: "/images/car.png",
        selectedIconPath: "/images/carClick.png",
        text: "3D展示",
      },
      {
        url: "/pages/main/productPrice/productPrice", //地址
        iconPath: "/images/price.png",
        selectedIconPath: "/images/priceClick.png",
        text: "报价",
      },
      {
        url: "/pages/main/home/home",
        iconPath: "/images/home.png",
        selectedIconPath: "/images/homeClick.png",
        text: "首页",
      },
      {
        url: "/pages/main/store/store",
        iconPath: "/images/store.png",
        selectedIconPath: "/images/storeClick.png",
        text: "商城",
      },
      {
        url: "/pages/main/index/index",
        iconPath: "/images/me.png",
        selectedIconPath: "/images/meClick.png",
        text: "我的",
      },
    ],
  },

  methods: {
    onChange(e) {
      let active = e.detail,
        list = this.data.list;
      this.setData({ active });

    //   console.log(list[active].url,active)

      if (list[active].url === "/pages/main/threeConfig/threeConfig") {
        wx.switchTab({
          url: list[active].url,
          success: function (e) {
            var page = getCurrentPages().pop();
            if (page == undefined || page == null) return;
            page.onLoad();
          },
        });
      } else {
        wx.switchTab({
          url: list[active].url,
        //   success: function (e) {
        //     var page = getCurrentPages().pop();
        //     console.log(page)
        //     if (page == undefined || page == null) return;
        //     page.onLoad();
        //   },
        });
      }

      if (active === 3) {
        if (!wx.getStorageSync("subscribeCouponAccount")) {
          wx.requestSubscribeMessage({
            tmplIds: ["Yqf5NbM1teijfyCkEUJHJ2ASGK8FVw5-YA9toGell5U"],
            success(res) {
              console.log(res);
            },
            fail(err) {
              console.log(err);
            },
          });
        }
      }
    },

    init() {
      const page = getCurrentPages().pop();
      this.setData({
        active: this.data.list.findIndex(
          (item) => item.url === `/${page.route}`
        ),
      });
    },
  },
});
