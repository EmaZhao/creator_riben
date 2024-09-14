// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//     通用提示框,打开的接口
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var CommonAlert = {
    show: function (str, confirm_label, confirm_callback, cancel_label, cancel_callback, type, close_callback, other_args) {
        var CommonAlertWin = require("commonalertwin");
        var view_tag = SCENE_TAG.dialogue;
        if (other_args && other_args.view_tag) {
            view_tag = other_args.view_tag;
        }

        var alertWin = new CommonAlertWin(view_tag);
        var data = { str: str, confirm_label: confirm_label, confirm_callback: confirm_callback, cancel_label: cancel_label, cancel_callback: cancel_callback, type: type, close_callback: close_callback, other_args: other_args };
        alertWin.open(data);
        return alertWin;
    },

    showInputApply: function (input_desc, desc_str, placeholder_str, confirm_label, confirm_callback, cancel_label, cancel_callback, close, close_callback, other_args) {
        var CommonInputAlertWin = require("commoninputalertwin");
        var alertWin = new CommonInputAlertWin();
        var data = { input_desc: input_desc, desc_str: desc_str, placeholder_str: placeholder_str, confirm_label: confirm_label, confirm_callback: confirm_callback, cancel_label: cancel_label, cancel_callback: cancel_callback, close: close, close_callback: close_callback, other_args: other_args || {} };
        alertWin.open(data);
        return alertWin;
    },

    showItemApply: function (str, list, confirm_callback, confirm_label, cancel_callback, cancel_label, title_str, font_size, type, close, close_callback, desc_label, item_info, view_tag, margin) {
        var CommonItemAlert = require("commonitemalertwin");
        var data = {
            str: str, list: list, confirm_callback: confirm_callback, confirm_label: confirm_label,
            cancel_callback: cancel_callback, cancel_label: cancel_label, title_str: title_str,
            font_size: font_size, type: type, close: close, close_callback: close_callback, desc_label: desc_label, item_info: item_info, view_tag: view_tag, margin: margin
        }
        var alert_win = new CommonItemAlert(view_tag);
        alert_win.open(data);
        return alert_win
    }

};
module.exports = CommonAlert;