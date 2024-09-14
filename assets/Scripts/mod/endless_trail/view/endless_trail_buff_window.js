// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-06 10:12:20
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var HeroConst = require("hero_const");
var EndlessTrailBuffItem = require("endless_trail_buff_item_panel");
var HeroVo = require("hero_vo");


var Endless_trail_buffWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_buff_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Tips;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.is_full_screen = false
        this.partner_list = [];
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        this.main_container = this.root_wnd.getChildByName("main_container")
        this.main_panel = this.main_container.getChildByName("main_panel")
        this.win_title = this.main_panel.getChildByName("win_title").getComponent(cc.Label);
        this.win_title.string = Utils.TI18N("增益选择");
        this.desc_label = this.main_panel.getChildByName("desc_label").getComponent(cc.Label);
        this.desc_label.string = Utils.TI18N("必须选择一个Buff才能继续挑战");
    
        this.buff_container = this.main_panel.getChildByName("buff_container")
        this.partner_container = this.main_panel.getChildByName("partner_container")
        this.form_icon = this.partner_container.getChildByName("form_icon").getComponent(cc.Sprite);
        this.form_label = this.partner_container.getChildByName("form_label").getComponent(cc.Label);
        this.desc_label_1 = this.partner_container.getChildByName("desc_label_1").getComponent(cc.Label);
        this.desc_label_1.string = Utils.TI18N("我的阵容");
        // --this.close_btn = this.main_panel:getChildByName("close_btn")
        this.cur_num = Utils.createRichLabel(24, new cc.Color(0x68,0x45,0x2a, 0xff), cc.v2(0.5, 0.5), cc.v2(170,772-this.main_container.height/2),30,500);
        this.main_container.addChild(this.cur_num.node);

     
        this.buff_scroll_size = this.buff_container.getContentSize();
        var setting = {
            item_class: EndlessTrailBuffItem,      // 单元类
            start_x: 0,                  // 第一个单元的X起点
            space_x: 2,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 604,               // 单元的尺寸width
            item_height: 149,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 1                         // 列数，作用于垂直滚动类型
        }
        this.buff_scrollview = new CommonScrollView();
        this.buff_scrollview.createScroll(this.buff_container, cc.v2(0,0), ScrollViewDir.vertical, ScrollViewStartPos.top, this.buff_scroll_size, setting);

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(data){
        if(data){
            this.buff_data = data;
            this.cur_num.string = cc.js.formatStr(Utils.TI18N("即将挑战第<color=#249003>%s</color>关"), data.round);
            var form_res = PathTool.getUIIconPath("form", "form_icon_" + data.formation_type);
            this.loadRes(form_res, function (sf_obj) {
                this.form_icon.spriteFrame = sf_obj;
            }.bind(this))
            if(Config.formation_data.data_form_data){
                var name = Config.formation_data.data_form_data[data.formation_type].name
                this.form_label.string = name+" Lv."+data.formation_lev;
            }
            this.updateBuffData(data)
            this.updatePartnerData(data)
            let time = data.end_time -gcore.SmartSocket.getTime()
            if(time <= 0){
                time = 0
            }
            if(time > 30){
                time = 30
            }
            this.desc_label.string = cc.js.formatStr(Utils.TI18N("必须选择1个Buff才能继续战斗，%d秒后自动选择"),time);
            this.timer_hander = this.startUpdate(30,function(){
                if(time > 0){
                    time--
                }
                this.desc_label.string = cc.js.formatStr(Utils.TI18N("必须选择1个Buff才能继续战斗，%d秒后自动选择"),time);
                if(time == 0){
                    this.stopUpdate(this.timer_hander);
                    this.timer_hander = null;
                }
            }.bind(this),1000)
        }
    },

    // 增益buff选择
    updateBuffData:function(data){
        if(data){
            data.list.sort(function(a,b){
                return a.buff_id - b.buff_id
            })
            this.buff_scrollview.setData(data.list);
        }
    },

    updatePartnerData:function(data){
        if(data){
            var pos_info = data.partner;
            if(pos_info){
                var temp = [];
                for(var i in pos_info){
                    pos_info[i].rare_type = pos_info[i].quality
                    var vo = new HeroVo();
                    vo.updateHeroVo(pos_info[i]);
                    temp.push(vo);
                }
                for(var j in temp){
                    if(!this.partner_list[j]){
                        var item = ItemsPool.getInstance().getItem("hero_exhibition_item");;//can_click = true
                        item.setRootScale(0.8);
                        item.setParent(this.partner_container);
                        item.show();
                        this.partner_list[j] = item;
                    }
                    var temp_item = this.partner_list[j];
                    if(temp_item){
                        temp_item.setExtendData({from_type:HeroConst.ExhibitionItemType.eEndLessHero})
                        temp_item.setData(temp[j],true)
                        var width = 120 * 0.8 
                        temp_item.setPosition(width * 0.5 + 16 + (width + 25)* j, this.partner_container.getContentSize().height / 2 - 10);
                    }
                }
            }
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.timer_hander) {
            this.stopUpdate(this.timer_hander);
            this.timer_hander = null;
        }
        if(this.partner_list){
            for(var i in this.partner_list){
                if(this.partner_list[i].onDelete){
                    this.partner_list[i].deleteMe();
                }
            }
            this.partner_list = null;
        }
        if(this.buff_scrollview){
            this.buff_scrollview.deleteMe();
            this.buff_scrollview = null;
        }
        this.ctrl.openEndlessBuffView(false)
    },
    getData(  ){
        return this.buff_data
    },

})