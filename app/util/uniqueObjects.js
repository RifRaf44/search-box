/**
 * Created by RaphaelV on 1/06/2015.
 */
Array.prototype.uniqueObjects = function (props) {
    function compare(a, b) {
        var prop;
        if (props) {
            for (var j = 0; j < props.length; j++) {
                prop = props[j];
                if (a[prop] != b[prop]) {
                    return false;
                }
            }
        } else {
            for (prop in a) {
                if (a[prop] != b[prop]) {
                    return false;
                }
            }

        }
        return true;
    }
    return this.filter(function (item, index, list) {
        for (var i = 0; i < index; i++) {
            if (compare(item, list[i])) {
                return false;
            }
        }
        return true;
    });
};
