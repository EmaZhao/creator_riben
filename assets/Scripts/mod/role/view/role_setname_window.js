// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-17 21:12:43
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var RoleController = require("role_controller")
var LoginController = require("login_controller");

var Role_setnameWindow = cc.Class({
    extends: BaseView,
    ctor: function () {
        this.prefabPath = PathTool.getPrefabPath("roleinfo", "role_setname_view");
        this.viewTag = SCENE_TAG.dialogue;                //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        // this.win_type = WinType.Full;               //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = RoleController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function () {
        this.sex_select = 1; //--当前选择的性别 1:boy 2:girl
        this.bind_role = true;
        this.is_bind_code = null;
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function () {
        // 关闭loading界面

        var self = this;

        self.main_panel = self.root_wnd.getChildByName("main_panel");
        this.background = this.seekChild("background");
        this.background.scale = FIT_SCALE;

        self.boy_btn = self.seekChild("boy_btn");
        self.boy_btn.active = false
        // self.boy_btn:setSelected(false)
        self.girl_btn = self.seekChild("girl_btn");
        self.girl_btn.active = false;
        // self.girl_btn:setSelected(false)

        // -- 提交按钮
        self.submit_btn = self.main_panel.getChildByName("btn_submit");
        // self.submit_btn.setPosition(cc.v2(353, 307.5));
        self.submit_btn.active = false;

        // -- 随机按钮
        self.random_btn = self.main_panel.getChildByName("btn_random");
        // self.random_btn.setPosition(cc.v2(517, 491));
        self.random_btn.active = false;
        // self.random_btn.setletZOrder(11)

        // -- 性别选择按钮
        // self.boy_btn.setPosition(cc.v2(289, 393));
        // self.girl_btn.setPosition(cc.v2(447.5, 393));

        // -- 名字输入框
        self.input_edit = this.seekChild("input_edit");
        // self.input_edit.setPosition(360, 490);
        self.input_edit.active = false;
        // let randomName = RoleController.getInstance().getRandomName(self.sex_select);
        self.input_edit.getComponent(cc.EditBox).string = "";

        //邀请码
        this.invite_code_edit = this.seekChild("invite_code_edit");
        this.invite_code_edit.setPosition(437, 377);
        this.invite_code_edit.active = false;

        var effect_id = 237;
        var code_visible = true;
        var boy = [374.5, 454];
        var gird = [499.5, 454];
        var subit = [353, 296.5];
        var edit = [360, 522];
        var random = [517, 522];
        // if (!SHOW_SINGLE_INVICODE) {
        if (false) {
            effect_id = 234;
            code_visible = false;
            boy = [288, 393];
            gird = [448.5, 393];
            subit = [353, 307];
            edit = [347, 491];
            random = [519, 493];
        }
        self.boy_btn.setPosition(cc.v2(boy[0], boy[1]));
        self.girl_btn.setPosition(cc.v2(gird[0], gird[1]));
        self.submit_btn.setPosition(cc.v2(subit[0], subit[1]));
        self.input_edit.setPosition(edit[0], edit[1]);
        // self.random_btn.setPosition(cc.v2(random[0], random[1]));

        this.bg_sk = self.seekChild("action", sp.Skeleton);
        this.bg_sk.setCompleteListener((function () {

        }.bind(this)))
        let sketon_path = PathTool.getSpinePath(PathTool.getEffectRes(effect_id), "action")
        
            LoginController.getInstance().updateLoading(1);
            this.close_login_ticket = gcore.Timer.set(function(){
                LoginController.getInstance().openLoginWindow(false);
                gcore.Timer.del(this.close_login_ticket);
            }.bind(this), 100, 1)

        this.loadRes(sketon_path, function (skeleton_data) {
            this.bg_sk.skeletonData = skeleton_data;
            this.bg_sk.setAnimation(0, "action1", false);
            

            Utils.delayRun(this.root_wnd, 1.2, function () {
                self.input_edit.active = true;
                self.submit_btn.active = true;
                self.boy_btn.active = true;
                self.girl_btn.active = true;
                // self.random_btn.active = true;
                self.invite_code_edit.active = code_visible;


            }.bind(this))
            
        }.bind(this));

    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        // this.random_btn.on('click', function () {
        //     let sex_select = 1;
        //     if (this.boy_btn.getComponent(cc.Toggle).isChecked) {
        //         sex_select = 1;
        //     } else {
        //         sex_select = 2;
        //     }
        //     let randomName = this.ctrl.getRandomName(sex_select);
        //     this.input_edit.getComponent(cc.EditBox).string = randomName;
        // }, this)
        // this.submit_btn.on('click', function () {
        //     let name = this.input_edit.getComponent(cc.EditBox).string
        //     let text = name.replace("\n", "")
        //     let sex = 1;
        //     if (this.boy_btn.getComponent(cc.Toggle).isChecked) {
        //         sex = 1;
        //     } else {
        //         sex = 0;
        //     }
        //     if (name == "") {
        //         message("请输入姓名~");
        //     } else {
        //         this.ctrl.changeRoleName(text, sex);
        //     }
        // }, this)
        var InviteCodeEvent = require("invitecode_event");
        this.addGlobalEvent(InviteCodeEvent.BindCode_Invite_Event, function (data) {
            this.bind_role = true;
            if (data.code == 1) {
                this.is_bind_code = true;
                var name = this.input_edit.getComponent(cc.EditBox).string;
                if (name != "") {
                    var text = name.replace("\n", "");
                    var sex = 1;
                    if (this.boy_btn.getComponent(cc.Toggle).isChecked) {
                        sex = 1;
                    } else {
                        sex = 0;
                    }
                    this.ctrl.changeRoleName(text, sex);
                    if (PLATFORM_TYPR == "SH_RH" && PLATFORM_NAME == "shmix"){
                        let vo = this.setRoleInfo(text)
                        SDK.createRole2(vo);
                    }
                } else if (name == "") {
                    message(Utils.TI18N("请输入姓名~"));
                }
            }
        }, this)
        this.submit_btn.on('click', function () {
            if (this.bind_role == false) {
                message(Utils.TI18N("正在绑定推荐码中~~~"));
                return
            }
            if (this.invite_code_edit.getComponent(cc.EditBox).string != "" && !this.is_bind_code) {
                this.bind_role = false;
                var text = this.invite_code_edit.getComponent(cc.EditBox).string;
                text = text.match(/\d+/g);
                if (this.send_code_ticket == null) {
                    this.send_code_ticket = gcore.Timer.set(function () {
                        this.bind_role = true;
                        if (this.send_code_ticket != null) {
                            gcore.Timer.del(this.send_code_ticket);
                            this.send_code_ticket = null;
                        }
                    }.bind(this), 1000, 1)
                }
                require("invitecode_controller").getInstance().sender19801(Number(text));
            } else {
                var name = this.input_edit.getComponent(cc.EditBox).string;
                if (name != "") {
                    var text = name.replace("\n", "");
                    var sex = 1;
                    if (this.boy_btn.getComponent(cc.Toggle).isChecked) {
                        sex = 1;
                    } else {
                        sex = 0;
                    }
                    this.ctrl.changeRoleName(text, sex);
                    if (PLATFORM_TYPR == "SH_RH" && PLATFORM_NAME == "shmix"){
                        let vo = this.setRoleInfo(text)
                        SDK.createRole2(vo);
                    }
                } else if (name == "") {
                    message(Utils.TI18N("请输入姓名~"));
                }
            }
        }, this)
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function (params) {

    },

    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function () {
        this.bg_sk.skeletonData = null;
    },

    setRoleInfo : function (name) {
        let loginData = LoginController.getInstance().getModel().getLoginData();
        if (loginData.srv_id == "") return;
        let roleVo = RoleController.getInstance().getRoleVo() || data;
        // console.log("roleVo,data===", roleVo, data)
        let srv_id = "";
        if (roleVo && roleVo.srv_id) {
            srv_id = roleVo.srv_id;
        } else if (loginData.srv_id) {
            srv_id = loginData.srv_id;
        }
        let index = srv_id.indexOf("_");
        if (index != -1) {
            srv_id = Number(srv_id.slice(index + 1, srv_id.length));
        } else {
            srv_id = 0;
        }

        let role_info = {
            role_id: roleVo.rid || 0,//角色ID
            role_name: name || "",//角色名
            role_level: roleVo && roleVo.lev || 1,//角色等级
            server_id: srv_id,//区服编号
            server_name: loginData.srv_name, //区服名称
            has_gold: roleVo && roleVo.getTotalGold() || 0,//角色所持有货币数
            vip_level: roleVo && roleVo.vip_lev || 0,//角色vip等级 没有可以不传或传0
            role_power: roleVo && roleVo.power || 0, //int 战力、武力之类角色的核心数值，没有可以传0（尽量上传）
            create_time: roleVo && roleVo.reg_time || 0 //角色创建时间，时间戳，单位：秒
        };
        cc.log(roleVo,role_info)
        return role_info
    }
})