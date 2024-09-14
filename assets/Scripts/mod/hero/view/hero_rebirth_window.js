// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var HeroEvent = require("hero_event");
var CommonAlert = require("commonalert")
var HeroRebirthWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("hero", "hero_rebirth_window");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        this.confirm_btn_nd = this.seekChild("confirm_btn");
        this.close_btn_nd = this.seekChild("close_btn");
        this.des_txt_nd = this.seekChild("des_txt");
        this.tips_txt_nd = this.seekChild("tips_txt");
        this.list_view_nd   = this.seekChild("list_view");
        this.win_title_nd = this.seekChild("win_title");
        this.hero_icon_nd = this.seekChild("hero_icon");

        this.confirm_btn_nd.getChildByName("label").getComponent(cc.Label).string = Utils.TI18N("返還アイテム");

        this.win_title_nd.getComponent(cc.Label).string = Utils.TI18N("返還アイテム一覧")
        this.tips_txt_nd.getComponent(cc.RichText).string = cc.js.formatStr(Utils.TI18N("今回の回帰消費:<img src='%s'/>%s"),3, 50);
        this.loadRes(PathTool.getItemRes(3), (function(resObject) {
            this.tips_txt_nd.getComponent(cc.RichText).addSpriteFrame(resObject);
        }).bind(this));
        this.initListView();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.close_btn_nd,()=>{
            this.onClickCloseBtn();
        },1)
        Utils.onTouchEnd(this.confirm_btn_nd,()=>{
            this.onClickConfirBtn();
        },1)

        this.addGlobalEvent(HeroEvent.Hero_Reset_Rebirth_Data,(list)=>{//重生材料
           this.setItemsData(list);
        })

        this.addGlobalEvent(HeroEvent.Hero_Reset_Rebirth,()=>{//重生后脱掉装备
            // if(this.hero_vo.eqm_list && Utils.next(this.hero_vo.eqm_list)){
            //     this.ctrl.sender11011(this.hero_vo.partner_id, 0);
            // }
            // for(let index in this.hero_vo.artifact_list){
            //     let info = this.hero_vo.artifact_list[index];
            //     this.ctrl.sender11030(this.hero_vo.partner_id,info.artifact_pos,info.id,0);
            // }
            this.ctrl.sender11000();
            this.onClickCloseBtn();//关闭界面
        })
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(params){
       
        if(params.hero_vo){
            this.hero_vo = params.hero_vo;
        }
        this.ctrl.sender11065([{partner_id:this.hero_vo.partner_id}]);//请求重生返还材料
        this.des_txt_nd.getComponent(cc.RichText).string =Utils.TI18N("英雄を回帰するとその英雄をLv.1にリセットできます（★の数はリセットされません）。<color=#329119>ランクアップ、Lv.UP</color>耗材で使用した素材の<color=#329119>100%</color>分が返還されます。")
        let item_node = ItemsPool.getInstance().getItem("backpack_item")
        item_node.show();
        item_node.setParent(this.hero_icon_nd)
        item_node.setScale(0.9)
        item_node.setData({ id: this.hero_vo.item_id})
        item_node.is_show_tips = false;
        // this.setItemsData();
    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
    },


    initListView: function() {
        var CommonScrollView = require("common_scrollview");
        var scroll_view_size = cc.size(this.list_view_nd.width, this.list_view_nd.height)
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 0,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                    // y方向的间隔
            item_width: 150,               // 单元的尺寸width
            item_height: 136,              // 单元的尺寸height
            col: 4,                        // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.list_view_nd, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5))
    },

    onClickConfirBtn: function() {
        this.onHeroComfirm()
    },

    onClickCloseBtn: function() {
        this.ctrl.openHeroRebirthWidow(false);
    },

    setItemsData: function(item_list) {
        var cur_list = [];
        for (var item_i in item_list) {
            var item_data = {};
            item_data.bid = item_list[item_i].id;
            item_data.num = item_list[item_i].num;
            cur_list.push(item_data);
        }
        this.item_scrollview.setData(cur_list, null, {is_show_tips: false, is_other: false});
    },
    onHeroComfirm(){
        var icon_id = 3;
        var num = 50;
        let str = cc.js.formatStr(Utils.TI18N("聖竜石<img src='%s'/>%sを消費して英雄を回帰しますか？"),icon_id, num);
        var good_path = PathTool.getIconPath("item", "3");
        var frame_arrays = [];
        frame_arrays.push(good_path);
        let other_args = {}
        other_args.title = Utils.TI18N("提示");
        other_args.resArr =  frame_arrays;
        let alert = CommonAlert.show(str,Utils.TI18N("确定"),function(){
            var role_vo = require("role_controller").getInstance().getRoleVo();
            if(role_vo.getTotalGold()<50){
                message(Utils.TI18N("聖竜石不足"));
                return;
            }
            this.ctrl.sender11066([{partner_id:this.hero_vo.partner_id}])//请求消耗并且重生该英雄
        }.bind(this), Utils.TI18N("取消"),null,null,null,other_args)
    },
})