// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     无尽试炼支援我的界面
// <br/>Create: 2019-03-05 19:15:42
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var CommonScrollView = require("common_scrollview");
var Endless_trailController = require("endless_trail_controller");
var Endless_trailEvent = require("endless_trail_event");
var RoleController = require("role_controller");
var HeroController = require("hero_controller");
var EndlessFriendHelpItem = require("endless_friend_help_item_panel");


var Endless_help_mePanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_help_me_panel");
        this.ctrl = Endless_trailController.getInstance();
        this.model = Endless_trailController.getInstance().getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){
        this.is_select = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        var container = this.root_wnd.getChildByName("container")
        var scroll_container = container.getChildByName("scroll_container")
        var desc_label = container.getChildByName("desc_label").getComponent(cc.Label);
        desc_label.string = Utils.TI18N("(超出拥有英雄120%战力的支援英雄不可选择)");
        
        var scorll_size = scroll_container.getContentSize();
        var size = cc.size(scorll_size.width - 4, scorll_size.height - 10)
        var setting = {
            item_class: EndlessFriendHelpItem,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 600,
            item_height: 149,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(scroll_container, cc.v2(4,5), null, null, size, setting);
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        this.addGlobalEvent(Endless_trailEvent.UPDATA_HIREPARNER_DATA,function(data){
            this.updateListData(data);
        }.bind(this));

        this.addGlobalEvent(Endless_trailEvent.UPDATA_HASHIREPARNER_DATA,function(data){
            this.updateHasListData(this.hire_data,data.list);
        }.bind(this));
    },

    setNodeVisible:function(status){
        if(this.root_wnd){
            this.root_wnd.active = status;
        }
    },

    updateHasListData:function(data){

    },

    updateListData:function(data,has_hire_list){
        if(data){
            this.hire_data = data;
            this.tmp_list = this.hire_data.list;
            var list_data = this.model.getHasHirePartnerData();
            var model_list = {}
            if(list_data){
                model_list = list_data.list;
            }
            var has_list = has_hire_list || model_list;
            var check_has_list = function(rid,srv_id,id){
                if(has_list && Utils.next(has_list || {}) != null){
                    var is_has = false;
                    for(var i in has_list){
                        if(has_list[i].id == id && has_list[i].rid == rid && has_list[i].srv_id == srv_id){
                            is_has = true;
                            break
                        }
                    }
                    return is_has;
                }
            }
            
            var height_power = HeroController.getInstance().getModel().getMaxFight() * 1.2;
            for(var j in this.tmp_list){
                var v = this.tmp_list[j];
                v.index = j
                v._index = j
                
                v.sort_index = 2
                v.select = false
                if(check_has_list(v.rid,v.srv_id,v.id) == true){
                    v.sort_index = 3;
                    v.select = true;
                }

                v.is_lock = false;
                if(Config.partner_data.data_partner_base[v.bid]){
                    v.info_data = Config.partner_data.data_partner_base[v.bid]
                }
                if(v.power >= height_power){
                    v.sort_index = 1;
                    v.is_lock = true;
                }
            }
            this.tmp_list.sort(Utils.tableUpperSorter(["sort_index","power"]));
            this.createList(this.tmp_list);

        }
    },

    createList:function(list){
        var callback = function(item, vo, index,is_select,is_start){
            if(vo && Utils.next(vo) != null){
                this.clickFun(item, vo, index,is_select,is_start);
            }
        }.bind(this);
        this.scroll_view.setData(list, callback);
        this.scroll_view.addEndCallBack(function (){
            var list = this.scroll_view.getItemList();
            for(var i in list){
                var data = list[i].getData();
                if(data.select == true){
                    this.clickFun(list[i], data, data._index, true, true)
                }
            }
        }.bind(this));
    },

    addToParent:function(){
        this.ctrl.send23907();
    },

    updateBtnChoseStatus:function( index, is_select ){
        if(!this.tmp_list)return;
        for(var i in this.tmp_list){
            var v = this.tmp_list[i];
            var old_status = v.select;
            if(v._index && v._index == index){
                v.select = is_select;
            }else{
                v.select = false;
            }
            if(old_status == true && v.select == false){
                this.ctrl.send23909(v.rid, v.srv_id, v.id, 0);
            }else if(old_status == false && v.select == true){
                this.ctrl.send23909(v.rid, v.srv_id, v.id, 1);
            }
        }
    },

    //  获取旧的item
    setAllItemBtnStatus:function(  ){
        var list = this.scroll_view.getItemList();
        for(var i in list){
            var data = list[i].getData();    
            if(data.select == true){
                list[i].updateBtnStatus(false);
            }
        }
    },

    clickFun:function(item,vo,index,is_select,is_start){
        this.setAllItemBtnStatus();
        if(this.select_item_index && this.select_item_index == index && this.select_item){
            // --controller:send23909(this.select_vo.rid, this.select_vo.srv_id, this.select_vo.id, 0)
            // --this.select_item:updateBtnStatus(false)
            this.updateBtnChoseStatus(this.select_item.index, false);
            this.select_item = null;
            this.is_select = false;
            this.select_item_index = null;
            return
        }
        // --[[if this.select_item then
        //     this.select_item:updateBtnStatus(false)
        //     controller:send23909(this.select_vo.rid, this.select_vo.srv_id, this.select_vo.id, 0)
        // end--]]
        this.select_item = item;
        this.select_vo = vo;
        this.select_item.updateBtnStatus(true);
        this.updateBtnChoseStatus(index, true);
        this.select_item_index = index;
        this.is_select = is_select;
        // --[[if not is_start then
        //     controller:send23909(this.select_vo.rid, this.select_vo.srv_id, this.select_vo.id, 1)
        // end--]]
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow:function(params){
        this.addToParent()
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