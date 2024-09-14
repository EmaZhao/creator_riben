// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-16 10:27:36
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var TimeTool = require("timetool");
var HeroVo = require("hero_vo");
var CommonScrollView = require("common_scrollview");

var Primus_challenge_record_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("primus", "primus_challenge_record_item");
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        this.size = cc.size(616,218);
    
        this.container = this.root_wnd.getChildByName("container");
    
        this.name_label = this.container.getChildByName("name_label").getComponent(cc.Label);
        this.time_label = this.container.getChildByName("time_label").getComponent(cc.Label);
        this.attk_label = this.container.getChildByName("attk_label").getComponent(cc.Label);
        this.magic_label = this.container.getChildByName("magic_label").getComponent(cc.Label);
        var result_node = this.container.getChildByName("result_node")
        this.result_label = Utils.createRichLabel(22, new cc.Color(0xff,0xff,0xff, 0xff), cc.v2(1, 0.5), cc.v2(0,0),30);
        this.result_label.horizontalAlign = cc.macro.TextAlignment.RIGHT;
        result_node.addChild(this.result_label.node);
        
        this.vedio_btn = this.container.getChildByName("vedio_btn");
        this.role_list = this.container.getChildByName("role_list");
        // this.role_list:setTouchEnabled(false)
    
        var scrollCon_size = this.role_list.getContentSize();
        this.scroll_view_size = cc.size(scrollCon_size.width - 10, scrollCon_size.height);
        
        var setting = {
            item_class : "hero_exhibition_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 6,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 0,                   // y方向的间隔
            item_width: 96,               // 单元的尺寸width
            item_height: 96,              // 单元的尺寸height
            row:1,
            once_num: 5,
            need_dynamic: true,
            scale: 0.8
        }
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(this.role_list, cc.v2(8,0) , ScrollViewDir.horizontal,null, cc.size(this.scroll_view_size.width,this.scroll_view_size.height), setting);

        if(this.data){
            this.updateInfo();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        Utils.onTouchEnd(this.vedio_btn, function () {
            if(this.data && this.data.replay_id){
                var BattleController = require("battle_controller");
                BattleController.getInstance().csRecordBattle(this.data.replay_id)
            }
        }.bind(this), 1);
    },

    updateInfo:function(){
        if(!this.root_wnd)return;
        this.name_label.string = cc.js.formatStr(Utils.TI18N("挑战者：%s"), this.data.name);
        this.attk_label.string = cc.js.formatStr(Utils.TI18N("战力：%d"), this.data.power);
        this.time_label.string = TimeTool.getYMDHMS(this.data.time);
        var form_data = Config.formation_data.data_form_data[this.data.formation_type];
        if(form_data){
            this.magic_label.string = form_data.name;
        }
        var num = this.data.num || 0;
        this.result_label.string = cc.js.formatStr(Utils.TI18N("<color=#ffde5e>進化に<color=#52ff6f>%s回</color>成功</color>"), this.data.num)
        //  阵容
        var temp_partner_vo = [];
        for(var i in this.data.partner_list){
            var vo = new HeroVo();
            vo.updateHeroVo(this.data.partner_list[i]);
            temp_partner_vo.push(vo);
        }
        this.scroll_view.setData(temp_partner_vo);
    },

    setData:function( data ){
        this.data = data;
        this.updateInfo();
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide:function(){

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete:function(){
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
    },
})