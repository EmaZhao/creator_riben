// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     七天登录活动面板
// <br/>Create: 2019-04-17 14:47:08
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var ActionEvent = require("action_event");

var Action_seven_loginWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("action", "action_seven_login_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.day_list = [];
        this.cur_select = null;
        this.cur_index = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        if(window.IS_PC){
          this.mask_nd = this.seekChild("mask");
          this.mask_nd.setContentSize(2200,1280);
        }
        this.main_panel = this.root_wnd.getChildByName("main_panel");
        this.main_panel.scale = 0;
        this.main_panel.runAction(cc.scaleTo(0.2,1,1));
        this.bigbackground = this.main_panel.getChildByName("background");
        this.bigbackground.scale = FIT_SCALE*1;
        this.background = this.bigbackground.getComponent(cc.Sprite);
        // this.loadRes(PathTool.getBigBg("action_bigbg_2","jpg","action"), (function(resObject){
        //     this.background.spriteFrame = resObject;
        // }).bind(this));
        this.container = this.main_panel.getChildByName("container");
        this.close_btn = this.main_panel.getChildByName("close_btn");
        this.close_btn.active = false;
        if(USE_SDK == true && PLATFORM_TYPR == "QQ_SDK"){
            this.close_btn.x = -312;
        }else{
            this.close_btn.x = 312;
        }

        this.model_icon_node = this.main_panel.getChildByName("model_icon");
        this.model_icon_node.scale = 1;

        this.model_icon = this.model_icon_node.getComponent(cc.Sprite);
        this.title_node = this.main_panel.getChildByName("title");
        this.title_node.scale = 1;
        this.title = this.title_node.getComponent(cc.Sprite);
    
        this.btn = this.container.getChildByName("btn");
        this.btn.name = "get_btn";
        this.btn_label = this.btn.getChildByName("Label").getComponent(cc.Label);
        this.btn_label.string = Utils.TI18N("领取");
        this.btn_out_line = this.btn.getChildByName("Label").getComponent(cc.LabelOutline);
    
        this.day_label = this.container.getChildByName("day_label").getComponent(cc.Label);
        this.day_label.node.zIndex = 21;
        this.day_bg = this.container.getChildByName("day_bg");
        this.day_bg.zIndex = 20;
    
        this.seven_con = this.container.getChildByName("seven_con");
        
        var LoginItem = require("action_seven_login_item_panel");
        for(var i = 1;i<=7;i++){
            var day = this.seven_con.getChildByName("day"+i);
            var item = new LoginItem();
            item.setParent(day);
            item.setData(i,1);
            item.show();
            this.day_list[i] = item;
            // --this.day_list[i].status = 1 --不可领取
            item.addCallBack(function (i){
                this.selectByIndex(i);
            }.bind(this,i));
        }

        this.goods_con = this.container.getChildByName("goods_con");

        var scroll_view_size = this.goods_con.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 10,                  // 第一个单元的X起点
            space_x: 15,                    // x方向的间隔
            start_y: 2,                    // 第一个单元的Y起点
            space_y: 4,                   // y方向的间隔
            item_width: 120,               // 单元的尺寸width
            item_height: 120,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                         // 列数，作用于垂直滚动类型
            // --scale = 0.85
        }
        this.item_scrollview = new CommonScrollView(); 
        this.item_scrollview.createScroll(this.goods_con, cc.v2(-this.goods_con.getContentSize().width/2,2) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);

        // --this:selectByIndex(1)

        this.ctrl.cs21100();
    },

    selectByIndex:function( index, force ){
        if(this.cur_index == index && !force)return;
        this.index = index;
        if(this.cur_select != null){
            this.cur_select.setSelect(false);
        }
        this.cur_index = index;
        this.cur_select = this.day_list[index];
        this.cur_select.setSelect(true);

        var res = PathTool.getBigBg("action_seven_bg1",null,"action");
	    var res1 = PathTool.getBigBg("txt_cn_action_seven_login_title1",null,"action");
        if(index <= 2){
            var res = PathTool.getBigBg("action_seven_bg1",null,"action");
            var res1 = PathTool.getBigBg("txt_cn_action_seven_login_title1",null,"action");
        }else{
            var res = PathTool.getBigBg("action_seven_bg2",null,"action");
            var res1 = PathTool.getBigBg("txt_cn_action_seven_login_title2",null,"action");
        }
        this.loadRes(res, (function(resObject){
            this.model_icon.spriteFrame = resObject;
        }).bind(this));

        this.loadRes(res1, (function(resObject){
            this.title.spriteFrame = resObject;
        }).bind(this));

        var StringUtil = require("string_util");
        this.day_label.string = Utils.TI18N("第")+StringUtil.numToChinese(index)+Utils.TI18N("天");

	    var list = [];
        var spec_reward = Config.login_days_data.data_day[index].spec_reward;
        var effect_list = [];

        if(spec_reward){
            for(var i in spec_reward){
                if(!effect_list[spec_reward[i]]){
                    effect_list[spec_reward[i]] = {effect_id: spec_reward[i]};
                }
            }
        }

        for(var i in Config.login_days_data.data_day[index].rewards){
            var v = Config.login_days_data.data_day[index].rewards[i];
            var vo = {};
            vo = Utils.deepCopy(Utils.getItemConfig(v[0]));
            if(vo){
                vo.bid = vo.id;
                vo.show_effect = effect_list[v[0]];
			    vo.num = v[1];
                list.push(vo);
            }
        }

        if(this.day_list[this.index].status == 2){//可领取
            this.btn.getComponent(cc.Button).interactable = true;
            this.btn.getComponent(cc.Button).enableAutoGrayEffect = false;
            if(this.btn_out_line!=null){
                this.btn_out_line.color = new cc.Color(0xc4, 0x5a, 0x14, 0xff);
                this.btn_out_line.width = 2;
            }
        }else{
            this.btn.getComponent(cc.Button).interactable = false;
            this.btn.getComponent(cc.Button).enableAutoGrayEffect = true;
            if(this.btn_out_line!=null){
                this.btn_out_line.width = 0;
            }
        }

        this.item_scrollview.setData(list);
        this.item_scrollview.addEndCallBack(function () {
            var list = this.item_scrollview.getItemList();
            for(var i in list){
                var v = list[i];
                v.setDefaultTip();
                if(v.data && v.data.show_effect){
                    if(v.data.quality >= 4){
                        v.showItemEffect(true, 263, PlayerAction.action_1, true, 1.1);
                    }else{
                        v.showItemEffect(true, 263, PlayerAction.action_2, true, 1.1);
                    }
                }else{
                    v.showItemEffect(false);
                }
            }
        }.bind(this))

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.main_panel, function () {
            var b = false;
            for(let index in this.day_list){
              let info = this.day_list[index];
              if(info.status == 2){
                this.ctrl.cs21101(index);
                b = true;
              }
            }
            if(!b){
              var LoginPopupManager = require("LoginPopupManager")
              if(LoginPopupManager.getInstance().getIsPopupStatus()){
                gcore.GlobalEvent.fire(EventId.POPUP_DORUN);
              }
            }
            this.ctrl.openSevenLoginWin(false);
        }.bind(this), 2);

        Utils.onTouchEnd(this.btn, function () {
            if(this.day_list[this.index]){
                if(this.day_list[this.index].status == 2){//可领取
                    // this.ctrl.cs21101(this.index);
                    for(let index in this.day_list){//全领取
                      let info = this.day_list[index];
                      if(info.status == 2){
                        this.ctrl.cs21101(index);
                      }
                    }
                    this.btn.getComponent(cc.Button).interactable = true;
                    this.btn.getComponent(cc.Button).enableAutoGrayEffect = false;
                    this.btn_out_line.color = new cc.Color(0xc4, 0x5a, 0x14, 0xff);
                    this.btn_out_line.width = 2;
                }else if(this.day_list[this.index].status == 3){
                    this.btn.getComponent(cc.Button).interactable = false;
                    this.btn.getComponent(cc.Button).enableAutoGrayEffect = true;
                    this.btn_out_line.width = 0;
                    message(Utils.TI18N("已经领取过啦"));
                }else if(this.day_list[this.index].status == 1){
                    this.btn.getComponent(cc.Button).interactable = false;
                    this.btn.getComponent(cc.Button).enableAutoGrayEffect = true;
                    this.btn_out_line.width = 0;
                    message(Utils.TI18N("未到天数"));
                }
            }
        }.bind(this), 1);

        this.addGlobalEvent(ActionEvent.UPDATE_SEVEN_LOGIN_STATUS,function(data){
            if(data.status_list){
                for(var i in data.status_list){
                    this.day_list[data.status_list[i].day].setStatus(data.status_list[i].status);
                }
                this.now_day = Math.min(data.status_list.length + 1,7);
				var target = this.getMinGetDay(data.status_list);
				this.selectByIndex(target, true);
            }
        }.bind(this));

        // 领取成功
        this.addGlobalEvent(ActionEvent.UPDATE_SEVEN_LOGIN_REWARDS,function(data){
            // -- if data.day < 7 then 
			// -- 	this:selectByIndex(data.day+1)
			// -- else
			// -- 	this:selectByIndex(7)
			// -- end
        }.bind(this));

    },

    // 最小可领取天数
    getMinGetDay:function( data ){
        var day = this.now_day;
        for(var i in data){
            if(data[i].day == 1 && data[i].status == 2){
                return 1;
            }else{
                if(data[i].day<day && data[i].status == 2){
                    day = data[i].day;
                }
            }
        }
        return day;
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
        }
        this.item_scrollview = null;

        for(var i in this.day_list){
            if(this.day_list[i]){
                this.day_list[i].deleteMe();
            }
        }

        this.day_list = null;
        this.ctrl.openSevenLoginWin(false);
    },
})