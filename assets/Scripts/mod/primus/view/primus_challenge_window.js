// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-16 10:26:46
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var ArenaController = require("arena_controller");
var PlayerHead = require("playerhead");
var FriendController = require("friend_controller");
var PartnerCalculate = require("partner_calculate");
var BaseRole = require("baserole");

var Primus_challengeWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("primus", "primus_challenge_panel");
        this.viewTag = SCENE_TAG.ui;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Mini;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        // 属性列表
        this.attr_label_list = [];
        this.attr_icon_list = [];
        // 复选框
        this.checkbox_list = [];
        this.checkbox_counts = [1,5,10];
        // boss 主动技能
        this.act_skill_item_list = [];
        // boss 被动技能
        this.passive_skill_item_list = [];
    
        // 技能宽高
        this.skill_width = 88
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.main_panel = this.main_container.getChildByName("main_panel");
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.win_title = this.main_panel.getChildByName("win_title").getComponent(cc.Label);
        this.win_title.string = Utils.TI18N("神殿挑战");
        this.primus_bigbg_3_node = this.main_panel.getChildByName("primus_bigbg_3");
        this.primus_bigbg_3_node.scale = 2;
        this.primus_bigbg_3 = this.primus_bigbg_3_node.getComponent(cc.Sprite);

        this.loadRes(PathTool.getBigBg("primus_bigbg_3",null,"primus"), (function(resObject){
            if(this.primus_bigbg_3){
                this.primus_bigbg_3.spriteFrame = resObject;
            }
        }).bind(this));

        this.record_btn     = this.main_panel.getChildByName("record_btn");
        // 站台
        var station_lay   = this.main_panel.getChildByName("station_lay");
        this.mode_node      = station_lay.getChildByName("mode_node")
        this.occupant_tips  = station_lay.getChildByName("occupant_tips").getComponent(cc.Label);
        this.tips_node    = station_lay.getChildByName("tips_node")
        this.head_node      = station_lay.getChildByName("head_node") 
        this.title_img      = station_lay.getChildByName("title_img").getComponent(cc.Sprite);
    
        this.name           = station_lay.getChildByName("name").getComponent(cc.Label);
        this.name_bg        = station_lay.getChildByName("name_bg");
        // boss技能
        var boss_panel    = this.main_panel.getChildByName("boss_panel");
        var desc_label     = boss_panel.getChildByName("desc_label").getComponent(cc.Label);
        var desc_label_1   = boss_panel.getChildByName("desc_label_1").getComponent(cc.Label);
        var desc_label_2   = boss_panel.getChildByName("desc_label_2").getComponent(cc.Label);
        desc_label.string = Utils.TI18N("Boss技能");
        desc_label_1.string = Utils.TI18N("主动技能");
        desc_label_2.string = Utils.TI18N("被动技能");

        // 主动技能scrollview
        this.item_container_1 = boss_panel.getChildByName("item_container_1").getChildByName("content");
        
        // 被动技能scrollview
        this.item_container_2 = boss_panel.getChildByName("item_container_2").getChildByName("content");

        // 属性
        this.attr_panel     = this.main_panel.getChildByName("attr_panel")
        this.arrt_title     = this.attr_panel.getChildByName("title").getComponent(cc.Label);

        for(var i = 0;i<4;i++){
            this.attr_label_list[i] = this.attr_panel.getChildByName("attr_label"+(i+1)).getComponent(cc.Label);
            this.attr_icon_list[i] = this.attr_panel.getChildByName("attr_icon"+(i+1)).getComponent(cc.Sprite);
        }
        this.arrt_title.string = Utils.TI18N("神位称号属性加成");

        // 复选框
        var box_panel     = this.main_panel.getChildByName("box_panel")
        this.checkbox_list[0] = box_panel.getChildByName("checkbox1")
        this.checkbox_list[1] = box_panel.getChildByName("checkbox5")
        this.checkbox_list[2] = box_panel.getChildByName("checkbox10")
        var name = this.checkbox_list[0].getChildByName("name").getComponent(cc.Label);
        name.string = cc.js.formatStr(Utils.TI18N("进化%s次"),this.checkbox_counts[0]);
        name = this.checkbox_list[1].getChildByName("name").getComponent(cc.Label);
        name.string = cc.js.formatStr(Utils.TI18N("进化%s次"),this.checkbox_counts[1]);
        name = this.checkbox_list[2].getChildByName("name").getComponent(cc.Label);
        name.string = cc.js.formatStr(Utils.TI18N("进化%s次"),this.checkbox_counts[2]);
        this.select_checkbox = 0;

        this.warning_tips = box_panel.getChildByName("warning_tips").getComponent(cc.Label);
        this.warning_tips.string  = Utils.TI18N("(难度大请谨慎)");
        
        this.tips_name = this.main_panel.getChildByName("tips_name").getComponent(cc.Label);
        this.challenge_btn = this.main_panel.getChildByName("challenge_btn");

        var goto_node = this.main_panel.getChildByName("goto_node");
        this.gotoe_label = Utils.createRichLabel(24, new cc.Color(36, 144, 3, 255), cc.v2(0, 0.5), cc.v2(0, 0),30,125);
        this.gotoe_label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        this.gotoe_label.string = cc.js.formatStr("<u>%s</u>", Utils.TI18N("前往竞技场"));
        
        goto_node.addChild(this.gotoe_label.node);

        var tips_node = this.main_panel.getChildByName("tips_node");
        this.tips_label = Utils.createRichLabel(22, new cc.Color(169, 95, 16, 255), cc.v2(0.5, 0.5), cc.v2(0, 0),30,1280);
        tips_node.addChild(this.tips_label.node);

        Utils.getNodeCompByPath("main_container/main_panel/challenge_btn/label", this.root_wnd, cc.Label).string = Utils.TI18N("挑 战");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.gotoe_label.node, function () {
            var ArenaController = require("arena_controller");
            ArenaController.getInstance().requestOpenArenWindow()   
            this.ctrl.openPrimusChallengePanel(false);     
        }.bind(this), 1);

        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openPrimusChallengePanel(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.record_btn, function () {
            this._onClickChallengeRecordBtn();
        }.bind(this), 2);
        
        Utils.onTouchEnd(this.challenge_btn, function () {
            this._onClickChallengeBtn();
        }.bind(this), 2);

        for(var i in this.checkbox_list){
            Utils.onTouchEnd(this.checkbox_list[i], function (i) {
                if(this.sever_data){
                    this.select_checkbox = i;
                    this.setSelectCheckBox();
                    var num = this.sever_data.num + this.checkbox_counts[i]
                    this.initBossSkill(num);
                }
            }.bind(this,i), 1);
        }
    
        // -- this:addGlobalEvent(TaskEvent.UpdateUIRedStatus, function(key, value)
        // --     this:updateUIRedStatus(key)
        // -- end)
    },

    // 去挑战去
    _onClickChallengeBtn:function(){
        if(!this.sever_data)return;
        var _send20702 = function(){
            var num = this.checkbox_counts[this.select_checkbox];
            this.ctrl.sender20702(this.sever_data.pos ,num);
        }.bind(this);
        if(this.is_have_title){
            var CommonAlert = require("commonalert");
            CommonAlert.show(Utils.TI18N("您当前已占有一个神位，若挑战其他神位成功，将失去原有神位，是否继续挑战？"),Utils.TI18N("确定"), _send20702,Utils.TI18N("取消"));
        }else{
            _send20702();
        }
    },

    // 查看挑战记录
    _onClickChallengeRecordBtn:function(){
        if(!this.sever_data)return;
        this.ctrl.sender20703(this.sever_data.pos);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(!data)return;
        if(data.length<2)return;
        this.is_have_title = data[1];
        this.sever_data = data[0];
        this.var_data = Config.primus_data.data_upgrade[this.sever_data.pos];

        var honor_data = Config.honor_data.data_title[this.var_data.honor_id];
        if(honor_data && this.title_img){
            var res = PathTool.getHonorRes(honor_data.res_id);
            this.loadRes(res, (function(resObject){
                if(this.title_img){
                    this.title_img.spriteFrame = resObject;
                }
            }).bind(this));
        }

        if(this.tips_node && this.var_data){
            var str = cc.js.formatStr(Utils.TI18N("<color=#ffffff>已进化<color=#14ff32>%s</color>次</color>"), this.sever_data.num)
            var label = Utils.createRichLabel(24, new cc.Color(0xff, 0xff, 0xff, 0xff), cc.v2(0.5, 0.5), cc.v2(0, 0),30);
            label.string = str;
            this.tips_node.addChild(label.node);
        }

        if(this.sever_data.name != null || this.sever_data.name != ""){
            var roleVo = RoleController.getInstance().getRoleVo();
            if(roleVo && this.sever_data.rid == roleVo.rid && this.sever_data.srv_id == roleVo.srv_id){
                // 是自己
                this.tips_name.string = Utils.TI18N("已占领神位");
                this.challenge_btn.active = false;
                this.gotoe_label.node.active = false;
            }
        }

        // 更新模型
        if(this.var_data){
            this.updateSpine(this.var_data.look_id);
        }

        // 头像
        this.initHeadUi();

        // boss技能
        this.initBossSkill(this.sever_data.num);
        // 称号属性
        this.initHonorAttribute();

        this.setSelectCheckBox();

        this.updateTipsLabel();
    },

    updateTipsLabel:function(){
        var my_data = ArenaController.getInstance().getModel().getMyLoopData();
        if(this.tips_label && this.var_data){
            if(my_data && my_data.rank && my_data.rank > 0){
                this.tips_label.string = cc.js.formatStr(Utils.TI18N("挑战条件:当前竞技场处于前%s名(我的排名:<color=#249003>%s</color>)"), this.var_data.arena_rank, my_data.rank);
            }else{
                this.tips_label.string = cc.js.formatStr(Utils.TI18N("挑战条件:当前竞技场处于前%s名(我的排名:<color=#249003>无</color>)"), this.var_data.arena_rank);
            }
        }
    },

    // 初始化头像ui
    initHeadUi:function(){
        if(!this.sever_data)return;
        if(this.sever_data.name == null || this.sever_data.name == ""){
            this.occupant_tips.string = Utils.TI18N("虚位以待");
            this.name_bg.active = false;
            this.name.node.active = false;
            return
        }
        // 头像
        this.play_head = new PlayerHead();//cc.size(96,96)
        this.play_head.setPosition(0, 0);
        // this.play_head.setScale(0.95);
        if(this.sever_data.lev){
            this.play_head.setLev(this.sever_data.lev);
        }
        
        this.play_head.setParent(this.head_node);
        this.play_head.show();
        this.play_head.setHeadRes(this.sever_data.face_id);
        this.name.string = this.sever_data.name;
        this.play_head.addCallBack(function(){
            FriendController.getInstance().openFriendCheckPanel(true, {srv_id: this.sever_data.srv_id, rid: this.sever_data.rid})
        }.bind(this));
    },

    initHonorAttribute:function(){
        if(!this.var_data)return;
        if(!this.attr_label_list)return;
        if(!this.attr_icon_list)return;
        var honor_data = Config.honor_data.data_title[this.var_data.honor_id];
        if(honor_data){
            for(var i in this.attr_label_list){
                var icon = this.attr_icon_list[i];
                if(honor_data.attr[i]){
                    this.attr_label_list[i].node.active = true;
                    var atrr_name = Config.attr_data.data_key_to_name[honor_data.attr[i][0]];
                    if(PartnerCalculate.isShowPerByStr(honor_data.attr[i][0])){
                        var value = honor_data.attr[i][1]/10;
                        this.attr_label_list[i].string = cc.js.formatStr("%s + %s%", Utils.TI18N(atrr_name), value);
                    }else{
                        this.attr_label_list[i].string = cc.js.formatStr("%s + %s ", Utils.TI18N(atrr_name), honor_data.attr[i][1]);
                    }
                    if(icon){
                        icon.node.active = true;
                        var res_id = PathTool.getAttrIconByStr(honor_data.attr[i][0]);
                        var res = PathTool.getCommonIcomPath(res_id);
                        this.loadRes(res, (function(icon,resObject){
                            if(icon){
                                icon.spriteFrame = resObject;
                            }
                        }).bind(this,icon));
                    }
                }else{
                    this.attr_label_list[i].node.active = false;
                    if(icon){
                        icon.node.active = false;
                    }
                }
            }
        }
    },

    initBossSkill:function(num){
        if(this.unit_data_list == null){
            this.unit_data_list = [];
            for(var i in Config.primus_data.data_unitdata){
                if(this.sever_data.pos == Config.primus_data.data_unitdata[i].pos){
                    this.unit_data_list.push(Config.primus_data.data_unitdata[i]);
                }
            }
        }
        var cur_data = null;
        var length = this.unit_data_list.length;
        for(var j in this.unit_data_list){
            if(num >= this.unit_data_list[j].min && num <= this.unit_data_list[j].max){
                cur_data = this.unit_data_list[j];
                break
            }
            if(j+1 == length){
                cur_data = this.unit_data_list[j];
            }
        }

        if(cur_data == null){
            return;
        }

        if(this.cur_unit_data && this.cur_unit_data.min == cur_data.min){
            // 同一个对象.不用初始化
            return;
        }

        this.cur_unit_data = cur_data;
        var act_skill = cur_data.act_skill;
        var passive_skill = cur_data.passive_skill;

        // 主动技能
        var item_width = this.skill_width * act_skill.length;
        var max_width = Math.max(this.item_container_1.getContentSize().width, item_width)
        this.item_container_1.setContentSize(cc.size(max_width, this.item_container_1.getContentSize().height));

        for(var i in act_skill){
            var vo = gdata("skill_data","data_get_skill",act_skill[i]);
            if(vo){
                if(this.act_skill_item_list[i] == null){
                    this.act_skill_item_list[i] = {};
                    this.act_skill_item_list[i] = this.updateSkillItem(vo, this.act_skill_item_list[i], true) 
                    this.item_container_1.addChild(this.act_skill_item_list[i].con);
                }else{
                    this.updateSkillItem(vo, this.act_skill_item_list[i]);
                }
                this.act_skill_item_list[i].con.setPosition((this.skill_width + 5) * i+this.skill_width/2, this.skill_width/2);
            }else{
                console.log(cc.js.formatStr("技能表id: %s 没发现",act_skill[i].toString()));
            }
        }

        // 被动技能
        var item_width = this.skill_width * passive_skill.length;
        var max_width = Math.max(this.item_container_2.getContentSize().width, item_width);
        this.item_container_2.setContentSize(cc.size(max_width, this.item_container_2.getContentSize().height));

        for(var i in passive_skill){
            var vo = gdata("skill_data","data_get_skill",passive_skill[i]);
            if(vo){
                if(this.passive_skill_item_list[i] == null){
                    this.passive_skill_item_list[i] = {};
                    this.passive_skill_item_list[i] = this.updateSkillItem(vo, this.passive_skill_item_list[i], false);
                    this.item_container_2.addChild(this.passive_skill_item_list[i].con);
                }else{
                    this.updateSkillItem(vo, this.passive_skill_item_list[i])
                }
                this.passive_skill_item_list[i].con.setPosition((this.skill_width + 5) * i+this.skill_width/2,this.skill_width/2);
            }else{
                console.log(cc.js.formatStr("技能表id: %s 没发现",passive_skill[i].toString()));
            }
        }
    },

    updateSpine:function(look_id){
        if(!look_id)return;
        var fun = function(){
            if(!this.spine){
                this.spine = new BaseRole();
                // this.spine:setCascade(true)
                this.spine.setParent(this.mode_node);
                this.spine.node.setPosition(0,76);
                this.spine.node.setAnchorPoint(cc.v2(0.5,0.5));
                var effect_nd = this.mode_node.getChildByName("effect");
                if(effect_nd){
                  effect_nd.setPosition(0,76);
                }
                // this.spine:setOpacity(0)
                // var action = cc.fadeIn(0.2);
                // this.spine.runAction(action);
                this.spine.setData(BaseRole.type.role, look_id, PlayerAction.show, true,0.75)
            }
        }.bind(this);

        if(this.spine){
            // this.spine:setCascade(true)
            var action = cc.fadeOut(0.2);
            this.spine.node.runAction(cc.sequence(action, cc.CallFunc(function(){
                this.spine.node.stopAllActions();
                this.spine.deleteMe();
                this.spine = null;
                fun();
               
            })))
            
        }else{
            fun()
        }
    },

    // @is_act 是否主动技能
    updateSkillItem:function(config, skill_item, is_act){
        var size = cc.size(this.skill_width,this.skill_width);
        var skill_size = cc.size(this.skill_width - 4 ,this.skill_width - 4);
    
        skill_item.config = config;
        if(skill_item.con == null){
            var con = new cc.Node();
            con.setContentSize(size);
            con.scale = 0.75;

            Utils.onTouchEnd(con, function () {
                if(skill_item.config){
                    var TipsController = require("tips_controller")
                    TipsController.getInstance().showSkillTips(skill_item.config)
                }
            }.bind(this), 1);
            skill_item.con = con;
            // 背景
            var res = PathTool.getCommonIcomPath("common_1005");
            var bg = Utils.createImage(con,null,0,0,cc.v2(0.5, 0.5),true, 0);
            
            this.loadRes(res, (function(bg,resObject){
                if(bg){
                    bg.spriteFrame = resObject;
                }
            }).bind(this,bg));
        }
        // 技能icon 
        var res = PathTool.getIconPath("skillicon", config.icon);
        if(skill_item.icon == null){
            skill_item.icon = Utils.createImage(skill_item.con,null,0,0,cc.v2(0.5, 0.5),false, 0, false);
            
            this.loadRes(res, (function(resObject){
                if(skill_item && skill_item.icon){
                    skill_item.icon.spriteFrame = resObject;
                }
            }).bind(this));
        }else{
            this.loadRes(res, (function(resObject){
                if(skill_item && skill_item.icon){
                    skill_item.icon.spriteFrame = resObject;
                }
            }).bind(this));
            
        }
        // 技能等级
        if(skill_item.lev_label == null){
            skill_item.lev_label = Utils.createLabel(26,new cc.Color(0xff,0xff,0xff,0xff),new cc.Color(0x00,0x00,0x00,0xff),this.skill_width/2+10,-this.skill_width/2-20,config.level.toString(),skill_item.con,2,cc.v2(1, 0));
        }else{
            skill_item.lev_label.string = config.level.toString();
        }
        return skill_item;
    },

    // 设置选择框
    setSelectCheckBox:function(){
        if(!this.select_checkbox)return;
        if(!this.checkbox_list)return;
        for(var i in this.checkbox_list){
            if(this.select_checkbox == i){
                this.checkbox_list[i].getComponent(cc.Toggle).check();
            }else{
                this.checkbox_list[i].getComponent(cc.Toggle).uncheck();
            }
        }
    },


    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.spine){
            this.spine.deleteMe();
            this.spine = null;
        }

        if(this.play_head){
            this.play_head.deleteMe();
            this.play_head = null;
        }
        this.ctrl.openPrimusChallengePanel(false);
    },
})