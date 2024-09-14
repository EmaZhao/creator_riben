// --------------------------------------------------------------------
// @author: @syg.com(必填, 创建模块的人员)
// @description:
//      成员列表单元
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var PathTool = require("pathtool");
var GuildController = require("guild_controller");
var PlayerHead = require("playerhead");
var RoleController = require("role_controller");
var GuildConst = require("guild_const");
var GuildEvent = require("guild_event");

var GuildApplyItem = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("guild", "guild_member_item");
        this.ctrl = GuildController.getInstance();
    },

    initPanel: function () {
        var container = this.seekChild("container");
        this.container_img = this.seekChild("container", cc.Sprite);
        this.set_post_btn = this.seekChild("set_post_btn");
        this.role_online = this.seekChild("role_online", cc.Label);
        this.role_name = this.seekChild("role_name", cc.Label);
        this.role_position = this.seekChild("role_position", cc.Label);
        this.role_donate = this.seekChild("role_donate", cc.Label);
        this.role_day_donate = this.seekChild("role_day_donate", cc.Label);
        this.role_action = this.seekChild("role_action", cc.Label);


        this.role_head = new PlayerHead();
        this.role_head.setParent(container);
        this.role_head.show()
        this.role_head.setLev(99);
        this.role_head.setPosition(-230,0);
        this.role_head.addCallBack((function () {
            if (this.data != null) {
                if (this.data.is_self == true)
                    message(Utils.TI18N("怎么？自己都不认识了？"));
                else
                    require("friend_controller").getInstance().openFriendCheckPanel(true, { srv_id: this.data.srv_id, rid: this.data.rid });
            }
        }).bind(this))
    },

    registerEvent: function () {
        this.set_post_btn.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.data == null)
                return

            var role_vo = RoleController.getInstance().getRoleVo();
            if (role_vo.position == 1) {
                if (this.data.post != GuildConst.post_type.leader)
                    this.ctrl.openGuildOperationPostWindow(true, this.data);
            } else if (role_vo.position == 2) {
                if (this.data.post == GuildConst.post_type.member)
                    this.ctrl.openGuildOperationPostWindow(true, this.data);
                else if (this.data.post == GuildConst.post_type.leader)
                    this.ctrl.openGuildImpeachPostWindow(true);
            } else if (role_vo.position == 3) {
                if (this.data.post == GuildConst.post_type.leader)
                    this.ctrl.openGuildImpeachPostWindow(true);
            }
        }, this)

        this.addGlobalEvent(GuildEvent.UpdateMyMemberItemEvent, function (key, value) {
            if (key == "post" || key == "role_post") {
                this.setPostInfo();
                this.updateBtnStatusByRolePost();
            }
        }, this)

    },

    setData: function (data) {
        this.data = data;
        if (this.root_wnd)
            this.onShow();
    },

    onShow: function () {
        if (this.data == null)
            return
        var data = this.data;
        this.set_post_btn.active = true;
        this.setBaseData();
        this.setOnLineStatus();
        this.updateBtnStatusByRolePost();
        if (data.is_self == true) {
            // this.loadRes(PathTool.getResFrame("common", "common"), function (res_object) {
            //     this.container_img.spriteFrame = res_object.getSpriteFrame("Currency_7_1");
            // }.bind(this))
            this.loadRes(PathTool.getCommonIcomPath("Currency_7_1"), function(sf_obj){
                this.container_img.spriteFrame = sf_obj;
            }.bind(this))
        } else {
            // this.loadRes(PathTool.getResFrame("common", "common"), function (res_object) {
            //     this.container_img.spriteFrame = res_object.getSpriteFrame("Currency_7_1");
            // }.bind(this))
            this.loadRes(PathTool.getCommonIcomPath("Currency_7_1"), function(sf_obj){
                this.container_img.spriteFrame = sf_obj;
            }.bind(this))
        }

    },

    setBaseData: function () {
        if (this.data == null)
            return
        var data = this.data;
        this.role_name.string = data.name;
        this.role_head.setHeadRes(data.face);
        this.role_head.setLev(data.lev);
        this.role_donate.string = cc.js.formatStr(Utils.TI18N("贡献：%s"), data.donate);
        this.role_day_donate.string = cc.js.formatStr(Utils.TI18N("今日贡献：%s"), data.day_donate);
        this.role_action.string = cc.js.formatStr(Utils.TI18N("活跃等级：%s"), data.active_lev);
        this.setPostInfo();
    },

    //按钮的一些状态判断，比如说是否是自己需要怎么显示，以及自己是什么职位需要怎么显示
    updateBtnStatusByRolePost: function () {
        if (this.data == null)
            return
        var imprachTime = Config.guild_data.data_const.impeach_offline_day.val;
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo.position == 1) {
            if (this.data.post == GuildConst.post_type.leader)
                this.set_post_btn.active = false;
            else
                this.set_post_btn.active = true;
        } else if (role_vo.position == 2) {
            if (role_vo.position == this.data.post)
                this.set_post_btn.active = false;
            if (this.data.post == GuildConst.post_type.leader) {
                var time = gcore.SmartSocket.getTime() - this.data.login_time;
                if (time >= 86400 * imprachTime)
                    this.set_post_btn.active = true;
                else
                    this.set_post_btn.active = false;
            }
        } else if (role_vo.position == 3) {
            if (this.data.post == GuildConst.post_type.leader) {
                var time = gcore.SmartSocket.getTime() - this.data.login_time;
                if (time >= 86400 * imprachTime)
                    this.set_post_btn.active = true;
                else
                    this.set_post_btn.active = false;
            } else {
                this.set_post_btn.active = false;
            }
        }
    },

    setOnLineStatus: function () {
        if (this.data == null)
            return 
        var data = this.data;
        if (data.online == 0) {
            this.role_online.node.color = new cc.Color(0xff, 0x56, 0x70, 0xff);
            var pass_time = gcore.SmartSocket.getTime() - this.data.login_time;
            if (pass_time <= 60) {
                this.role_online.string = Utils.TI18N("刚刚");
            } else if (pass_time > 60 && pass_time <= 3600) {
                this.role_online.string = cc.js.formatStr(Utils.TI18N("%s分钟前"), Math.floor(pass_time / 60));
            }else if (pass_time > 3600 && pass_time <= 86400){
                this.role_online.string = cc.js.formatStr(Utils.TI18N("%s小时前"), Math.floor(pass_time / 3600));
            }else if (pass_time > 86400 && pass_time <= 604800){
                this.role_online.string = cc.js.formatStr(Utils.TI18N("%s天前"), Math.floor(pass_time / 86400));
            }else{
                this.role_online.string = Utils.TI18N("7天前");
            }
        }else{
            this.role_online.node.color = new cc.Color(82, 255, 111, 0xff);
            this.role_online.string = Utils.TI18N("在线");
        }

    },

    setPostInfo:function(){
        if (this.data == null)
        return
        var config = Config.guild_data.data_position[this.data.post];
        if (config != null){
            if (this.data.post == GuildConst.post_type.member)
                this.role_position.node.color = new cc.Color(0xff,0xff,0xff,0xff);
            else
                this.role_position.node.color = new cc.Color(0xcc,0x52,0xff,0xff);
            this.role_position.string = config.name;
        }
    },

    suspendAllActions:function(){

    },

    onDelete: function () {
        if (this.role_head)
            this.role_head.deleteMe();
        this.role_head = null;
    }
});

module.exports = GuildApplyItem;