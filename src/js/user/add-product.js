// upload section
document.querySelector("html").classList.add('js');
var imageInput = document.querySelector( ".input-image" );
var fileInput = document.querySelector( ".input-file" );
var uploadImageButton = document.querySelector( ".input-image-trigger" );
var uploadDownloadButton = document.querySelector( ".input-file-trigger" );
// upload button hover event
uploadImageButton.addEventListener( "keydown", function( event ) {  
    if ( event.keyCode == 13 || event.keyCode == 32 ) {  
        imageInput.focus();  
    }  
});
uploadDownloadButton.addEventListener( "keydown", function( event ) {  
    if ( event.keyCode == 13 || event.keyCode == 32 ) {  
        fileInput.focus();  
    }  
});
// upload button on click
uploadImageButton.addEventListener( "click", function( event ) {
    imageInput.focus();
    return false;
});
uploadDownloadButton.addEventListener( "click", function( event ) {
    fileInput.focus();
    return false;
});  
// event change and path insert
imageInput.addEventListener( "change", function( event ) { 
    var image = this.value.match(/\\([^\\]+)$/)[1];
    document.getElementById('image-return').value = image;
});  
fileInput.addEventListener( "change", function( event ) { 
    var file = this.value.match(/\\([^\\]+)$/)[1];
    document.getElementById('file-return').value = file;
});  

var addProductForm = document.getElementById('add-product-form');
var addProductFormSubmitButton = document.querySelector('#add-product-form .button');
var addProductFormTitle = document.getElementById('add-product-title');
var addProductFormPrice = document.getElementById('add-product-price');
var addProductFormOrder = document.getElementById('add-product-order');
var addProductFormVideoUrl = document.getElementById('add-product-video-url');

// Function to check if it is USD currency format Ex. "99.90"
function isCurrency(number) {
    var regex  = /^\d+(?:\.\d{0,2})$/;
    var numStr = number;
    if (regex.test(numStr)) {return true};
    return false;
}

// Function to check if url
function isURL(str) {
    var pattern = new RegExp('^(https?:\\/\\/)?'+ // protocol
    '((([a-z\\d]([a-z\\d-]*[a-z\\d])*)\\.?)+[a-z]{2,}|'+ // domain name
    '((\\d{1,3}\\.){3}\\d{1,3}))'+ // OR ip (v4) address
    '(\\:\\d+)?(\\/[-a-z\\d%_.~+]*)*'+ // port and path
    '(\\?[;&a-z\\d%_.~+=-]*)?'+ // query string
    '(\\#[-a-z\\d_]*)?$','i'); // fragment locator
    return pattern.test(str);
}

// add product form submit event
addProductFormSubmitButton.addEventListener('click', function(event) {
    const isUpdate = $('#add-product-form').find('.button').html().toLowerCase() === 'update';
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
    // if item order not integer
    if (!(/^[0-9]+$/).test(addProductFormOrder.value) 
        && addProductFormOrder.value !== "") {
            errorMessages.push('Item order has to be an integer.');
    }
    // // if no video url and image upload
    // if (addProductFormVideoUrl.value === "" && imageInput.value === "" && !isUpdate) {
    //     errorMessages.push('No video url or image file was selected to upload.');
    // }
    if (imageInput.value === "" && !isUpdate) {
        errorMessages.push('No image file was selected to upload.');
    }
    // if invalid video url
    if (!isURL(addProductFormVideoUrl.value) && addProductFormVideoUrl.value !== "") {
        errorMessages.push('Invalid video url.');
    }
    if (/\W/.test(addProductFormVideoUrl.value.split("").pop() && addProductFormVideoUrl.value !== "")
        && addProductFormVideoUrl.value !== "") {
        errorMessages.push('Can not have a non-word character at the end of video url.');
    }
    // if no download upload
    if (fileInput.value === "" && !isUpdate) {
        errorMessages.push('No download file was selected to upload.');
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