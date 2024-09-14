// --------------------------------------------------------------------
// uthor: xxx@syg.com(必填, 创建模块的人员)
// description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-17 10:35:09
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller");
var BackpackController = require("backpack_controller");
var CommonScrollView = require("common_scrollview");
var RoleFaceItem = require("role_face_item")
var RoleEvent = require("role_event");

var Role_facedPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_face_panel");
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.ctrl = RoleController.getInstance();
        this.item_list = {};
        this.group_list = {};
        this.have_list = {};
        this.is_first = true;
        this.role_vo = this.ctrl.getRoleVo();
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.scroll_con = this.root_wnd.getChildByName("scroll_con");
        this.view = this.scroll_con.getChildByName("view");
        this.content = this.view.getChildByName("content");
        this.use_btn = this.root_wnd.getChildByName("ok_btn");
        this.use_btn_label = this.use_btn.getChildByName("Label").getComponent(cc.Label);

        this.item = this.root_wnd.getChildByName("item");

        var setting = {
            item_class: RoleFaceItem,      // 单元类
            start_x: 5,                    // 第一个单元的X起点
            space_x: 4,                    // x方向的间隔
            start_y: 0,                    // 第一个单元的Y起点
            space_y: 10,                   // y方向的间隔
            item_width: 141,               // 单元的尺寸width
            item_height: 120,              // 单元的尺寸height
            row: 0,                        // 行数，作用于水平滚动类型
            col: 4,                        // 列数，作用于垂直滚动类型
            once_num: 4,
            need_dynamic: true
        };
        var scroll_view_size = cc.size(604, 514);
        this.item_scrollview = new CommonScrollView()
        this.item_scrollview.createScroll(this.scroll_con, cc.v2(0, 0), ScrollViewDir.vertical, ScrollViewStartPos.top, scroll_view_size, setting, cc.v2(0.5, 0.5));

        this.ctrl.send21500();
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        Utils.onTouchEnd(this.use_btn, function () {
            if (this.select_item && this.select_item.getData()) {
                var data = this.select_item.getData();
                if (data && data.base_id) {
                    var is_lock = this.select_item.getIsLock() || false;
                    if (is_lock == true) {
                        this.ctrl.send21503(data.base_id);
                        return
                    }
                    var bid = data.base_id;
                    if (data.group == 110) {
                        for (var i in this.have_list) {
                            var v = this.have_list[i];
                            for (var i in this.have_list) {
                                if (this.isSameGroup(v.base_id, data.base_id)) {
                                    bid = v.base_id
                                };
                            }
                        }
                    }
                    this.ctrl.send21501(bid)
                }
            }
        }.bind(this), 1)
        this.addGlobalEvent(RoleEvent.GetFaceList, function (data) {
            if (data && data.avatar_frame) {
                for (var i in data.avatar_frame) {
                    var v = data.avatar_frame[i];
                    if (v && v.base_id) {
                        this.have_list[v.base_id] = v;
                        var config = Config.avatar_data.data_avatar[v.base_id];
                        if (config && config.group) {
                            this.group_list[config.group] = config;
                        }
                    }
                }
            }
            this.createItemList();
        });

        if (!this.role_update_evt) {
            this.role_update_evt = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, (function (key, val) {
                if (key == "avatar_base_id") {
                    if(this.role_vo && this.role_vo.avatar_base_id){
                    }
                }
            }), this);
        }
    },


    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

    },

    createItemList: function () {
        var num = Config.avatar_data.data_avatar_length || 0;
        var config = Config.avatar_data.data_avatar;
        if (!config) return
        var index = 1;

        var array = [];
        for (var i in config) {
            var v = config[i];
            if (v.is_show == 1) {
                v.has = 3;      //这个没激活
                if (v.loss && Utils.next(v.loss || {}) != null) {
                    var loss_bid = v.loss[0][0];
                    var loss_num = v.loss[0][1];
                    if (!this.have_list[v.base_id]) {           //如果是不存在已在列表又尚未激活的
                        var has_num = BackpackController.getInstance().getModel().getBackPackItemNumByBid(loss_bid);
                        if (has_num >= loss_num) {          //可激活的
                            v.has = 0;
                        }
                    }
                } else {
                    v.has = 1
                }
                array.push(v)
            }
        }

        for (var i = 0; i < array.length; i++) {
            var v = array[i];
            if (this.have_list[v.base_id]) {      //已经拥有的
                v.has = 2;
            }
        }
        array.sort(Utils.tableLowerSorter(["has","base_id"]));

        var func = function(face_item,vo){
            if(this.select_item){
                this.select_item.setSelected(false);
            }
            this.select_item = face_item;
            this.select_item.setSelected(true);
            var is_lock = this.select_item.getIsLock() || false;
            if(is_lock == true){
                this.use_btn_label.string = Utils.TI18N("激 活");
            }else{
                this.use_btn_label.string = Utils.TI18N("更 换");
            }
            if(this.is_first == false){
                // TipsManager:getInstance():showFaceTips(2,face_item:getData(),self.scroll_view:convertToWorldSpace(cc.p(self.select_item:getPositionX(),343)))
            }else{
                this.is_first = false;
            }
        }.bind(this)

        this.item_scrollview.setData(array)
    },

    //是否是同组的
    isSameGroup:function(bid1,bid2){
        var config_1 = Config.avatar_data.data_avatar[bid1];
        if(!config_1)return false
        var config_2 = Config.avatar_data.data_avatar[bid2];
        if(!config_2)return false
        if(config_1.group && config_1.group == config_2.group){
            return true
        }
        return false
    },

    //根据bid获取该组id
    getGroupByBid:function(bid){
        var config = Config.avatar_data.data_avatar[bid];
        if(!config)return 0
        return config.group || 0;
    },

    setVisibleStatus:function(bool){
        this.setVisible(bool)
    },

    createTimer:function(value){

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        if(this.item_scrollview){
            this.item_scrollview.deleteMe();
            this.item_scrollview = null;
        }
        if(this.role_update_evt){
            this.role_vo.unbind(this.role_update_evt);
        }
    },
})