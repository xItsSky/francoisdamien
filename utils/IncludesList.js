/**
 * Check if the string cobntains all strings in the list
 * @param string
 * @param list
 * @returns {boolean}
 */
module.exports = function (string, list) {
    let res = false;
    list.forEach(elt => {
       if(string.includes(elt)) res = true;
    });
    return res;
}
