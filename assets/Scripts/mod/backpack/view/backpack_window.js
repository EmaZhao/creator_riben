// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      背包主界面
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var BackPackController = require("backpack_controller");
var BackPackConst = require("backpack_const");
var CommonScrollView = require("common_scrollview");
var TipsConst = require("tips_const");
var BackpackEvent = require("backpack_event");
var GuideController = require("guide_controller");

var BackPackWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.rleasePrefab = false;
        this.prefabPath = PathTool.getPrefabPath("backpack", "backpack_window");
        this.viewTag = SCENE_TAG.ui;
        this.win_type = WinType.Full;
    },

    initConfig: function(){
        this.panel_list = {};
        this.tab_list = {};
        this.min_size = 30;     // 每一页最小的物品数目
        this.col_size = 5;      // 一行最多
        this.normal_color = new cc.Color(0xff, 0xff, 0xff, 0xff)
        this.normal_outlinecolor = new cc.Color(0x00, 0x00, 0x00, 0xff)
        this.select_color = new cc.Color(0xff, 0xff, 0xff, 0xff)
        this.select_outlinecolor = new cc.Color(0x00, 0x00, 0x00, 0xff)
    },

    openCallBack: function () {
        var title_list = [Utils.TI18N("装备"), Utils.TI18N("道具"), Utils.TI18N("碎片"), Utils.TI18N("特殊")]
        
        this.mainContainer = this.root_wnd.getChildByName("main_container");
        this.title_effect = this.mainContainer.getChildByName("title_img").getComponent(sp.Skeleton);
        var anima_path = "spine/E24120/action.atlas";
        this.loadRes(anima_path, function(ske_data) {
            this.title_effect.skeletonData = ske_data;
            this.title_effect.setAnimation(1, PlayerAction.action, true);
        }.bind(this));

        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        var tab_container = this.seekChild("tab_container")
        for (let index = 0; index < 4; index++) {
            var object = {}
            var new_index = index + 1
            object.btn = tab_container.getChildByName("tab_btn_" + new_index)       //获取主节点
            object.normal = object.btn.getChildByName("normal")                     //普通状态
            object.select = object.btn.getChildByName("select")                     //选中状态
            object.red_point = object.btn.getChildByName("red_point")               //红点
            object.title = object.btn.getChildByName("label")                       //label对象
            object.title_label = object.title.getComponent(cc.Label)                //label
            object.title_outline = object.title.getComponent(cc.LabelOutline)       //描边
            object.title_label.string = title_list[index]
            object.index = new_index
            this.tab_list[new_index] = object;
        }

        var container = this.seekChild("container")
        var scroll_view_size = cc.size(620,600)
        var setting = {
            item_class: "backpack_item",      // 单元类
            start_x: 0,                    // 第一个单元的X起点
            space_x: 4,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: 120,               // 单元的尺寸width
            item_height: 120,              // 单元的尺寸height
            row: 5,                        // 行数，作用于水平滚动类型
            col: 5,                        // 列数，作用于垂直滚动类型
            once_num: 5,
            need_dynamic: true
        }
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(container, cc.v2(0, -30), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5,0.5))

        if (GuideController.getInstance().isInGuide())
            this.item_scrollview.setClickEnabled(false);
    },

    registerEvent: function () {
        for(var key in this.tab_list){
            const element = this.tab_list[key]
            if (element.btn) {
                element.btn.on(cc.Node.EventType.TOUCH_END, (function (event) {
                    Utils.playButtonSound(ButtonSound.Tab);
                    this.changeTabView(element.index)
                }).bind(this))
            }
        }
        this.addGlobalEvent(EventId.ADD_GOODS, function (bag_code, item_list){
            this.updateBackPack(bag_code, item_list)
        }.bind(this))

        this.addGlobalEvent(EventId.DELETE_GOODS, function (bag_code, item_list) {
            this.updateBackPack(bag_code, item_list)
        }.bind(this))

        this.addGlobalEvent(EventId.MODIFY_GOODS_NUM, function (bag_code, item_list) {
            this.updateBackPack(bag_code, item_list)
            if(this.cur_index == 3){ 
                this.isCompRedPoint()
            }
        }.bind(this))

        this.addGlobalEvent(BackpackEvent.Compose_BackPack_Success, function () {
            this.isCompRedPoint();
            this.setPanelData();
        }.bind(this))
    },

    openRootWnd: function (params){
        var index = params || BackPackConst.item_tab_type.EQUIPS
        this.changeTabView(index)
        this.isCompRedPoint()
    },
    // --判断碎片是否显示红点
    isCompRedPoint(){
        var self = this
        let item_list = BackPackController.getInstance().getModel().getAllBackPackArray(3)
        let status = false
        let partner_config = Config.partner_data.data_get_compound_info
        for(let i=0;i<item_list.length;++i){
            let v = item_list[i]
            if(v.quality != -1 && v.base_id){
                if(partner_config[v.base_id]){
                    if(v.quantity >= partner_config[v.base_id].num){
                        status = true
                        break
                    }
                }
                // --神器的时候
                // let hallow_list = BackpackController:getModel():getHallowsCompData(v.base_id)
                // if hallow_list and next(hallow_list) ~= nil then
                //     if v.quantity >= hallow_list.num then
                //         status = true
                //         break
                //     end
                // end
            }
        }
        self.tab_list[3].red_point.active = status //--仅碎片需要红点显示
    },
    /**
     * 切换标签页
     * @param {*} index 
     */
    changeTabView:function(index){
        if(this.cur_index == index) {
            return;
        }
        if (this.cur_tab){
            this.cur_tab.select.active = false
            this.cur_tab.title.color = this.normal_color
            this.cur_tab.title_outline.color = this.normal_outlinecolor
        }
        this.cur_index = index
        this.cur_tab = this.tab_list[index]
        if (this.cur_tab) {
            this.cur_tab.select.active = true
            this.cur_tab.title.color = this.select_color
            this.cur_tab.title_outline.color = this.select_outlinecolor
        }
        this.setPanelData()
    },

    /**
     * 设置当前显示标签页内容
     */
    setPanelData:function(){
        if(this.cur_index == null) {
            return;
        }
        if (this.cur_index == BackPackConst.item_tab_type.HERO) {
            this.item_scrollview.setSpaceY(30,true);
        } else {
            this.item_scrollview.setSpaceY(10);
        }

        var item_list = BackPackController.getInstance().getModel().getAllBackPackArray(this.cur_index)     // 这个是一个数组
        var item_total_length = item_list.length

        // 不足30个补满30个.不足5的倍数,补满5的倍数
        this.min_size = item_total_length
        if (this.min_size < 30){
            this.min_size = 30
        }else if((this.min_size % this.col_size) != 0){
            this.min_size = this.min_size + this.col_size - this.min_size % this.col_size 
        }
        // 需要填充的数量
        var fill_num = this.min_size - item_total_length
        if (fill_num > 0){
            for (let index = 0; index < fill_num; index++) {
                item_list.push({sort:-1, quality:-1, undata:true})
            }
        }
        var callback = function(cell){
            this.selectedItem(cell)
        }.bind(this)

        var sort_func = null;
        if(this.cur_index == BackPackConst.item_tab_type.EQUIPS){
            sort_func = Utils.tableUpperSorter(["quality","sort"]);
        }else if (this.cur_index == BackPackConst.item_tab_type.PROPS){
            sort_func = Utils.tableUpperSorter(["quality","sort","base_id"]);
        }else if(this.cur_index == BackPackConst.item_tab_type.SPECIAL){
            // 特殊分页只有符文，星级越大的放前面
            sort_func = function ( objA, objB ){
                return objA.quality > objB.quality?-1:1;
            };
        }else if(this.cur_index == BackPackConst.item_tab_type.HERO){
            var checkIsFull = function(data){
                var is_full = false;
                if(data.quality != -1 && data.base_id){
                    if(Config.partner_data.data_get_compound_info[data.base_id]){
                        if(data.quantity >= Config.partner_data.data_get_compound_info[data.base_id].num){
                            is_full = true;
                        }
                    }
                }
                return is_full;
            };

            var sortFunc = function(objA, objB){
                if(checkIsFull(objA) && !checkIsFull(objB)){
                    return -1;
                }else if(!checkIsFull(objA) && checkIsFull(objB)){
                    return 1;
                }else{
                    if(objA.quality != -1 && objA.base_id && objB.quality != -1 && objB.base_id){
                        if(objA.quality == objB.quality){
                            return objA.base_id < objB.base_id?-1:1;
                        }else{
                            return objA.quality > objB.quality?-1:1;
                        }
                    }else if(objA.quality != -1 && objA.base_id && objB.quality == -1){
                        return -1;
                    }else if(objA.quality == -1 && objB.quality != -1 && objB.base_id){
                        return 1;
                    }else{
                        return 1;
                    }
                }
            };

            sort_func = sortFunc;
            // --英雄碎片需要取消红点
            var MainuiController = require("mainui_controller")
            var MainuiConst = require("mainui_const")
            MainuiController.getInstance().setBtnRedPoint(MainuiConst.new_btn_index.backpack, false)
        }else{
            sort_func = Utils.tableUpperSorter(["sort", "quality"]);
        }
        item_list.sort(sort_func);

        var ext = {is_other:false, scale:1, effect:false, is_show_tips:false, is_show_chip_loading:true};
        if(this.cur_index == 3){
            ext.is_comp_num = true;
        }else{
            ext.is_comp_num = false;
        }
        this.item_scrollview.setData(item_list, callback, ext);
    },

    // 点击返回,显示tips
    selectedItem:function(cell){
        if (cell == null) return;
        var data = cell.getItemData()
        if (data == null) return;
        var data_config = cell.getItemConfig()
        if (data_config == null) return;

        var TipsController = require("tips_controller")
        if (BackPackConst.checkIsEquip(data_config.type)){                          // 装备
            TipsController.getInstance().showEquipTips(data, TipsConst.eqmTips.backpack)
        }else if(data_config.type == BackPackConst.item_type.ARTIFACTCHIPS){        // 符文
            var PartnerConst = require("partner_const");
            require("hero_controller").getInstance().openArtifactTipsWindow(true, data, PartnerConst.ArtifactTips.backpack)
        }else if(data_config.sub_type == BackPackConst.item_tab_type.HERO){         // 碎片
            TipsController.getInstance().showBackPackCompTips(true,data.base_id)
        }else if(BackPackConst.checkIsHeroSkin(data_config.type)){      
            var HeroController = require("hero_controller")      
            var PartnerConst = require("partner_const");                                                      //皮肤
            HeroController.getInstance().openHeroSkinTipsPanel(true, data, PartnerConst.EqmTips.backpack)
        }else{
            TipsController.getInstance().showGoodsTips(data, true) 
        }
    },

    updateBackPack:function(bag_code, item_list){
        if (this.cur_index == null) return;

        if(this.cur_index == BackPackConst.item_tab_type.EQUIPS){
            if(bag_code != BackPackConst.Bag_Code.EQUIPS)return;
        }else{
            if(bag_code == BackPackConst.Bag_Code.EQUIPS)return;
        }
        
        if (item_list == null || Object.keys(item_list).length == 0) return;
        var can_update = false
        for(var key in item_list){
            var vo = item_list[key]
            if (vo.sub_type == this.cur_index){
                can_update = true
                break
            }
        }
        if (can_update){
            this.setPanelData()
        }
    },

    closeCallBack: function(){
        BackPackController.getInstance().openMainWindow(false)
        if (this.item_scrollview){
            this.item_scrollview.DeleteMe()
        }
        this.item_scrollview = null
    },
});