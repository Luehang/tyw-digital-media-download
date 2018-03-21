/**
 * Convert to normal & proper price tags.
 * Function to change price to string ex. "2.00"
 *
 */
function priceToCompleteString(number) {
    let newString = number.toString();
    if ((/\./).test(newString) !== true) {
        return newString + ".00";
    }
    const startIndex = newString.match(/\./).index + 1;
    const decimalPlace = newString.substring(startIndex, newString.length);
    if (decimalPlace.length === 1) {
        return newString + "0";
    } else {
        return newString;
    }
}
/**
 * Function to return normal formatted time date.
 *
 */
function returnDateTime(ISOdate) {
    let date = new Date(ISOdate);
    let hours = date.getHours();
    let mins = date.getMinutes().toString();
    let month = date.getMonth() + 1;
    let day = date.getDate();
    let year = date.getFullYear();
    let time = "";
    if (mins.length === 1) {
        mins = "0" + mins;
    }
    if (hours >= 13) {
        hours = hours - 12;
        time = `${month}/${day}/${year} at ${hours}:${mins} PM`;
    } else if (hours === 0) {
        hours = 12;
        time = `${month}/${day}/${year} at ${hours}:${mins} AM`;
    } else {
        time = `${month}/${day}/${year} at ${hours}:${mins} AM`;
    }
    return time;
}