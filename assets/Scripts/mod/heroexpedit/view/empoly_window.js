// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-11 14:17:19
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroController = require("hero_controller");
var CommonScrollView = require("common_scrollview");
var EmpolyPanelItem = require("empoly_item_panel");
var HeroExpeditEvent = require("heroexpedit_event");

var EmpolyWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("heroexpedit", "empoly_panel");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.cur_index = null;
        this.reward_list = []
        this.tab_list = []
        this.employ_data = [] //雇佣
        this.send_data = [] //派遣
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container");
    
        var text_7 = this.main_container.getChildByName("Image_6").getChildByName("Text_7").getComponent(cc.Label);
        text_7.string = Utils.TI18N("好友助阵");
        this.text_empoly_num = this.main_container.getChildByName("Text_2").getComponent(cc.Label);
        this.text_empoly_num.string = Utils.TI18N("今日已雇佣： ");

        var tab_container = this.main_container.getChildByName("tab_container");
        var tab_name = [Utils.TI18N("支援我的"),Utils.TI18N("我的支援")]
        for(var i = 1;i<3;i++){
            var tab = {};
            tab.btn = tab_container.getChildByName("btn_"+i);
            tab.normal = tab.btn.getChildByName("normal")
            tab.select = tab.btn.getChildByName("select")
            tab.select.active = false;
            tab.title = tab.btn.getChildByName("title").getComponent(cc.Label);
            tab.titleLine = tab.btn.getChildByName("title").getComponent(cc.LabelOutline);
            tab.title.string = tab_name[i-1];
            tab.title.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            tab.index = i
            this.tab_list[i] = tab
        }

        this.good_cons = this.main_container.getChildByName("good_cons")

        this.empty_bg = Utils.createImage(this.good_cons,null,this.good_cons.width*0.5, this.good_cons.height*0.5,cc.v2(0.5, 0.5));
        var res = PathTool.getBigBg("bigbg_3");
        this.loadRes(res, function (sf_obj) {
            this.empty_bg.spriteFrame = sf_obj;
        }.bind(this))
        this.empty_label = Utils.createLabel(24,new cc.Color(0x3f,0x32,0x34,0xff),null,this.empty_bg.node.width*0.5,-75,"",this.empty_bg.node,0,cc.v2(0.5,0.5));
        this.empty_label.string = Utils.TI18N("暂无可雇佣英雄，快去加好友吧");
        this.empty_bg.node.active = false;

        this.hero_list = HeroController.getInstance().getModel().getExpeditHeroData();
        this.hero_list = this.hero_list || [];

        var scroll_view_size = this.good_cons.getContentSize();
        var setting = {
            item_class: EmpolyPanelItem,      // 单元类
            start_x: 2,                  // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 5,                    // y方向的间隔
            item_width: 631,               // 单元的尺寸width
            item_height: 149,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1,                         // 列数，作用于垂直滚动类型
            need_dynamic: true
        }
        this.itemScrollview = new CommonScrollView();
        this.itemScrollview.createScroll(this.good_cons, cc.v2(0,0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);

    },

    isVisibleRedPoint:function(){
        var status = this.model.getHeroSendRedPoint();
	    Utils.addRedPointToNodeByStatus(this.tab_list[2].btn, status,null,11)
    },


    tabChangeView:function(index){
        index = index || 1;
        if(this.cur_index == index)return;
        if(this.cur_tab!=null){
            this.cur_tab.select.active = false;
            this.cur_tab.title.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            this.cur_tab.titleLine.color = new cc.Color(0x00,0x00,0x00,0xff);
        }
        this.cur_index = index;
        this.cur_tab = this.tab_list[this.cur_index];
        if(this.cur_tab!=null){
            this.cur_tab.select.active = true;
            this.cur_tab.title.node.color = new cc.Color(0xff, 0xff, 0xff, 0xff);
            this.cur_tab.titleLine.color = new cc.Color(0x00,0x00,0x00,0xff);
        }
        if(index == 1){
            var employData = this.model.getPartnerMessage() //伙伴信息
            var num = employData.length;
            this.text_empoly_num.node.active = true;
            var str = cc.js.formatStr(Utils.TI18N("今日已雇佣： %d/%d"),num,3);
            this.text_empoly_num.string = str;
            if(this.employ_data && Utils.next(this.employ_data) != null){
                var tab = {}
                tab.num = num
                tab.index = 1
                this.itemScrollview.setData(this.employ_data,null,tab)
                this.empty_bg.node.active = false;
            }else{
                this.itemScrollview.setData([]);
                this.empty_bg.node.active = true;
            }
        }else if(index == 2){
            this.text_empoly_num.node.active = false;
            this.empty_bg.node.active = false;
            if(this.send_data && Utils.next(this.send_data) != null){
                var num = this.send_data.length;
                var tab = {};
                tab.num = num;
                tab.index = 2;
                this.hero_list.sort(Utils.tableUpperSorter(["power"]));
                if(Utils.next(this.send_data) !=null){
                    var temp = [];
                    for(var i = this.hero_list.length-1; i>=0;i--){
                        if(this.hero_list[i].id == this.send_data[0].id){
                            temp = this.hero_list[i];
                            this.hero_list.splice(i,1);
                        }
                    }
                    if(temp && Utils.next(temp) != null){
                        temp.isHelp = true;
                        this.hero_list.unshift(temp);
                        tab.num = num;
                    }else{
                        tab.num = 0;
                    }
                }
                
                this.itemScrollview.setData(this.hero_list,null,tab);
            }else{
                this.ctrl.sender24405();
            }
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
         // 支援我的
        this.addGlobalEvent(HeroExpeditEvent.EmployEvent, function() {
            var employData = this.model.getPartnerMessage() //已经借用的
            var employPartner = this.model.getEmployPartner() //可以选择的伙伴
            employPartner.sort(function(a,b){
                return a.power > b.power;
            })
            for(var i = employPartner.length-1; i>=0;i--){
                for(var j = employData.length-1; j>=0;j--){
                    if(employPartner[i].bid && employData[j].bid && employPartner[i].id && employData[j].id && employPartner[i].srv_id && employData[j].srv_id && employPartner[i].rid && employData[j].rid){
                        if(employPartner[i].bid == employData[j].bid && employPartner[i].id == employData[j].id && 
                            employPartner[i].srv_id == employData[j].srv_id && employPartner[i].rid == employData[j].rid){
                                employPartner.shift();
                        }
                    }
                }
            }
            var num = employData.length;
            if(employPartner.length == 0 && num == 0){
                this.empty_bg.node.active = true;
            }else{
                this.empty_bg.node.active = false;
            }
            for(var k in employData){
                employData[k].isHelp = true;
                employPartner.unshift(employData[k]);
            }
            this.text_empoly_num.node.active = true;
            var str = cc.js.formatStr(Utils.TI18N("今日已雇佣： %d/%d"),num,3)
            this.text_empoly_num.string = str;
            this.employ_data = employPartner || [];

            var tab = {}
            tab.num = num
            tab.index = 1
            this.itemScrollview.setData(this.employ_data,null,tab)
        }.bind(this))        

        // 我的支援
        this.addGlobalEvent(HeroExpeditEvent.EmploySendEvent, function(data) {
            this.isVisibleRedPoint();
            this.send_data = data.list;
            this.text_empoly_num.node.active =false;
        
            var num = this.send_data.length
            var tab = {}
            tab.num = num;
            tab.index = 2;
            this.hero_list.sort(Utils.tableUpperSorter(["power"]));
            if(Utils.next(this.send_data)!= null){
                var temp = [];
                for(var i = this.hero_list.length-1; i>=0;i--){
                    if(this.hero_list[i].id == data.list[0].id){
                        temp = this.hero_list[i]
                        this.hero_list.splice(i,1);
                    }
                }
                if(temp && Utils.next(temp)!=null){
                    temp.isHelp = true;
                    this.hero_list.unshift(temp);
                    tab.num = num;
                }else{
                    tab.num = 0;
                }
            }
            
            this.itemScrollview.setData(this.hero_list,null,tab)
        }.bind(this))        

        // 我的支援成功返回
        this.addGlobalEvent(HeroExpeditEvent.EmploySendEvent_Success, function(hero_id) {
            var num = this.send_data.length;
            var tab = {}
            tab.num = num
            tab.index = 2
            this.hero_list.sort(Utils.tableUpperSorter(["power"]));
            if(Utils.next(this.send_data)!=null){
                var temp = {};
                for(var i = this.hero_list.length-1; i>=0;i--){
                    if(this.hero_list[i].id == hero_id){
                        temp = this.hero_list[i];
                        this.hero_list.splice(i,1);
                    }
                }
                temp.isHelp = true;
                this.hero_list.unshift(temp);
            }
            
            this.itemScrollview.setData(this.hero_list,null,tab)
        }.bind(this))   

        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openEmpolyPanelView(false);
        }.bind(this), 2);

        for(var i in this.tab_list){
            Utils.onTouchEnd(this.tab_list[i].btn, function (v) {
                this.tabChangeView(v.index);
            }.bind(this,this.tab_list[i]), ButtonSound.Tab);
        }

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.tabChangeView(1);
        this.isVisibleRedPoint();
        this.ctrl.sender24406();
        this.ctrl.sender24404();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.itemScrollview){
            this.itemScrollview.deleteMe();
            this.itemScrollview = null;
        }

        this.cur_index = null;
        this.reward_list = null;
        this.tab_list = null;
        this.employ_data = null;
        this.send_data = null;
        this.hero_list = null;

	    this.ctrl.openEmpolyPanelView(false);
    },
})