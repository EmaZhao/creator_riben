// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     圣器装备的tips
// <br/>Create: 2019-02-21 16:09:38
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackPackConst = require("backpack_const");
var Hallows_tipsWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hallows", "hallows_tips");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.is_full_screen = false;
        this.base_list = {};
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_panel = this.root_wnd.getChildByName("main_panel");
    
        this.lab_name_node = this.main_panel.getChildByName("lab_name");

        this.box_bg_2 = this.main_panel.getChildByName("box_bg_2").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("Frame_2_1"), (function(resObject){
            this.box_bg_2.spriteFrame = resObject;
        }).bind(this));

        this.box_bg = this.main_panel.getChildByName("box_bg").getComponent(cc.Sprite);
        this.loadRes(PathTool.getCommonIcomPath("common_1037"), (function(resObject){
            this.box_bg.spriteFrame = resObject;
        }).bind(this));

        this.line = this.main_panel.getChildByName("line").getComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("common","Currency_1_1"), (function(resObject){
            this.line.spriteFrame = resObject;
        }).bind(this));

        this.lab_name = this.main_panel.getChildByName("lab_name").getComponent(cc.Label);
    
        this.node_dec = this.main_panel.getChildByName("node_dec");
        
        this.lab_dec = Utils.createRichLabel(20, new cc.Color(0x3f,0x32,0x34,0xff), cc.v2(0, 1), cc.v2(0, 0), 22, 400);
        this.lab_dec.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.node_dec.addChild(this.lab_dec.node);
    
        this.node_item = this.main_panel.getChildByName("node_item");
    
        this.lab_base = this.main_panel.getChildByName("lab_base").getComponent(cc.Label);
        this.lab_base.string = Utils.TI18N("基础属性(升级属性强化效果)");
        this.lab_special = this.main_panel.getChildByName("lab_special").getComponent(cc.Label);
        this.lab_special.string = Utils.TI18N("特殊属性(升级技能强化效果)");

        //基本属性
        this.attr_info_list = {};
        for(var i = 1;i<3;i++){
            var item = {};
            item.attr_label = this.main_panel.getChildByName("attr_label"+i).getComponent(cc.Label);
            item.attr_icon = this.main_panel.getChildByName("attr_icon"+i).getComponent(cc.Sprite);
            this.attr_info_list[i] = item;
        }

        // 特殊属性
        this.special_info_list = {};
        for(var j = 1;j<4;j++){
            var item2 = {};
            item2.apecial_left_label = this.main_panel.getChildByName("apecial_left_label"+j).getComponent(cc.Label);
            item2.apecial_right_label = this.main_panel.getChildByName("apecial_right_label"+j).getComponent(cc.Label);
            this.special_info_list[j] = item2;
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on(cc.Node.EventType.TOUCH_END, function () {
            Utils.playButtonSound(ButtonSound.Close);
            this.ctrl.openHallowsTips(false);
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(hallows_data){
        if(!hallows_data)return;
        var hallows_vo = null;
        
        if(typeof hallows_data == "number"){
            hallows_vo = this.model.getHallowsById(hallows_data);
        }else{
            hallows_vo = hallows_data;
        }

        if(!hallows_vo)return;
        
        var hallows_id = hallows_vo.id;
        var skill_lev = 1;
        var is_lock = false;
        if(hallows_vo){
            skill_lev = hallows_vo.skill_lev;
        }else{
            is_lock = true;
        }
        
        this.config = gdata("hallows_data","data_base",hallows_id);
        if(!this.config)return;
       
        //名字
        var str = cc.js.formatStr("%s(+%s)", this.config.name, hallows_vo.step);
        this.lab_name.string = str;

        
        var item_config = Utils.getItemConfig(this.config.item_id)
        if(item_config){
            this.node_item.setScale(0.9);

            // if(BackPackConst.quality_color(item_config.quality)){
            //     var hex = BackPackConst.quality_color(item_config.quality);
            //     var color = this.lab_name_node.color;
            //     color.fromHEX(hex);
            //     this.lab_name_node.color = color
            // }

            if(!this.hallows_item){
                this.hallows_item = ItemsPool.getInstance().getItem("backpack_item");
                this.hallows_item.initConfig(false,1,false,false);
                this.hallows_item.setParent(this.node_item);
                this.hallows_item.show();
            }

            // if(hallows_vo.look_id != 0){  幻化状态--暂时屏蔽
            //     var magic_cfg = Config.HallowsData.data_magic[hallows_vo.look_id]
            //     if(magic_cfg){
            //         this.hallows_item.setData(magic_cfg.item_id)
            //     }else{
            //         this.hallows_item.setData(this.config.item_id)
            //     }
            // }else{
            //     this.hallows_item.setData(this.config.item_id);
            // }
            this.hallows_item.setData(this.config.item_id);


            if(is_lock){
                var res = PathTool.getCommonIcomPath("common_90009");
                var lock_icon =Utils.createImage(this.node_item, null, x ,y , cc.v2(0.5,0.5),true,0,false)
                this.loadRes(res, function (sf_obj) {
                    lock_icon.spriteFrame = sf_obj;
                }.bind(this));
                lock_icon.setScale(0.8);
                // setChildUnEnabled(true, self.item_icon)
                // setChildUnEnabled(true, self.item_bg)
            }

            var skill_key = Utils.getNorKey(hallows_id, skill_lev);
            var skill_up_config = gdata("hallows_data","data_skill_up",skill_key);
            if(skill_up_config){
                var skill_config = gdata("skill_data","data_get_skill",skill_up_config.skill_bid);
                if(skill_config){
                    //技能描述
                    this.lab_dec.string = skill_config.des;
                }
            }
        }

        //属性
        var attr_data = hallows_vo.add_attr;
        for(var i in this.attr_info_list){
            var item = this.attr_info_list[i];
            var attr = attr_data[i-1];
            if(attr){
                var attr_id = attr.attr_id
                var attr_val = attr.attr_val
                var attr_str = gdata("attr_data","data_id_to_key",attr_id);
                var res_id = PathTool.getAttrIconByStr(attr_str)
                
                var res = PathTool.getCommonIcomPath(res_id);
                LoaderManager.getInstance().loadRes(res, function(icon,sf_obj){
                    icon.spriteFrame = sf_obj;
                    icon.active = true;
                }.bind(this,item.attr_icon))

                var attr_name = gdata("attr_data","data_key_to_name",attr_str);
                var name = cc.js.formatStr("%s%s+%s",Utils.TI18N("全队"), attr_name, attr_val);
                item.attr_label.string = name;
                item.attr_label.active = true;
            }else{
                item.attr_label.active = false;
                item.attr_icon.active = false;
            }
        }

        //特殊属性
        var attr_config =  gdata("hallows_data","data_skill_attr",hallows_id);
        if(attr_config){
            for(var j in this.special_info_list){
                var item2 = this.special_info_list[j];
                if(attr_config[j]){
                    item2.apecial_left_label.string = attr_config[j].desc;
                    var str = cc.js.formatStr(Utils.TI18N("技能等级%s级"), attr_config[j].lev_limit)
                    item2.apecial_right_label.string = str;
                    
                    if(is_lock || skill_lev < attr_config[j].lev_limit){
                        item2.apecial_left_label.node.color = new cc.Color(0xa5,0x5f,0x14,0xff);
                        item2.apecial_right_label.node.color = new cc.Color(0xa5,0x5f,0x14,0xff);
                    }
                    item2.apecial_left_label.active = true;
                    item2.apecial_right_label.active = true;
                }else{
                    item2.apecial_left_label.active = false;
                    item2.apecial_right_label.active = false;
                }
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.hallows_item){
            this.hallows_item.deleteMe();
        }
        this.hallows_item = null;

        this.ctrl.openHallowsTips(false);
    },
})