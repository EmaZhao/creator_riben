// 工具类的全局
var SoundManager = require("soundmanager");

window.Utils = {
    _effect_once_playing: false,
    _effect_once_last: null,
    _effect_once_list: null,

    keyfind: function(key, val, arr) {
        for (var i = 0, n = arr.length; i < n; i++) {
            if (arr[i][key] == val) {
                return arr[i];
            }
        }
        return null;
    },

    deepCopy: function(source) {
        var sourceCopy = source instanceof Array ? [] : {};
        for (var item in source) {
            sourceCopy[item] = typeof source[item] === 'object' ? this.deepCopy(source[item]) : source[item];
        }
        return sourceCopy;
    },

    randomNum: function(min, max) {
        if (max > min) {
            return Math.round(Math.random() * (max - min)) + min;
        } else {
            return min;
        }
    },

    randomStr: function(min, max, strRange) {
        var n = this.randomNum(min, max);
        strRange = strRange || '0123456789abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ';
        var str = "";
        var len = strRange.length;
        for (var i = 0; i < n; i++) {
            var pos = this.randomNum(1, len) - 1;
            str += strRange.charAt(pos);
        }
        return str;
    },

    getNodeCompByPath: function(path, node, type) {
        if (path == "" || node == null || !cc.js.isChildClassOf(type, cc.Component))
            return null;
        var node = cc.find(path, node);
        return ((node && node.getComponent(type)) || null);
    },

    // TI18N: function (str) {
    //     return str;
    // },


    TI18N: function(str) {
        if(window.Language && window.Language == "chs"){
            return str;
        }
        if (window.Lang == null) {
            require("lang.js")
        }
        var exChange = window.Lang[str] || "";
        if (exChange != "") {
            return exChange;
        }
        Log.debug("langV find key fail, key is: ", str);
        return str;
    },

    // 获取单位配置
    getUnitConfig: function(id) {
        return gdata("unit_data", "data_unit1", id, false) || gdata("unit_data", "data_unit2", id, false) || gdata("unit_data", "data_unit3", id)
    },

    // 获取物品配置数据
    getItemConfig: function(id) {
        return gdata("item_data", "data_unit1", id, false) || gdata("item_data", "data_unit2", id, false) || gdata("item_data", "data_unit3", id, false) || gdata("item_data", "data_unit4", id, false) || gdata("item_data", "data_unit5", id, false)
    },

    // 拼key
    getNorKey: function(...value) {
        var key = ""
        for (let index = 0; index < value.length; index++) {
            const element = value[index];
            if (key != "") {
                key = key + "_";
            }
            key = key + element;
        }
        return key
    },

    // 关闭所有窗体
    closeAllWindow: function() {
        var temp_list = [];
        for (let index = 0; index < BaseView.winMap.length; index++) {
            const element = BaseView.winMap[index];
            temp_list.push(element)
        }
        for (let index = 0; index < temp_list.length; index++) {
            const element = temp_list[index];
            if (element.close) {
                element.close({ close_win: true })
            }
        }
        BaseView.winMap = [];
    },

    // 进入战斗后,关闭所有的窗体
    hideAllWindowForBattle: function() {
        for (let index = 0; index < BaseView.winMap.length; index++) {
            const element = BaseView.winMap[index];
            if (element && !element.is_before_battle) {
                element.enter_battle_status = element.getVisible();
                element.is_before_battle = true;
                if (element.enter_battle_status == true) {
                    element.setVisible(false);
                }
            }
        }
    },

    // 退出战斗之后,打开进入战斗之前的界面
    showAllWindowForBattle: function() {
        var need_show_scene = true;
        for (let index = 0; index < BaseView.winMap.length; index++) {
            const element = BaseView.winMap[index];
            if (element) {
                if (element.enter_battle_status == null) {
                    element.enter_battle_status = true;
                }
                element.setVisible(element.enter_battle_status);
                if (need_show_scene == true && element.win_type == WinType.Full && element.enter_battle_status == true) {
                    need_show_scene = false;
                }
                element.is_before_battle = false;
            }
        }
        return need_show_scene;
    },

    isEmpty: function(obj) {
        for (var objIndex in obj) {
            return false;
        }
        return true;
    },

    //返回数组或对象的下一个索引值
    //(实际只能用来判断是否为空，不能用来循环获取索引值)
    next: function(arr) {
        for (var k in arr) {
            if (arr[k] != null) {
                return true
            }
        }
        return null
    },

    // 多元素小到大
    tableLowerSorter: function(array) {
        return function(a, b) {
            if (a == null || b == null) {
                return 1
            }
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (a[element] == null || b[element] == null) {
                    return 1
                }
                if (a[element] != b[element]) {
                    return a[element] - b[element]
                }
            }
            return 1
        }
    },

    // 多元素从大到小
    tableUpperSorter: function(array) {
        return function(a, b) {
            if (a == null || b == null) {
                return -1
            }
            for (let index = 0; index < array.length; index++) {
                const element = array[index];
                if (a[element] == null || b[element] == null) {
                    return -1
                }
                if (a[element] != b[element]) {
                    return b[element] - a[element]
                }
            }
            return -1
        }
    },

    /*按需排序
    temp_tab 需要比较的表项中的多个key值，用于多参数的比较
    temp_tab = {{"参数名字", true}, {"参数名字", false}...}
    --true  表示 大到小  false 表示 小到大 */
    tableCommonSorter: function(temp_tab) {
        return function(a, b) {
            if (a == null || b == null) {
                return -1
            }
            for (var i = 0; i < temp_tab.length; i++) {
                const element = temp_tab[i];
                if (a[element[0]] == null || b[element[0]] == null) {
                    return -1
                }
                var is_sort = element[1] || false;
                if (is_sort) {
                    if (a[element[0]] != b[element[0]]) {
                        return b[element[0]] - a[element[0]]
                    }
                } else {
                    if (a[element[0]] != b[element[0]]) {
                        return a[element[0]] - b[element[0]]
                    }
                }
            }
            return -1
        }
    },

    // 创建一个需要require的类
    createClass: function(window_name, any) {
        if (window_name == null || window_name == "") {
            cc.error("创建窗体失败,没有给具体名字 ========>>")
        }
        var WindowClass = require(window_name)
        return new WindowClass(any);
    },

    /**
     * 播放一次特效,临时创建一个节点数据,播放完特效之后移除
     * @param {*} effect_name 特效资源名
     * @param {*} x 坐标X
     * @param {*} y 坐标Y
     * @param {*} parent 父节点
     * @param {*} finish_call 播放完的回调
     * @param {*} action_name 播放动作,默认为action
     * @param {*} scale 缩放比,理论上不需要设置
     */
    playEffectOnce: function(effect_name, x, y, parent, finish_call, action_name, scale) {
        if (parent == null) return;
        action_name = action_name || PlayerAction.action
        scale = scale || 1
        if (this._effect_once_playing == true) {
            if (this.effect_object && this.effect_object.node && this.effect_object.node.parent) {
                if (this._effect_once_last != effect_name) {
                    if (this._effect_once_list == null) {
                        this._effect_once_list = []
                    }
                    this._effect_once_list.push({ effect_name: effect_name, x: x, y: y, parent: parent, finish_call: finish_call, action_name: action_name, scale: scale })
                }
            } else {
                if (this.effect_object && this.effect_object.node) {
                    this.effect_object.node.destroy();
                    LoaderManager.getInstance().releaseRes(this.effect_object.res_path);
                }
                this.effect_object = null;
                this._effect_once_last = null;
                this._effect_once_playing = false;
                if (this._effect_once_list == null) {
                    this._effect_once_list = []
                }
                this._effect_once_list.push({ effect_name: effect_name, x: x, y: y, parent: parent, finish_call: finish_call, action_name: action_name, scale: scale })

                if (this._effect_once_list && this._effect_once_list.length > 0) {
                    var object = this._effect_once_list.shift()
                    if (object) {
                        this.playEffectOnce(object.effect_name, object.x, object.y, object.parent, object.finish_call, object.action_name, object.scale)
                    }
                }
            }
        } else {
            this._effect_once_playing = true
            this._effect_once_last = effect_name
            var remove_fun = function() {
                if (finish_call) {
                    finish_call()
                }
                this._effect_once_playing = false
                this._effect_once_last = null
                if (this.effect_object) { //移除掉缓存的对象
                    if (this.effect_object.node) {
                        this.effect_object.node.destroy();
                    }
                    LoaderManager.getInstance().releaseRes(this.effect_object.res_path);
                    this.effect_object = null;
                }
                if (this._effect_once_list && this._effect_once_list.length > 0) {
                    var object = this._effect_once_list.shift()
                    if (object) {
                        this.playEffectOnce(object.effect_name, object.x, object.y, object.parent, object.finish_call, object.action_name, object.scale)
                    }
                }
            }.bind(this)

            // 节点对象
            this.effect_object = { node: null, effect: null, res_path: null };


            // 创建临时的节点
            var node = new cc.Node("once_effect");
            node.setAnchorPoint(0.5, 0.5);
            if (scale != 1) {
                node.scale = scale;
            }
            node.setPosition(x, y);
            parent.addChild(node);
            var effect_spine = node.addComponent(sp.Skeleton);
            var res_path = PathTool.getSpinePath(effect_name, "action");

            // 储存数据
            this.effect_object.node = node;
            this.effect_object.effect = effect_spine;
            this.effect_object.res_path = res_path;



            // 监听事件
            effect_spine.setCompleteListener((function(trackEntry, loopCount) {
                var animationName = trackEntry.animation ? trackEntry.animation.name : "";
                if (animationName == action_name) {
                    remove_fun();
                }
            }).bind(this))


            // 加载资源
            LoaderManager.getInstance().loadRes(res_path, (function(res_object) {
                effect_spine.skeletonData = res_object
                effect_spine.setAnimation(0, action_name, false);
            }).bind(this))
        }
    },

    //计算字符串长度，汉字算两个长度
    //（如果汉字算一个长度,直接string.length可以获得）
    getByteLen: function(val) {
        var len = 0;
        for (var i = 0; i < val.length; i++) {
            var a = val.charAt(i);
            if (a.match(/[^\x00-\xff]/ig) != null) {
                len += 2;
            } else {
                len += 1;
            }
        }
        return len;
    },

    //按钮置灰，并关闭事件，btn:cc.Button,  bool:true是变灰
    setGreyButton: function(btn, bool) {
        if (bool == null)
            bool = true
        if (btn) {
            btn.interactable = !bool;
            btn.enableAutoGrayEffect = bool;
        }
    },

    getTimeInterval: function(time_stamp) {
        if (!(time_stamp >= 0)) return;
        var srver_time = gcore.SmartSocket.getTime();
        return time_stamp - srver_time;
    },

    // 将秒转为标准时间, 参数:秒数, 是否加0 
    changeIntevalToDate: function(secondNum, n_addo) {
        if (!(secondNum >= 0)) return;
        var daySecond = 24 * 60 * 60;
        var hourSecond = 60 * 60;
        var day = Math.floor(secondNum / daySecond);
        var remainSecondM = secondNum % daySecond;
        var hour = Math.floor(remainSecondM / hourSecond);
        var remainSecondS = remainSecondM % hourSecond;
        var minute = Math.floor(remainSecondS / 60);
        var second = Math.ceil(remainSecondS % 60);
        if (n_addo) {
            return { D: day, H: hour, M: minute, S: second };
        }
        var add0 = function(m) {
            return m < 10 ? ('0' + m) : m;
        };
        return { D: day, H: add0(hour), M: add0(minute), S: add0(second) };
    },

    //-----------------------moneytool---start-------------//
    //转换金钱格式
    getMoneyString: function(value, is_symbol) {
        if (is_symbol == null)
            is_symbol = true;
        if (value == null)
            return 0
        if (value < 100000) {
            if (is_symbol)
                return this.moneyFormat(value);
            else
                return value;
        } else if (value < 100000000) {
            value = Math.floor(value * 0.0001);
            if (is_symbol)
                return cc.js.formatStr("%s万", this.moneyFormat(value));
            else
                return cc.js.formatStr("%s万", value);
        } else {
            value = Math.floor(value * 0.00000001);
            if (is_symbol)
                return cc.js.formatStr("%s億", this.moneyFormat(value));
            else
                return cc.js.formatStr("%s億", value);
        }
    },

    //价钱里面加上逗号
    moneyFormat: function(value) {
        var sign = "";
        if (value < 0) {
            sign = "-";
            value = value * (-1);
        }
        if (value < 1000)
            return String(value);
        var arr = this.moneySplit(String(value), "");
        var n = arr.length;
        var i = n % 3;
        if (i == 0) {
            i = 4;
        }
        while (i < n) {
            arr.splice(i, 0, ",")
            i = i + 4;
            n = n + 1;
        }
        return sign + this.Join(arr, "");
    },

    moneySplit: function(source_str, split_str) {
        if (split_str.length == 0) {
            var arr = [];
            for (var i = 0; i < source_str.length; i++) {
                arr.push(source_str.substring(i, i + 1));
            }
            return arr
        } else {
            return this.Split(source_str, split_str)
        }
    },

    //-----------------------moneytool---end-------------//

    // 以某个分隔符为标准，分割字符串
    // @param split_string 需要分割的字符串
    // @param splitter 分隔符
    // @return 用分隔符分隔好的table
    Split: function(split_string, splitter) {
        var split_result = {};
        var search_pos_begin = 0;
        while (true) {
            var find_pos_begin = split_string.indexOf(splitter, search_pos_begin);
            var find_pos_end = splitter.length + find_pos_begin;
            if (find_pos_begin == -1) break

            split_result[Object.keys(split_result).length + 1] = split_string.substring(search_pos_begin, find_pos_begin - 1);
            search_pos_begin = find_pos_end + 1;
        }
        if (search_pos_begin <= split_string.length) {
            split_result[Object.keys(split_result).length + 1] = split_string.substr(search_pos_begin);
        }
        return split_result
    },

    // 以某个连接符为标准，返回一个table所有字段连接结果
    // @param join_table 连接table：array
    // @param joiner 连接符
    // @param return 用连接符连接后的字符串
    Join: function(join_table, joiner) {
        if (joiner == null) {
            return join_table.join("");
        } else {
            return join_table.join(joiner);
        }
    },

    //区分服务器名称
    transformNameByServ: function(name, srv_id) {
        var tmpName = name;
        if (srv_id == null || name == null)
            return tmpName
        if (name) {
            if (tmpName.indexOf("【") != -1) {
                return tmpName
            }
        }
        if (!require("role_controller").getInstance().isTheSameSvr(srv_id)) {
            var vo = require("role_controller").getInstance().getRoleVo();
            if (vo) {
                var listOr = this.Split(srv_id, "_");
                var listMe = this.Split(vo.srv_id, "_");
                if (listOr[2] && listMe[1] && listOr[1] != listMe[1]) {
                    tmpName = cc.js.formatStr(Utils.TI18N("[异域]%s"), tmpName);
                } else if (Object.keys(listOr).length > 1) {
                    tmpName = cc.js.formatStr(Utils.TI18N("[S%s]%s"), listOr[Object.keys(listOr).length], tmpName);
                }
                if (srv_id == "robot_1")
                    tmpName = name;
            }
        }
        return tmpName
    },

    // 配置格式装换
    splitDataStr: function(content) {
        var result = content;
        while (result.indexOf("{") != -1) {
            var i = result.indexOf("{");
            var n = result.indexOf("}");
            var temp = result.substring(i, n + 1);
            var target = temp.substring(1, temp.length - 1);
            var list = this.Split(target, ":")
            var str = cc.js.formatStr("<color=%s>%s</color>", gdata("color_data", "data_color3", parseInt(list[1])), list[2])
            result = result.replace(temp, str)
        }
        var RoleController = require("role_controller");
        var role_vo = RoleController.getInstance().getRoleVo();
        if (role_vo) {
            result = result.replace(/~n/g, role_vo.name)
        }
        return result;
    },

    //desc:创建一个普通文本
    createLabel: function(font_size, text_color, line_color, x, y, text_content, parent_wnd, line_num, anchorpoint, font) {
        font_size = font_size || 20;
        var node = new cc.Node();
        node.setAnchorPoint(anchorpoint || cc.v2(0, 0));
        var label = node.addComponent(cc.Label);
        LoaderManager.getInstance().loadUsuallyRes("fonts/MPLUS1p-ExtraBold", (function(label, res_object) {
            label.font = res_object;
        }).bind(this, label),cc.Font);
        label.fontSize = font_size;
        label.horizontalAlign = cc.macro.TextAlignment.CENTER;
        label.verticalAlign = cc.macro.TextAlignment.CENTER;
        if (text_color == null) text_color = new cc.Color(0xff, 0xff, 0xff, 0xff);
        node.color = text_color;
        if (line_color) {
            var line = node.addComponent(cc.LabelOutline);
            line.color = line_color;
            line.width = line_num || 1;
        }
        x = x || 0;
        y = y || 0;
        node.setPosition(x, y);
        if (text_content != null)
            label.string = text_content;
        if (parent_wnd)
            parent_wnd.addChild(node);
        return label
    },

    //desc:创建富文本
    createRichLabel: function(fontsize, textcolor, ap, pos, lineHeight, max_width, parent_wnd, align) {
        var node = new cc.Node();
        node.setAnchorPoint(ap || cc.v2(0, 0));
        node.setPosition(pos || cc.v2(0, 0));
        var label = node.addComponent(cc.RichText);
        if (textcolor == null) textcolor = new cc.Color(0xff, 0xff, 0xff, 0xff);
        LoaderManager.getInstance().loadUsuallyRes("fonts/MPLUS1p-ExtraBold", (function(label, res_object) {
            label.font = res_object;
        }).bind(this, label),cc.Font);
        label.fontSize = fontsize;
        label.horizontalAlign = cc.macro.TextAlignment.CENTER;
        label.verticalAlign = cc.macro.TextAlignment.CENTER;
        if (align == "left") {
            label.horizontalAlign = cc.macro.TextAlignment.LEFT;
        } else if (align == "right") {
            label.horizontalAlign = cc.macro.TextAlignment.RIGHT;
        }
        label.lineHeight = lineHeight || (fontsize + 4);
        node.color = textcolor;
        label.maxWidth = max_width || 300;
        if (parent_wnd)
            parent_wnd.addChild(node);
        return label
    },

    //desc:创建image
    createImage: function(parent, res, x, y, anchorPoint, usePlist, zorder, is_Scale9) {
        var node = new cc.Node();
        var image = node.addComponent(cc.Sprite);
        if (res != null) {
            LoaderManager.getInstance().loadRes(res, (function(image, res_object) {
                image.spriteFrame = res_object
            }).bind(this, image))
        }
        if (anchorPoint == null) {
            node.setAnchorPoint(cc.v2(0.5, 0.5));
        } else {
            node.setAnchorPoint(anchorPoint);
        }
        if (is_Scale9 == true) {
            image.type = cc.Sprite.Type.SLICED;
            image.sizeMode = cc.Sprite.SizeMode.CUSTOM;
        }
        if (x != null && y != null) {
            node.setPosition(cc.v2(x, y));
        }
        if (parent) {
            parent.addChild(node, zorder || 0);
        }
        return image
    },

    createEffectSpine: function(effectName, pos, arPos, loop, action, call_back, pixelformal, not_play_action) {
        let node = new cc.Node();
        node.setPosition(pos);
        node.setAnchorPoint(arPos);
        let effect = node.addComponent(sp.Skeleton);
        effectName = effectName || "E88888";
        if (loop == null) {
            loop = true;
        }
        action = action || PlayerAction.action;

        var res = cc.js.formatStr("spine/%s/action.atlas", effectName)
        LoaderManager.getInstance().loadRes(res, function(res_object) {
            effect.skeletonData = res_object;
            if (not_play_action == null) {
                effect.setAnimation(0, action, loop)
            } else {
                effect.setAnimation(1, action, loop)
            }
            if (call_back) {
                call_back();
            }
        }.bind(this))
        return effect
    },

    //  给节点添加红点
    // [[
    //     node:红点父节点
    //     status:是否显示
    //     offset_x:红点x轴偏移
    //     offset_y:红点y轴偏移
    //     zorder:红点层级
    // ]]
    addRedPointToNodeByStatus: function(node, status, offset_x, offset_y, zorder, red_type) {
        if (node) {
            if (status == true) {
                if (!node.red_point) {
                    offset_x = offset_x || 0;
                    offset_y = offset_y || 0;
                    zorder = zorder || 10;
                    var red_res = PathTool.getUIIconPath("mainui", "mainui_1009");
                    if (red_type && red_type == 2) {
                        red_res = PathTool.getCommonIcomPath("common_1014");
                    }

                    var node_size = node.getContentSize();
                    var pos_x = node_size.width / 2 + offset_x
                    var pos_y = node_size.height / 2 + offset_y
                    var red_point = this.createImage(node, null, pos_x, pos_y, cc.v2(1, 1), null, zorder);
                    // 加载资源
                    LoaderManager.getInstance().loadRes(red_res, (function(red_point, res_object) {
                        red_point.spriteFrame = res_object
                    }).bind(this, red_point))
                    node.red_point = red_point
                }
                node.red_point.node.active = true;
            } else if (node.red_point) {
                node.red_point.node.active = false;
            }
        }
    },

    //获取数组或对象具有真实子类的长度
    getArrTrueLen: function(obj) {
        var index = 0;
        for (var i in obj) {
            var v = obj[i];
            if (v != null) {
                index = index + 1;
            }
        }
        return index
    },

    //获取数组或对象的长度
    getArrLen: function(obj) {
        if (obj instanceof Array) {
            return obj.length
        } else {
            return Object.keys(obj).length
        }
    },

    // 延迟动作
    delayRun: function(obj, delay_time, fun) {
        if (!fun) return;
        if (obj == null) {
            fun();
        }
        var delay_fun = cc.delayTime(delay_time);
        var call_fun = cc.callFunc(function() {
            if (obj != null) {
                fun();
            }
        });
        obj.runAction(cc.sequence(delay_fun, call_fun));
    },

    /**
     * 统一处理点击事件,为了后面统一音效做处理
     * @param {*} object 节点对象
     * @param {*} clickback 点击回调
     * @param {*} soundType 声音类型 1:普通音效 2:关闭音效 3....
     */
    onTouchEnd: function(object, clickback, soundType) {
        if (!object) {
            if (clickback) {
                clickback();
            }
            return;
        }
        object.on(cc.Node.EventType.TOUCH_END, function(event) {
            Utils.playButtonSound(soundType);
            if (clickback) {
                clickback()
            }
        });
    },

    /**
     * 播放音效接口
     * @param {*} type 1:普通按钮音效 2:关闭按钮音效 3:标签页音效 4..自定义音效id
     */
    playButtonSound: function(type) {
        if (!type) return;
        var res_id = null;
        if (type == ButtonSound.Normal) {
            res_id = "c_button1";
        } else if (type == ButtonSound.Close) {
            res_id = "c_close";
        } else if (type == ButtonSound.Tab) {
            res_id = "c_002";
        } else {
            res_id = type;
        }
        SoundManager.getInstance().playEffect(AUDIO_TYPE.COMMON, res_id);
    },

    playEffectSound: function(type, res_id) {
        SoundManager.getInstance().playEffectOnce(type, res_id);
    },

    playMusic: function(type, res_id, loop) {
        SoundManager.getInstance().playMusic(type, res_id, loop);
    },


    //获取随机名字
    getRandomSaveName: function() {
        var randomName = function(str) {
            var result = str;
            var a = String.fromCharCode(Math.random(65, 90));
            var b = String.fromCharCode(Math.random(97, 122));
            var c = String.fromCharCode(Math.random(48, 57));
            if (Math.random(3) % 3 == 0) {
                result = result + a;
            } else if (Math.random(3) % 2 == 0) {
                result = result + b;
            } else {
                result = result + c;
            }
            if (this.getByteLen(result) < 12) {
                result = randomName(result);
            }
            return result
        }.bind(this)
        var usr = randomName("");
        return "sy" + usr
    },

    /*==============================--
    --desc:获取服务器索引
    --time:2018-07-22 10:54:30
    --@str:
    --@return [index, is_var]
    --index == 0 表示 机器 或者 异域(就是无法知道是那个服的)
    --is_var : 表示是否本服
    --==============================--*/
    getServerIndex: function(srv_id) {
        if (srv_id == null) return [""]
        if (srv_id == "robot_1" || srv_id == "robot") { //代表机器人
            return [0]
        }
        let RoleController = require("role_controller");
        let vo = RoleController.getInstance().getRoleVo();
        if (vo) {
            let listOr = srv_id.split("_");
            let listMe = vo.srv_id.split("_");
            if (listOr[1] && listMe[0] && listOr[0] != listMe[0]) {
                return [0]
            } else if (listOr.length > 1) {
                if (srv_id == vo.srv_id) {
                    return [listOr[listOr.length], true]
                } else {
                    return [listOr[listOr.length]]
                }
            }
        }
        return [0]
    },

    // 通用显示单行道具列表
    // @ item_scrollview scrollview 对象
    // @ item_list BackPackItem的对象列表 (注意: 需要在那边手动移除)
    // @ data_list 数据列表 结构{{道具id, 数量},...} 就是策划填表的奖励道具结构
    // @setting 
    // @content
    // @isActionCallBack 是否调用ActionCallBack
    // @setting.scale 缩小参数 默认 1 
    // @setting.start_x 两边对应道具的间隔
    // @setting.space_x 道具之间的间隔
    // @setting.max_count item_scrollview最大能显示item数量..用于判断是否可以左右滑动  不填则可以移动
    // @setting.is_center 是否不满就居中 max_count必须有值
    // @setting.show_effect_id =特效id 显示对应特效 默认无
    // @setting.is_tip 是否弹通用tips 默认nil
    commonShowSingleRowItemList: function(item_scrollview, item_list, data_list, setting, content, isActionCallBack) {
        if (!item_scrollview || !data_list) {
            return;
        }
        var item_list = item_list;
        if (item_list) {
            // 隐藏物品
            for (var i in item_list) {
                item_list[i].setVisible(false);
            }
        }
        if (item_list == null) {
            item_list = [];
        }

        if (data_list.length == 0) {
            return;
        }
        // 道具列表
        var setting = setting || {};
        var scale = setting.scale || 1;
        var start_x = setting.start_x || 5;
        var space_x = setting.space_x || 5;
        var max_count = setting.max_count;
        var item_width = setting.item_width || 120;
        var lock = setting.lock || false;
        // 点击返回回调函数
        var is_tip = setting.is_tip;
        var callback = setting.callback || false;

        var item_count = data_list.length;
        item_width = item_width * scale;

        var total_width = start_x * 2 + item_width * item_count + space_x * (item_count - 1);
        var item_scrollview_size = content.getContentSize();
        var max_width = Math.max(item_scrollview_size.width, total_width);
        content.setContentSize(cc.size(max_width, item_scrollview_size.height));
        if (max_count && item_count <= max_count) {
            item_scrollview.off(cc.Node.EventType.TOUCH_START, item_scrollview._onTouchBegan, item_scrollview, true);
            item_scrollview.off(cc.Node.EventType.TOUCH_MOVE, item_scrollview._onTouchMoved, item_scrollview, true);
            item_scrollview.off(cc.Node.EventType.TOUCH_END, item_scrollview._onTouchEnded, item_scrollview, true);
            item_scrollview.off(cc.Node.EventType.TOUCH_CANCEL, item_scrollview._onTouchCancelled, item_scrollview, true);
            if (setting.is_center) {
                start_x = (item_scrollview_size.width - total_width) * 0.5;
                if (start_x < 0) {
                    start_x = 0;
                }
            }
        } else {
            // item_scrollview.on(cc.Node.EventType.TOUCH_START, item_scrollview._onTouchBegan, item_scrollview, true);
            // item_scrollview.on(cc.Node.EventType.TOUCH_MOVE, item_scrollview._onTouchMoved, item_scrollview, true);
            // item_scrollview.on(cc.Node.EventType.TOUCH_END, item_scrollview._onTouchEnded, item_scrollview, true);
            // item_scrollview.on(cc.Node.EventType.TOUCH_CANCEL, item_scrollview._onTouchCancelled, item_scrollview, true);
        }
        content.stopAllActions();

        var _setItemData = function(item, v, i, is_tip) {
            item.setVisible(true);
            var _x = start_x + item_width / 2 + i * (item_width + space_x);

            item.setPosition(_x, item_scrollview_size.height * 0.5);
            item.setData({ bid: v[0], num: v[1] });
            item.showOrderWarLock(lock);
            if (callback) {
                if (isActionCallBack) {
                    item.addActionCallBack(function() {
                        callback();
                    }.bind(this));
                } else {
                    item.addCallBack(function() {
                        callback();
                    }.bind(this));
                }
            }
            if (v[2]) {
                item.setExtendLabel(v[2], null, 24);
            }
            item.setDefaultTip(is_tip);
            if (setting.show_effect_id) {
                item.showItemEffect(true, setting.show_effect_id, PlayerAction.action_1, true, 1.1)
            } else {
                item.showItemEffect(false)
            }
        }.bind(this);

        var item = null;
        var size = item_list.length;
        for (var i in data_list) {
            item = item_list[i];
            if (item) {
                _setItemData(item, data_list[i], i, is_tip);
            } else {
                var dealey = i - size;
                if (dealey <= 0) {
                    dealey = 1;
                }
                Utils.delayRun(content, dealey / 60, function(i, v, item, is_tip) {
                    if (!item_list[i]) {
                        item = ItemsPool.getInstance().getItem("backpack_item");
                        item.initConfig(true, scale);
                        // item.setAnchorPoint(0, 0.5)
                        item.setParent(content);
                        item.show();
                        item_list[i] = item;
                        _setItemData(item, v, i, is_tip)
                    }
                }.bind(this, i, data_list[i], item, is_tip));
            }
        }
        return item_list;
    },



    /*--通用显示空白
    --@parent 父类
    --@bool 显示状态 true 显示 , false 不显示
    --@setting 配置信息
    --setting.text  文本内容 默认: 暂无数据
    --setting.pos  icon显示位置  默认 父类的中心点
    --setting.scale  icon缩放大小  默认 1
    --setting.offset_y 因图标缩放导致文本的位置需要调整 偏移量调整 默认是 -10
    --setting.font_size 文本大小 默认 26
    --setting.label_color 文本颜色 默认 Config.ColorData.data_color16[175]*/
    commonShowEmptyIcon: function(parent, bool, setting) {
        if (!parent) return;
        if (bool) {
            var setting = setting || {}
            var text = setting.text || Utils.TI18N("暂无数据");
            if (!parent.empty_con) {
                var parent_size = parent.getContentSize();
                var pos = setting.pos || cc.v2(parent_size.width * 0.5, parent_size.width * 0.5, parent_size.height * 0.5 + 10);
                var scale = setting.scale || 1;
                var offset_y = setting.offset_y || -110;
                var label_color = setting.label_color || new cc.Color().fromHEX(Config.color_data.data_color16[175]);
                var font_size = setting.font_size || 26;
                var size = cc.size(200, 200);

                parent.empty_con = new cc.Node();
                parent.empty_con.setContentSize(cc.size(120, 120))
                parent.empty_con.setAnchorPoint(0.5, 0.5);
                parent.empty_con.setPosition(pos.x, pos.y);
                parent.addChild(parent.empty_con, 10);

                var bg = Utils.createImage(parent.empty_con, PathTool.getUIIconPath("bigbg", "bigbg_3"), 0, 0, cc.v2(0.5, 0.5), false)
                bg.node.scale = scale;
                parent.empty_label = Utils.createLabel(font_size, label_color, null, 0, offset_y, '', parent.empty_con, 0, cc.v2(0.5, 0.5));

            } else {
                parent.empty_con.action = true;
            }
            parent.empty_label.string = text;
        } else {
            if (parent.empty_con) {
                parent.empty_con.action = false;
            }
        }
    },
    getType: function(obj) {
        var str = Object.prototype.toString.call(obj);
        var map = {
                '[object Boolean]': 'boolean',
                '[object Number]': 'number',
                '[object String]': 'string',
                '[object Function]': 'function',
                '[object Array]': 'array',
                '[object Date]': 'date',
                '[object RegExp]': 'regExp',
                '[object Undefined]': 'undefined',
                '[object Null]': 'null',
                '[object Object]': 'object'
            }
            // if(obj instanceof Element){ //判断是否是dom元素，如div等
            //     return "element";
            // }
        return map[str];
    },
    deepCopy1: function(p) {
        var obj;
        var str = this.getType(p);
        if (str == 'array') {
            obj = [];
            for (var i = 0; i < p.length; i++) {
                obj.push(this.deepCopy1(p[i])); //回调自己
            }
        } else if (str == 'object') {
            obj = {};
            for (var i in p) {
                obj[i] = this.deepCopy1(p[i]);
            }
        } else {
            return p;
        }
        return obj;
    },

    //通用设置倒计时 时间格式默认   TimeTool.GetTimeForFunction 此方法返回格式(需要其他的 在callback 自行处理)
    //注意: 关闭panel的时候记得 doStopAllActions(label) 否则会报错
    //@label 倒计时对象 label 
    //@less_time 剩余时间 
    //@setting 配置信息
    //setting.label_type  文本类型(参考 CommonAlert.type.rich) ..注意:需要增加标题 和 时间颜色 才设置这个(否则没意义)
    //setitng.time_title  时间标题  eg: 剩余时间:
    //setitng.time_color  时间颜色 格式: #ffffff 富文本下 需要变的颜色..(在is_rich_label == true下 必填)
    //setting.callback 回调函数  如果_setTimeFormatString 不能满足需求 自己用回调函数处理
    commonCountDownTime: function(label, less_time, setting) {
        if (!label) return
        var setting = setting || {};
        var callback = setting.callback; //回调函数
        var label_type = setting.label_type; //文本类型
        var time_title = null;
        var time_color = null;
        var TimeTool = require("timetool");

        if (label_type && label_type == "rich") {
            time_title = setting.time_title || "";
            time_color = setting.time_color;
        }

        let _setTimeFormatString = function(time) {
            if (!label) return
            if (callback) {
                callback(time);
                return
            }
            if (label_type && label_type == "rich" && time_color) {
                if (time > 0) {
                    label.string = cc.js.formatStr("%s <color=%s>%s</c>", time_title, time_color, TimeTool.getTimeForFunction(time))
                } else {
                    label.node.stopAllActions();
                    label.string = cc.js.formatStr("%s <color=%s>00:00:00</c>", time_title, time_color)
                }
            } else {
                if (time > 0) {
                    label.string = TimeTool.getTimeForFunction(time);
                } else {
                    label.node.stopAllActions();
                    label.string = "00:00:00";
                }
            }
        }
        label.node.stopAllActions();
        if (less_time > 0) {
            _setTimeFormatString(less_time);
            label.node.runAction(cc.repeatForever(cc.sequence(cc.delayTime(1), cc.callFunc(function() {
                less_time = less_time - 1;
                _setTimeFormatString(less_time);
            }.bind(this)))))
        } else {
            _setTimeFormatString(less_time);
        }
    },

    //设置精灵变灰,递归下去
    setChildUnEnabled: function(node, status) {
        var sp_status
        if (status) {
            sp_status = cc.Sprite.State.GRAY;
        } else {
            sp_status = cc.Sprite.State.NORMAL;
        }
        let sprites = node.getComponentsInChildren(cc.Sprite)
        for (let i = 0; i < sprites.length; ++i) {
            sprites[i].setState(sp_status)
        }
    },

    //--获取属性对应信息 
    // @attr_key  策划定义属性key 参考表attr_data.xml
    // @attr_val  对应值..如果是百分比 传过来的是千分比
    //return 属性icon路径, 属性名字, 属性值
    commonGetAttrInfoByKeyValue: function(attr_key, attr_val) {
        if (!attr_key || !attr_val) return
        let attr_name = Config.attr_data.data_key_to_name[attr_key];
        if (attr_name) {
            let icon = PathTool.getAttrIconByStr(attr_key);
            var PartnerCalculate = require("partner_calculate");
            let is_per = PartnerCalculate.isShowPerByStr(attr_key);
            if (is_per == true) {
                attr_val = (attr_val / 10) + "%";
            }
            let res = PathTool.getUIIconPath("common", icon);

            return { res: res, attr_name: attr_name, attr_val: attr_val, icon: icon }
        }
    },
};