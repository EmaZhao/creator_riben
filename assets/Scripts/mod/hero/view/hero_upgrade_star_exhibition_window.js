// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-01 17:06:07
// --------------------------------------------------------------------
var PathTool  = require("pathtool");
var SkillItem = require("skill_item");

var HeroUpgradeStarExhibition = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_upgrade_star_exhibition");
        this.viewTag    = SCENE_TAG.dialogue;                // 该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type   = WinType.Full;                     // 是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function() {
        Utils.playButtonSound("c_starup");
        this.main_container_nd  = this.seekChild("main_container");
        this.title_container_sk = this.seekChild("title_container", sp.Skeleton);
        this.left_head_con_nd   = this.seekChild("left_head_con");
        this.right_head_con_nd  = this.seekChild("right_head_con");
        this.mask_bg_nd         = this.seekChild("mask_bg");
        this.mask_bg_nd.scale   = FIT_SCALE;

        // 技能相关
        this.skills_con_nd      = this.seekChild("skills_con");
        this.tow_skill_con_nd   = this.seekChild("tow_skill_con");
        this.left_skill_con_nd  = this.seekChild("left_skill_con");
        this.right_skill_con_nd = this.seekChild("right_skill_con");
        this.no_skill_tip_nd    = this.seekChild("no_skill_tip");

        this.attr_items = {};
        for (var attr_i = 1; attr_i <= 5; attr_i++) {
            var attr_item = this.attr_items[attr_i] = {};
            var attr_nd = this.seekChild(this.main_container_nd, "attr_item_" + attr_i);
            attr_item["old_val_lb"] = this.seekChild(attr_nd, "old_val", cc.Label);
            attr_item["new_val_lb"] = this.seekChild(attr_nd, "new_val", cc.Label);            
        }

        this.left_hero_item =ItemsPool.getInstance().getItem("hero_exhibition_item");
        this.left_hero_item.setParent(this.left_head_con_nd);
        this.left_hero_item.show();

        this.right_hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
        this.right_hero_item.setParent(this.right_head_con_nd);
        this.right_hero_item.show();

        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMask, this);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function() {

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params) {
        if (!params) return;
        this.data = params;
        this.udpateWidgets();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function() {
        if (this.left_hero_item)
            this.left_hero_item.deleteMe();
        if (this.right_hero_item)
            this.right_hero_item.deleteMe();
        if (this.right_skill_item)
            this.right_skill_item.deleteMe();
        if (this.lefg_skill_item)
            this.lefg_skill_item.deleteMe();
        if (this.skill_items) {
            for (var skill_i in this.skill_items)
                this.skill_items[skill_i].deleteMe();
        }
    },

    udpateWidgets: function() {
        // 判断是否有解锁新技能
        this.handleEffect(true);
        this.updateHead();
        this.updateAttrList();
    },

    handleEffect: function(status) {
        if (status) {
            var action = PlayerAction.action_5;
            var effect_res = PathTool.getEffectRes(103);
            var effect_path = PathTool.getSpinePath(effect_res, "action");

            this.loadRes(effect_path, function(title_sd) {
                cc.log(action);
                cc.log(title_sd);
                this.title_container_sk.skeletonData = title_sd;
                this.title_container_sk.setAnimation(0, action, false);
            }.bind(this));
        } else {

        }
    },

    updateHead: function() {
        var new_vo = this.data.new_vo;
        var old_vo = this.data.old_vo;        
        this.left_hero_item.setData(old_vo);
        this.right_hero_item.setData(new_vo);
    },

    updateAttrList: function() {
        var old_vo = this.data.old_vo;
        var new_vo = this.data.new_vo;

        var old_key = old_vo.bid + "_" + old_vo.star;
        var new_key = new_vo.bid + "_" + new_vo.star;        
        var old_star_config = gdata("partner_data", "data_partner_star", old_key)
        var new_star_config = gdata("partner_data", "data_partner_star", new_key)

        // 战斗力
        this.attr_items["1"]["old_val_lb"].string = old_vo.power;
        this.attr_items["1"]["new_val_lb"].string = new_vo.power;

        var attr_list = ["hp","atk","def","speed"];
        // 属性
        var attr_item_index = 2;
        for (var attr_i in attr_list) {
            var attr_str = attr_list[attr_i];
            if (attr_str == "hp_max")
                attr_str = "hp"
            var attr_name = Config.attr_data.data_key_to_name[attr_str];
            var old_str = attr_name + "：" + old_vo[attr_str];
            var new_str = new_vo[attr_str];
            this.attr_items[attr_item_index]["old_val_lb"].string = old_str;
            this.attr_items[attr_item_index]["new_val_lb"].string = new_str;            
            attr_item_index++;
        }

        // 技能提升
        var old_skill = null;
        var new_skill_list = {}
        var new_skill_num = 0;
        var dic_old_skill = {}
        for (var skill_i in old_star_config.skills) {
            var skill_info = old_star_config.skills[skill_i];
            dic_old_skill[skill_info[0]] = skill_info[1];
        }

        for (var skill_i in new_star_config.skills) {
            var skill_info = new_star_config.skills[skill_i];
            if (skill_info[0] != 1) {
                if (dic_old_skill[skill_info[0]]) {
                    if (dic_old_skill[skill_info[0]] != skill_info[1]) {
                        if (!old_skill)
                            old_skill = dic_old_skill[skill_info[0]]
                        new_skill_list[skill_info[0]] = skill_info[1];
                        new_skill_num ++;
                    } 
                } else {                              // 新技能
                    if (!old_skill)
                        old_skill = dic_old_skill[skill_info[0]]
                    new_skill_list[skill_info[0]] = skill_info[1];
                    new_skill_num ++;                    
                }
            }
        }

        if (new_skill_num > 0) {
            if (new_skill_num == 1 && old_skill) {
                this.tow_skill_con_nd.active = true;

                var new_skill = null;
                for (var skill_i in new_skill_list) {
                    new_skill = new_skill_list[skill_i];
                }

                var lefg_skill_item = this.lefg_skill_item = new SkillItem();
                lefg_skill_item.setScale(0.8);
                lefg_skill_item.setParent(this.left_skill_con_nd);
                lefg_skill_item.setData(old_skill)

                var right_skill_item = this.right_skill_item = new SkillItem();
                right_skill_item.setScale(0.8);
                right_skill_item.setParent(this.right_skill_con_nd);
                right_skill_item.setData(new_skill);            
            } else {
                this.skill_items = {};
                for (var skill_i in new_skill_list) {
                    var skill_nd = new cc.Node();
                    skill_nd.setContentSize(cc.size(119, 119))
                    this.skills_con_nd.addChild(skill_nd);
                    var skill_item = this.skill_items[skill_i] = new SkillItem();
                    skill_item.setScale(0.8);
                    skill_item.setParent(skill_nd);
                    skill_item.setData(new_skill_list[skill_i]);
                }
            }
        } else {
            this.no_skill_tip_nd.active = true;
        }
    },
    
    onClickMask: function() {
        this.ctrl.openHeroUpgradeStarExhibitionPanel(false);
    },
})