// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-05-09 10:03:33
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var AdventureActivityConst= require("adventureactivity_const");
var MainuiController = require("mainui_controller");
var AdventureActivityController = require("adventureactivity_controller");
var AdventureController = require("adventure_controller");

var Adventureactivity_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventureactivity", "adventureactivity_item");
        this.ctrl = AdventureActivityController.getInstance();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.main_container = this.root_wnd.getChildByName("main_container");
        this.item_bg_node = this.main_container.getChildByName("item_bg");
        this.item_bg = this.item_bg_node.getComponent(cc.Sprite);
        this.open_desc = this.main_container.getChildByName("open_desc").getComponent(cc.Label);
        this.open_desc.node.active = false;
        this.open_desc2 = this.main_container.getChildByName("open_desc_2").getComponent(cc.Label);
        this.open_desc2.node.active = false;

        this.join_bg = this.main_container.getChildByName("join_bg");
        this.join_desc = this.main_container.getChildByName("join_desc").getComponent(cc.Label);
        this.join_desc.string = "";
        this.lock_layer = this.main_container.getChildByName("lock_layer");
        this.award_list = this.main_container.getChildByName("award_list");
        this.award_list.active = false;
        var scroll_view_size = this.award_list.getContentSize();
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 10,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 120*0.7,               // 单元的尺寸width
            item_height: 120*0.7,              // 单元的尺寸height
            row: 1,                        // 行数，作用于水平滚动类型
            col: 0,                         // 列数，作用于垂直滚动类型
            need_dynamic: true,
            scale: 0.7
        }
        var CommonScrollView = require("common_scrollview");
        this.award_scrollview = new CommonScrollView();
        this.award_scrollview .createScroll(this.award_list, cc.v2(0,0) , ScrollViewDir.horizontal, ScrollViewStartPos.top, scroll_view_size, setting);
        // this.award_scrollview:setSwallowTouches(false)

        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        //当用户点击的时候记录鼠标点击状态
        this.main_container.on(cc.Node.EventType.TOUCH_START, function(event){
            var touches = event.getTouches();
            this.touch_began = touches[0].getDelta();
        },this);

        //当鼠标抬起的时候恢复状态
        this.main_container.on(cc.Node.EventType.TOUCH_END, function(event){
            var touches = event.getTouches();
            this.touch_end = touches[0].getDelta();
            var is_click = true;
            if(this.touch_began!=null){
                is_click = Math.abs(this.touch_end.x - this.touch_began.x) <= 20 && Math.abs(this.touch_end.y - this.touch_began.y) <= 20;
            }
            if(is_click){
                if(this.data){
                    var is_open = MainuiController.getInstance().checkIsOpenByActivate(this.data.activate);
                    if(is_open == true){
                        this.ctrl.onClickGotoAdvenTureAcivity(this.data.retrue_id);
                    }else{
                        if(this.data.id == AdventureActivityConst.Ground_Type.heaven){
                            var str = cc.js.formatStr(Utils.TI18N("%s，角色%s可进入"),this.data.desc2,this.data.desc);
                            message(str);
                        }else{
                            message(this.data.desc)
                        }
                    }
                }
            }
        },this);
    },

    setData:function(data){
        if(!data)return;
        this.data = data;
        if(this.root_wnd){
            this.updateInfo();
        }
    },
    
    updateInfo:function(){
        // 背景
        var res = PathTool.getBigBg(cc.js.formatStr("txt_cn_adventrueactivity_%d", this.data.res_id),null,"adventrueactivity");
        this.loadRes(res, (function(resObject){
            this.item_bg.spriteFrame = resObject;
        }).bind(this));
        this.join_desc.string = this.data.item_desc;

        var size = this.join_desc.node.getContentSize();
        if(size.width < 250){
            size.width = 250;
        }
        this.join_bg.setContentSize(cc.size(size.width+210, size.height));
        // 奖励数据
        var item_list = [];
        for(var i in this.data.award){
            var v = this.data.award[i];
            var vo = {};
            if(vo){
                vo.bid = v[0];
                vo.num = v[1];
                item_list.push(vo);
            }
        }
        this.award_scrollview.setData(item_list);
        this.award_scrollview.addEndCallBack(function(){
            var list = this.award_scrollview.getItemList();
            // var book_id_cfg = Config.dungeon_heaven_data.data_const["heaven_handbook"];
            for(var k in list){
                var iData = list[k].getData();
                var is_special;
                // if(this.data.id == AdventureActivityConst.Ground_Type.heaven && book_id_cfg && iData){
                //     for(var n in book_id_cfg.val){
                //         if(book_id_cfg.val[n] == iData.id){
                //             is_special = 2;
                //             break;
                //         }
                //     }
                // }
                list[k].setDefaultTip(true, null, null, is_special);
            }
        }.bind(this));

        var is_open = MainuiController.getInstance().checkIsOpenByActivate(this.data.activate);
        if(is_open == true){
            this.lock_layer.active = false;
            this.open_desc.node.active = false;
            this.award_list.active = true;
        }else{
            this.lock_layer.active = true;
            this.open_desc.string = this.data.desc;
            this.open_desc.node.active = true;
            if(this.data.desc != ""){
                this.open_desc2.string = this.data.desc2;
                this.open_desc2.node.active = true;
            }
            this.award_list.active = false;
        }
        this.updateRedStatus();
    },

    //  红点刷新
    updateRedStatus:function(){
        if(this.data){
            var red_status = false;
            if(this.data.id == AdventureActivityConst.Ground_Type.adventure){ //冒险
                red_status = AdventureController.getInstance().getModel().getAdventureRedPoint();
            }else if(this.data.id == AdventureActivityConst.Ground_Type.element){ //元素
                // red_status = ElementController:getInstance():getModel():checkElementRedStatus();
            }else if(this.data.id == AdventureActivityConst.Ground_Type.heaven){ //天界副本
                // red_status = HeavenController:getInstance():getModel():getHeavenRedStatus();
            }
            var is_open = MainuiController.getInstance().checkIsOpenByActivate(this.data.activate);
            if(is_open == false){
                red_status = false;
            }
            Utils.addRedPointToNodeByStatus(this.main_container, red_status, this.main_container.width/2, this.main_container.height/2, 99, 2)
        }
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.award_scrollview){
            this.award_scrollview.deleteMe();
            this.award_scrollview = null;
        }
    },
})