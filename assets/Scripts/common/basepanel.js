// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      基础标签页或者独立的panel
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var LoaderManager = require("loadermanager");
var ViewClass = require("viewclass");

window.BasePanel = cc.Class({
    extends: ViewClass,
    ctor: function () {
        this.scale = 1;
        this.x = 0;
        this.y = 0;
        this.initConfig()
        this.root_wnd = null;
    },
    wating: false,
    prefabPath: "",             // 预设路径
    loading: false,             // 是否在加载中
    fastShowThenHide: false,    // 还没有异步加载完成,就要隐藏掉了
    isFirstOpen: false,         // 是否是第一次打开

    setParent: function (parent) {
        this._super(parent);
        this.isInLoading = false,
            this.fastShowThenHide = false,
            this.isFirstOpen = true;
        this.base_view_event_list = {};
        this.res_list = {}
        this.visible = true;
        if (this.root_wnd && parent instanceof cc.Node) {
            this.root_wnd.parent = parent
        }
    },

    // 子类实现具体的,比如说监听事件,或者其他
    initConfig: function () { },
    initPanel: function () { },
    registerEvent: function () { },
    onShow: function () { },
    onHide: function () { },
    onDelete: function () { },

    // 加载预设
    onLoadPanel: function () {
        var self = this

        if (!this.waiting_timer && this.wating && !window.hide_loading) {
            this.waiting_timer = gcore.Timer.set(function () {
                this.is_wating = true;
                game.updateWaitingStatus(WaitingStaus.LOADING);
            }.bind(this), 1500, 1)
        }
        LoaderManager.getInstance().loadRes(this.prefabPath, function (res_object) {
            // if (error) {
            //     cc.log("加载Prefab失败,原因:" + error);
            //     return;
            // }

            if (self.waiting_timer) {
                gcore.Timer.del(self.waiting_timer);
                self.waiting_timer = null;
            }

            if (self.is_wating) {
                game.updateWaitingStatus();
                self.is_wating = false;
            }

            if (self.delete || !self.parent._children) {
                return;
            }

            self.root_wnd = res_object;
            self.root_wnd.parent = self.parent;
            self.root_wnd.scale = self.scale;
            if (self.zIndex) {
                self.setZIndex(self.zIndex)
            }
            if (!self.visible) {
                self.setVisible(false);
            }
            // self.root_wnd.active = self.visible;

            if (self.zIndex && self.zIndex >= 0) {
                self.root_wnd.zIndex = self.zIndex;
            }

            // 缓存位置
            if (self.cache_x != null && self.cache_y != null) {
                self.root_wnd.setPosition(self.cache_x, self.cache_y)
                self.cache_x = null;
                self.cache_y = null;
            }

            if (self.cache_ap_y != null && self.cache_ap_x != null) {
                self.root_wnd.setAnchorPoint(self.cache_ap_x, self.cache_ap_y)
                self.cache_ap_x = null;
                self.cache_ap_y = null;
            }

            // 第一次打开直接回调初始化.获取对象或者组件
            if (self.isFirstOpen == true) {
                self.isFirstOpen = false
                self.initPanel();
                self.registerEvent();
            }
            self.isInLoading = false;

            // 加载完成之后,需要判断是否有逻辑隐藏掉
            if (self.fastShowThenHide == true) {
                self.fastShowThenHide = false
                // self.root_wnd.active = false;
                self.setVisible(false);
            } else {
                self.onShow(self.open_params);
            }

            if (self.root_wnd && self.root_wnd.getComponent(cc.Widget)) {
                self.roow_wdg = self.root_wnd.getComponent(cc.Widget);
            }

            if (self.root_wnd_cb)
                self.root_wnd_cb(self.root_wnd);
        });
    },

    // 显示窗体处理
    show: function (params) {
        if (this.isInLoading == true) { return; }
        this.open_params = params;
        if (this.root_wnd == null) {
            this.isInLoading = true;
            this.onLoadPanel();
        } else {
            this.isInLoading = false;
            // this.root_wnd.active = true;
            if (this.root_wnd.active)
                this.setVisible(true);
            this.onShow(params);
        }
    },

    // 关掉窗体
    hide: function () {
        if (this.root_wnd) {
            this.setVisible(false);
            // this.root_wnd.active = false;
            this.onHide();
        } else {
            this.fastShowThenHide = true;
        }
    },

    // 是否可见
    setVisible: function (status, dir) {
        this.visible = status;
        if (this.root_wnd) {
            if (status) {
                if (this.roow_wdg) {
                    this.roow_wdg.alignMode = cc.Widget.AlignMode.ON_WINDOW_RESIZE;
                }                
                this.setPosition(this.x, this.y)
                this.cur_visible = false;
            } else {
                if (!this.cur_visible) {
                    if (this.roow_wdg) {
                        this.roow_wdg.alignMode = cc.Widget.AlignMode.ONCE;
                    }

                    if (dir == ScrollViewDir.vertical) {
                        this.root_wnd.x -= cc.winSize.width * 2;
                    } else if (dir == ScrollViewDir.horizontal) {
                        this.root_wnd.x -= cc.winSize.height * 2;
                        this.root_wnd.y -= cc.winSize.height * 2;
                    } else {
                        this.root_wnd.x -= cc.winSize.width * 2;
                    }

                    // this.visible_x = this.root_wnd.x;
                    this.cur_visible = true;
                }
            }
            // this.root_wnd.active = status;
            if (this.onVisible)
                this.onVisible(status);
        }
    },

    //新增一些不受cur_visible控制的显隐
    setActive: function (status) {
        this.visible = status;
        if (this.root_wnd) {
            if (status) {
                this.setPosition(this.x, this.y);
            } else {
                this.root_wnd.x -= cc.winSize.width * 2;
            }
        }
    },

    isOpen: function () {
        if (this.root_wnd && !this.cur_visible)
            return true;
        return false
    },

    setPosVisible: function () {
        if (this.root_wnd)
            this.root_wnd.x -= 1000;
    },

    getVisible: function () {
        return this.visible
    },

    setScale: function (scale) {
        this.scale = scale;
        if (this.root_wnd)
            this.root_wnd.scale = scale;
    },

    setZIndex: function (zIndex) {
        this.zIndex = zIndex;
        if (this.root_wnd)
            this.root_wnd.zIndex = zIndex;
    },

    deleteMe: function () {
        this.delete = true;
        this.onDelete();
        this._super();
        // this.removeGlobalEvent();
        // if(this.root_wnd){
        //     this.root_wnd.destroyAllChildren();
        //     this.root_wnd.destroy();
        //     this.root_wnd = null;
        // }
        // // LoaderManager.getInstance().deleteRes(this.prefabPath);
        // LoaderManager.getInstance().releasePrefab(this.prefabPath);
        // for(var key in this.res_list){
        //     LoaderManager.getInstance().releaseRes(key)
        // }
    },

    // 设置坐标位置
    setPosition: function (x, y) {
        if (x == null || y == null) return
        this.x = x
        this.y = y
        if (this.root_wnd) {
            this.root_wnd.setPosition(x, y)
        } else {
            this.cache_x = x;
            this.cache_y = y
        }
    },

    // 设置锚点
    setAnchorPoint: function (x, y) {
        this.ap_x = x;
        this.ap_y = y;
        if (this.root_wnd) {
            this.root_wnd.setAnchorPoint(0.5, 0.5);
        } else {
            this.cache_ap_x = x;
            this.cache_ap_y = y;
        }
    },

    getPositionX: function () {
        return this.x
    },

    getPositionY: function () {
        return this.y
    },

    getRootWnd: function (cb) {
        this.root_wnd_cb = cb;
        if (this.root_wnd)
            this.root_wnd_cb(this.root_wnd);
    },
})
