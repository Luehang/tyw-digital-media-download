// convert all price tags with class "full-price" to ex. 24.00
var priceRows = document.querySelectorAll('.full-price');
priceRows.forEach(function(row) {
    row.innerText = priceToCompleteString(row.innerText);
});
// format all dates
var timeRows = document.querySelectorAll('.time');
timeRows.forEach(function(row) {
    row.innerText = returnDateTime(row.innerText);
});