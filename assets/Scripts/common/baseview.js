// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      所有窗体的显示基类
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var LoaderManager = require("loadermanager");
var ViewClass = require("viewclass");
window.BaseView = cc.Class({
    extends: ViewClass,
    // inifPrefab: true,
    ctor: function () {
        this.viewTag = SCENE_TAG.win;
        this.win_type = WinType.Big;
        this.wating = true;
        // this.active_status = true;
        this.is_close = false;
        this.close_is_map = false;
        this.prefabPath = "";
        this.root_wnd = null;
        this.base_view_event_list = {};
        // this.res_list = {}
        this.is_battle_hide = true;
        this.is_loading = false;
        this.is_before_battle = false;
        this.initConfig();
    },
    statics: {
        winMap: [],
    },

    // 打开窗体的主入口
    open: function (params) {
        this.open_params = params;
        if (this.root_wnd) {
            this.openRootWnd(params);
            if (this.active_status == false) {
                this.setVisible(true);
            }
            var GuideEvent = require("guide_event");
            if (GuideEvent)
                gcore.GlobalEvent.fire(GuideEvent.OpenTaskEffect, this.root_wnd);
        } else {
            var self = this;
            if (this.is_loading) return;
            this.is_loading = true;
            if (!this.waiting_timer && this.wating && !window.hide_loading) {
                this.waiting_timer = gcore.Timer.set(function () {
                    this.is_wating = true;
                    game.updateWaitingStatus(WaitingStaus.LOADING);
                }.bind(this), 1500, 1)
            }
            LoaderManager.getInstance().loadRes(this.prefabPath, (function (res_object) {
                if (this.waiting_timer) {
                    gcore.Timer.del(this.waiting_timer);
                    this.waiting_timer = null;
                }

                if (this.is_wating) {
                    game.updateWaitingStatus();
                    this.is_wating = false;
                }

                if (this.is_close) {
                    return;
                }
                this.is_loading = false;
                this.root_wnd = res_object;
                this.root_wnd.setPosition(-SCREEN_WIDTH * 0.5, -SCREEN_HEIGHT * 0.5)
                ViewManager.getInstance().addToSceneNode(this.root_wnd, this.viewTag);

                // 还未加载完成的时候设置了不可见,那么直接隐藏掉
                if (self.fastShowThenHide) {
                    self.fastShowThenHide = false
                    self.setVisible(false)
                }

                // 打开回调
                this.openCallBack();
                // 开启注册时间
                this.registerEvent();
                // 数据设置
                self.openRootWnd(self.open_params);
                // 缓存窗体数据
                this.openCacheView();

                if (this.root_wnd_cb)
                    this.root_wnd_cb(this.root_wnd);

                var GuideEvent = require("guide_event");
                if (GuideEvent)
                    gcore.GlobalEvent.fire(GuideEvent.OpenTaskEffect, this.root_wnd);
            }).bind(this));
        }

    },

    /**
     * 关闭窗体
     * @param {*} dis_map 是都断开关闭窗体的连接关系,如果是调用closeallwindow,则不需要连接,既closeCacheView的逻辑处理
     */
    close: function (dis_map) {
        if (this.is_close) {
            return;
        }
        if (dis_map && (dis_map instanceof Object)) {
            this.close_is_map = dis_map.close_win || false
        }
        this.closeCacheView();
        this.is_close = true;
        this.closeCallBack();
        this.deleteMe();
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

    deleteMe: function () {
        this._super();
    },

    checkWinType: function (type) {
        return type == WinType.Mini || type == WinType.Tips
    },

    // 对打开过的窗体做缓存处理
    openCacheView: function () {
        if (this.prefabPath == "prefab/chat/chat_window.prefab") {
            return;
        }
        if(this.viewTag == 10 ||this.viewTag == 11){
          return;
        }
        BaseView.winMap.push(this);
        const length = BaseView.winMap
        if (length > 1) {
            var next_index = length - 2;    // 倒数第二个窗体的下表 
            var lastWin = BaseView.winMap[next_index];
            
            // 如果这个面板的上一个面板是一个mini窗体的话,那么关闭掉上一个mini窗体,并且把改mini窗体的下一个窗体指向当前窗体
            if (lastWin && this.checkWinType(lastWin.win_type) && this.win_type != WinType.Mini) {
                BaseView.winMap.splice(next_index, 1);
                lastWin.top_win = null;
                lastWin.next_win = null;
                if (lastWin.close) {
                    lastWin.close();
                }
            }
            // 取出当前窗体的上一个窗体,做关联
            var next_index_to = BaseView.winMap.length - 2;
            if (next_index_to && next_index_to.active_status == true) {
                this.top_win = next_index_to;
                next_index_to.next_win = this;
                if (!this.checkWinType(this.win_type)) {
                    this.top_win.setVisible(false)
                }
            }
        }
        // 如果是全屏窗体,则需要有隐藏掉主场景,和战斗场景
        if (this.win_type == WinType.Full&&(this.viewTag != 10 ||this.viewTag != 11)) {
            var mainSceneController = require("mainscene_controller").getInstance();
            mainSceneController.handleSceneStatus(false);
            var battleSceneController = require("battle_controller").getInstance()
            battleSceneController.handleBattleSceneStatus(false)
            var mainUiController = require("mainui_controller").getInstance()
            mainUiController.openMainUI(false)
        }
    },

    // 关闭窗体的时候做处理,
    closeCacheView: function () {
        var array = BaseView.winMap;
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element == this) {
                if (this.top_win && !this.close_is_map) {   // 如果这个窗体存在上一个窗体,那么没有下一个窗体的时候,打开上一个窗体,如果有下一个窗体,则把上一个窗体的下一个窗体变成自身的下一个窗体,进行关联
                    if (this.is_battle_hide == false) {       // 旧版本的众神战场有这样的需求,界面进战斗不消失.现在基本上没有

                    } else if (this.next_win == null || this.next_win.win_type != WinType.Full) {
                        this.top_win.setVisible(true)
                    }
                    this.top_win.next_win = null
                    if (this.next_win) {
                        this.top_win.next_win = this.next_win;
                        this.next_win.top_win = this.top_win;
                    }
                }
                // 删除掉这个
                BaseView.winMap.splice(index, 1);
                break
            }
        }
        // 如果没有窗体,或者没有全屏窗体,则显示出主城和主战斗场景
        if (BaseView.winMap.length == 0 || !this.isFullWinExist()) {
            var battleSceneController = require("battle_controller").getInstance()
            if (battleSceneController.hadBattleScene()) { // 如果在战斗中  
                battleSceneController.handleBattleSceneStatus(true)
            } else {
                var mainUiController = require("mainui_controller").getInstance();
                var new_btn_index = mainUiController.getMainUIIndex();
                var MainUiConst = require("mainui_const");
                if (new_btn_index != MainUiConst.new_btn_index.drama_scene) {
                    var mainSceneController = require("mainscene_controller").getInstance();
                    mainSceneController.handleSceneStatus(true);
                }
            }
        }
    },

    isFullWinExist: function () {
        const array = BaseView.winMap;
        for (let index = 0; index < array.length; index++) {
            const element = array[index];
            if (element.win_type == WinType.Full && element.is_before_battle == false) {
                return true;
            }
        }
        return false;
    },

    setVisible: function (status) {
        if (this.active_status == status) {
            return
        }
        this.active_status = status;
        if (this.root_wnd) {
            this.root_wnd.active = status;
        } else {
            this.fastShowThenHide = status;
        }
    },

    getVisible: function (status) {
        return this.active_status
    },

    getRootWnd: function (cb) {
        this.root_wnd_cb = cb;
        if (this.root_wnd)
            this.root_wnd_cb(this.root_wnd);
    },

    // 初始化一些基础数据
    initConfig: function () { },

    // 子类中实现,
    openRootWnd: function () { },

    // 注册监听事件,子类中实现
    registerEvent: function () { },

    // 打开界面之后回调,子类中实现
    openCallBack: function () { },

    // 关闭界面之后的回调,子类中实现
    closeCallBack: function () { },
});
