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
// convert all price tags with class "full-price" to ex. 24.00
var priceRows = document.querySelectorAll('.full-price');
priceRows.forEach(function(row) {
    row.innerText = priceToCompleteString(row.innerText);
});