// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     冒险布阵界面
// <br/>Create: 2019-05-14 11:34:59
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroConst      = require("hero_const");
var CommonAlert = require("commonalert");
var HeroController = require("hero_controller")
var CommonScrollView = require("common_scrollview");

var Adventure_formWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("adventure", "adventure_form_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Big;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){
        this.five_hero_vo = [];			// 已经选择的伙伴列表
        this.hero_item_list = [];		// 英雄对象
        this.select_list = [];			// 上面选中的实例对象
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.background = this.root_wnd.getChildByName("background");
        this.background.scale = FIT_SCALE;
        var main_container = this.root_wnd.getChildByName("main_container");
        var win_title = main_container.getChildByName("win_title").getComponent(cc.Label);
        win_title.string = Utils.TI18N("冒险出战");
    
        var top_panel = main_container.getChildByName("top_panel");
        this.lay_scrollview = top_panel.getChildByName("lay_scrollview");
        this.no_vedio_image = top_panel.getChildByName("no_vedio_image");
        var no_label = this.no_vedio_image.getChildByName("label").getComponent(cc.Label);
        no_label.string = Utils.TI18N("暂无该类型英雄");
    
        // 阵营
        var camp_node = top_panel.getChildByName("camp_node");
        this.camp_btn_list = [];
        this.camp_btn_list[0] = camp_node.getChildByName("camp_btn0")
        this.camp_btn_list[HeroConst.CampType.eWater] = camp_node.getChildByName("camp_btn1");
        this.camp_btn_list[HeroConst.CampType.eFire]  = camp_node.getChildByName("camp_btn2");
        this.camp_btn_list[HeroConst.CampType.eWind]  = camp_node.getChildByName("camp_btn3");
        this.camp_btn_list[HeroConst.CampType.eLight] = camp_node.getChildByName("camp_btn4");
        this.camp_btn_list[HeroConst.CampType.eDark]  = camp_node.getChildByName("camp_btn5");
        this.img_select = camp_node.getChildByName("img_select");
        var x = this.camp_btn_list[0].x;
        var y = this.camp_btn_list[0].y;
        this.img_select.setPosition(x - 0.5, y + 1);
    
        var bottom_panel = main_container.getChildByName("bottom_panel");
        for(var i=1;i<=5;i++){
            var item = ItemsPool.getInstance().getItem("hero_exhibition_item");;
            item.setRootScale(0.9);
            item.setButtonEffect(false)
            item.setRootPosition(cc.v2(104 + (i-1)* 128, 229));
            item.setParent(bottom_panel);
            item.addTouchCb(function (i) {
                this.onClickHeroItemEnd(i);
            }.bind(this,i));
            item.show();
            this.hero_item_list[i] = item;
        }
    
        var pos_tips = bottom_panel.getChildByName("pos_tips").getComponent(cc.Label);
        pos_tips.string = Utils.TI18N("从列表中选择英雄");
    
        this.fight_btn = bottom_panel.getChildByName("fight_btn");
        this.key_up_btn = bottom_panel.getChildByName("key_up_btn");
    
        var fight_lab = this.fight_btn.getChildByName("label").getComponent(cc.Label);
        fight_lab.string = Utils.TI18N("进入冒险");
        var kep_lab = this.key_up_btn.getChildByName("label").getComponent(cc.Label);
        kep_lab.string = Utils.TI18N("一键布阵");
    
        this.power_click = bottom_panel.getChildByName("power_click");
        
        // 战力
        this.power_val_nd          = this.seekChild("power_val");
        this.fight_label         = this.power_val_nd.getComponent("CusRichText");
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.background, function () {
            this.ctrl.openAdventureFormWindow(false);
        }.bind(this), 2);

        for(var i in this.camp_btn_list){
            Utils.onTouchEnd(this.camp_btn_list[i], function (i) {
                this.onClickBtnShowByIndex(i);
            }.bind(this,i), 1);
        }

        Utils.onTouchEnd(this.key_up_btn, function () {
            this.onClickKeyUpBtn();
        }.bind(this), 1);

        Utils.onTouchEnd(this.fight_btn, function () {
            this.onClickSaveBtn();
        }.bind(this), 1);

    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
        this.onClickBtnShowByIndex(0);
    },

    // 显示根据类型 0表示全部
    onClickBtnShowByIndex:function(select_camp){
        if(this.img_select && this.camp_btn_list[select_camp]){
            var x = this.camp_btn_list[select_camp].x;
            var y = this.camp_btn_list[select_camp].y;
            this.img_select.setPosition(x - 0.5, y + 1)
        }
        this.updateHeroList(select_camp);
    },
    
    // ==============================--
    // desc:创建英雄列表
    // @select_camp:
    // @return 
    // ==============================--
    updateHeroList:function(select_camp){
        var select_camp = select_camp || 0;
        if(select_camp == this.select_camp)return;
        if(!this.list_view){
            var scroll_view_size = this.lay_scrollview.getContentSize();
            var setting = {
                item_class: "hero_exhibition_item",      // 单元类
                start_x: 0,                  // 第一个单元的X起点
                space_x: 8,                    // x方向的间隔
                start_y: 0,                    // 第一个单元的Y起点
                space_y: 10,                   // y方向的间隔
                item_width: 119,               // 单元的尺寸width
                item_height: 119,              // 单元的尺寸height
                row: 5,                        // 行数，作用于水平滚动类型
                col: 5,                         // 列数，作用于垂直滚动类型
                once_num: 5,
                need_dynamic: true
            }
            this.list_view = new CommonScrollView();
            this.list_view.createScroll(this.lay_scrollview, cc.v2(-scroll_view_size.width/2, -scroll_view_size.height/2), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);
        }
        this.select_camp = select_camp;

        var clickback = function(cell){
            this.selectHero(cell);
        }.bind(this);

        if(this.hero_array == null){
            this.hero_array = Utils.deepCopy(HeroController.getInstance().getModel().getAllHeroArray());
        }
        
        var show_list = [];

        for(var j=1;j<=this.hero_array.length;j++){
            var hero_vo = this.hero_array[j-1];
            if(select_camp == 0 || (select_camp == hero_vo.camp_type)){
                show_list.push(hero_vo);
            }
        }
        
        if(show_list.length>0){
            show_list.sort(Utils.tableUpperSorter(["star", "power", "lev", "sort_order"]));
            this.list_view.setData(show_list, clickback, {scale:0.9,from_type:HeroConst.ExhibitionItemType.eHeroSelect, can_click:true});
            this.no_vedio_image.active = false;
        }else{
            this.list_view.setData({});
            this.no_vedio_image.active = true;
        }
        this.show_list = show_list;
    },

    // ==============================--
    // desc:一键上阵
    // @return 
    // ==============================--
    onClickKeyUpBtn:function(){
        var count = 0;
        for(var i in this.five_hero_vo){
            if(this.five_hero_vo[i]){
                count++;
            }
        }
        if(count >= 5){
            message(Utils.TI18N("上阵人数已满"));
            return
        }
        if(this.show_list == null || Utils.next(this.show_list) == null){
            message(Utils.TI18N("当前列表没有可上阵的英雄"));
            return;
        }
        for(var i=1;i<=5;i++){
            if(this.five_hero_vo[i] == null){
                var hero_vo = this.getFreeHero();
                if(hero_vo){
                    hero_vo.is_ui_select = true;
                    this.five_hero_vo[i] = hero_vo;
                    this.hero_item_list[i].setData(hero_vo);
                    //  在上面列表中找到这个对象,并且设置选中
                    this.setTopSelect(hero_vo, i);
                }
            }
        }
        this.updateFightPower();
    },
        
    setTopSelect:function(hero_vo, index){
        if(this.list_view == null)return;
        if(this.select_list[index])return;
        var item_list = this.list_view.getItemList();
        for(var i in item_list){
            var v = item_list[i];
            var data = v.getData();
            if(data && data.partner_id == hero_vo.partner_id){
                data.is_ui_select = hero_vo.is_ui_select;
                v.setSelected(hero_vo.is_ui_select);
                this.select_list[index] = v;
                break;
            }
        }
    },

    // ==============================--
    // desc:获取当前不在阵上的英雄
    // @return 
    // ==============================--
    getFreeHero:function(){
        for(var i in this.show_list){
            var hero_vo = this.show_list[i];
            var is_free = true;
            for(var k in this.five_hero_vo){
                if(this.five_hero_vo[k]){
                    var data = this.five_hero_vo[k];
                    if(hero_vo.partner_id == data.partner_id || hero_vo.bid == data.bid){
                        is_free = false;
                        break;
                    }
                }
            }
            if(is_free == true){
                return hero_vo
            }
        }
    },

    // ==============================--
    // desc:点击上面选中的单位
    // @item:
    // @hero_vo:
    // @return 
    // ==============================--
    selectHero:function(item){
        if(item == null)return;
        var hero_vo = this.show_list[item.tmp_index];
        if(hero_vo == null)return;
        var index = -1;
        var partner_id = hero_vo.partner_id;
        for(var k in this.five_hero_vo){
            if(this.five_hero_vo[k] && partner_id == this.five_hero_vo[k].partner_id){
                index = k;
			    break;
            }
        }
        if(index != -1){//下阵
            hero_vo.is_ui_select = false
            var data = item.getData();
            data.is_ui_select = hero_vo.is_ui_select;
            item.setSelected(hero_vo.is_ui_select);
            this.hero_item_list[index].setData(null);
            this.five_hero_vo[index] = null;
            this.select_list[index] = null;
        }else{
            var count = 0;
            for(var i in this.five_hero_vo){
                if(this.five_hero_vo[i]){
                    if(this.five_hero_vo[i].bid == hero_vo.bid){
                        message(Utils.TI18N("不能同时上阵2个相同英雄"));
                        return;
                    }
                    count = count + 1;
                }
            }
            if(count >= 5){
                message(Utils.TI18N("上阵人数已满"));
                return
            }

            var new_index = 0;
            for(var i=1;i<=5;i++){
                if(this.five_hero_vo[i] == null){
                    new_index = i;
				    break;
                }
            }
            if(new_index == 0){
                message(Utils.TI18N("没有上阵位置"));
                return;
            }
            this.five_hero_vo[new_index] = hero_vo;
            this.hero_item_list[new_index].setData(hero_vo);
            this.select_list[new_index] = item;
            hero_vo.is_ui_select = true;
            var data = item.getData();
            data.is_ui_select = hero_vo.is_ui_select;
            item.setSelected(hero_vo.is_ui_select);
        }
        this.updateFightPower();
    },

    
    // ==============================--
    // desc:计算战斗力
    // @return 
    // ==============================--
    updateFightPower:function(){
        var power = 0;
        for(var k in this.five_hero_vo){
            if(this.five_hero_vo[k]){
                power = power + this.five_hero_vo[k].power;
            }
        }
        this.fight_label.setNum(power);
    },

    // ==============================--
    // desc:点击下面5个英雄
    // @index:
    // @sender:
    // @return 
    // ==============================--
    onClickHeroItemEnd:function(index, sender){
        var hero_vo = this.five_hero_vo[index];
        if(hero_vo == null)return;
        hero_vo.is_ui_select = false ;

        var list = this.list_view.getItemList();
        for(var i in list){
            var item = list[i];
            var data = item.getData();
            if(data.partner_id == hero_vo.partner_id){
                data.is_ui_select = hero_vo.is_ui_select;
                item.setSelected(hero_vo.is_ui_select);
                break;
            }
        }
        this.five_hero_vo[index] = null;
        this.select_list[index] = null;
        this.hero_item_list[index].setData(null);

        this.updateFightPower();
    },

    // ==============================--
    // desc:请求进入冒险
    // @return 
    // ==============================--
    onClickSaveBtn:function(){
        var plist = [];
        var count = 0;
        for(var k in this.five_hero_vo){
            if(this.five_hero_vo[k]){
                plist.push({id:this.five_hero_vo[k].partner_id});
                count = count + 1;
            }
        }
        if(count == 0){
            message(Utils.TI18N("请设置出战英雄"));
            return;
        }
        var hero_array = HeroController.getInstance().getModel().getAllHeroArray();
        var size = hero_array.length;
        if(count < 5 && count < size){//当前还有可上的英雄但是没设置上
            var msg = Utils.TI18N("当前上阵英雄不足5个，是否确认以此阵容进入冒险？");
            CommonAlert.show(msg,Utils.TI18N("确定"),function(plist){
                this.ctrl.requestSetForm(plist);
            }.bind(this,plist), Utils.TI18N("取消"));
        }else{
            this.ctrl.requestSetForm(plist)
        }
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.list_view) {
            this.list_view.deleteMe();
            this.list_view = null;
        }

        if(this.hero_item_list){
            for(var i in this.hero_item_list){
                this.hero_item_list[i].deleteMe();
            }
            this.hero_item_list = null;
        }

        this.hero_array = null;
        this.ctrl.openAdventureFormWindow(false);
    },
})