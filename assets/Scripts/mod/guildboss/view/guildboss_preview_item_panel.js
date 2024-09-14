// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-02-20 20:36:18
// --------------------------------------------------------------------
var PlayerHead = require("playerhead");

var PathTool = require("pathtool");
var Guildboss_preview_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guildboss", "guildboss_preview_item");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.boss_id = 0;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.size = this.root_wnd.getContentSize();
        this.root_wnd.setContentSize(this.size);
        this.root_wnd.setAnchorPoint(0.5, 0.5);

        this.center_x = this.size.width * 0.5;
        this.head_icon = this.seekChild("head_icon");
        this.boss_icon = new PlayerHead();
        this.boss_icon.show();
        this.boss_icon.setScale(0.8);
        this.boss_icon.setPosition(0, 0);
        this.boss_icon.setParent(this.head_icon);

        this.pass_icon = this.seekChild("pass_icon");
        this.chapter_value = this.seekChild("chapter_value", cc.Label);
        this.status_value = this.seekChild("status_value", cc.Label);
        this.status_value.node.active = false;
        this.lock_icon = this.seekChild("lock_icon");
        this.lock_icon.setScale(0.8);

        this.select_img = this.seekChild("select_img")
        if(this.select_status!= null){
            this.setSelect(this.select_status)
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.root_wnd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.callback)
                this.callback();
        }, this)
    },

    setData: function (data, index) {
        this.data = data;
        this.index = index;
        if (this.root_wnd)
            this.onShow();
    },

    getData: function () {
        return this.data
    },

    updateMonsterInfo: function (boss_id, status) {
        var config = gdata("guild_dun_data", "data_guildboss_list", [boss_id]);
        this.data.config = config;
        if (config == null) return
        this.boss_id = boss_id;
        this.boss_icon.setHeadRes(config.head_icon);
        this.boss_icon.setLockStatus(true);
        if (status == 2 || status == 3) {
            this.boss_icon.setLockStatus(false);
        }
    },

    addCallBack: function (value) {
        this.callback = value;
    },

    setSelect: function (status) {
        // if (status && !this.select_img) {
        //     this.select_img = Utils.createImage(this.root_wnd, null, 50, 45, cc.v2(0.5, 0.5), false);
        //     this.loadRes(PathTool.getUIIconPath("guildboss", "guildboss_1018"), function (sf_obj) {
        //         this.select_img.spriteFrame = sf_obj;
        //     }.bind(this))
        // }
        // if (this.select_img) {
        //     if (status) {
                // CommonAction.breatheShineAction3(this.select_img);
        //     } else {
        //         // this.select_img.node.stopAllActions();
        //         // this.select_img.node.active = false;
        //     }
        //     this.select_img.node.active = status;
        // }
        // console.error(this.boss_id,status);
        if(this.root_wnd==null){
            this.select_status = status;
            return
        }
        if(status){
            CommonAction.breatheShineAction(this.select_img);
            this.select_img.active = true;
        }else{
            this.select_img.active = false;
        }
    },

    getItemPosition: function () {
        if (this.root_wnd)
            return cc.v2(this.root_wnd.getPosition());
    },

    getIsShow: function () {
        return this.is_show
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function () {
        if (this.data == null) return
        var data = this.data;
        this.data = data;
        this.chapter_value.string = data.desc;
        this.updateMonsterInfo(data.show_id, data.status);
        this.pass_icon.active = false;
        // var temp_index = Math.min(index - 1,Config.guild_dun_data.data_chapter_reward_length);
        if (data.status == 0) {
            this.lock_icon.active = false;
        } else if (data.status == 1) {
            this.pass_icon.active = true;
            this.lock_icon.active = false;
        } else if (data.status == 2) {
            this.lock_icon.active = true;
        } else {
            this.lock_icon.active = true;
        }
    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if(this.boss_icon){
            this.boss_icon.deleteMe();
            this.boss_icon = null;
        }
        // if(this.select_img){
        //     this.select_img.node.destroy();
        //     this.select_img = null;
        // }
    },
})