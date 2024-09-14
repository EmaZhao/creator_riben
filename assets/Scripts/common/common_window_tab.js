// --------------------------------------------------------------------
// @author: zhangyusong@syg.com(必填, 创建模块的人员)
// @description:
//      用户公共窗体
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");

window.CommonWindowTab = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("common", "common_window_tab");
        this.tab_info_list = []; //需要写在ctor里面
        this.title_str = null; //窗口顶部标题
        this.tab_max = 4; //标签最长长度
        this.win_type = WinType.Full;
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
    },

    openCallBack: function() {

        //Utils.getNodeCompByPath("main_container/main_panel/close_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("返回");
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.main_panel = this.main_container.getChildByName("main_panel");
        this.reward_btn = this.main_panel.getChildByName("reward");
        this.reward_mask_nd = this.reward_btn.getChildByName("mask");
        this.background = this.seekChild("background");
        this.background.scale = this.background.scale * FIT_SCALE;
        this.loadRes(PathTool.getBigBg("bigbg_2"), function(res) {
                this.background.getComponent(cc.Sprite).spriteFrame = res
            }.bind(this))
            // this.tab_container = this.main_panel.getChildByName("tab_container");
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.win_title = this.main_panel.getChildByName("win_title").getComponent(cc.Label);
        this.container = this.main_panel.getChildByName("container");
        this.scroll_con = this.main_panel.getChildByName("scroll_con");
        this.empty_con = this.main_panel.getChildByName("empty_con");
        this.empty_con.active = false;
        if (this.empty_con) {
            this.empty_label = this.empty_con.getChildByName("label").getComponent(cc.Label);
        }
        if (this.title_str != null)
            this.win_title.string = this.title_str;
        this.close_btn.on(cc.Node.EventType.TOUCH_END, function() {
            Utils.playButtonSound("c_close");
            if (this.closeCallBack)
                this.closeCallBack();
        }, this);
        this.createTabInfoList();
        this.initPanel();
        Utils.getNodeCompByPath("main_container/main_panel/empty_con/label", this.root_wnd, cc.Label).string = Utils.TI18N("暂无好友申请");
    },

    //---------以下方法在用到时需要重写内容----------
    registerEvent: function() {

    },

    openRootWnd: function() {

    },

    closeCallBack: function() {},

    initPanel: function() {

    },
    //-------------------end-------------------------

    changeTitleName: function(str) {
        if (this.win_title != null)
            this.win_title.string = str;
    },

    createTabInfoList: function() {
        if (this.root_wnd == null) return
            // this.background = this.root_wnd.getChildByName("background");
        if (this.tab_info_list != null && Utils.next(this.tab_info_list) != null) {
            var tab_panel = this.main_panel.getChildByName("tab_container");
            if (this.tab_btn_list == null)
                this.tab_btn_list = [];
            var tab, tab_btn, tab_tips, info, tab_red_num, select_bg, unselect_bg;
            for (var i = 1; i <= this.tab_max; i++) {
                tab = tab_panel.getChildByName("tab_btn_" + i);
                if (tab != null) {
                    tab_btn = tab;
                    tab_btn.setName("tab_btn" + i);
                    tab_tips = tab.getChildByName("tab_tips");
                    tab_red_num = tab.getChildByName("red_num").getComponent(cc.Label); //要显示出红点跟次数
                    unselect_bg = tab.getChildByName("unselect_bg");
                    select_bg = tab.getChildByName("select_bg");
                    if (tab_btn != null) {
                        tab_btn.tips = tab_tips;
                        tab_btn.red_num = tab_red_num;
                        tab_btn.select_bg = select_bg;
                        tab_btn.unselect_bg = unselect_bg;
                        info = this.tab_info_list[i - 1]; //有序数组，直接去下标去创建
                        if (info != null) {
                            tab_btn.notice = info.notice || "";
                            tab_btn.label = tab.getChildByName("title").getComponent(cc.Label);
                            tab_btn.label.string = info.label || "";
                            tab_btn.index = info.index;
                            // tab_btn.label.node.color = new cc.Color(0xf5, 0xe0, 0xb9, 0xff);
                            tab_btn.select_bg.active = false;
                            tab_btn.tips.active = false;
                            tab_btn.red_num.node.active = false;
                            // tab_btn.touchEnabled = info.status;
                            //如果不可点击，就灰掉把
                            // if (info.status == false) {
                            // setChildUnEnabled(true, tab_btn, Config.ColorData.data_color4[1])
                            // }
                            //添加注册监听事件
                            tab_btn.on(cc.Node.EventType.TOUCH_END, (function(sender) {
                                if (sender.bubbles == false)
                                    message(sender.notice);
                                else
                                    this.setSelecteTab(sender.currentTarget.index);
                            }).bind(this));
                            this.tab_btn_list[info.index] = tab_btn;
                        } else {
                            tab_btn.active = false;
                        }
                    }
                }
            }
        }
    },

    //切换标签页做的一些事情
    setSelecteTab: function(index) {
        Utils.playButtonSound(ButtonSound.Tab);
        if (this.cur_selected && this.cur_selected.index == index)
            return
        if (this.cur_selected != null) {
            // if (this.cur_selected.label) {
                // this.cur_selected.label.node.color = new cc.Color(0xcf, 0xb5, 0x93, 0xff)
            // }
            this.cur_selected.select_bg.active = false;
        }
        this.cur_selected = this.tab_btn_list[index];
        if (this.cur_selected != null) {
            // if (this.cur_selected.label) {
                // this.cur_selected.label.node.color = new cc.Color(0xff, 0xed, 0xd6, 0xff)
            // }
            this.cur_selected.select_bg.active = true;
        }
        if (this.selectedTabCallBack && this.cur_selected != null) {
            this.selectedTabCallBack(this.cur_selected.index);
        }
        this.refreshRewardBtn(index);
    },

    refreshRewardBtn:function(index){//子类实现
    },

    //设置标签页上面的红点
    setTabTips: function(status, index) {
        if (this.root_wnd && this.tab_btn_list) {
            const tab_btn = this.tab_btn_list[index];
            if (tab_btn && tab_btn.tips) {
                tab_btn.tips.active = status;
            }
        }
    },

    //设置标签页上的红点，要显示出数字出来
    setTabTipsII: function(num, index) {
        var status = true;
        if (num <= 0) {
            status = false;
        }
        var tab_btn = this.tab_btn_list[index];
        if (tab_btn && tab_btn.tips) {
            tab_btn.tips.active = status;
            tab_btn.red_num.node.active = status;
        }
        if (num >= 0) {
            tab_btn.red_num.string = "";
            // tab_btn.red_num.string = num;
        }
    },

});