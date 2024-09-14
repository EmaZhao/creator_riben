// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-22 11:02:42
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var VipController = require("vip_controller");
var NewFirstChargeEvent = require("newfirstcharge_event");

var NewfirstchargeWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("newfirstcharge", "newfirstcharge_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.cur_index = null;
        this.item_list = [];
        this.item_reward_list = [];
        for(var i = 1;i<=3;i++){
            this.item_reward_list[i] = {};
        }
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
        var container = this.main_container.getChildByName("container");
        var bg_node = container.getChildByName("bg");
        var bg = bg_node.getComponent(cc.Sprite);
        this.loadRes(PathTool.getBigBg("txt_cn_action_bigbg_3",null,"action"), (function(resObject){
            bg.spriteFrame = resObject;
        }).bind(this));
    
        this.close_btn = container.getChildByName("close_btn");
        this.title_img = container.getChildByName("title_img");
        this.remain_charge = container.getChildByName("remain_charge").getComponent(cc.Label);
        this.remain_charge.string = Utils.TI18N("已累充: ");
    
        this.btn_recharge = container.getChildByName("btn");
        this.btn_label = this.btn_recharge.getChildByName("label").getComponent(cc.Label);
        this.btn_label.string = Utils.TI18N("前往充值");

        this.Sprite_2 = container.getChildByName("Sprite_2").getComponent(cc.Sprite);
        this.Sprite_2_0 = container.getChildByName("Sprite_2_0").getComponent(cc.Sprite);
        this.Sprite_2_1 = container.getChildByName("Sprite_2_1").getComponent(cc.Sprite);
        var icon_path = PathTool.getItemRes(3);
        this.loadRes(icon_path, function(res_object){
            this.Sprite_2.spriteFrame = res_object;
            this.Sprite_2_0.spriteFrame = res_object;
            this.Sprite_2_1.spriteFrame = res_object;
        }.bind(this));
        

        this.model.setFirstRechargeData();

        for(var i = 1;i<=3;i++){
            var item = container.getChildByName("item_"+i);
            if(item){
                var object = {}
                object.scroll = item.getChildByName("scroll").getChildByName("content");
                object.finish_icon = item.getChildByName("finish_icon")
                object.finish_icon.active = false;
                object.title = item.getChildByName("title").getComponent(cc.Label);
                object.title.string = Utils.TI18N("第")+i+Utils.TI18N("天免费领");
                object.list = {}
                this.item_list[i] = object;
            }
        }

        this.tab_view = [];
        for(var i = 1;i<=2;i++){
            var tab = {}
            tab.btn = container.getChildByName("btn_grade_"+i);
            tab.normal = tab.btn.getChildByName("normal");
            tab.select = tab.btn.getChildByName("select");
            tab.select.active = false;
            tab.title = tab.btn.getChildByName("title")
            tab.title.color = new cc.Color(0xff,0xff,0xff,0xff);
            tab.titleOutLine = tab.btn.getChildByName("title").getComponent(cc.LabelOutline);
            tab.titleOutLine.color = new cc.Color(0x71,0x00,0x42,0xff);
            tab.title_barner = container.getChildByName("title_img_"+i);
            tab.title_barner.scale = 2;
            tab.title_barner.active = false;

            this.loadRes(PathTool.getUIIconPath("newfirstcharge","txt_cn_newfirstcharge_"+i), (function(title_barner,resObject){
                title_barner.getComponent(cc.Sprite).spriteFrame = resObject;
            }).bind(this,tab.title_barner));

            tab.index = i;
            this.tab_view[i] = tab
        }

        this.tab_get_hero = {}
        for(var i = 1;i<=3;i++){
            var tab = {}
            tab.btn = container.getChildByName("btn_"+i);
            tab.title = tab.btn.getChildByName("Text_1");
            tab.get = container.getChildByName("get_"+i)
            tab.get.active = false;
            tab.index = i;
            this.tab_get_hero[i] = tab
        }

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn, function () {
            this.ctrl.openNewFirstChargeView(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn_recharge, function () {
            var first_data = this.model.getFirstRechargeData(this.cur_index);
            if(this.get_gift_id == 0){
                this.ctrl.openNewFirstChargeView(false);//临时
                VipController.getInstance().openVipMainWindow(true, VIPTABCONST.DAILY_GIFT)
            }else if(this.get_gift_id == 1){
                if(first_data[this.gift_index]){
                    this.ctrl.sender21013(first_data[this.gift_index].id)
                }
            }else{
                this.ctrl.openNewFirstChargeView(false);
            }
        }.bind(this), 1);

        for(var i in this.tab_view){
            Utils.onTouchEnd(this.tab_view[i].btn, function (v) {
                this.changeTabView(v.index)
            }.bind(this,this.tab_view[i]), 1);
        }

        for(var j in this.tab_get_hero){
            Utils.onTouchEnd(this.tab_get_hero[j].btn, function (v) {
                if(v.index && this.updata_charge_data){
                    if(this.updata_charge_data.choosen_status == 1){
                        var list = [20501,30506,10505];
                        var role_data = Config.partner_data.data_partner_base[list[v.index-1]];
                        if(role_data){
                            var str = cc.js.formatStr(Utils.TI18N("<color=#643223>是否确定选择</color> <color=#bc3f0e fontsize=26>%s</color> <color=#643223>作为奖励？\n</color> <color=#643223>  确定后其它英雄将不可领取</color>"),role_data.name)
                            var CommonAlert = require("commonalert");
                            CommonAlert.show(str,Utils.TI18N("确定"),function(){
                                this.ctrl.sender21014(v.index);
                            }.bind(this),Utils.TI18N("取消"))
                        }
                    }else{
                        this.ctrl.sender21014(v.index);
                    }
                }
            }.bind(this,this.tab_get_hero[j]), 1);
        }

        this.addGlobalEvent(NewFirstChargeEvent.New_First_Charge_Event,function(data){
            this.updata_charge_data = data;
            if(data.choosen_status!=null && data.has_choosen_id!=null){
                this.getChooseHeroStatus(data.choosen_status, data.has_choosen_id);
            }

            var RoleController = require("role_controller");
            var role_vo = RoleController.getInstance().getRoleVo();
            var totle_str = cc.js.formatStr(Utils.TI18N("已累充: %d"),Math.floor(role_vo.vip_exp*0.1))
            this.remain_charge.string = totle_str;
            
            this.setRedPointTab()
            this.updateData(data);
        }.bind(this));

    },

    // 红点
    setRedPointTab:function(){
        var status_1 = false;
        for(var i = 1;i<=3;i++){
            var get_data = this.model.getFirstBtnStatus(i);
            if(get_data){
                if(get_data == 1){
                    status_1 = true;
				    break;
                }
            }
        }
        Utils.addRedPointToNodeByStatus(this.tab_view[1].btn,status_1)
        var status_2 = false;
        for(var i = 4;i<=6;i++){
            var get_data = this.model.getFirstBtnStatus(i);
            if(get_data){
                if(get_data == 1){
                    status_2 = true;
				    break;
                }
            }
        }
        Utils.addRedPointToNodeByStatus(this.tab_view[2].btn,status_2)
    },

    changeTabView:function(index){
        index = index || 0;
        if(this.cur_index == index)return;
        if(this.tab_index!=null){
            this.tab_index.normal.active = true;
            this.tab_index.select.active = false;
            this.tab_index.titleOutLine.color = new cc.Color(0x71,0x00,0x42,0xff);
            this.tab_index.title_barner.active = false;
        }
        this.tab_index = this.tab_view[index]
        if(this.tab_index!=null){
            this.tab_index.normal.active = false;
            this.tab_index.select.active = true
            this.tab_index.titleOutLine.color = new cc.Color(0xc4,0x5a,0x14,0xff);
            this.tab_index.title_barner.active = true;
        }

        this.cur_index = index;
        var first_data = this.model.getFirstRechargeData(index);
        this.fillItemList(first_data);
        
        if(this.updata_charge_data){
            this.updateData(this.updata_charge_data);
        }
    },

    fillItemList:function(list){
        var scale = 0.8;
        var size = 119 * scale;
        var create_index = 1;
        for(var i=0;i<list.length;i++){
            var object = this.item_list[i+1];
            var num = list[i].item_list.length;
            object.scroll.setContentSize(cc.size(size*num, object.scroll.getContentSize().height));
            for(var k=0;k<num;k++){
                var _x = size * (k+1) - size * 0.5;
                var _y = size * 0.5;
                if(!this.item_reward_list[i+1][k]){
                    this.item_reward_list[i+1][k] = ItemsPool.getInstance().getItem("backpack_item");
                    this.item_reward_list[i+1][k].setParent(object.scroll);
                    this.item_reward_list[i+1][k].setExtendData({scale: scale,is_show_tips:true});
                    this.item_reward_list[i+1][k].show();
                }
                if(this.item_reward_list[i+1][k]){
                    this.item_reward_list[i+1][k].setPosition(_x, _y)
                    this.item_reward_list[i+1][k].setData({bid:list[i].item_list[k][0],num:list[i].item_list[k][1]})
                    cc.log(list[i],"list[i]")
                }

                create_index = create_index + 1
            }
        }
    },

    // 选择英雄按钮
    getChooseHeroStatus:function(status, choose_id){
        for(var i = 1;i<=3;i++){
            if(status == 0){
                this.tab_get_hero[i].get.active = false;
                this.tab_get_hero[i].btn.active = true;
                this.tab_get_hero[i].btn.getComponent(cc.Button).interactable = false;
                this.tab_get_hero[i].btn.getComponent(cc.Button).enableAutoGrayEffect = true;    
                this.tab_get_hero[i].title.color = new cc.Color(0xff,0xff,0xff,0xff);
            }else if(status == 1){
                this.tab_get_hero[i].get.active = false;
                this.tab_get_hero[i].btn.active = true;
                this.tab_get_hero[i].btn.getComponent(cc.Button).interactable = true;
                this.tab_get_hero[i].btn.getComponent(cc.Button).enableAutoGrayEffect = false;    
                this.tab_get_hero[i].title.color = new cc.Color(0x25,0x55,0x05,0xff);                
            }else if(status == 2){
                this.tab_get_hero[i].btn.active = false;
                if(i == choose_id){
                    this.tab_get_hero[i].get.active = true;
                }
            }
        }
    },

    updateData:function(data){
        if(data == null)return;
        var status_list = [[1,2,3],[4,5,6]];
        var charge_list = [];
        for(var i in status_list[this.cur_index-1]){
            var status = this.model.getFirstBtnStatus(status_list[this.cur_index-1][i]);
            charge_list[i] = status;
            this.item_list[parseInt(i)+1].finish_icon.active = status==2;
        }

        this.gift_index = 0 //领取的位置
        var totle = 0;
        this.get_gift_id = 10;
        for(var i in charge_list){
            totle = totle + charge_list[i];
            if(charge_list[i] == 1){
                this.get_gift_id = 1;
			    this.gift_index = i;
            }
        }
        if(totle == 0){
            this.get_gift_id = 0;
		    this.btn_label.string = Utils.TI18N("前往充值");
        }else if(totle == 1 || totle == 3 || totle == 5){
            this.btn_label.string = Utils.TI18N("领取奖励");
        }else if(totle == 2 || totle == 4){
            this.btn_label.string = Utils.TI18N("明日再来");
        }else if(totle == 6){
            this.btn_label.string = Utils.TI18N("领取完毕");
        }
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(index){
        index = index || 1;
        this.changeTabView(index);
        this.ctrl.sender21012();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        for(var i= 1;i<=3;i++){
            for(var j in this.item_reward_list[i]){
                this.item_reward_list[i][j].deleteMe();
            }
            this.item_reward_list[i] = null;
        }

        this.item_reward_list = [];
	    this.ctrl.openNewFirstChargeView(false);
    },
})