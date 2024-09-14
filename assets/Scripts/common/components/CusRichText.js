
var CusRichText = cc.Class({
    extends: cc.Component,
    editor: CC_EDITOR && {
        executeInEditMode: true,
    },
    properties: {
        // needImg: cc.SpriteFrame,
        // numRichtext: cc.RichText,
        string: {
            default: '',
            multiline: true,
            notify: function () {
                this.updateString();
            }
        },
        fontAtlas: cc.SpriteAtlas,
        _richNd: cc.Node,
        _richText: cc.RichText,
    },

    ctor: function() {

    },

// a_power

    onLoad: function () {
        if (!this._richNd) {
            this._richNd = new cc.Node("CusNum");
            this.node.addChild(this._richNd);
            this._richText = this._richNd.addComponent(cc.RichText);
        }
        this._richText.string = "";
        this._richText.imageAtlas = this.fontAtlas;
        this.updateString();
    },

    updateString: function() {
        var richString = "";
        if (this.fontAtlas) {
            var fontName = this.fontAtlas.name.substring(0, this.fontAtlas.name.length - 6) + "_";
            for (var str_i in this.string) {
                if (parseInt(this.string[str_i]) >= 0 && parseInt(this.string[str_i]) <= 9){
                    var cur_str = "<img src = \'" + fontName + this.string[str_i] + "\'/>"
                    richString += cur_str;
                }
            }            
        }
        if (this._richText)
            this._richText.string = richString;
    },

    setNum: function(num) {
        this.string = num + "";
        this.updateString();
    },

    getNum: function() {
        return parseInt(this.string);
    },

    setAtlas: function(SpriteAtlas) {
        if (SpriteAtlas instanceof cc.SpriteAtlas)
            this.fontAtlas = SpriteAtlas;
        this.updateString();
    },

});
