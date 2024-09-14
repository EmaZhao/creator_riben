
var ZipLib = function(filePath, onLoaded){
    var oReq = cc.loader.getXMLHttpRequest();
    oReq.open("GET", filePath, true);
    oReq.overrideMimeType('text/plain; charset=x-user-defined');
    oReq.responseType = "arraybuffer";
    oReq.onload = function(oEvent) {
        // var newData = new JSZip(oReq.response, {checkCRC32:false});
        if (onLoaded) {
            onLoaded(oReq.response);
        }

        // onLoaded(oReq.response);
    };
    oReq.send();
};


module.exports = {
    RegisterZipLoader: function () {
        cc.loader.addDownloadHandlers({
            "zip": function (item, callback) {
                ZipLib(item.url, function(data){
                    callback(null, data);
                });
            }
        });
    }
};