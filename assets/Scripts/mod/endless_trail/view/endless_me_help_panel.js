// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     无尽试炼我的支援界面
// <br/>Create: 2019-03-05 19:16:11
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var Endless_trailController = require("endless_trail_controller");
var CommonScrollView = require("common_scrollview");
var Endless_trailEvent = require("endless_trail_event");
var HeroController = require("hero_controller");
var EndlessFriendHelpItem2 = require("endless_friend_help_item_2_panel");
var PartnerConst = require("partner_const");


var Endless_me_helpPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("endlesstrail", "endlesstrail_me_help_panel");
        this.ctrl = Endless_trailController.getInstance();
        this.model = Endless_trailController.getInstance().getModel();
    },

    // 可以初始化声明一些变量的
    initConfig:function(){

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel:function(){
        // --var container = this.root_wnd:getChildByName("container")
        var scroll_container = this.root_wnd.getChildByName("scroll_container");
        var desc_title = scroll_container.getChildByName("desc_title").getComponent(cc.Label);
        desc_title.string = Utils.TI18N("可选英雄");
        var desc_label = scroll_container.getChildByName("desc_label").getComponent(cc.Label);
        desc_label.string = Utils.TI18N("每日派遣支援英雄可得奖励，若英雄被使用自己将获得友情点");
        // -- this.comfirm_button = scroll_container:getChildByName("comfirm_button")
        // -- this.comfirm_label = this.comfirm_button:getChildByName("comfirm_label")
        // -- this.comfirm_label:setString(TI18N("确定"))
        var scroll_size = scroll_container.getContentSize();
        var size = cc.size(scroll_size.width - 4, scroll_size.height - 16);
        var setting = {
            item_class: EndlessFriendHelpItem2,
            start_x: 0,
            space_x: 0,
            start_y: 0,
            space_y: 0,
            item_width: 600,
            item_height: 124,
            row: 0,
            col: 1,
            need_dynamic: true
        }
        this.scroll_view = new CommonScrollView();
        this.scroll_view.createScroll(scroll_container, cc.v2(4,7), null, null, size, setting);

        var my_container = this.root_wnd.getChildByName("my_container");
        this.item_container = my_container.getChildByName("item_container");
        this.item_container.active = false;
        this.career_icon = this.item_container.getChildByName("career_icon").getComponent(cc.Sprite);
        this.role_name = this.item_container.getChildByName("role_name").getComponent(cc.Label);
        this.career_name = this.item_container.getChildByName("career_name").getComponent(cc.Label);
        this.role_power = this.item_container.getChildByName("role_power").getComponent(cc.Label);
        this.has_label = this.item_container.getChildByName("has_label").getComponent(cc.Label);
        this.has_label.string = Utils.TI18N("已派遣支援");
        var my_desc_title = my_container.getChildByName("my_desc_title").getComponent(cc.Label);
        my_desc_title.string = Utils.TI18N("当前已选");
        this.no_label = my_container.getChildByName("no_label").getComponent(cc.Label);
        this.no_label.string = Utils.TI18N("暂无派遣支援英雄,快快选择英雄帮助好友吧");
        this.no_label.node.active = false;

        this.hero_icon = ItemsPool.getInstance().getItem("hero_exhibition_item");;
        this.hero_icon.setRootScale(0.8);
        this.hero_icon.setRootPosition(cc.v2(65, 64));
        this.hero_icon.setParent(this.item_container);
        this.hero_icon.show();
        
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent:function(){
        // -- if this.comfirm_button then
        // --     this.comfirm_button:addTouchEventListener(function(sender,event_type)
        // --         if event_type == ccui.TouchEventType.ended then
        // --             if this.select_vo then
        // --                 if this.select_vo.info_data and this.select_vo.info_data.partner_id then
        // --                     controller:send23908(this.select_vo.info_data.partner_id)
        // --                     if this.select_item then
        // --                         this.select_item:updateBtnStatus(false)
        // --                         this.select_item = nil
        // --                         this.select_vo = nil
        // --                     end
        // --                 end
        // --             end
        // --         end
        // --     end)
        // -- end

        this.addGlobalEvent(Endless_trailEvent.UPDATA_SENDPARTNER_DATA,function(data){
            this.updateListData(data);
        }.bind(this));


        this.addGlobalEvent(Endless_trailEvent.UPDATA_SENDPARTNER_SUCESS_DATA,function(data){
            if(data.code == 1){
                if(this.select_item){
                    this.select_item.updateBtnStatus(false);
                    this.select_item = null;
                    this.select_vo = null;
                }
            }
        }.bind(this));

    },

    updateListData:function(data){
        if(data){
            this.send_data = data;
            if(this.send_data.list && Utils.next(this.send_data.list || {}) == null){
                this.item_container.active = false;
                this.no_label.node.active = true;
            }else{
                if(this.send_data.list[0]){
                    this.item_container.active = true;
                    this.no_label.node.active = false;
                    this.send_role_data = this.send_data.list[0];
                    if(this.send_role_data){
                        this.hero_icon.setData(this.send_role_data);
                        this.role_power.string = this.send_role_data.power;
                        var partner_config = Config.partner_data.data_partner_base[this.send_role_data.bid]  ;
                        if(partner_config){
                            var res = PathTool.getCommonIcomPath(cc.js.formatStr("common_%s",90045+partner_config.type));
                            this.loadRes(res, (function(resObject){
                                this.career_icon.spriteFrame = resObject;
                            }).bind(this));
                            var str = PartnerConst.Hero_Type[partner_config.type] || "";
                            this.career_name.string = "[" + str + "]";
                            this.role_name.string = partner_config.name;
                        }
                    }
                }
            }
            var data = HeroController.getInstance().getModel().getAllHeroArray();
            var index = 0;
            var list = [];
            data.sort(Utils.tableUpperSorter(["power", "quality", "star", "lev", "sort_order"]));
            for(var i = 0;i<data.length;i++){
                var info = data[i];
                if(this.send_role_data && this.send_role_data.id && this.send_role_data.id == info.id){

                }else{
                    list[index] = {info_data: info, type: Endless_trailEvent.helptype.me , _index:index}
                    index = index + 1;
                }
            }
            var callback = function(item, vo, index){
                if(vo && Utils.next(vo) != null){
                    this.clickFun(item,vo,index);
                }
            }.bind(this);
            this.scroll_view.setData(list, callback)
        }
    },

    setNodeVisible:function(status){
        if(this.root_wnd){
            this.root_wnd.active = status;
        }
        
    },

    addToParent:function(){
        this.ctrl.send23905();
    },

    clickFun:function(item,vo,index){
        if(this.select_item && this.select_item.index == index){
            this.select_item.updateBtnStatus(false);
            this.select_item = null;
            this.select_vo = null;
            return;
        }
        if(this.select_item){
            this.select_item.updateBtnStatus(false);
        }
        this.select_item = item;
        this.select_vo = vo;
        this.select_item.updateBtnStatus(true);

        if(this.select_vo.info_data && this.select_vo.info_data.partner_id){
            this.ctrl.send23908(this.select_vo.info_data.partner_id);
        }
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
        if(this.hero_icon){
            this.hero_icon.deleteMe();
            this.hero_icon = null;
        }
        
        if(this.scroll_view){
            this.scroll_view.deleteMe();
            this.scroll_view = null;
        }
    },
})