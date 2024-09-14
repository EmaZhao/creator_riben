
/*-----------------------------------------------------+
 * 角色控制模块
 * @author whjing2012@163.com
 +-----------------------------------------------------*/
// var MainSceneController = require("mainscene_controller");
var RoleEvent = require("role_event");

var RoleController = cc.Class({
    extends: BaseController,
    ctor: function () {
    },

    // 初始化配置数据
    initConfig: function () {
        var RoleModel = require("role_model");
        this.model = new RoleModel();
        this.model.initConfig();

        this.is_re_connect = false;
        this.apk_data = null;
        // SDK_.get_apk_url(function(data){
        //     cc.log(data)
        //     this.apk_data = data;
        // }.bind(this))
        this.draw_vo = null;//立绘信息
        this.bStoryStatus = false;
    },

    getModel: function () {
        return this.model;
    },

    getRoleVo: function () {
        if (this.model) {
            return this.model.getRoleVo();
        }
    },

    setStoryStatus:function(status){
      this.bStoryStatus = status;
      if(status == false && this.need_set_name){
        this.openRoleSetNameView(true);
      }
    },

    // 注册监听事件
    registerEvents: function () {
        this.re_link_game_event = gcore.GlobalEvent.bind(EventId.LOADING_FINISH, function () {
            if (this.need_set_name && !this.bStoryStatus){
                this.openRoleSetNameView(true);
            }
        }.bind(this))

        if(!this.init_event){
          this.init_event = gcore.GlobalEvent.bind(RoleEvent.RefreshVertical, function(hero_vo) {
            var role_vo = this.getRoleVo()
            if(role_vo && hero_vo.bid){
              let protocal = {}
              protocal.id = hero_vo.bid;
              protocal.star = hero_vo.star;
              this.draw_vo.bid = hero_vo.bid;
              this.draw_vo.star = hero_vo.star;
              this.draw_vo.draw_res = hero_vo.draw_res;
              this.draw_vo.partner_id = hero_vo.partner_id;
              role_vo.draw_id = hero_vo.bid+"_"+hero_vo.star+"_"+hero_vo.partner_id;
              this.SendProtocal(10352, protocal);
            }
          }.bind(this))
        }
    },
    refreshDrawData:function(hero_vo){
      if(!this.draw_vo){
        this.draw_vo = {};
      }
      this.draw_vo.bid = hero_vo.bid;
      this.draw_vo.star = hero_vo.star;
      var config = Config.partner_data.data_partner_base[this.draw_vo.bid]
      if(this.draw_vo.star >=8){
        this.draw_vo.draw_res = config.awaken_draw_res;
      }else{
        this.draw_vo.draw_res = config.draw_res;
      }
    },

    getDrawData:function(){
      if(!this.draw_vo){
        this.draw_vo = {};
        var role_vo = this.getRoleVo()
        // if(typeof(role_vo.draw_id)==String){
          var str = role_vo.draw_id;
          let arr = str.split("_");
          this.draw_vo.bid = Number(arr[0])?Number(arr[0]):10401;
          var config = Config.partner_data.data_partner_base[this.draw_vo.bid]
          this.draw_vo.draw_res = config.draw_res;
          this.draw_vo.star = Number(arr[1]);
          this.draw_vo.partner_id = Number(arr[2]);
          if(Number(arr[1])>=8){
            if(config.awaken_draw_res){
              this.draw_vo.draw_res = config.awaken_draw_res;
            }
          }
        // }
      }
      return this.draw_vo;
    },

    setDrawData(hero_vo){
        if(hero_vo){
            this.draw_vo.partner_id = hero_vo.partner_id;
            this.refreshDrawData(hero_vo);
        }
    },
   
    // 注册协议接受事件
    registerProtocals: function () {
        this.RegisterProtocal(10301, this.on10301); // 角色基本信息
        this.RegisterProtocal(10302, this.on10302); // 资产信息
        this.RegisterProtocal(10315, this.on10315); // 查看角色信息
        this.RegisterProtocal(10306, this.on10306); // 战力变更推送

        this.RegisterProtocal(10352, this.on10352); // 战力变更推送
        this.RegisterProtocal(10318, this.on10318); // 允许切磋状态
        this.RegisterProtocal(10325, this.on10325); // 头像列表信息
        this.RegisterProtocal(10327, this.on10327); // 头像变更
        this.RegisterProtocal(10345, this.on10345); // 形象信息
        this.RegisterProtocal(10346, this.on10346); // 形象使用
        this.RegisterProtocal(10347, this.on10347); // 形象激活

        this.RegisterProtocal(10342, this.on10342); // 强制改名
        this.RegisterProtocal(10343, this.on10343); // 角色改名

        this.RegisterProtocal(10317, this.on10317); // 形象激活                

        this.RegisterProtocal(10316, this.on10316); // 膜拜角色
        // this.RegisterProtocal(12741, this.on12741); // 能用提示信息
        this.RegisterProtocal(12745, this.on12745); // 道具不足通用协议

        this.RegisterProtocal(10906, this.on10906); // 开服天数

        this.RegisterProtocal(10994, this.on10994); // 服务端通知整点更新
        this.RegisterProtocal(10945, this.on10945); // 媒体卡兑换

        this.RegisterProtocal(21500, this.on21500); // 头像框获取
        this.RegisterProtocal(21501, this.on21501); // 使用头像框 
        this.RegisterProtocal(21502, this.on21502); // 更新头像框 
        this.RegisterProtocal(21503, this.on21503); // 激活头像框 

        this.RegisterProtocal(23300, this.on23300); // 称号信息
        this.RegisterProtocal(23301, this.on23301); // 使用称号
        this.RegisterProtocal(23302, this.on23302); // 更新称号数据
        this.RegisterProtocal(23303, this.on23303); // 激活称号

        this.RegisterProtocal(24500, this.on24500); // 当前特权情况

        this.RegisterProtocal(10350, this.handle10350)     //-- 获取活动资产id
        this.RegisterProtocal(10351, this.handle10351)     //-- 推送活动资产id 

        this.RegisterProtocal(12770, this.handle12770)    // -- 发送举报协议
        this.RegisterProtocal(12771, this.handle12771)     //-- 获取举报协议信息

        this.RegisterProtocal(10905, this.handle10905)     //-- 世界等级

        //成长之路
        // this.RegisterProtocal(25830, this.handle25830);  //查看成长之路
        // this.RegisterProtocal(25831, this.handle25831);  //成长之路分享
        // this.RegisterProtocal(25832, this.handle25832);  //查看成长之路分享
    },

    setReconnect: function (status) {
        this.is_re_connect = status
    },

    //判断别人srv_id是不是与自己是不是同服
    isTheSameSvr: function (srv_id) {
        var is_same = this.model.isTheSame(srv_id);
        if (srv_id && is_same) {
            return true
        } else {
            return false
        }
    },

    on10352:function(data){
      let {code,msg,id,star} = data;
      message(msg);
      if(code ==1){
        if(!this.draw_vo){
          this.draw_vo ={};
        }
        this.draw_vo.bid = id;
        this.draw_vo.star = star;
        this.refreshDrawData(this.draw_vo);
      }
    },

    // 角色基本信息
    on10301: function (data) {
        cc.log("角色基本信息");
        cc.log(data);

        if (!this.init_role) {
            this.init_role = true;
            //先实例化
            this.model.initRoleBaseData(data);
            // 这里会有很多信息需要请求
            this.requestOpenSrvDay();       // 开服天数
            if(PLATFORM_TYPR == "SH_SDK"){
                SDK.roleUpLevel(this.getRoleVo().lev);
            }
            if (data.lev <= 5) {
                game.addGuideRes();
                if (data.sex == 2) {
                    game.addRenameRes();
                }
            }
            game.addChapterRes(data.chapter_id);
        
            if (data.lev < 10) {
                window.hide_loading = true;
            }

            var SysController = require("sys_controller").getInstance();
            game.preloadRes(function () {
                // this.model.initRoleBaseData(data);
                SysController.requestLoginProtocals(function () {
                    var MainUiController = require("mainui_controller");
                    MainUiController.getInstance().openMainUI(true);
                    if(window.IS_PC){
                      var ChatCtrl = require("chat_controller");
                      ChatCtrl.getInstance().openChatPanel();
                      ChatCtrl.getInstance().chat_window.setVisible(data.lev>=5);
                      var ActivityController = require("activity_controller")
                      ActivityController.getInstance().openActivityPCWindow(true);
                    }
                    if(data.sex == 2){
                      this.bStoryStatus = true;
                      var login_controller = require("login_controller");
                      login_controller.getInstance().openLoginStoryWindow(true);
                    }
                    var MainSceneController = require("mainscene_controller");
                    MainSceneController.getInstance().enterMainScene(true);
                }.bind(this));

            }.bind(this))

            gcore.GlobalEvent.fire(EventId.EVT_ROLE_CREATE_SUCCESS);

            // -- sdk等级计算
            if (IS_SUBMIT) {
                SDK.sdkSubmitUserData(3)
            }
            game.initMsgView();

        } else {
            this.model.initRoleBaseData(data);
        }
        // 断线重连抛出事件
        if (this.is_re_connect) {
            gcore.GlobalEvent.fire(EventId.EVT_RE_LINK_GAME)
            this.is_re_connect = false
        }
    },

    // 角色资产信息
    on10302: function (data) {
        this.model.initRoleAssetsData(data);
    },

    //查看角色信息
    requestRoleInfo: function (rid, srv_id) {
        if (rid == 0 || !srv_id)
            return
        var protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        this.SendProtocal(10315, protocal);
    },

    //查看角色信息
    on10315: function (data) {
        gcore.GlobalEvent.fire(RoleEvent.DISPATCH_PLAYER_VO_EVENT, data);
    },

    // 膜拜
    sender10316: function (rid, srv_id, index, type) {
        if (!rid) return;
        index = index || 0;
        type = type || 0;
        var protocal = {}
        protocal.type = type;
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        protocal.idx = index;
        this.SendProtocal(10316, protocal)
    },

    on10316: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(RoleEvent.WorshipOtherRole, data);
        }
    },

    // 更新切磋状态
    send10318: function (auto_pk) {
        this.SendProtocal(10318, { auto_pk: auto_pk });
    },

    // 更新切磋状态结果
    on10318: function (data) {
        message(data.msg);
        if (data.code == 1) {
            this.model.setRoleAttribute("auto_pk", data.auto_pk);
        }
    },

    // 请求头像列表信息
    send10325: function () {
        this.SendProtocal(10325, {});
    },

    on10325: function (data) {
        this.model.setRoleAttribute("face_list", data.face_list);
    },

    // 头像变更
    send10327: function (face_id) {
        this.SendProtocal(10327, { face_id: face_id });
    },

    on10327: function (data) {
        message(data.msg);
        if (data.code == 1) {
            this.model.setRoleAttribute("face_id", data.face_id);
        }
    },

    // 通用提示信息
    on12741: function (data) {
        // message(data.msg);
    },

    // 道具不足通用提示
    on12745: function (data) {
        var item_config = Utils.getItemConfig(data.bid);
        if (item_config) {
            if (data.bid == Config.item_data.data_assets_label2id.gold || data.bid == Config.item_data.data_assets_label2id.gold) {
                if (IS_SHOW_CHARGE == false) {
                    message(Utils.TI18N("钻石不足"));
                } else {
                    var fun = function () {
                        require("vip_controller").getInstance().openVipMainWindow(true, VIPTABCONST.CHARGE);
                    }.bind(this);
                    var str = cc.js.formatStr(Utils.TI18N('%s不足，是否前往充值'), item_config.name);
                    var CommonAlert = require("commonalert");
                    CommonAlert.show(str, Utils.TI18N('确定'), fun, Utils.TI18N('取消'), null, CommonAlert.type.rich, null, null);
                }
            } else if (data.bid == Config.item_data.data_assets_label2id.energy) {
                message(Utils.TI18N("情报不足"));
            } else {
                var config = Utils.getItemConfig(data.bid);
                if (config) {
                    var BackpackController = require("backpack_controller");
                    BackpackController.getInstance().openTipsSource(true, config.id);
                }
            }
        }
    },

    on10994: function (data) {
        if (data.type == 6 || data.type == 18) {
            require("mainscene_controller").getInstance().changeMainCityTimeType(data.type);
        } else if (data.type == 0) {
            this.requestOpenSrvDay();
            // require("primus_controller").getInstance().sender20706() //星河神殿请求红点
            require("action_controller").getInstance().requestActionRedStatus() //部分活动请求红点
            require("startower_controller").getInstance().sender11320();
        }
    },

    // 改名
    changeRoleName: function (name, sex) {
        this.SendProtocal(10343, { name: name, sex: sex });
    },

    // 改名结果
    on10343: function (data) {
        message(data.msg);
        if (data.code == 1) {
            this.model.setRoleAttribute("name", data.name);
            this.model.setRoleAttribute("sex", data.sex);
            this.model.setRoleAttribute("is_first_rename", 0);
            this.openRoleSetNameView(false)
        }
    },

    // 形象信息请求
    send10345: function () {
        this.SendProtocal(10345, {});
    },

    on10345: function (data) {
        gcore.GlobalEvent.fire(RoleEvent.GetModelList, data);
    },

    // 形象使用
    send10346: function (id) {
        this.SendProtocal(10346, { id: id });
    },

    on10346: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(RoleEvent.UpdateModel, data.id);
        }
    },

    // 形象激活
    send10347: function (id) {
        this.SendProtocal(10347, { id: id })
    },

    on10347: function (data) {
        message(data.msg);
        if (data.code == 1) {
            gcore.GlobalEvent.fire(RoleEvent.ActiveModel, data.id);
        }
    },

    // 媒体卡领取
    sender10945: function (card_id) {
        this.SendProtocal(10945, { card_id: card_id });
    },

    on10945: function (data) {
        message(data.msg);
    },

    // 头像框获取
    send21500: function () {
        this.SendProtocal(21500);
    },

    on21500: function (data) {
        gcore.GlobalEvent.fire(RoleEvent.GetFaceList, data);
    },

    // 使用头像框
    send21501: function (base_id) {
        this.SendProtocal(21501, { base_id: base_id });
    },

    on21501: function (data) {
    },

    // 更新头像框 
    on21502: function (data) {
        gcore.GlobalEvent.fire(RoleEvent.GetFaceList, data);
    },

    // 激活头像框 
    send21503: function (base_id) {
        this.SendProtocal(21503, { base_id });
    },

    on21503: function (data) {
        gcore.GlobalEvent.fire(RoleEvent.GetFaceList, data);
    },

    // 称号列表信息
    send23300: function () {
        this.SendProtocal(23300, {});
    },

    on23300: function (data) {
        this.model.setRoleAttribute("title_id", data.base_id);
        this.model.setRoleAttribute("title_list", data.honor);
        gcore.GlobalEvent.fire(RoleEvent.GetTitleList, data);
    },

    // 使用称号
    send23301: function (base_id) {
        this.SendProtocal(23301, { base_id: base_id });
    },

    on23301: function (data) {
        this.model.setRoleAttribute("title_id", data.base_id);
        gcore.GlobalEvent.fire(RoleEvent.UseTitle, data.base_id);
    },

    // 更新称号
    on23302: function (data) {
        this.model.setRoleAttribute("title_list", data.honor);
        gcore.GlobalEvent.fire(RoleEvent.UpdateTitleList, data);
    },

    // 激活称号 
    send23303: function (base_id) {
        this.SendProtocal(23303, { base_id: base_id });
    },

    on23303: function (data) {
        this.model.setRoleAttribute("title_list", data.honor);
        gcore.GlobalEvent.fire(RoleEvent.UpdateTitleList, data);
    },

    // 打开角色设置面板
    openRoleInfoView: function (status) {
        if (status == true) {
            if (!this.role_info_view) {
                var RoleSetWindow = require("role_set_window");
                this.role_info_view = new RoleSetWindow();
            }
            this.role_info_view.open();
        } else {
            if (this.role_info_view) {
                this.role_info_view.close();
                this.role_info_view = null;
            }
        }
    },

    // 打开更改装饰界面
    openRoleDecorateView: function (status, index, setting) {
        if (status) {
            if (!this.role_decorate_view) {
                var RoleDecorateWindow = require("role_decorate_window");
                this.role_decorate_view = new RoleDecorateWindow();
            }
            this.role_decorate_view.open(index, setting);
        } else {
            if (this.role_decorate_view) {
                this.role_decorate_view.close();
                this.role_decorate_view = null;
            }
        }
    },

    //判断一个人是否是自己
    checkIsSelf: function (srv_id, rid) {
        var role_vo = this.getRoleVo();
        if (role_vo == null)
            return false
        else
            return role_vo.srv_id == srv_id && role_vo.rid == rid
    },

    // 当前特权情况
    on24500: function (data) {
        this.model.setPrivilegeData(data.list)
    },

    // 请求开服天数
    requestOpenSrvDay: function () {
        this.SendProtocal(10906, {});
    },

    // 开服天数返回
    on10906: function (data) {
        this.model.setOpenSrvDay(data.open_day);
    },

    // 强制改名
    on10342: function () {
        if (game.finish_loading) {
            this.openRoleSetNameView(true)
        } else {
            this.need_set_name = true;
        }
    },

    // 点赞数量
    on10317: function () {

    },
    // --打开设置名称界面
    openRoleSetNameView(status) {
        var self = this;
        if (status == true) {
            if (self.role_setname_new == null) {
                let RoleSetNameView = require("role_setname_window")
                self.role_setname_new = new RoleSetNameView()
            }
            self.role_setname_new.open()
        } else {
            if (self.role_setname_new != null) {
                self.role_setname_new.close()
                self.role_setname_new = null
            }
        }
    },
    getRandomName(sex) {
        sex = sex || 1
        let randomName = ""
        for (let i in Config.random_name_data.data_list) {
            let config = Config.random_name_data.data_list[i] || {}
            //     -- 取出所有符合性别要求的名称
            let temp_data = []
            for (let k = 0; k < config.length; ++k) {
                let v = config[k]
                if (v && (v.sex == sex || v.sex == 0)) {
                    temp_data.push(v)
                }
            }
            let random_data = temp_data[~~(Math.random() * temp_data.length)] || []
            randomName = randomName + (random_data.name || "")
        }
        return randomName
    },

    // --[[活动资产推送]] --登陆的时候推送
    handle10350(data) {
        this.model.initRoleActionAssetsData(data.holiday_assets, false)
    },
    handle10351(data) {
        this.model.initRoleActionAssetsData(data.holiday_assets, true)
    },

    // --打开举报界面
    openRoleReportedPanel(status, rid, srv_id, play_name) {
        var self = this
        if (status == true) {
            if (self.role_reported_panel == null) {
                let RoleReportedWindow = require("role_reported_window")
                self.role_reported_panel = new RoleReportedWindow()
            }
            self.role_reported_panel.open({ rid: rid, srv_id: srv_id, play_name: play_name })
        } else {
            if (self.role_reported_panel != null) {
                self.role_reported_panel.close()
                self.role_reported_panel = null
            }
        }
    },
    // --打开钻石详情界面
    openDiamondDetailPanel(status) {
        var self = this
        if (status == true) {
            if (self.diamond_detail_panel == null) {
                let DiamondDetailWindow = require("diamond_detail_window")
                self.diamond_detail_panel = new DiamondDetailWindow()
            }
            self.diamond_detail_panel.open()
        } else {
            if (self.diamond_detail_panel != null) {
                self.diamond_detail_panel.close()
                self.diamond_detail_panel = null
            }
        }
    },
    // -----------------------------------------------举报功能协议和打开方法-------------------------
    send12770(rid, srv_id, _type, msg, history) {
        let protocal = {}
        protocal.rid = rid
        protocal.srv_id = srv_id
        protocal.type = _type || 1
        protocal.msg = msg || ""
        protocal.history = history || []
        this.SendProtocal(12770, protocal)
    },
    send12771(rid, srv_id) {
        let protocal = {}
        protocal.rid = rid
        protocal.srv_id = srv_id
        this.SendProtocal(12771, protocal)
    },
    handle12770(data) {
        message(data.msg)
    },
    handle12771(data) {
        gcore.GlobalEvent.fire(RoleEvent.ROLE_REPORTED_EVENT, data)
    },

    checkRoleSetNameViewIsOpen: function () {
        if (this.role_setname_new)
            return true
        return false
    },

    on10306: function (data) {
        var role = this.getRoleVo();
        role.setPower(data.power);
        role.setMaxPower(data.max_power);
    },


    getApkData: function () {
        if (this.apk_data) {
            return this.apk_data
        }
    },
    handle10905(data) {
        this.model.setWorldLev(data.world_lev)
    },

    //成长之路---------
    send25830: function (start, num) {
        let protocal = {};
        protocal.start = start;
        protocal.num = num;
        this.SendProtocal(25830, protocal);
    },

    handle25830: function (data) {
        cc.log("25830", data);
        //num等于1是计算红点用途
        if (data.num == 1) {
            // data.is_redpoint = this.model.checkGrowthWayRedPoint(data);
        }
        // this.model.setGrowthWayData(data);
    },

    //成长之路分享
    send25831: function (channel) {
        let protocal = {};
        protocal.channel = channel;
        this.SendProtocal(25831, protocal);
    },

    handle25831: function (data) {
        cc.log("25831", data);
    },

    //查看成长之路分享
    send25832: function (rid, srv_id, start, num) {
        let protocal = {};
        protocal.rid = rid;
        protocal.srv_id = srv_id;
        protocal.start = start;
        protocal.num = num;
        this.SendProtocal(25832, protocal);
    },

    handle25832:function(data){
        cc.log("25832",data);
    },

    //角色是否第一次创建
    isfirstRole:function(){
        let role_vo = this.getRoleVo();
        if(role_vo && role_vo.sex == 2) return true
        return false
    },
});
module.exports = RoleController;