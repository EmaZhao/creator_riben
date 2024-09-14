/*-----------------------------------------------------+
 * 消息处理类相关处理
 * @author whjing2012@163.com
 +-----------------------------------------------------*/

window.GlobalMessageMgr = cc.Class({
    cotr: function () {
    },

    properties: {
        vertical_array: [],
        vertical_array_tmp: []
    },

    statics: {
        instance: null,
    },

    showMoveVertical: function (msg, color) {
        if(msg == "")return
        if (this.vertical_array.length >= 3) {
            this.vertical_array_tmp.push({ msg: msg, color: color });
            if (this.vertical_array_tmp.length > 10) {
                this.vertical_array_tmp.shift();
            }
            return;
        }
        var parent_wnd = ViewManager.getInstance().getSceneNode(SCENE_TAG.msg);
        var container = new cc.Node();
        container.setAnchorPoint(0.5, 0.5);
        container.setPosition(0, 300);
        parent_wnd.addChild(container);      
        //背景
        var image = container.addComponent(cc.Sprite);
        this.loadRes(PathTool.getUIIconPath("common", "common_90056"), function (sp) {
            if(container && container.isValid){
                image.spriteFrame = sp;
            }
        }.bind(this))

        image.type = cc.Sprite.Type.SLICED;
        image.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        image.node.setContentSize(500, 60);

        // var richText = container.addComponent(cc.RichText);
        var richText = Utils.createRichLabel(22, new cc.Color(0xff, 0xda, 0x2f, 0xff), cc.v2(0.5,0.5), cc.v2(0,0), 24, 500, container);
        richText.handleTouchEvent = false;
        richText.horizontalAlign = cc.macro.TextAlignment.CENTER;
         //添加布局
         if(richText.node.height>60){
            var layout = container.addComponent(cc.Layout);
            layout.resizeMode = cc.Layout.ResizeMode.CONTAINER;
         }
        // richText.maxWidth = 500;
        // richText.fontSize = 24;
        // richText.node.color = new cc.Color(0xff, 0xda, 0x2f, 0xff);
        //richText.string = StringUtil.parseStr(msg).string;
        var parsestr = StringUtil.parseStrNew(msg,null,true)
        richText.string = parsestr.string;//已全部替换成cc富文本格式
        var resArr = parsestr.resArr;
        if (resArr) {
            for (var i in resArr) {
                this.loadRes(PathTool.getItemRes(resArr[i]), (function (resObject) {
                    if(container && container.isValid){
                        richText.addSpriteFrame(resObject);
                    }
                }).bind(this));
            }
        }
        container.rict_text_nd = richText.node;

        var seq = cc.sequence(
            // cc.moveBy(1, 0, 100),
            cc.delayTime(2),
            cc.removeSelf(),
            cc.callFunc(function () {
                var node = this.vertical_array.shift();
                node.destroy();
                node = null;
                if (this.vertical_array_tmp.length > 0) {
                    var o = this.vertical_array_tmp.shift();
                    this.showMoveVertical(o.msg, o.color);
                }
            }, this)
        );
        this.vertical_array.push(container);
        this.sortPosition();
        container.rict_text_nd.runAction(seq);
    },

    sortPosition: function () {
        var size = this.vertical_array.length;
        if (size > 0) {
            var _y = 230;//起始点
            var _x = 0;
            var last_height = this.vertical_array[size - 1].height;
            var last_y;
            for (var i = size; i > 0; i--) {
                var item = this.vertical_array[i -1];
                if(item == null)return
                item.stopAllActions();
                if(size == i){
                    item.setPosition(cc.v2(_x,_y));
                    last_y = _y + item.height;
                }else{
                    item.setPosition(cc.v2(_x,last_y));
                    last_y = last_y + item.height;
                }
                item.runAction(cc.moveBy(0.5,0,last_height));
            }
        }
    },

    loadRes: function (path, callback) {
        if (this.res_list == null) {
            this.res_list = {}
        }
        if (this.res_list[path]) {
            callback(this.res_list[path])
            return
        } else {
            LoaderManager.getInstance().loadRes(path, function (res_object) {
                if (this.is_close || this.delete) {
                    return;
                }
                this.res_list[path] = res_object
                callback(res_object)
            }.bind(this))
        }
    },

    showPowerMove: function (num, res, old_num) {
        var MainUIController = require("mainui_controller");
        MainUIController.getInstance().showPower(num, old_num);
    },
    showMoveHorizontal(msg, color){
        return;
        let curr_scene = ViewManager.getInstance().getSceneNode(SCENE_TAG.msg)
        if(!curr_scene) return;
        var self = this
        let size = cc.size(682, 38)
        if(this.per_bg_icon == null){
            let node = new cc.Node()
            let widget = node.addComponent(cc.Widget)
            widget.isAlignTop = true;
            widget.isAlignHorizontalCenter = true;
            widget.top = 55
            widget.horizontalCenter = 0
            let image = node.addComponent(cc.Sprite)
            this.loadRes(PathTool.getUIIconPath("common", "common_90056"), function (sp) {
                if(node && node.isValid){
                    image.spriteFrame = sp;
                }
            }.bind(this))
            image.type = cc.Sprite.Type.SLICED;
            image.sizeMode = cc.Sprite.SizeMode.CUSTOM;
            node.setAnchorPoint(0.5, 1)
            node.setContentSize(size)
            curr_scene.addChild(node)
            widget.updateAlignment()
            // node.setPosition(0, SCREEN_HEIGHT*0.5 - 55)
            this.per_bg_icon = node
        }
        if(this.msg_save_arr == null){
            this.msg_save_arr = [];
        }

        //创建文本
        function createLabel(msg, color){
            // msg = "<size = 15>" + msg + "</size>"
            let temp_msg = self.createhorizontalLabel(msg, color, 0, 20)
            temp_msg.node.setAnchorPoint(cc.v2(0, 0.5))
            temp_msg.node.setPosition(cc.v2(0, -size.height / 2 - size.height))
            self.per_bg_icon.addChild(temp_msg.node)
            return temp_msg
        }

        //只存储5条传闻
        if(this.msg_save_arr.length > 5){
            this.msg_save_arr.pop()
        }

        this.msg_save_arr.push({msg : msg, delay_time : 3, color : color})

        //如果当前有滚动
        if(this.has_msg_moveing == true) return;
        function deleteMsg(){
            self.has_msg_moveing = false
            if(self.per_move_msg_word){
                self.per_move_msg_word.node.destroy()
                self.per_move_msg_word = null;
            }
            if(self.msg_save_arr.length > 0){
                self.has_msg_moveing = true
                let temp_tab = self.msg_save_arr.pop()
                let msg_word = createLabel(temp_tab.msg, temp_tab.color)
                let show_time = temp_tab.delay_time || 3;
                self.per_move_msg_word = msg_word
                let sequence_1 = null;
                let font_size = msg_word.node
                if(font_size.width > size.width){
                    msg_word.node.x = -size.width/2;
                    let move_to_ = cc.moveTo(0.1,cc.v2(msg_word.node.x, -size.height / 2))
                    let move_to = cc.moveTo(show_time, cc.v2(msg_word.node.x - (font_size.width - size.width) - 5, -size.height / 2))
                    let delay_time = cc.delayTime(1)
                    sequence_1 = cc.sequence(move_to_,move_to,delay_time,cc.callFunc(deleteMsg))
                }else{
                    msg_word.node.x = -font_size.width / 2
                    let delay_time = cc.delayTime(show_time)
                    let move_to_ = cc.moveTo(0.1,cc.v2(msg_word.node.x, -size.height / 2))
                    sequence_1 = cc.sequence(move_to_,delay_time,cc.callFunc(deleteMsg))
                }
                msg_word.node.runAction(sequence_1)
            }else{
                self.msg_save_arr = null;
                if(self.per_bg_icon){
                    self.per_bg_icon.destroy()
                    self.per_bg_icon = null;
                }
            }
        }
        deleteMsg()
    },
    createhorizontalLabel(msg, color, max_width, fontsize){
        let richText = new cc.Node().addComponent(cc.RichText);
        richText.node.color = color || new cc.Color(25,30,40);
        richText.maxWidth = max_width || 0;
        richText.fontSize = fontsize;
        richText.string = msg
        return richText
    },
});

// 实例化单利
GlobalMessageMgr.getInstance = function () {
    if (!GlobalMessageMgr.instance) {
        GlobalMessageMgr.instance = new GlobalMessageMgr();
    }
    return GlobalMessageMgr.instance;
}

//全局 message 提示方法
window.message = function (msg, color) {
    if (msg == null || msg == "") {
        return;
    }
    GlobalMessageMgr.getInstance().showMoveVertical(msg, color);
}

//资产提示
window.showAssetsMsg = function (msg, color) {
    message(msg, color)
}