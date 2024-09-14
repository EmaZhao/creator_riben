// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-03-04 17:03:31
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var FunctionIconVo = require("function_icon_vo");
var MainuiConst = require("mainui_const");
var MainuiController = require("mainui_controller");
var ActionEvent = require("action_event");
var ActionController = require("action_controller");
var RoleController = require("role_controller");
var TimeTool = require("timetool")
var Function_iconPanel = cc.Class({
    extends: BasePanel,
    ctor: function () {
        this.time_ticket_desc = "";
        this.data = arguments[0];
        this.width = 0;
        this.height = 0;
        if (this.data.config.type == FunctionIconVo.type.right_top_1 || this.data.config.type == FunctionIconVo.type.right_top_2) {
            this.prefabPath = PathTool.getPrefabPath("mainui", "function_icon_left");
            this.width = 74;
            this.height = 90;
        } else if (this.data.config.type == FunctionIconVo.type.right_bottom_1 || this.data.config.type == FunctionIconVo.type.right_bottom_2) {
            this.prefabPath = PathTool.getPrefabPath("mainui", "function_icon_right");
            this.width = 74;
            this.height = 74;
        }
    },

    // 可以初始化声明一些变量的
    initConfig: function () {
        this.node_list = [];
        this.need_load = false;
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function () {
        this.container_nd = this.seekChild("main_container");
        this.button_sp = this.seekChild("button", cc.Sprite);
        this.tishi_nd = this.seekChild("tips");
        this.tishi_sp = this.seekChild("tips", cc.Sprite)
        this.skeleton = this.seekChild("skeleton", sp.Skeleton);
        this.container_nd.name = this.data.config.name;
        this.tishi_nd.active = false;

        if (this.data.config.type == FunctionIconVo.type.right_bottom_1 || this.data.config.type == FunctionIconVo.type.right_bottom_2) {
            this.num_lb = this.seekChild(this.container_nd, "num", cc.Label);
            this.num_lb.node.active = false;
            if (this.data.config.id == MainuiConst.icon.mail || this.data.config.id == MainuiConst.icon.friend) {
                this.loadRes(PathTool.getUIIconPath("mainui", "mainui_1034"), function (sp) {
                    this.tishi_sp.spriteFrame = sp;
                }.bind(this))
            }
        } else {
            this.name_lb = this.seekChild(this.container_nd, "name", cc.Label);
            this.setIconName();
        }
        this.updateInfo();
    
        //7天登录特殊处理
        if (this.data && this.data.config) {
            if (this.data.config.id == MainuiConst.icon.seven_login) {
                this.updateSevenLoginInfo();
            } else if (this.data.config.id == MainuiConst.icon.icon_charge1 || this.data.config.id == MainuiConst.icon.icon_charge2) {
                this.updateFirstChargeInfo();
            }
        }

        if(this.need_load){
            this.updateIconRes();
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function () {
        this.container_nd.on(cc.Node.EventType.TOUCH_END, function () {
            if (this.data != null || this.data.config != null) {
                Utils.playButtonSound(1);
                MainuiController.getInstance().iconClickHandle(this.data.config.id, this.data.action_id);
            }
        }, this)

        if (this.data != null) {
            if (this.update_by_self_event == null) {
                this.update_by_self_event = this.data.bind(FunctionIconVo.UPDATE_SELF_EVENT, function (key) {
                    if (key == null) {
                        this.updateInfo();
                    } else {
                        if (key == "res_id") {
                            this.updateIconRes();
                        } else if (key == "tips_status") {
                            this.updateTishiState();
                        }
                    }
                }, this)
            }

            if (this.data.id == MainuiConst.icon.seven_login) {
                this.addGlobalEvent(ActionEvent.UPDATE_SEVEN_LOGIN_STATUS, function () {
                    this.updateSevenLoginInfo();
                }, this)
            }
        }

        //     self:registerScriptHandler(function(event)
        // 	if "exit" == event then	
        // 		if self.data then
        // 			if self.update_by_self_event ~= nil then
        // 				self.data:UnBind(self.update_by_self_event)
        // 				self.update_by_self_event = nil
        // 			end
        // 			self.data = nil
        // 		end
        // 	end 
        // end)
    },

    //更新自身,现在只处理显示tips与否
    updateInfo: function () {
        this.updateTishiState();
        this.updateIconRes();
        this.setIconName();

        //首充的特殊处理
        if (this.data && this.data.config) {
            if (this.data.config.id == MainuiConst.icon.icon_charge1 || this.data.config.id == MainuiConst.icon.icon_charge2) {
                this.updateFirstChargeInfo();
            }
        }
        //推送礼包的处理
        // if(this.data && this.data.config){
        //     if(this.data.config.id == MainuiConst.icon.personal_gift){
        //         FestivalActionController:getInstance():sender26301()
        //     }
        // }
    },


    setIconName:function(){
        if(!this.name_lb || this.data == null || this.data.config == null)return;
        if(this.data.real_name && this.data.real_name!="" && this.data.real_name!="null"){
            this.name_lb.string = this.data.real_name;
        }else{
            this.name_lb.string = this.data.config.icon_name;
        }
    },

    //针对七天登录的
    updateSevenLoginInfo: function () {
        var login_data = ActionController.getInstance().getModel().getMaxSevenDay();
        if (login_data == null || login_data.day == null) return
        var day_config = gdata("login_days_data", "data_day", [login_data.day]);
        if (day_config) {
            var str = "";
            if (login_data.status == 3) {
                str = day_config.next_desc;
            } else {
                str = day_config.day_desc;
            }
            if (this.extend_label == null) {
                this.extend_label = Utils.createLabel(20, new cc.Color(0xff, 0xff, 0xff, 0xff), new cc.Color(0x34, 0x0d, 0x00, 0xff), 0, -this.container_nd.getContentSize().height / 2 - 12, '', this.container_nd, 2, cc.v2(0.5, 0.5));
                this.node_list.push(this.extend_label);
            }
            this.extend_label.string = str;
        }
    },

    updateFirstChargeInfo: function () {
        if (this.data == null) return
        var status = this.data.status;
        if (this.extend_label == null) {
            this.extend_label = Utils.createLabel(20, 1, 163, this.container_nd.getContentSize().width / 2, -12, '', this.container_nd, 2, cc.v2(0.5, 0.5));
        }
        if (status == 0) {
            this.extend_label.string = Utils.TI18N("明日可领");
        } else {
            this.extend_label.string = Utils.TI18N("可领取")
        }
    },

    updateIconRes: function () {
        if(this.root_wnd == null && this.button_sp == null){
            this.need_load = true;
            return
        }
        if (this.data != null && this.data.config != null) {
            if (this.data.config.res_type == 1) {

                var res_id = this.data.real_res_id;
                if (res_id == "") {
                    res_id = this.data.res_id;
                }
                var target_res = PathTool.getFunctionRes(res_id)
                if (target_res != this.res_id) {
                    this.res_id = target_res;
                    // if( this.button_sp && this.button_sp.spriteFrame ){
                        this.loadRes(target_res, function (sf_obj) {
                            this.button_sp.spriteFrame = sf_obj;
                        }.bind(this))
                    // }else{
                    //     this.need_load = true;
                    // }
                }
            } else {
                if (MainuiController.getInstance().getHideContainerStatus()) {
                    if (this.data.id == MainuiConst.icon.first_charge) {
                        var target_res = PathTool.getFunctionRes(this.data.res_id);
                        if (target_res != this.res_id) {
                            this.res_id = target_res;
                            // if( this.button_sp && this.button_sp.spriteFrame ){
                                this.loadRes(target_res, function (sf_obj) {
                                    this.button_sp.spriteFrame = sf_obj;
                                }.bind(this))
                            // }else{
                            //     this.need_load = true;
                            // }
                        }
                        this.button_sp.node.active = false;

                        if (this.icon_first_effect == null) {
                            this.icon_first_effect = PathTool.getSpinePath(this.data.config.icon_effect);
                            this.loadRes(this.icon_first_effect, function (res_object) {
                                this.skeleton.skeletonData = res_object;
                                this.skeleton.setAnimation(0, PlayerAction.action, true)
                            }.bind(this))
                        }

                        var get_status = false;
                        for (var i = 1; i <= 6; i++) {
                            var get_data = ActionController.getInstance().getModel().getFirstBtnStatus(i);
                            if (get_data == 1) {
                                get_status = true;
                                break
                            }
                        }
                        this.tishi_nd.active = get_status;

                        var role_vo = RoleController.getInstance().getRoleVo();
                        var num_vip_exp = role_vo.vip_exp / 10;
                        if (num_vip_exp >= 100) {
                            if (get_status == true) {
                                this.skeleton.node.active = true;
                                this.button_sp.node.active = false;
                            } else {
                                this.skeleton.node.active = false;
                                this.button_sp.node.active = true;
                            }
                        } else {
                            this.skeleton.node.active = true;
                        }
                    } else {
                        if (this.icon_effect == null) {
                            this.icon_effect = PathTool.getSpinePath(this.data.config.icon_effect);
                            this.loadRes(this.icon_effect, function (res_object) {
                                this.skeleton.skeletonData = res_object;
                                this.skeleton.setAnimation(0, PlayerAction.action, true)
                            }.bind(this))
                        }
                    }
                }
            }
        }
    },

    //开始准备倒计时
    updateTime: function () {
        if (this.data == null || this.data.config == null) return
        if (this.data.end_time > 0) {
            this.setLessTime();
        } else {
            this.removeTimeLabel();
        }
    },

    //设置倒计时
    setLessTime: function () {
        var self = this;
        var time = this.data.end_time - gcore.SmartSocket.getTime();
        if (time <= 0) {
            this.removeTimeLabel()
        } else {
            if (self.time_label == null) {
                self.time_label = Utils.createLabel(17, new cc.Color(77, 170, 128, 255), new cc.Color(255, 255, 255, 255), 0, -55, '', self.container_nd, 2, cc.v2(0.5, 0.5));
            }
            this.time_desc = ""
            // if (self.data.config.id == MainuiConst.icon.champion) {
            //     if (self.data.status == 1) {//"后开启"
            //       this.time_desc = TimeTool.getTimeForFunction(time);
            //     } else if (self.data.status == 2) {//"进行中:"
            //       this.time_desc =TimeTool.getTimeForFunction(time);
            //     }
            // } else if (self.data.config.id == MainuiConst.icon.godbattle) {
            //     if (self.data.status == 1) {//"报名中:"
            //       this.time_desc =TimeTool.getTimeForFunction(time);
            //     } else if (self.data.status == 2) {//"进行中:" 
            //       this.time_desc =TimeTool.getTimeForFunction(time);
            //     }
            // } else if (self.data.config.id == MainuiConst.icon.guildwar) {
            //     if (self.data.status == 1) {//+ "后开启"
            //       this.time_desc = TimeTool.getTimeForFunction(time) ;
            //     } else if (self.data.status == 2) {//+ "后结束"
            //       this.time_desc = TimeTool.getTimeForFunction(time) ;
            //     }
            // } else {
            //   this.time_desc = TimeTool.getTimeForFunction(time);
            // }
            this.time_desc = TimeTool.getTimeFormat(time);
            let hour = Math.floor(Number(time)/ 3600)
            if(hour>99){
              this.time_desc = "";
            }
            self.setBaseTimeInfo(this.time_desc);
        }
    },


    removeTimeLabel: function () {
        var self = this
        if (self.time_label) {
            self.time_label.node.destroy()
            self.time_label = null
        }
    },

    updateTishiState: function () {
        if (this.tishi_nd == null || this.data == null) return
        var status = this.data.getTipsStatus();
        this.tishi_nd.active = status;
        if (this.data.config.id == MainuiConst.icon.friend || this.data.config.id == MainuiConst.icon.mail) {
            var num = this.data.getTipsNum();
            if (num > 0 && this.num_lb != null) {
                this.num_lb.string = num;
                this.num_lb.node.active = true;
            } else {
                this.num_lb.node.active = false;
            }
        }
    },


    //设置通用类的倒计时显示
    setBaseTimeInfo: function (time_desc) {
        var self = this
        if (self.time_ticket_desc != time_desc) {
            self.time_ticket_desc = time_desc;
            self.time_label.string = time_desc;
        }
    },

    getTime:function () {
      if(this.time_desc){
        return this.time_desc;
      }
    },

    getData: function () {
        return this.data
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function (params) {

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function () {

    },

    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function () {
        for (var i in this.node_list) {
            var v = this.node_list[i];
            if (v instanceof cc.Node) {
                v.destroy();
                v = null;
            } else {
                v.node.destroy();
                v = null;
            }
        }
        this.node_list = null;
        if (this.data) {
            if (this.update_by_self_event != null) {
                this.data.unbind(this.update_by_self_event);
                this.update_by_self_event = null;
            }
            this.data = null;
        }
    },
})