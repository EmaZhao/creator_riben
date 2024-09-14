// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//    -- 先知殿预览
// <br/>Create: 2019-03-25 19:30:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var SeerpalaceConst = require("seerpalace_const")
var SeerpalaceController = require("seerpalace_controller")
var SeerpalacePreviewWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("seerpalace", "seerpalace_preview_window");
        this.viewTag = SCENE_TAG.ui; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.is_full_screen = false
        this.ctrl = SeerpalaceController.getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {
        var self = this
        self.background = this.root_wnd.getChildByName("background")
        if (self.background) {
            // self.background.setScale(display.getMaxScale())
        }

        let container = self.root_wnd.getChildByName("container")
        self.container = container

        // let win_title = container.getChildByName("win_title")
        // win_title.getComponent(cc.Label).string = Utils.TI18N("奖励预览")
        self.list_panel = container.getChildByName("list_panel")
        self.viewContent = this.seekChild("content")
            // self.root_wnd.getComponent(cc.Animation).play("seerpalace_preview_window")

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.background.on("touchend", this._onClickBtnClose, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(index) {
        var self = this
        self.group_id = SeerpalaceConst.Index_To_GroupId[index]
        if (self.group_id) {
            self.setData()
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        this.list_panel.stopAllActions()
        for (let i = 0; i < this.backpackItem.length; ++i) {
            if (this.backpackItem[i]) {
                this.backpackItem[i].deleteMe()
                this.backpackItem[i] = null;
            }
        }
        this.ctrl.openSeerpalacePreviewWindow(false)
    },
    setData() {
        var self = this
        let award_config = Config.recruit_high_data.data_seerpalace_award[self.group_id]
        if (award_config) {
            this.backpackItem = []
            let five_star_config = award_config[5]
            let four_star_config = award_config[4]

            let scale = 0.9
            let desc_height = 40 //--概率描述的高度
            let row = 4 //-- 5列英雄
            let start_x = 22
            let space_x = 35
            let space_y = 20
            let offset_y = 10 //-- 两种星级之间的间隔
            let content_h = 0
            for (let i in award_config) {
                let v = award_config[i]
                if (v.desc && v.desc != "") {
                    content_h = content_h + desc_height
                }
                let item_num = v.items.length // -- 数量
                let item_col = Math.ceil(item_num / row) //-- 行数
                content_h = content_h + 119 * scale * item_col + (item_col - 1) * space_y + offset_y
            }
            let y = 568 / 2 - content_h
            self.viewContent.height = content_h
            self.viewContent.y = y
            let max_height = content_h
                //-- 5星
            Utils.createLabel(20, new cc.Color(63, 50, 52, 255), null, start_x, content_h - desc_height / 2, five_star_config.desc, self.viewContent, null, cc.v2(0, 0.5))
            for (let i = 0; i < five_star_config.items.length; ++i) {
                let v = five_star_config.items[i]
                Utils.delayRun(self.list_panel, i / 60, function() {
                    let bid = v[0]
                    let num = v[1]
                    let item_node = ItemsPool.getInstance().getItem("backpack_item")
                    item_node.show();
                    item_node.setParent(self.viewContent)
                    item_node.setScale(0.9)
                    item_node.setData({ bid: bid, num: num })
                    item_node.name_color = "#CB6F25";
                    let index = i + 1
                    let row_index = index % row
                    if (row_index == 0) {
                        row_index = row
                    }
                    let col_index = Math.ceil(index / row)
                    let pos_x = start_x + (row_index - 1) * (119 * scale + space_x) + 60 * 0.9
                    let pos_y = max_height - desc_height - (col_index - 1) * (119 * scale + space_y) - 60 * 0.9
                    item_node.setPosition(pos_x, pos_y)
                    self.backpackItem.push(item_node)
                })
            }

            // -- 4星
            let start_y = max_height - desc_height - (Math.ceil(five_star_config.items.length / row)) * (119 * scale + space_y) + space_y - offset_y
            Utils.createLabel(20, new cc.Color(63, 50, 52, 255), null, start_x, start_y - desc_height / 2, four_star_config.desc, self.viewContent, null, cc.v2(0, 0.5))
            for (let i = 0; i < four_star_config.items.length; ++i) {
                let v = four_star_config.items[i]
                Utils.delayRun(self.list_panel, i / 60, function() {
                    let bid = v[0]
                    let num = v[1]
                    let item_node = ItemsPool.getInstance().getItem("backpack_item")
                    item_node.show();
                    item_node.setParent(self.viewContent)
                    item_node.setScale(0.9)
                    item_node.setData({ bid: bid, num: num })
                    item_node.name_color = "#CB6F25"
                    let index = i + 1
                    let row_index = index % row
                    if (row_index == 0) {
                        row_index = row
                    }
                    let col_index = Math.ceil(index / row)
                    let pos_x = start_x + (row_index - 1) * (119 * scale + space_x) + 60 * 0.9
                    let pos_y = start_y - desc_height - (col_index - 1) * (119 * scale + space_y) - 60 * 0.9
                    item_node.setPosition(pos_x, pos_y)
                    self.backpackItem.push(item_node)
                })
            }
        }
    },
    _onClickBtnClose() {
        Utils.playButtonSound(2)
        this.ctrl.openSeerpalacePreviewWindow(false)
    }
})