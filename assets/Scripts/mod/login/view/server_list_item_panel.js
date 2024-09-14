// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-09 21:10:28
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var LoginController = require("login_controller")
var Server_list_itemPanel = cc.Class({
    extends: BasePanel,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("login", "server_cell");
        this.ctrl = LoginController.getInstance()
        this.model = this.ctrl.getModel();
    },

    // 可以初始化声明一些变量的
    initConfig: function() {

    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initPanel: function() {

        this.server_id_lb = this.seekChild("server_id", cc.Label)
        this.server_name_lb = this.seekChild("server_name", cc.Label)
        this.select_bg_nd = this.seekChild("select_bg")
        this.recomed_nd = this.seekChild("state_icon")
        this.icon_state_sp = this.seekChild("icon_state", cc.Sprite)
        this.role_info_nd = this.seekChild("role_info")
        this.addHeight = false
        if (this.data) {
            this.updateView()
        }
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.root_wnd.on('touchend', function() {
            if (this.data.is_close || gcore.SmartSocket.getTime() - this.data.open_time < 0) {
                this.model.checkReloadServerData(this.data)
                if (this.data.is_close) {
                    message(Utils.TI18N("停服维护中"))
                }
                return
            }
            // if(this.data.roles.length){
            this.serverListWindow.onClickEffect(this.itemID, this.data)
                // LoginController.getInstance().getModel().setIsSocket(true);
                // LoginController.getInstance().connectServer(this.data.host,this.data.port,this.data.ws);
                // }
        }, this);
    },

    // 预制体加载完成之后,添加到对应主节点之后的回调可以设置一些数据了
    onShow: function(params) {

    },

    // 面板设置不可见的回调,这里做一些不可见的屏蔽处理
    onHide: function() {

    },
    setData(tmplID, itemID, serverListWindow) {
        this.tmplID = tmplID;
        this.itemID = itemID;
        if (serverListWindow) {
            this.serverListWindow = serverListWindow;
        }
        this.data = this.serverListWindow.getItemData(itemID);
        if (this.data) {
            this.show();
            if (this.root_wnd) {
                this.updateView();
            }
        } else {
            this.hide();
        }

    },
    updateItem(itemID) {
        if (!this.data) return
        this.itemID = itemID;
        this.data = this.serverListWindow.getItemData(itemID);
        if (this.data) {
            this.updateView();
        }
        if (this.serverListWindow.cur_index == this.itemID) {
            this.select_bg_nd.active = true;
        } else {
            this.select_bg_nd.active = false;
        }
        if (this.serverListWindow.scroll_view == null) return;

        if (this.serverListWindow.cur_index || this.serverListWindow.cur_index == 0) {
            let y = this.getPositionY();
            if (itemID <= this.serverListWindow.cur_index) {
                if (this.addHeight == true) {
                    this.setPosition(0, y + this.serverListWindow.scroll_view.height);
                    this.addHeight = false
                }
            } else {
                if (this.addHeight == false) {
                    this.setPosition(0, y - this.serverListWindow.scroll_view.height);
                    this.addHeight = true
                } else {
                    this.setPosition(0, y + this.serverListWindow.scroll_view.height);
                    this.addHeight = false
                }

            }
        }
    },
    updateView() {
        this.server_name_lb.string = this.data.srv_name;
        this.server_id_lb.string = this.data.group_num + Utils.TI18N("服");
        this.recomed_nd.active = true
        let path;
        if (this.data.is_close) {
            path = PathTool.getUIIconPath("login2", "login2_1002");
        } else {
            if (this.data.is_new) {
                path = PathTool.getUIIconPath("login2", "login2_1000");
            } else {
                this.recomed_nd.active = false;
                path = PathTool.getUIIconPath("login2", "login2_1001");
            }
        }
        this.loadRes(path, function(res) {
            this.icon_state_sp.spriteFrame = res;
        }.bind(this))
        if (this.data.roles && this.data.roles.length) {
            this.role_info_nd.active = true;
            this.role_info_nd.getChildByName("role_sum").getComponent(cc.Label).string = this.data.roles.length;
        } else {
            this.role_info_nd.active = false;
        }

    },
    getItemID() {
        return this.itemID;
    },
    updateRoleData(roles) {
        var self = this;
        if (roles) {
            self.roles = roles;
            self.rolesNum = roles.length;
            self.roles.sort(function(a, b) {
                return b.lev - a.lev;
            })
        }

    },
    // 当面板从主节点释放掉的调用接口,需要手动调用,而且也一定要调用
    onDelete: function() {

    },
})