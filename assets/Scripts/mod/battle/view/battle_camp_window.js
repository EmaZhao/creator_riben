// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-11 10:35:32
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var BattleCampItem = require("battle_camp_Item")
var BattleController = require("battle_controller")
var BattleEvent = require("battle_event")
var Battle_campWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("battle", "battle_camp_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = BattleController.getInstance();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig:function(){

    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack:function(){
        var self = this
        self.background = self.root_wnd.getChildByName("background");
        let main_container = self.root_wnd.getChildByName("main_container");
        let title_label_1 = main_container.getChildByName("title_label_1").getComponent(cc.Label)
        title_label_1.string = (Utils.TI18N("种族克制"))
        let title_label_2 = main_container.getChildByName("title_label_2").getComponent(cc.Label)
        title_label_2.string = (Utils.TI18N("种族克制效果:"))
        let attr_label_1 = main_container.getChildByName("attr_label_1").getComponent(cc.Label)
        attr_label_1.string = (Utils.TI18N("伤害+25%"))
        let attr_label_2 = main_container.getChildByName("attr_label_2").getComponent(cc.Label)
        attr_label_2.string = (Utils.TI18N("命中+20%"))
        self.background.scale = FIT_SCALE;

        let list_panel = main_container.getChildByName("list_panel");
        let scroll_view_size = cc.size(list_panel.width, list_panel.height);
        let setting = {
            item_class : BattleCampItem,     // -- 单元类
            start_x : 0,                  //-- 第一个单元的X起点
            space_x : 0,                   // -- x方向的间隔
            start_y : 0,                    //-- 第一个单元的Y起点
            space_y : 5,                   //-- y方向的间隔
            item_width : 603,               //-- 单元的尺寸width
            item_height : 160,              //-- 单元的尺寸height
            row : 0,                        //-- 行数，作用于水平滚动类型
            col : 1,                         //-- 列数，作用于垂直滚动类型
            need_dynamic : true
        }

        self.camp_scrollview = new CommonScrollView(); 
        self.camp_scrollview.createScroll(list_panel, cc.v2(0,0) , ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting);
    
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.background.on("touchend",function(){
            Utils.playButtonSound(2)
            this.ctrl.openBattleCampView(false)
        },this)
        this.addGlobalEvent(BattleEvent.EXIT_FIGHT,function(){
            this.ctrl.openBattleCampView(false)
        }.bind(this))
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd:function(form_id_list){
        this.form_id_list = form_id_list || [];
        this.form_pos_info = {}
        for(let k=0;k<this.form_id_list.length;++k){
            let form_id = this.form_id_list[k]
            let form_cfg = Config.combat_halo_data.data_halo[form_id]
            if(form_cfg){
                for(let i=0;i<form_cfg.pos_info.length;++i){
                    let v = form_cfg.pos_info[i]
                    let camp_type = v[0]
                    let camp_num = v[1]
                    if(!this.form_pos_info[camp_type]){
                        this.form_pos_info[camp_type] = camp_num
                    }else{
                        this.form_pos_info[camp_type] = this.form_pos_info[camp_type] + camp_num
                    }
                }
            }
        }
        this.refreshCampList();
    },
    refreshCampList(  ){
        var self = this;
        let camp_show_config = Config.combat_halo_data.data_halo_show;
        if (camp_show_config){
            let camp_data = [];
            for(let k in camp_show_config){
                let v = camp_show_config[k];
                let data = Utils.deepCopy(v);
                let show_cfg = {}
                show_cfg.id = k
			    show_cfg.is_activate = false
                for(let j in data){
                    let cfg = data[j]
                    cfg.is_activate = this.checkIsActivateCamp(cfg.pos_info)
                    if(cfg.is_activate){
                        show_cfg.is_activate = true
                    }
                    if(!show_cfg.name){
                        show_cfg.name = cfg.name
                    }
                    if(!show_cfg.icon){
                        show_cfg.icon = cfg.icon
                    }
                }
                show_cfg.attr_data = data
                camp_data.push(show_cfg)
            }
            let SortFunc = function( objA, objB){
                if (objA.is_activate && !objB.is_activate){
                    return -1;
                }else if(!objA.is_activate && objB.is_activate){
                    return 1;
                }else{
                    return objA.id - objB.id;
                }
            }
            camp_data.sort(SortFunc);
            for(let i=0;i<camp_data.length;++i){
                camp_data[i].index = i
            }
            self.camp_scrollview.setData(camp_data);
        }
    },
    checkIsActivateCamp(pos_info){
        let is_activate = false
        if(pos_info && Utils.next(pos_info) != null){
            is_activate = true
            for(let i=0;i<pos_info.length;++i){
                let v = pos_info[i]
                let camp_type = v[0]
                let camp_num = v[1]
                let have_num = 0
                for(let _type in this.form_pos_info){
                    let num = this.form_pos_info[_type]
                    if(_type == camp_type){
                        have_num = num
                        break
                    }
                }
                if(camp_num > have_num){
                    is_activate = false
                    break
                }
            }
        }
        return is_activate
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack:function(){
        if (this.camp_scrollview){
            this.camp_scrollview.deleteMe();
            this.camp_scrollview = null;
        }
        this.ctrl.openBattleCampView(false)
    },
})