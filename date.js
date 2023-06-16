
exports.getdate = function () {
    let today = new Date();
    let options = {
        weekday : "long",
        day : "numeric",
        month : "long"
        
    };

    let day = today.toLocaleDateString("en-us", options); 
    return day;
}

module.exports.getday = getday;
function getday() {
    let today = new Date();
    let options = {
        weekday : "long",
        
    };

    let day = today.toLocaleDateString("en-us", options); 
    return day;
}
