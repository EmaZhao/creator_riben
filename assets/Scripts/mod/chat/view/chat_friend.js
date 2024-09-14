var CommonAlert = require("commonalert");

var ChatItem = cc.Class({
    extends: BaseView,

    properties: {
    	friend_vo: null,     // 好友数据
    	parent: null,        // 父节点
    	select_cb: null,     // 选择回调
    	delete_cb: null,     // 关闭回调
    	index:　"",
        is_select: false,
        head_path: null,
    },

    ctor: function () {
    	this.friend_vo = arguments[0];
    	this.parent = arguments[1];
        this.is_select = arguments[2];
    	this.index = this.friend_vo.srv_id + this.friend_vo.rid;
    	this.initRootWind();
    },

    initRootWind: function() {
        var prefab_path = PathTool.getPrefabPath("chat", "chat_friend");
        LoaderManager.getInstance().loadRes(prefab_path, function(res_object) {
            this.root_wnd = res_object;
            this.parent.addChild(this.root_wnd);
            this.initWidget();
        }.bind(this))
	},

    initWidget: function() {
    	this.head_sp = this.seekChild("head_icon", cc.Sprite);
    	this.level_lb = this.seekChild("level", cc.Label);
    	this.close_nd = this.seekChild("close_btn");
    	this.bg_nd = this.seekChild("bg_nd");
    	this.name_lb = this.seekChild("name", cc.Label);
        this.mask_bg_nd = this.seekChild("mask_bg");

        if (this.is_select) {
            this.mask_bg_nd.active = false;            
        } else {
            this.mask_bg_nd.active = true;
        }

    	this.close_nd.on(cc.Node.EventType.TOUCH_END, this.deleteItem.bind(this));
    	this.bg_nd.on(cc.Node.EventType.TOUCH_END, this.selectItem.bind(this));

    	this.updateWidget();
    },

    updateWidget: function() {
        this.head_path = PathTool.getHeadRes(this.friend_vo.face_id);
        LoaderManager.getInstance().loadRes(this.head_path, function(res_object){
            this.head_sp.spriteFrame = res_object;
        }.bind(this))

        this.level_lb.string = this.friend_vo.lev || "";
        this.name_lb.string = this.friend_vo.name || "";

    },

    setSelectCallback: function(s_cb) {
    	this.select_cb = s_cb;
    },

    setDeleteCallBack: function(d_cb) {
    	this.delete_cb = d_cb;
    },

    selectItem: function() {
        if (this.select_cb)
            this.select_cb(this.index, this.friend_vo);
    },

    cancelSelcet: function() {
        this.mask_bg_nd.active = true;
    },

    setSelectStatus: function() {
        this.mask_bg_nd.active = false;        
    },

    deleteItem: function() {
        // LoaderManager.getInstance().loadRes(this.head_path);
        
        var str = Utils.TI18N("确定要删除该好友的所有聊天记录吗？");
        var fun = function () {
        	if (this.delete_cb)
        		this.delete_cb(this.index, this.friend_vo);
            this.root_wnd.destroy();
        }.bind(this)
        CommonAlert.show(str, Utils.TI18N("确认"), fun, Utils.TI18N("取消"), null, 2, null)
    },

})