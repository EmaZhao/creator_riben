// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     符文合成的tips
// <br/>Create: 2019-04-09 17:59:14
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");

var Artifact_com_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "artifact_com_tips");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.ctrl = HeroController.getInstance()
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        this.background = this.seekChild("background");
        this.main_panel = this.seekChild("main_panel");
        this.container = this.seekChild("container");

        //基础属性,名字,类型
        this.base_panel = this.seekChild("base_panel");
        this.base_panel_sp = this.seekChild("base_panel", cc.Sprite);
        this.equip_item = ItemsPool.getInstance().getItem("backpack_item");
        this.equip_item.initConfig(false,1,false,false)
        this.equip_item.show();
        this.equip_item.setPosition(72-206,68-138);
        this.equip_item.setParent(this.base_panel);
        this.name_lb = this.seekChild(this.base_panel, "name", cc.Label);
        this.equip_type_lb = this.seekChild("equip_type", cc.Label);

        //可能出现的属性
        this.baseattr_panel = this.seekChild("baseattr_panel");
        this.attr_text_rt = this.seekChild("attr_text", cc.RichText);

        //间隔线
        this.line = this.seekChild("line");

        //可能出现的符文技能
        this.skill_panel = this.seekChild("skill_panel");
        this.skill_text_rt = this.seekChild("skill_text", cc.RichText);
        this.close_btn = this.seekChild("close_btn");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openArtifactComTipsWindow(false)
        }.bind(this), 2)
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openArtifactComTipsWindow(false)
        }.bind(this), 2)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (bid) {
        this.artifact_bid = bid;
        this.setBaseInfo();
        this.setAttrAndSkillInfo();
    },

    //基础信息
    setBaseInfo: function () {
        if (!this.artifact_bid) return
        var item_config = Utils.getItemConfig(this.artifact_bid);
        if (!item_config) return
        this.equip_item.setData({ bid: this.artifact_bid, num: 0 });

        var quality = 0;
        if (item_config.quality >= 0 && item_config.quality <= 5) {
            quality = item_config.quality;
        }
        var background_res = PathTool.getUIIconPath("tips", "tips_" + quality);
        this.loadRes(background_res, function (sp) {
            this.base_panel_sp.spriteFrame = sp;
        }.bind(this))

        var color = require("backpack_const").getEquipTipsColor(quality)
        this.name_lb.node.color = color;
        this.name_lb.string = item_config.name;

        this.equip_type_lb.string = Utils.TI18N("类型：") + item_config.type_desc
    },

    //属性和技能文字显示
    setAttrAndSkillInfo:function(){
        if(!this.artifact_bid)return
        var art_base_cfg = Config.partner_artifact_data.data_artifact_data[this.artifact_bid];
        if(!art_base_cfg)return
        this.attr_text_rt.string = art_base_cfg.arrt_desc || "";
        this.skill_text_rt.string = art_base_cfg.skill_desc || "";

        //调整大小
        var container_size = this.container.getContentSize();
        var base_panel_size = this.base_panel.getContentSize();

        var attr_panel_height = 50;
        var attr_text_size = this.attr_text_rt.node.getContentSize();
        attr_panel_height = attr_panel_height + attr_text_size.height;

        var skill_panel_height = 50;
        var skill_text_size = this.skill_text_rt.node.getContentSize();
        skill_panel_height = skill_panel_height + skill_text_size.height;

        var top_space = 4;
        var line_space = 10;
        var bottom_space = 20;

        container_size.height = top_space + base_panel_size.height + attr_panel_height + line_space + skill_panel_height + bottom_space;
        this.container.setContentSize(container_size);

        this.base_panel.y = container_size.height - top_space;
        this.baseattr_panel.y = container_size.height - top_space - base_panel_size.height;
        // this.line.y = container_size.height - top_space - base_panel_size.height - attr_panel_height - line_space/2;
        // this.skill_panel.y = bottom_space + skill_panel_height + 40;
        this.skill_panel.y = - 60 ;
        this.close_btn.y = container_size.height - 25;
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        if(this.equip_item){
            this.equip_item.deleteMe();
            this.equip_item = null;
        }
        this.ctrl.openArtifactComTipsWindow(false)
    },
})