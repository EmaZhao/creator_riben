// --------------------------------------------------------------------
// @author: shiraho@syg.com(必填, 创建模块的人员)
// @description:
//      资源下载数据
// <br/>Create: new Date().toISOString()
// --------------------------------------------------------------------

var FileInfo = cc.Class({
    properties: {
        url: {
            get: function () {
                return this._url;
            },

            set: function (url) {
                this._url = url;
            }
        },
        obj: null,
    },

    ctor:function(){
        this.loadNum = 0;
        this.obj = arguments[0];
    },

    // 累加加载次数
    updateLoadNum:function(){
        this.loadNum += 1;
    },

    //
    decrementLoadNum:function(){
        this.loadNum -= 1;
    },

    getLoadNum:function(){
        return this.loadNum;
    },

    deleteMe:function(){
    }
});

module.exports = FileInfo;
