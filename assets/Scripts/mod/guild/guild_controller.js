// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//      这里填写详细说明,主要填写该模块的功能简要
// <br/>Create: 2019-01-14 10:57:08
// --------------------------------------------------------------------
var GuildConst = require("guild_const");
var PathTool = require("pathtool");
var GuildEvent = require("guild_event");
var RoleController = require("role_controller");

var GuildController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var GuildModel = require("guild_model");
        this.model = new GuildModel();
        this.model.initConfig();
    },

    // 返回当前的model
    getModel: function () {
        return this.model;
    },

    // 注册监听事件
    registerEvents: function () {
        if (this.login_event_success == null) {
            this.login_event_success = gcore.GlobalEvent.bind(EventId.EVT_ROLE_CREATE_SUCCESS, (function () {
                gcore.GlobalEvent.unbind(this.login_event_success)
                this.login_event_success = null;

                var RoleController = require("role_controller")
                this.role_vo = RoleController.getInstance().getRoleVo()
                if (this.role_vo) {
                    this.requestInitProtocal();
                    if (this.role_assets_event == null) {
                        this.role_assets_event = this.role_vo.bind(EventId.UPDATE_ROLE_ATTRIBUTE, function (key, value) {
                            if (key == "gid") {
                                if (value == 0) {    // 这个时候表示退帮了,需要关闭一些窗体
                                    this.openGuildMainWindow(false)
                                    this.openGuildMemberWindow(false)
                                    this.openGuildDonateWindow(false)
                                } else {
                                    // 有公会的时候,如果处于初始窗体,就标识加入或者创建
                                    if (this.init_window) {
                                        this.request_open_main_window = true
                                    }
                                    this.openGuildInitWindow(false)
                                }
                                this.requestInitProtocal()
                            } else if (key == "position") {
                                this.model.updateMemberByPosition(value);
                            }
                        }.bind(this))
                    }
                }
            }).bind(this))
        }

    },

    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(13500, this.handle13500)         // 创建公会
        this.RegisterProtocal(13501, this.handle13501)         // 公会列表
        this.RegisterProtocal(13503, this.handle13503)         // 申请加入公会
        this.RegisterProtocal(13505, this.handle13505)         // 操作申请成员的列表
        this.RegisterProtocal(13507, this.handle13507)         // 更新申请加入列表
        this.RegisterProtocal(13513, this.handle13513)         // 从公会中踢人
        this.RegisterProtocal(13514, this.handle13514)         // 退帮
        this.RegisterProtocal(13516, this.handle13516)         // 解散公会
        this.RegisterProtocal(13518, this.handle13518)         // 本公会基础信息
        this.RegisterProtocal(13519, this.handle13519)         // 本公会成员列表
        this.RegisterProtocal(13520, this.handle13520)         // 职位设置
        this.RegisterProtocal(13521, this.handle13521)         // 修改宣言
        this.RegisterProtocal(13522, this.handle13522)         // 设置申请
        this.RegisterProtocal(13523, this.handle13523)         // 玩家基础捐献信息
        this.RegisterProtocal(13524, this.handle13524)         // 捐献返回
        this.RegisterProtocal(13542, this.hander13542)         // 增删更新成员
        this.RegisterProtocal(13558, this.handle13558)         // 公会招募广告

        this.RegisterProtocal(13565, this.handle13565)         // 弹劾

        this.RegisterProtocal(13568, this.handle13568)         // 修改公会名字
        this.RegisterProtocal(13573, this.handle13573)         // 公会申请列表红点

        this.RegisterProtocal(13574, this.handle13574)         // 领取捐献宝箱情况
        this.RegisterProtocal(13575, this.handle13575)         // 更新当前捐献进度值

        this.RegisterProtocal(13576, this.handle13576)         // 欢迎新人

        this.RegisterProtocal(16900, this.handle16900)
        this.RegisterProtocal(16901, this.handle16901)
        this.RegisterProtocal(16902, this.handle16902)
        this.RegisterProtocal(16903, this.handle16903)
        this.RegisterProtocal(16904, this.handle16904)
    },

    // 请求公会相关协议
    requestInitProtocal: function () {
        if (this.role_vo == null) return;
        if (this.role_vo.gid == 0) {
            this.model.clearMyGuildInfo()
        } else {
            this.SendProtocal(13518, {})
            this.SendProtocal(13523, {})
            this.SendProtocal(16900, {})
            if (this.role_vo.position != GuildConst.post_type.member) {
                this.SendProtocal(13573, {})
            }
        }
    },

    // 外部调用,打开公会的界面,会根据当前是否存在公会而去打开指定的界面
    checkOpenGuildWindow: function (index) {
        if (this.role_vo == null || this.role_vo.gid == 0) {
            this.openGuildInitWindow(true, index)
        } else {
            this.openGuildMainWindow(true, index)
        }
    },

    // 创建查找联盟列表窗体
    openGuildInitWindow: function (status, index) {
        if (!status) {
            if (this.init_window != null) {
                this.init_window.close()
                this.init_window = null
            }
        } else {
            if (this.init_window == null) {
                this.init_window = Utils.createClass("guildinit_window")
            }
            this.init_window.open(index)
        }
    },

    // 控制主界面
    openGuildMainWindow: function (status, index) {
        if (!status) {
            if (this.main_window) {
                this.main_window.close();
                this.main_window = null;
            }
        } else {
            if (this.main_window == null) {
                this.main_window = Utils.createClass("guild_main_window");
            }
            this.main_window.open(index)
        }
    },

    // 成员界面
    openGuildMemberWindow: function (status) {
        if (!status) {
            if (this.member_window) {
                this.member_window.close();
                this.member_window = null;
            }
        } else {
            if (this.member_window == null) {
                this.member_window = Utils.createClass("guild_member_window");
            }
            this.member_window.open()
        }
    },

    // 捐献界面
    openGuildDonateWindow: function (status) {
        if (!status) {
            if (this.donate_window) {
                this.donate_window.close();
                this.donate_window = null;
            }
        } else {
            if (this.role_vo == null || !this.role_vo.isHasGuild()) {
                message(Utils.TI18N("您暂时还没有加入公会"));
                return
            }
            if (this.donate_window == null) {
                this.donate_window = Utils.createClass("guild_donate_window");
            }
            this.donate_window.open()
        }
    },

    //
    openGuildApplyWindow: function (status) {
        if (!status) {
            if (this.apply_window) {
                this.apply_window.close();
                this.apply_window = null;
            }
        } else {
            if (this.apply_window == null) {
                this.apply_window = Utils.createClass("guild_apply_window");
            }
            this.apply_window.open()
        }
    },

    //打开公会活跃面板
    openGuildActionGoalWindow: function (status) {
        if (!status) {
            if (this.goal_window) {
                this.goal_window.close();
                this.goal_window = null;
            }
        } else {
            if (this.goal_window == null) {
                this.goal_window = Utils.createClass("guild_action_goal_window");
            }
            this.goal_window.open()
        }
    },

    //打开公会活跃奖励预览面板
    openGuildRewardWindow: function (status) {
        if (!status) {
            if (this.reward_window) {
                this.reward_window.close();
                this.reward_window = null;
            }
        } else {
            if (this.reward_window == null) {
                this.reward_window = Utils.createClass("guild_reward_window");
            }
            this.reward_window.open()
        }
    },

    //公会申请设置面板
    openGuildApplySetWindow: function (status) {
        if (!status) {
            if (this.apply_set_window) {
                this.apply_set_window.close();
                this.apply_set_window = null;
            }
        } else {
            if (this.apply_set_window == null) {
                this.apply_set_window = Utils.createClass("guild_apply_set_window");
            }
            this.apply_set_window.open()
        }
    },

    //职位任免和踢人面板
    openGuildOperationPostWindow: function (status, data) {
        if (!status) {
            if (this.operation_post_window) {
                this.operation_post_window.close();
                this.operation_post_window = null;
            }
        } else {
            if (this.operation_post_window == null) {
                this.operation_post_window = Utils.createClass("guild_operation_post_window");
            }
            this.operation_post_window.open(data);
        }
    },

    //弹劾帮主
    openGuildImpeachPostWindow: function (status) {
        if (!status) {
            if (this.impeach_post_window) {
                this.impeach_post_window.close();
                this.impeach_post_window = null;
            }
        } else {
            if (this.impeach_post_window == null) {
                this.impeach_post_window = Utils.createClass("guild_impeach_post_window");
            }
            this.impeach_post_window.open();
        }
    },

    //公会改名面板
    openGuildChangeNameWindow: function (status) {
        if (!status) {
            if (this.change_name_window) {
                this.change_name_window.close();
                this.change_name_window = null;
            }
        } else {
            if (this.change_name_window == null) {
                this.change_name_window = Utils.createClass("guild_change_name_window");
            }
            this.change_name_window.open();
        }
    },

    //公会宣言修改
    openGuildChangeSignWindow: function (status) {
        if (!status) {
            if (this.change_sign_window) {
                this.change_sign_window.close();
                this.change_sign_window = null;
            }
        } else {
            if (this.change_sign_window == null) {
                this.change_sign_window = Utils.createClass("guild_change_sign_window");
            }
            this.change_sign_window.open();
        }
    },


    //请求创建公会
    //@name:公会名字
    //@sign:宣言
    //@apply_type:申请类型(0:自动审批 1:手动审批 2:不允许申请)
    //@apply_lev:最小等级要求
    requestCreateGuild: function (name, sign, apply_type, apply_lev) {
        var protocal = {};
        protocal.name = name;
        protocal.sign = sign;
        protocal.apply_lev = apply_lev || 1;
        protocal.apply_type = apply_type || 0;
        this.SendProtocal(13500, protocal);
    },

    //创建公会返回
    handle13500: function (data) {
        message(data.msg);
    },

    //请求公会列表
    //@page:页码
    //@flag:是否显示满人的公会 0:不显示 1:显示
    //@num:每页显示条数
    //@name:如果不为“”表示是搜索
    requestGuildList: function (page, flag, num, name) {
        var protocal = {};
        protocal.page = page || 0;
        protocal.flag = flag || 1;
        protocal.num = num || 0;
        protocal.name = name || "";
        this.SendProtocal(13501, protocal);
    },

    //获取公会列表
    handle13501: function (data) {
        this.model.updateGuildList(data.name, data.guilds);
    },

    //申请加入公会
    requestJoinGuild: function (gid, gsrv_id, type) {
        if (gid == null || gsrv_id == null)
            return
        var protocal = {};
        protocal.gid = gid;
        protocal.gsrv_id = gsrv_id;
        protocal.type = type || 1;
        this.SendProtocal(13503, protocal);
    },

    //请求加入公会返回
    handle13503: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.model.updateGuildApplyStatus(data.gid, data.gsrv_id, data.is_apply);
    },

    //更新自己公会的信息
    handle13518: function (data) {
        this.model.updateMyGuildInfo(data);
        //
        if (this.request_open_main_window == true) {
            this.request_open_main_window = false;
            this.openGuildMainWindow(true);
        }
    },

    //弹劾帮主
    send13565: function () {
        this.SendProtocal(13565, {});
    },

    handle13565: function (data) {
        message(data.msg);
    },

    //请求公会成员列表
    requestGuildMemberList: function () {
        this.SendProtocal(13519, {});
    },

    //更新整个公会成员列表
    handle13519: function (data) {
        this.model.updateMyGuildMemberList(data.members, 1);
    },

    handle13523: function (data) {
        this.model.updateDonateInfo(data.donate_list);
        //更新捐献宝箱情况
        this.model.updateDonateBoxInfo(data.boxes, data.donate_exp);
        require("redbag_controller").getInstance().getModel().updateRedBagNum(data.day_send_num,data.day_recv_num);
    },

    //请求公会捐献
    requestGuildDonate: function (type) {
        var protocal = {};
        protocal.type = type;
        this.SendProtocal(13524, protocal);
    },

    //公会捐献返回
    handle13524: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.model.setGuildDonateStatus();
    },

    //更新，增加或者删除成员
    hander13542: function (data) {
        this.model.updateMyGuildMemberList(data.members, data.type);
    },

    //会长或者副会长处理操作申请列表
    requestOperationApply: function (type, rid, srv_id) {
        var protocal = {};
        protocal.type = type;
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(13505, protocal);
    },

    //操作申请玩家列表返回
    handle13505: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.model.deleteApplyInfo(data.rid, data.srv_id);
    },

    //请求当前申请加入的公会列表
    requestGuildApplyList: function (page, num) {
        var protocal = {};
        protocal.page = page;
        protocal.num = num;
        this.SendProtocal(13507, protocal);
    },

    //更新申请列表
    handle13507: function (data) {
        this.model.updateGuildApplyList(data.guids);
    },

    //请求退帮
    requestExitGuild: function () {
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo == null)
            return
        if (role_vo.position == GuildConst.post_type.leader) {          //自己是帮主，则是解散公会
            var msg = cc.js.formatStr(Utils.TI18N("是否确定解散公会【%s】？"), role_vo.gname);
            var extend_msg = "";
            if (role_vo.guild_quit_time != 0)
                extend_msg = Utils.TI18N("(解散公会后，会长将在24小时内无法加入其他公会)");
            else
                extend_msg = Utils.TI18N("(首次退出或解散公会后，可立即加入其他公会。)");
            var CommonAlert = require("commonalert");
            CommonAlert.show(msg, Utils.TI18N("确定"), (function () {
                this.SendProtocal(13516, {});
            }).bind(this), Utils.TI18N("取消"), null, null, null, { timer: 3, timer_for: true, off_y: 43, title: Utils.TI18N("解散公会"), extend_str: extend_msg, extend_offy: -5, extend_aligment: cc.TEXT_ALIGNMENT_CENTER });
        } else {
            var msg = cc.js.formatStr(Utils.TI18N("是否确定退出公会【%s】？"), role_vo.gname);
            var extend_msg = "";
            if (role_vo.guild_quit_time != 0)
                extend_msg = Utils.TI18N("(退出公会后12小时内无法加入其他公会)");
            else
                extend_msg = Utils.TI18N("(首次退出公会可立即加入其它公会)");
            var CommonAlert = require("commonalert");
            CommonAlert.show(msg, Utils.TI18N("确定"), (function () {
                this.SendProtocal(13514, {});
            }).bind(this), Utils.TI18N("取消"), null, null, null, { timer: 3, timer_for: true, off_y: 43, title: Utils.TI18N("退出公会"), extend_str: extend_msg, extend_offy: -5, extend_aligment: cc.TEXT_ALIGNMENT_CENTER });
        }
    },

    //退帮
    handle13514: function (data) {
        message(data.msg);
    },

    //解散
    handle13516: function (data) {
        message(data.msg);
    },

    //设置修改申请条件
    requestChangeApplySet: function (apply_type, apply_lev) {
        var protocal = {};
        protocal.apply_type = apply_type;
        protocal.apply_lev = apply_lev;
        this.SendProtocal(13522, protocal);
    },

    //设置权限返回
    handle13522: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.openGuildApplySetWindow(false);
    },

    //请求修改公会宣言
    requestChangeGuildSign: function (sign) {
        var protocal = {};
        protocal.sign = sign;
        this.SendProtocal(13521, protocal);
    },

    //公会宣言修改
    handle13521: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.openGuildChangeSignWindow(false);
    },

    //从公会中踢人
    requestKickoutMember: function (rid, srv_id, name) {
        var call_back = function () {
            var protocal = {};
            protocal.rid = rid;
            protocal.srv_id = srv_id;
            this.SendProtocal(13513, protocal);
        }.bind(this)

        var msg = cc.js.formatStr(Utils.TI18N("是否确认将【%s】玩家移除出公会？"), name);
        var CommonAlert = require("commonalert");
        CommonAlert.show(msg, Utils.TI18N("确定"), function () { call_back() }.bind(this), Utils.TI18N("取消"))
    },

    //踢人返回
    handle13513: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.openGuildOperationPostWindow(false);
    },

    //职位任命
    requestOperationPost: function (rid, srv_id, position) {
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        protocal.position = position;
        this.SendProtocal(13520, protocal);
    },

    handle13520: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.openGuildOperationPostWindow(false);
    },

    //请求改名
    requestChangGuildName: function (name) {
        var protocal = {};
        protocal.name = name;
        this.SendProtocal(13568, protocal);
    },

    //公会改名
    handle13568: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.openGuildChangeNameWindow(false);
    },

    //发送公会招募广告
    requestGuildRecruit: function () {
        var my_info = this.model.getMyGuildInfo();
        if (my_info != null) {
            if (my_info.recruit_num == 0) {
                var msg = Utils.TI18N("是否确定发布招募公告？\n\n<color=#AA6111><size=22>每日首次发布公告免费</size></c>");
                var extend_msg = Utils.TI18N("（每日首次发布公告免费）");
                var CommonAlert = require("commonalert");
                CommonAlert.show(msg, Utils.TI18N("确定"), function () {
                    this.SendProtocal(13558, {})
                }.bind(this), Utils.TI18N("取消"), null, null, null,null)
            } else {
                var config = gdata("guild_data", "data_const", "recruit_cost");
                var role_vo = RoleController.getInstance().getRoleVo();
                if (config && role_vo) {
                    var total = role_vo.getTotalGold();
                    var extend_msg = cc.js.formatStr(Utils.TI18N("<color=#AA6111><size=22>发布消耗：<img src='%s' scale=0.5 />%s/%s</size></c>"),15, Utils.getMoneyString(total), config.val)
                    var msg = cc.js.formatStr(Utils.TI18N("是否确定花费<img src='%s' scale=0.5 />%s发布招募广告？\n\n%s"), 15, config.val,extend_msg);
                    var CommonAlert = require("commonalert")
                    var res =  PathTool.getItemRes(15);
                    CommonAlert.show(msg, Utils.TI18N("确定"), function () {
                        this.SendProtocal(13558, {})
                    }.bind(this), Utils.TI18N("取消"), null, 2, null, {resArr:[res]})
                }
            }
        }
    },

    //招募广告返回
    handle13558: function (data) {
        message(data.msg);
    },

    //公会申请红点
    handle13573: function (data) {
        this.model.updateGuildRedStatus(GuildConst.red_index.apply, (data.code == 1));
    },

    //有玩家申请加入的提示
    setApplyListStatus: function (data) {
        this.model.updateGuildRedStatus(GuildConst.red_index.apply, true);
    },

    //请求领取指定捐献宝箱
    requestDonateBoxRewards: function (box_id) {
        var protocal = {};
        protocal.box_id = box_id;
        this.SendProtocal(13574, protocal);
    },

    //领取捐献宝箱返回
    handle13574: function (data) {
        message(data.msg);
        if (data.code == 1)
            this.model.setDonateBoxStatus(data.box_id);
    },

    //更新捐献进度值
    handle13575: function (data) {
        this.model.updateDonateActivity(data.donate_exp);
    },

    welcomeNewMember: function (rid, srv_id) {
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(13576, protocal);
    },

    handle13576: function (data) {
        message(data.msg)
    },

    //--------------公会活跃
    //基本信息
    send16900: function () {
        this.SendProtocal(16900, {});
    },

    handle16900: function (data) {
        this.model.updataGuildActionRedStatus(data);
        gcore.GlobalEvent.fire(GuildEvent.UpdataGuildGoalBasicData, data);
    },

    //任务信息
    send16901: function () {
        this.SendProtocal(16901, {});
    },

    handle16901: function (data) {
        gcore.GlobalEvent.fire(GuildEvent.UpdataGuildGoalTaskData, data);
    },

    //单条任务信息
    handle16902: function (data) {
        gcore.GlobalEvent.fire(GuildEvent.UpdataGuildGoalSingleTaskData, data);
    },

    //提交任务
    send16903: function (id) {
        var protocal = {};
        protocal.id = id;
        this.SendProtocal(16903, protocal);
    },

    handle16903: function (data) {
        message(data.msg);
    },

    send16904: function () {
        this.SendProtocal(16904, {});
    },

    handle16904: function (data) {
        message(data.msg);
    },


    getGuildMainRootWnd:function(){
        if(this.main_window){
            return this.main_window.root_wnd
        }
    },

});

module.exports = GuildController;
