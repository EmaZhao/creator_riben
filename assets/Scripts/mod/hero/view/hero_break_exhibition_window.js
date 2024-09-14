// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-01 17:06:07
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroBreakExhibitionWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_exhibition_window");
        this.viewTag    = SCENE_TAG.dialogue;                // 该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type   = WinType.Mini;                     // 是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function() {

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function() {
        Utils.playButtonSound("c_rankup");
        this.main_container_nd  = this.seekChild("main_container");
        this.title_container_sk = this.seekChild("title_container", sp.Skeleton);
        this.head_con_nd        = this.seekChild("head_con");
        this.break_con_nd       = this.seekChild("break_con");
        this.mask_bg_nd         = this.seekChild("mask_bg");
        this.mask_bg_nd.scale   = FIT_SCALE;

        this.attr_items = {};
        for (var attr_i = 1; attr_i <= 6; attr_i++) {
            var attr_item = this.attr_items[attr_i] = {};
            var attr_nd = this.seekChild(this.main_container_nd, "attr_item_" + attr_i);
            attr_item["old_val_lb"] = this.seekChild(attr_nd, "old_val", cc.Label);
            attr_item["new_val_lb"] = this.seekChild(attr_nd, "new_val", cc.Label);            
        }

        this.hero_item = ItemsPool.getInstance().getItem("hero_exhibition_item");
        this.hero_item.setParent(this.head_con_nd);
        this.hero_item.show();

        this.mask_bg_nd.on(cc.Node.EventType.TOUCH_END, this.onClickMask, this);
        Utils.getNodeCompByPath("New Node", this.root_wnd, cc.Label).string = Utils.TI18N("点击任意处关闭");
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
        if (this.hero_item){
            this.hero_item.deleteMe();
        }
        this.ctrl.openBreakExhibitionWindow(false);
    },

    udpateWidgets: function() {
        // 判断是否有解锁新技能
        this.handleEffect(true);
        this.updateHead();
        this.updateAttrList();
    },

    handleEffect: function(status) {
        if (status) {
            var action = PlayerAction.action_6;
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
        this.hero_item.setData(new_vo);

        var max_count = this.ctrl.getModel().getHeroMaxBreakCountByInitStar(new_vo.init_star);
        var break_count = new_vo.break_lev;
        for (var break_i = 1; break_i <= max_count; break_i++) {
            var break_nd = new cc.Node();
            var break_sp = break_nd.addComponent(cc.Sprite);
            var break_res = "hero_info_2";
            if (break_i <= break_count)
                break_res = "hero_info_1";
            var break_path = PathTool.getUIIconPath("hero", break_res);
            this.loadRes(break_path, function(break_sp, brek_sf) {
                break_sp.spriteFrame = brek_sf;
            }.bind(this, break_sp));
            this.break_con_nd.addChild(break_nd);
        }
    },

    updateAttrList: function() {
        var old_vo = this.data.old_vo;
        var new_vo = this.data.new_vo;

        var key              = old_vo.type + "_" + old_vo.break_id + "_" + old_vo.break_lev || 0;
        var old_break_config = Config.partner_data.data_partner_brach[key];
        var new_key          = new_vo.type + "_" + new_vo.break_id + "_" + new_vo.break_lev || 0;
        var new_break_config = Config.partner_data.data_partner_brach[new_key];

        if(!old_break_config || !new_break_config)  return;
        // --查找是否有解锁新技能
        if(new_break_config.skill_num > old_break_config.skill_num){
            //--说明有解锁技能
            let key = Utils.getNorKey(old_vo.bid, old_vo.star)
            let star_config = gdata("partner_data", "data_partner_star",key)
            if(star_config){
                let skill_id = null //--200101
                for(let i=0;i<star_config.skills.length;++i){
                    let info = star_config.skills[i]
                    if(info[0] ==  new_break_config.skill_num){
                        skill_id = info[1]
                        break
                    }
                }
                if(skill_id != null){
                    this.unlock_skill_id = skill_id
                }
            }
        }

        // 战斗力
        this.attr_items["1"]["old_val_lb"].string = old_vo.power;
        this.attr_items["1"]["new_val_lb"].string = new_vo.power;
        // 等级
        this.attr_items["2"]["old_val_lb"].string = Utils.TI18N("等级上限：") + old_break_config.lev_max;
        this.attr_items["2"]["new_val_lb"].string = new_break_config.lev_max;

        // 属性
        var attr_item_index = 3;
        for (var attr_i in new_break_config.all_attr) {
            var attr_info = new_break_config.all_attr[attr_i];
            var attr_str = attr_info[0];
            if (attr_str == "hp_max")
                attr_str = "hp"
            var attr_name = Config.attr_data.data_key_to_name[attr_str];
            var old_str = attr_name + "：" + old_vo[attr_str];
            var new_str = new_vo[attr_str];
            this.attr_items[attr_item_index]["old_val_lb"].string = old_str;
            this.attr_items[attr_item_index]["new_val_lb"].string = new_str;            
            attr_item_index++;
        }
    },
    
    onClickMask: function() {
        this.ctrl.openBreakExhibitionWindow(false,this.unlock_skill_id);
    },
})