// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      物品单列,显示对象
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------
var PathTool           = require("pathtool");
var GoodsVo            = require("goods_vo");
var PathTool           = require("pathtool");
var BackPackConst      = require("backpack_const");
var ChatConst          = require("chat_const");
var ChatItemController = require("chat_item_controller");
var ChatHelp           = require("chat_help");
var ChatController = require("chat_controller")
var ChatItem = cc.Class({
    extends: BaseView,

    properties: {
        content: null,
        msg_index: 0,               // 消息标签号
        data: null,
        height: 100,
        update_cb: null,
        pos_y: 0,
        is_mine: false,
        head_margin: 63,
        name_margin: 120,
        msg_bg_pos: 220,
        msg_rt_pos: 200,
        channel: null,
        init_ing: false,
        have_nd: true,
        head_sp: null,
        sp_res: null,
        is_loading: false,
    },

    ctor: function () {
        this.content = arguments[0];
        this.data    = arguments[1];
        this.height  = arguments[2];
        this.pos_y   = arguments[3];
        this.channel = arguments[4];

        var RoleController = require("role_controller")
        var role_vo = this.role_vo= RoleController.getInstance().getRoleVo();

        if (this.channel === ChatConst.Channel.Friend) {
            if (this.data.flag === 1 || this.data.flag === 11 || !this.data.flag) {
                this.is_mine = true;
                this.face_id = role_vo.face_id;
                this.r_name = role_vo.name;
            } else {            
                this.face_id = this.data.face_id;
                this.r_name = this.data.name;
            }
        } else if (this.channel === ChatConst.Channel.System) {

        } else {
            if(this.data && this.data.role_list && this.data.role_list[0]){
                var msg_role = this.data.role_list[0]
                if (msg_role.rid === role_vo.rid && msg_role.srv_id === role_vo.srv_id) 
                    this.is_mine = true;
                this.face_id = this.data.role_list[0].face_id;
                this.r_name = this.data.role_list[0].name;
            }
            
        }
        let msg
        if(this.data.len == 0){
            msg = StringUtil.parseStr(this.data.msg,"handler").string
        }else{
            msg = this.data.msg
        }
        // 对数据进行初始化
        this.msg = msg;
        this.head_path = PathTool.getHeadRes(this.face_id);
        this.chat_item_ctrl = ChatItemController.getInstance();
        this.updateInterval = 1;
        this.updateTimer = 0;
        this.totalCount = 0;
    },

    initRootWind: function() {
        if (this.init_ing) return;
        this.root_wnd = this.content.getChatItemNd();
        if (this.root_wnd) {
            this.have_nd = true;
            this.root_wnd.active = true;
            this.initWidget();
        } else {
            var prefab_path = PathTool.getPrefabPath("chat", "chat_item");
            LoaderManager.getInstance().loadRes(prefab_path, function(res_object) {
                this.init_ing = false;
                var root_wnd = res_object;
                if (this.content && this.content.msgs_content) {                
                    root_wnd.parent = this.content.msgs_content;
                    if (this.have_nd) {
                        this.root_wnd = root_wnd;
                        this.initWidget();
                    } else {
                        root_wnd.active = false;
                        this.content.chat_items_cache.push(root_wnd);
                    }
                }
            }.bind(this))
            this.init_ing = true;
        }
    },

    initWidget: function() {
        this.common_msg_nd        = this.seekChild("common_msg");
        this.notice_msg_nd        = this.seekChild("notice");
        
        this.head_nd              = this.seekChild("head_bg");
        this.name_nd              = this.seekChild("name_nd");
        this.head_kuang_sp        = this.seekChild("head_kuang", cc.Sprite);
        this.sex_nd               = this.seekChild("sex");
        this.sex_sp               = this.seekChild("sex", cc.Sprite);

        this.msg_root_nd          = this.seekChild("msg_root");
        this.message_bg_nd        = this.seekChild("msg_bg");
        
        this.head_sp              = this.seekChild("head_sp", cc.Sprite);
        this.name_lb              = this.seekChild("name_nd", cc.Label);
        this.message_rt           = this.seekChild("msg_rt", cc.RichText);
        this.message_nd           = this.seekChild("msg_rt");
        this.notice_msg_rt        = this.seekChild("notice_msg", cc.RichText);
        this.notice_bg_nd         = this.seekChild("bg");
        this.channel_notice_icon  = this.seekChild("channel",cc.Sprite);
        
        this.head_wd              = this.head_nd.getComponent(cc.Widget);
        this.name_wd              = this.name_nd.getComponent(cc.Widget);
        this.message_wd           = this.message_nd.getComponent(cc.Widget);
        
        this.root_wnd.height      = 100;
        this.message_nd.height    = 24;
        this.message_bg_nd.height = 36;

        this.message_rt.addTouchHandler("handler", this.onClickItem.bind(this))
        this.notice_msg_rt.addTouchHandler("handler", this.onClickItem.bind(this))

        if (this.data){
            this.updateWidget();
            this.register();
        } 

    },

    register:function(){
        this.head_kuang_sp.node.on(cc.Node.EventType.TOUCH_START, this.upBtnStart, this);
        this.head_kuang_sp.node.on(cc.Node.EventType.TOUCH_CANCEL, this.upBtnEnd,this ) 
        this.head_kuang_sp.node.on(cc.Node.EventType.TOUCH_END, this.upBtnEnd, this);
    },

    upBtnStart:function(){
        this.stopUpdate();
        this.startUpdate();
    },

    
    upBtnEnd:function(){
        this.stopUpdate();
        if(this.totalCount < this.updateInterval){
            //小于1秒时
            this.touchHead();
        }else{
            if(this.data == null || this.data.role_list == null || this.data.role_list[0] == null || this.role_vo == null){
                this.totalCount = 0;
                this.updateTimer = 0;
                return;
            }
            if(this.data.role_list[0].rid == this.role_vo.rid && this.data.role_list[0].srv_id == this.role_vo.srv_id){
                this.totalCount = 0;
                this.updateTimer = 0;
                return;
            }
            var input = ChatController.getInstance().getChatInput();
            if(input){
                input.setInputText("@"+this.data.role_list[0].name+" ");
            }
        }
        this.totalCount = 0;
        this.updateTimer = 0;

    },

    update(dt){
        if(this.head_kuang_sp.node.active == false){
            this.totalCount = 0;
            this.updateTimer = 0;
            this.stopUpdate();
            return;
        }
        this.updateTimer += dt;
        this.totalCount += dt;
        
        if(this.updateTimer >= this.updateInterval){
            this.updateTimer = 0;
            if(this.data == null || this.data.role_list == null || this.data.role_list[0] == null || this.role_vo == null){
                this.stopUpdate();
                return;
            }

            if(this.data.role_list[0].rid == this.role_vo.rid && this.data.role_list[0].srv_id == this.role_vo.srv_id){
                this.stopUpdate();
                return;
            }
            var input = ChatController.getInstance().getChatInput();
            if(input){
                input.setInputText("@"+this.data.role_list[0].name+" ");
            }
        }
    },


    touchHead:function(){
        
        var rid, srv_id,name;
        if (this.channel === ChatConst.Channel.Friend) {
            // rid = this.data.rid;
            // srv_id = this.data.srv_id;
            return;
        } else {
            if(this.data && this.data.role_list && this.data.role_list[0]){
                rid = this.data.role_list[0].rid;
                srv_id = this.data.role_list[0].srv_id;
                name = this.data.role_list[0].name;
            }
        }
        if(rid == this.role_vo.rid)return
        Utils.playButtonSound(1);
        ChatController.getInstance().openFriendInfo({srv_id :srv_id, rid :rid,channel:this.channel,name:name}); 
    },

    onShow: function () {
    },

    // 更新数据
    updateData: function(data, msg_index, pos_y) {
        this.data = data;
        this.pos_y = pos_y;
        // if ()
    },

    // 更新布局
    updateWidget: function() {
        if (this.channel == ChatConst.Channel.System || this.data.subChanner == 256) {
            this.common_msg_nd.active = false;
            this.notice_msg_nd.active = true;
            this.root_wnd.y = - this.pos_y;
            this.notice_msg_rt.string = this.msg;
            var path = null;
            if(this.data.subChanner == 256){
              path = PathTool.getUIIconPath("mainui","txt_cn_chat_icon_gang")
            }else{
              path = PathTool.getUIIconPath("mainui","txt_cn_chat_icon_notice")
            }
            this.loadRes(path,(res)=>{
              if(res){
                this.channel_notice_icon.spriteFrame = res;
              }
            });
            this.notice_msg_nd.width = 640;
            this.notice_msg_nd.height = this.notice_msg_rt.node.height+20;
            this.notice_bg_nd.height = this.notice_msg_nd.height;
            this.root_wnd.height = this.notice_msg_nd.height+20;
            return
        } else {
            this.notice_msg_nd.active = false;
            var show_delay = cc.delayTime(0.1);
            var show_active = cc.callFunc(function () {
                this.common_msg_nd.active = true;
            }, this);
            var show_act = cc.sequence(show_delay, show_active);
            this.root_wnd.runAction(show_act);
        }

        // 布局
        if (this.is_mine) {
            this.head_wd.isAlignLeft = false;
            this.head_wd.isAlignRight = true;
            this.head_wd.right = this.head_margin;

            this.name_wd.isAlignLeft = false;
            this.name_wd.isAlignRight = true;
            this.name_wd.right = this.name_margin;

            this.message_bg_nd.anchorX = 1;
            this.message_nd.anchorX = 1;            
            // this.message_bg_nd.x =  this.msg_bg_pos - this.message_bg_nd.width;
            this.message_nd.x =  this.msg_rt_pos - 5;

            this.message_bg_nd.scaleX = -1;
        } else {
            this.head_wd.isAlignLeft = true;
            this.head_wd.isAlignRight = false;
            this.head_wd.left = this.head_margin;

            this.name_wd.isAlignLeft = true;
            this.name_wd.isAlignRight = false;
            this.name_wd.left = this.name_margin;

            this.message_bg_nd.anchorX = 0;
            this.message_nd.anchorX = 0;            
            this.message_bg_nd.x = - this.msg_bg_pos;
            this.message_nd.x = - this.msg_rt_pos;

            this.message_bg_nd.scaleX = 1;
        }

        // 设置表情
        var emoji_ids = this.chat_item_ctrl.getEmojis(this.msg);
        for (var emoji_i in emoji_ids) {
            var anima_path = PathTool.getSpinePath(emoji_ids[emoji_i]);
            this.loadRes(anima_path, function(emoji, emoji_sd) {
                this.message_rt.addEmojiAtlas(emoji_sd, emoji);
                this.message_bg_nd.height = this.message_nd.height + 12;
                this.message_bg_nd.width = this.message_nd.width + 30;     
                if (this.is_mine) {
                    this.message_bg_nd.x = this.msg_bg_pos - this.message_bg_nd.width;
                }           
            }.bind(this, emoji_ids[emoji_i]));
        }

        // 设置Imag
        var item_imgs = this.chat_item_ctrl.getImages(this.msg);
        for (var img_i in item_imgs) {
            var item_path = PathTool.getItemRes(item_imgs[img_i]);
            this.loadRes(item_path, function(item_sf) {
                this.message_rt.addSpriteFrame(item_sf);
                this.message_bg_nd.height = this.message_nd.height + 12;
                this.message_bg_nd.width = this.message_nd.width + 30;     
                if (this.is_mine) {
                    this.message_bg_nd.x = this.msg_bg_pos - this.message_bg_nd.width;
                }                 
            }.bind(this));
        }

        this.message_rt.maxWidth = 0;

        if(this.msg.indexOf("英雄") != -1) {
            let oriName = this.msg.substring(this.msg.indexOf("[") + 1, this.msg.indexOf("]"));
            let bid = this.msg.split("|")[1];
            let name = Config.partner_data.data_partner_base[bid].name;
            let result = this.msg.replace(oriName, name);
            this.msg = result;
        }

        this.message_rt.string = this.msg;
        // this.message_rt.addTouchHandler("handler", this.onClickItem.bind(this))
        this.root_wnd.y = - this.pos_y;

        if (this.message_nd.width >= 400) {
            this.message_rt.maxWidth = 400;
        } else {
            this.message_rt.maxWidth = 0;
        }
        
        this.message_bg_nd.height = this.message_nd.height + 12;
        this.message_bg_nd.width = this.message_nd.width + 30;
        if (this.is_mine) {
            this.message_bg_nd.x = this.msg_bg_pos - this.message_bg_nd.width;
        }
        this.root_wnd.height += this.message_nd.height;

        // 头像
        if (this.sp_res) {
            this.head_sp.spriteFrame = this.sp_res;
        } else {
            if (!this.is_loading) {
                this.is_loading = true;
                this.loadRes(this.head_path, function(res_object){
                    this.sp_res = res_object;
                    this.head_sp.spriteFrame = this.sp_res;
                    this.is_loading = false;
                }.bind(this))
            }
        }
        var role_data = this.data;
        if (this.channel === ChatConst.Channel.Friend) {
            role_data = this.data;
        } else {
            if(this.data && this.data.role_list && this.data.role_list[0]){
                role_data = this.data.role_list[0];
            }
        }

        // 头像框
        this.loadFrameRes(role_data.head_bid);
        // name
        var name_str = this.r_name;
        if (this.channel == ChatConst.Channel.Cross) {

        } else if (this.channel == ChatConst.Channel.Province) {
            if(this.is_mine){
                name_str = cc.js.formatStr("%s    %s", role_data.city, this.r_name);
            }else{
                name_str = cc.js.formatStr("%s    %s", this.r_name, role_data.city);
            }
        }
        this.name_lb.string = name_str;

        // sex
        if (role_data.sex !== 2 && typeof role_data.sex == "number") {
            this.sex_nd.active = true;            
            var sex_res_path = PathTool.getUIIconPath("common","common_sex" + role_data.sex);
            this.loadRes(sex_res_path, function(sex_sf) {
                this.sex_sp.spriteFrame = sex_sf;
            }.bind(this));
        } else {
            this.sex_nd.active = false;
        }

        // vip 
        if (role_data.is_show_vip === 0 && role_data.vip_lev > 0 && this.channel !== ChatConst.Channel.Province) {

        } else {       // 不显示vip

        }
    },

    //scale默认比例是大部分需要缩放所以用了100/117，其他情况结合自己界面修改scale值
    loadFrameRes: function (bid,scale) {
        if(scale == null){
            scale = 100/117;
        }
        if(typeof (bid) == "number"){
            var config = Config.avatar_data.data_avatar[bid];
            if (!config) {
                return;
            }

            var res_path = PathTool.getHeadcircle(config.res_id);
            this.loadRes(res_path, function (resObject) {
                this.head_kuang_sp.spriteFrame = resObject;
            }.bind(this))
            this.head_kuang_sp.node.scale = scale;
            if(bid == 1000){
                this.head_kuang_sp.node.y = 0;
            }else{
                this.head_kuang_sp.node.y = 5;
            }
        }else{
            if(bid == null){
                bid = PathTool.getCommonIcomPath("common_1031");
                scale = 1;
            }
            this.loadRes(bid, function (resObject) {
                this.head_kuang_sp.spriteFrame = resObject;
            }.bind(this))
            this.head_kuang_sp.node.scale = scale;
            this.head_kuang_sp.node.y = 0;
        }
    },

    onHide: function () {

    },

    onDelete: function () {
        this.stopUpdate();
        // LoaderManager.getInstance().releaseRes(this.head_path);
    },

    // content显示区域更新区域
    updateContent: function(isCache) {
        if (isCache) {
            if (this.root_wnd) {
                if(this.head_kuang_sp && this.head_kuang_sp.node){
                    this.head_kuang_sp.node.off(cc.Node.EventType.TOUCH_START, this.upBtnStart, this);
                    this.head_kuang_sp.node.off(cc.Node.EventType.TOUCH_CANCEL, this.upBtnEnd,this ) 
                    this.head_kuang_sp.node.off(cc.Node.EventType.TOUCH_END, this.upBtnEnd, this);
                }
                
                this.root_wnd.active = false;
                this.content.chat_items_cache.push(this.root_wnd);
                this.root_wnd = null;            
            }
            this.have_nd = false;
            return
        }
        var content_pos = this.content.getContentPos();
        if ((this.pos_y < content_pos + 800) && (this.pos_y > content_pos - 300)) {
            this.have_nd = true;
            if (!this.root_wnd) {
                this.initRootWind();
            } else {
                this.root_wnd.y = - this.pos_y;
            }
        } else {
            if (this.root_wnd) {
                if(this.head_kuang_sp && this.head_kuang_sp.node){
                    this.head_kuang_sp.node.off(cc.Node.EventType.TOUCH_START, this.upBtnStart, this);
                    this.head_kuang_sp.node.off(cc.Node.EventType.TOUCH_CANCEL, this.upBtnEnd,this ) 
                    this.head_kuang_sp.node.off(cc.Node.EventType.TOUCH_END, this.upBtnEnd, this);
                }
                
                this.root_wnd.active = false;
                this.content.chat_items_cache.push(this.root_wnd);
                this.root_wnd = null;
            }
            this.have_nd = false;
        }
    },

    onClickFrom: function(event, parame) {

    },

    onClickItem: function(data, parame) {
        var parames = parame.split("|");

        var link_type = parames[0];
        var sev_id = parames[1];
        var share_id = parames[2];

        ChatHelp.getInstance().onChatTouched(link_type, parame, this.data);
    },

    getId:function(){
        if(!this.data)return null;
        return this.data.id;
    }

})