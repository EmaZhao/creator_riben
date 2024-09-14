var PathTool = require("pathtool");
var FormationSelectPanel = cc.Class({
    extends: BaseView,
    ctor: function () {
        // this.prefabPath = PathTool.getPrefabPath("modelname", "modelname_window");
        this.prefabPath = PathTool.getPrefabPath("hero", "formation_select_panel");     
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips

        this.ctrl = arguments[0];
        this.model = this.ctrl.getModel();

         var RoleController = require("role_controller")
         this.role_vo = RoleController.getInstance().getRoleVo();
    },

    initConfig: function() {
        this.formaiton_cfg = Config.formation_data.data_form_data
        this.item_cfgs = [];
        for (var from_i in this.formaiton_cfg) {
            this.item_cfgs.push(this.formaiton_cfg[from_i]);
        }

        this.item_cfgs.sort(function(conf1, conf2) {
            return conf1.order - conf2.order;
        });

        this.form_items = {};
        this.cur_select_item = null;
        this.new_select_type = null;
    },

    openCallBack: function() {
        this.comfirm_btn_nd      = this.seekChild("comfirm_btn");
        this.from_content_nd     = this.seekChild("form_content");
        this.form_item           = this.seekChild("form_item");
        this.background_nd       = this.seekChild("background");
        this.background_nd.scale = FIT_SCALE;

        for (var from_i = 0; from_i < 6; from_i ++) {
            if (!this.form_items[from_i]) {
                this.form_items[from_i] = cc.instantiate(this.form_item);
                this.from_content_nd.addChild(this.form_items[from_i]);
                this.form_items[from_i].y = 0;
                this.form_items[from_i].form_tag = from_i;
                this.form_items[from_i].on(cc.Node.EventType.TOUCH_END, this.onClickFromItem, this);
            }
        }

        this.comfirm_btn_nd.on(cc.Node.EventType.TOUCH_END, this.onClickConfirmBtn, this);
        this.background_nd.on(cc.Node.EventType.TOUCH_END, this.onClickBackground, this);        
    },

    registerEvent: function() {

    },

    openRootWnd: function(pagram) {
        this.cur_form_type = pagram.formation_type;
        this.selent_cb = pagram.callback;
        this.updageWidget();
    },

    closeCallBack: function() {

    },

    updageWidget: function() {
        for (var from_i = 0; from_i < this.item_cfgs.length; from_i++) {
            var form_cfg_item = this.item_cfgs[from_i];
            var item_nd = this.form_items[from_i];
            //名称
            var name_lb = this.seekChild(item_nd, "form_name", cc.Label);
            name_lb.string = form_cfg_item.name;

            // 锁
            var lock_nd = this.seekChild(item_nd, "form_lock");
            var is_lock = false;
            if (form_cfg_item.need_lev > this.role_vo.lev) {
                lock_nd.active = true;
                is_lock = true;
            } else {
                lock_nd.active = false;
            }

            var form_select_icon_nd = this.seekChild(item_nd, "form_select_icon");
            var cur_tag_nd = this.seekChild(item_nd, "cur_tag");
            if (this.cur_form_type == form_cfg_item.type) {
                form_select_icon_nd.active = true;
                cur_tag_nd.active = true;
                this.cur_select_item = item_nd;
            } else {
                form_select_icon_nd.active = false;
                cur_tag_nd.active = false;                
            }

            // frame_icon
            var form_icon_path = PathTool.getUIIconPath("form", "form_icon_" + form_cfg_item.type);
            this.loadRes(form_icon_path, function(item_nd, is_lock, form_sf) {
                var form_sp = this.seekChild(item_nd, "form_icon", cc.Sprite);
                form_sp.spriteFrame = form_sf;
                if (is_lock) {
                    form_sp.setState(cc.Sprite.State.GRAY);
                } else {
                    form_sp.setState(cc.Sprite.State.NORMAL);
                }
            }.bind(this, item_nd, is_lock));

            // 开启文本
            var lock_lv = this.seekChild(item_nd, "form_lv",cc.Label);
            if(lock_lv){
                var str = cc.js.formatStr("Lv.%sで開放", form_cfg_item.need_lev);
                lock_lv.string = str;
                if(is_lock){
                    lock_lv.node.active = true;
                }else{
                    lock_lv.node.active = false;
                }
            }

        }
    },

    onClickFromItem: function(event) {
        var select_cgf = this.item_cfgs[event.target.form_tag];
        if (select_cgf.type === this.new_select_type)
            return;

        if (select_cgf.need_lev > this.role_vo.lev){
            //message(select_cgf.need_lev+Utils.TI18N("级解锁"));
            var str = cc.js.formatStr("Lv.%sで開放", select_cgf.need_lev);
            message(str);
            return;
        }

        var form_select_icon_nd = this.seekChild(this.cur_select_item, "form_select_icon");
        form_select_icon_nd.active = false;

        this.cur_select_item = event.target;
        var form_select_icon_nd = this.seekChild(this.cur_select_item, "form_select_icon");
        form_select_icon_nd.active = true;

        this.new_select_type = select_cgf.type;
    },

    onClickConfirmBtn: function() {
        this.ctrl.openFormationSelectPanel(false);

        if (this.new_select_type !== null && this.new_select_type !== this.cur_form_type) {
            if (this.selent_cb) {
                this.selent_cb(this.new_select_type);
            }
        }
    },

    onClickBackground: function() {
        this.ctrl.openFormationSelectPanel(false);
    },
 
})