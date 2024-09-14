// --------------------------------------------------------------------
// @author: xxx@syg.com(必填, 创建模块的人员)
// @description:
//     这里是描述这个窗体的作用的
// <br/>Create: 2019-04-09 20:28:48
// --------------------------------------------------------------------
var PathTool = require("pathtool");
var ServerListItem = require("server_list_item_panel")
var LoginController = require("login_controller")
var LoginEvent = require("login_event");
const TimeTool = require("../../../util/timetool");

var Server_listWindow = cc.Class({
    extends: BaseView,
    ctor: function() {
        this.prefabPath = PathTool.getPrefabPath("login", "server_panel_view");
        this.viewTag = SCENE_TAG.dialogue; //该窗体所属ui层级,全屏ui需要在ui层,非全屏ui在dialogue层,这个要注意
        this.win_type = WinType.Full; //是否是全屏窗体  WinType.Full, WinType.Big, WinType.Mini, WinType.Tips
        this.ctrl = LoginController.getInstance()
    },

    // 初始化一些配置数据,可以用于声明一些变量之类的
    initConfig: function() {
        this.spacing = 0 //y间隔为0
        this.spawnCount = 10 //预加载总数
        this.itemTemplate = 86 //块的高度
        this.items = [];
        this.cur_index = null
    },

    // 预制体加载完成之后的回调,可以在这里捕获相关节点或者组件
    openCallBack: function() {

        Utils.getNodeCompByPath("main_container/win_title", this.root_wnd, cc.Label).string = Utils.TI18N("选择服务器");
        Utils.getNodeCompByPath("main_container/status_tips_1", this.root_wnd, cc.Label).string = Utils.TI18N("爆满");
        Utils.getNodeCompByPath("main_container/status_tips_2", this.root_wnd, cc.Label).string = Utils.TI18N("流畅");
        Utils.getNodeCompByPath("main_container/status_tips_3", this.root_wnd, cc.Label).string = Utils.TI18N("维护");
        this.scrollView = this.seekChild("server_scroll_view", cc.ScrollView)
        this.serverListView = this.seekChild("serverListView", cc.ScrollView)
        this.close_btn_nd = this.seekChild("close_btn")
        this.viewHeight = this.scrollView.node.height
        this.content = this.scrollView.content;
        this.bufferZone = 390;
    },

    // 注册事件监听的接口,不需要手动调用,如果是使用gcore.GlobalEvent监听,可以直接调用addGlobalEvent
    registerEvent: function() {
        this.scrollView.node.on('scrolling', this.checkRectIntersectsRect, this);
        this.close_btn_nd.on("touchend", function() {
            this.ctrl.openServerList(false)
        }, this)
        this.addGlobalEvent(LoginEvent.LOGIN_EVENT_PLAYER_INFO, function(data) {
            this.setRolesInfo(data.roles)
        }.bind(this))
    },
    checkRectIntersectsRect(event) {
        if (event.getScrollOffset().y < 0) return
        let interval = Math.abs(this.scrollView.content.y - this.lastContentPosY)
        if (interval < 20) {
            return
        }
        let items = this.items;
        let buffer = this.bufferZone;
        let isDown = this.scrollView.content.y < this.lastContentPosY; // scrolling direction 304 < 0 
        let offset = (this.itemTemplate + this.spacing) * items.length; //预加载的总高度
        for (let i = 0; i < items.length; ++i) {
            if (!items[i].data) {
                continue
            }
            let viewPos = this.getPositionInView(items[i]);
            let height = 0
            if (this.scroll_view) {
                height = this.scroll_view.height
            }
            if (isDown) {
                // if away from buffer zone and not reaching top of content
                if (viewPos.y < -buffer && items[i].getPositionY() + offset + height < 0) {
                    items[i].setPosition(0, items[i].getPositionY() + offset)
                    let item = items[i];
                    let itemId = item.itemID - items.length; // update item id
                    item.updateItem(itemId);
                }
            } else {
                // if away from buffer zone and not reaching bottom of content
                if (viewPos.y > buffer && items[i].getPositionY() - offset - height > -this.content.height) {
                    let y = items[i].getPositionY() - offset
                    items[i].setPosition(0, y)
                    let item = items[i]
                    let itemId = item.itemID + items.length;
                    item.updateItem(itemId);
                }
            }
        }
        // update lastContentPosY
        this.lastContentPosY = this.scrollView.content.y;
    },
    // 预制体加载完成之后,添加到对应主节点之后的回调,也就是一个窗体的正式入口,可以设置一些数据了
    openRootWnd: function(data) {
        data = Utils.deepCopy(data)
            // group_id 在区号   group_num 为服号
        this.server_list = {}
        for (let i = 0; i < data.length; ++i) {
            if (!this.server_list[data[i].group_id]) {
                this.server_list[data[i].group_id] = []
            }
            var serverOpenTime = data[i].open_time || data[i].begin_time;
            var serverTime = gcore.SmartSocket.getTime();
            if(serverOpenTime > serverTime){
              continue;
            }
            this.server_list[data[i].group_id].push(data[i])
        }
        for (let i in this.server_list) {
            this.server_list[i].sort(function(a, b) {
                return b.group_num - a.group_num
            })
        }
        let prefabPath1 = PathTool.getPrefabPath("login", "server_list_item");
        let count = 0
        for (let i in this.server_list) {
            let num = count
            this.loadRes(prefabPath1, function(prefab) {
                let node = prefab;
                this.serverListView.content.addChild(node)
                node.getChildByName("list_desc").getComponent(cc.Label).string = this.ctrl.getModel().getSrvGroupNameByGroupId(i) //ServerData[i] || i
                node.on('toggle', function(event) {
                    this.cur_zone = i
                    this.initialize()
                }, this);
                node.x = 0
                node.y = -node.height / 2 - num * node.height
                if (num == 0 && node.getComponent(cc.Toggle).isChecked == false) {
                    node.getComponent(cc.Toggle).check()
                }
                this.serverListView.content.height = num * node.height
            }.bind(this))
            count++
        }
    },
    initialize() {
        this.scrollView.stopAutoScroll()
        this.data = this.server_list[this.cur_zone]
        this.cur_index = null
        for (let i = 0; i < this.items.length; ++i) {
            this.items[i].deleteMe()
            this.items[i] = null
        }
        if (this.scroll_view) {
            this.scroll_view.destroy()
            this.scroll_view = null
        }
        this.items = []
        this.lastContentPosY = 0;
        this.content.y = this.viewHeight / 2
        this.content.height = this.data.length * (this.itemTemplate + this.spacing) + this.spacing; //获取总高度
        for (let i = 0; i < this.spawnCount; ++i) { // spawn items, we only need to do this once
            let item = new ServerListItem()
            item.setParent(this.content)
            item.setPosition(0, -this.itemTemplate * (0.5 + i) - this.spacing * (i + 1));
            item.setData(i, i, this);
            this.items.push(item);
        }
    },
    getPositionInView(item) {
        let worldPos = item.root_wnd.parent.convertToWorldSpaceAR(cc.v2(item.getPositionX(), item.getPositionY()));
        let viewPos = this.scrollView.node.convertToNodeSpaceAR(worldPos);
        return viewPos;
    },
    getItemData(index) {
        if (this.data[index]) {
            return this.data[index]
        }
    },
    onClickEffect(index, server) {
        if (this.cur_index == index) return
        if (this.scroll_view) {
            this.content.height -= this.scroll_view.height;
            for (let i = 0; i < this.items.length; ++i) {
                let id = this.items[i].getItemID();
                this.items[i].updateItem(id);
            }
            this.scroll_view.destroy()
            this.scroll_view = null
        }
        this.cur_index = index;
        this.ctrl.getModel().setCurServer(server)
        this.ctrl.getModel().setIsSocket(true);
        this.ctrl.connectServer(this.data.host, this.data.port, this.data.ws);
    },
    addCallBack(callFunc) {
        this.callBack = callFunc;
    },
    setRolesInfo(data) {
        this.createView(data)
        for (let i = 0; i < this.items.length; ++i) {
            let id = this.items[i].getItemID();
            this.items[i].updateItem(id);
        }
        let y = -(this.cur_index + 1) * this.itemTemplate + -this.scroll_view.height / 2;
        this.scroll_view.setPosition(0, y)
    },
    createView(data) {
        let parent = new cc.Node();
        this.scroll_view = parent
        this.content.addChild(parent);
        let height;
        if (data.length > 1) {
            height = 190;
        } else {
            height = 95;
        }
        parent.setContentSize(400, height)
        this.content.height += height;
        let path = PathTool.getPrefabPath("common", "common_scroll_view");
        this.loadRes(path, function(Prefab) {
            let view = Prefab;
            view.setAnchorPoint(0.5, 0.5);
            view.setContentSize(parent.getContentSize())
            let scroll_view = view.getChildByName("ScrollView");
            let scroll_view_mask = scroll_view.getChildByName("view");
            let container = scroll_view_mask.getChildByName("content");
            scroll_view.setAnchorPoint(0.5, 0.5)
            scroll_view.setPosition(0, 0)
            scroll_view_mask.setAnchorPoint(0.5, 0.5)
            scroll_view_mask.setPosition(0, 0)
            scroll_view.setContentSize(view.getContentSize())
            scroll_view_mask.setContentSize(view.getContentSize())
            container.width = 400
            container.height = 95 * data.length
            container.setAnchorPoint(0.5, 1)
            container.setPosition(0, height / 2)
            scroll_view.getComponent(cc.ScrollView).vertical = true
            let prefabPath = PathTool.getPrefabPath("login", "role_login_cell");
            if (data.length) {
                for (let i = 0; i < data.length; ++i) {
                    this.loadRes(prefabPath, function(cell) {
                        let node = cell;
                        container.addChild(node)
                        node.y = -(95 * 0.5 + 95 * i)
                        node.x = 0
                        this.setCellText(node, data[i])
                    }.bind(this))
                }
            } else {
                this.loadRes(prefabPath, function(cell) {
                    let node = cell;
                    container.addChild(node)
                    node.y = -(95 * 0.5 + 95 * data.length)
                    node.x = 0
                    this.setCellText(node)
                }.bind(this))
            }
            parent.addChild(view)
            view.setPosition(0, 0)
        }.bind(this))
    },
    setCellText(node, data) {
        let path
        let icon = node.getChildByName("background").getChildByName("add").getChildByName("mask").getChildByName("icon").getComponent(cc.Sprite)
        let lv_lb = node.getChildByName("background").getChildByName("add").getChildByName("lv").getComponent(cc.Label)
        let name_lb = node.getChildByName("background").getChildByName("add").getChildByName("name").getComponent(cc.Label)
        if (data) {
            path = PathTool.getHeadRes(data.face_id);
            icon.node.scale = 0.6
            lv_lb.string = "Lv." + data.lev;
            name_lb.string = data.name;
            node.on("touchend", function() {
              this.ctrl.openLoginTipsWindow(true,()=>{
                this.ctrl.reqLoginRole(data.rid, data.srv_id);
              })
            }, this)
        } else {
            path = PathTool.getUIIconPath("common", "common_90026");
            icon.node.scale = 1
            lv_lb.string = "";
            name_lb.string = "";
            node.runAction(cc.sequence(cc.delayTime(1), cc.callFunc(function() {
              this.ctrl.openLoginTipsWindow(true,()=>{
                this.ctrl.reqCreateRole();
              })
            }, this)))
        }
        this.loadRes(path, function(res) {
            icon.spriteFrame = res;
        }.bind(this))
    },
    // 关闭窗体回调,需要在这里调用该窗体所属controller的close方法没用于置空该窗体实例对象
    closeCallBack: function() {
        for (let i = 0; i < this.items.length; ++i) {
            this.items[i].deleteMe()
            this.items[i] = null
        }
        this.items = null
        if (this.callBack) {
            this.callBack()
        }
        this.ctrl.openServerList(false)
    },
})