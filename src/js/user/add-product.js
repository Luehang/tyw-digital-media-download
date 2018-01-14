// upload section
document.querySelector("html").classList.add('js');
var fileInput  = document.querySelector( ".input-file" ),  
    uploadButton     = document.querySelector( ".input-file-trigger" );
// upload button hover event
uploadButton.addEventListener( "keydown", function( event ) {  
    if ( event.keyCode == 13 || event.keyCode == 32 ) {  
        fileInput.focus();  
    }  
});
// upload button on click
uploadButton.addEventListener( "click", function( event ) {
    fileInput.focus();
    return false;
});  
// event change and path insert
fileInput.addEventListener( "change", function( event ) { 
    var file = this.value.match(/\\([^\\]+)$/)[1];
    document.getElementById('file-return').value = file;
});  

var addProductForm = document.getElementById('add-product-form');
var addProductFormSubmitButton = document.querySelector('#add-product-form .button');
var addProductFormTitle = document.getElementById('add-product-title');
var addProductFormPrice = document.getElementById('add-product-price');
var addProductFormAvailable = document.getElementById('add-product-available');

// Function to check if it is USD currency format Ex. "99.90"
function isCurrency(number) {
    var regex  = /^\d+(?:\.\d{0,2})$/;
    var numStr = number;
    if (regex.test(numStr)) {return true};
    return false;
}

// add product form submit event
addProductFormSubmitButton.addEventListener('click', function(event) {
    var errorMessages = [];
    var toHTML = "";
    // if no title
    if (addProductFormTitle.value === "") {
        errorMessages.push('Need to add a product title.');
    }
    // if not currency
    if (!isCurrency(addProductFormPrice.value)) {
        errorMessages.push('Product price needs to be formatted in USD currency. Ex. 99.90');
    }
    // if available not integer
    if (!(/^[0-9]+$/).test(addProductFormAvailable.value) 
        && addProductFormAvailable.value !== "") {
            errorMessages.push('Amount available has to be an integer.');
    }
    // if no errors then submit
    if (errorMessages.length === 0) {
        addProductForm.submit();
    } else {
        // if errors throw all errors
        errorMessages.map(function(message) {
            toHTML += `<p style="color: red;">* ${message}</p>`;
        });
        document.getElementById('alert').innerHTML = toHTML;
        document.getElementById('front-annotation').style.display = "block";
    }
});