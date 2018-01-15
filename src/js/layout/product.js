var defaultAvatar = '/img/default-avatar.svg';
var guestusername = '';
var $productID = $('#product-id').val();
var url = `/api/review-message/${$productID}`;
var allComments = [];
var $productRatingDiv = $('#product-rating-div');
var $productRating = $('#product-rating').val();

function starRating(rating) {
    const rates = [5, 4.5, 4, 3.5, 3, 2.5, 2, 1.5, 1, .5];
    let betweenTop = null;
    let equalRate = null;
    let betweenMiddle = null;
    let betweenBottom = null;
    let starRate = null;
    rating = Number.parseFloat(rating);
    for (var i = 0; i < rates.length; i++) {
        if (rating > rates[i]) {
            betweenBottom = rates[i];
            break;
        }
        if (rating === rates[i]) {
            equalRate = rates[i];
            break;
        }
    }
    if (equalRate) {
        return equalRate;
    }
    if (betweenBottom) {
        betweenTop = betweenBottom + .5;
        betweenMiddle = betweenBottom + .25;
        if (rating >= betweenMiddle) {
            return betweenTop;
        }
        if (rating < betweenMiddle) {
            return betweenBottom;
        }
    }
}

function htmlRating(rating) {
    const rates = [5, 4, 3, 2, 1];
    let checked = "";
    let checked2 = "";
    let toHTML = `<div class="rating">`;
    for(var i = 0; i < rates.length; i++) {
        if (rating === rates[i]) {
            checked = "checked";
        }
        if (rating === rates[i] - .5) {
            checked2 = "checked";
        }
        toHTML += `<input ${checked} type="radio" id="star${rates[i]}" disabled />
                    <label class = "full" for="star${rates[i]}"></label>`;
        toHTML += `<input ${checked2} type="radio" id="star${rates[i] - .5}" disabled />
                    <label class = "half" for="star${rates[i] - .5}"></label>`; 
        checked = "";
        checked2 = "";
    }
    return toHTML + `</div>`;
}

function getRateHTML(rating) {
    const rate = starRating(rating);
    return htmlRating(rate);
}

function getStarRating(rating) {
    var open = `<form class="rating" style="width: 138px;">`;
    var star5 = 5 === rating ? 
        `<input checked type="radio" id="star5" name="rating" value="5" disabled />
                <label class = "full" for="star5"></label>`
        : `<input type="radio" id="star5" name="rating" value="5" disabled />
                <label class = "full" for="star5"></label>`;
    var star4 = 4 === rating ?
        `<input checked type="radio" id="star4" name="rating" value="4" disabled />
                <label class = "full" for="star4"></label>`
        : `<input type="radio" id="star4" name="rating" value="4" disabled />
                <label class = "full" for="star4"></label>`;
    var star3 = 3 === rating ?
        `<input checked type="radio" id="star3" name="rating" value="3" disabled />
                <label class = "full" for="star3"></label>`
        : `<input type="radio" id="star3" name="rating" value="3" disabled />
                <label class = "full" for="star3"></label>`;
    var star2 = 2 === rating ?
        `<input checked type="radio" id="star2" name="rating" value="2" disabled />
                <label class = "full" for="star2"></label>`
        : `<input type="radio" id="star2" name="rating" value="2" disabled />
                <label class = "full" for="star2"></label>`;
    var star1 = 1 === rating ?
        `<input checked type="radio" id="star1" name="rating" value="1" disabled />
                <label class = "full" for="star1"></label>`
        : `<input type="radio" id="star1" name="rating" value="1" disabled />
                <label class = "full" for="star1"></label>`;
    var close = `</form>`;
    var ratingHTML = open + star5 + star4 + star3 + star2 + star1 + close;
    return ratingHTML;
}

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

function stopLoader() {
    $('.loader').fadeOut('slow', function() {
        $('.comments .inner').fadeIn('slow');
    });
}

// convert product rating and place into html
var productRatingHTML = getRateHTML($productRating);
$productRatingDiv.html(productRatingHTML);

// send request for product data
$.ajax({
    type: "GET",
    url: url,
    dataType: "json",
    contentType: "application/json",
    cache: true
}).done(function(data) {
    if (data.success) {
        allComments = data.data;
        var loaded = 0;
        // iterate over fetched data and place into html
        $.each(allComments, function(i, val) {
            var comment = $(`<div class="comment"></div>`);
            //var avatar = this.avatar == 'default' ? defaultAvatar : this.avatar;
            $(`<img class="avatar" alt="avatar" src="${defaultAvatar}"/>`).appendTo(comment);
            var contents = $('<div class="body"></div>');
            $(`<a target="_blank">${this.name}</a>`).appendTo(contents);
            $(`<span> • ${returnDateTime(this.created_at)}</span><br />${getStarRating(this.rating)}<br />`).appendTo(contents);
            $(`<p>${this.message}</p>`).appendTo(contents);
            
            contents.appendTo(comment);
            comment.appendTo('.comments .inner');
            loaded++;
        });
        // after all comments iterate.. stop loader
        if(loaded == allComments.length) stopLoader();
    }
    if (!data.success) {
        stopLoader();
    } 
}); // end ajax GET request

setTimeout(() => {
    stopLoader();
}, 10000);

const $downloadButton = $('#download-button');
const $downloadID = $('#download-id').val();
// update download amount for order and product database
$downloadButton.click(function() {
    $.ajax({
        type: "POST",
        url: `/download/${$productID}?download=${$downloadID}`,
        dataType: "json",
        cache: true
    }); // end ajax POST request
});

$(function() {
    // on rating input.. store rating value
    var starRating = null;
    $('.stars-container .click').click(function() {
        starRating = $(this).val();
        starRating = Number.parseInt(starRating);
    });
    // on input submit/click
    $('.send-msg').click(function() {
        var name = $('.your-name').val();
        var msg = $('.your-msg').val();
        var errorMessages = [];
        var toHTML = "";
        var $annotation = $('#front-annotation');
        var $alert = $('#alert');
        var comment = $(`<div class="comment" style="display: none;"></div>`);
        var contents = $(`<div class="body"></div>`);
        // validate form
        if (starRating === null) {
            errorMessages.push('Invalid rating.');
        }
        if (name === "") {
            errorMessages.push('Name field needs to be filled out.');
        }
        if (msg === "" || msg.length <= 10) {
            errorMessages.push('Message needs to be longer than 10 characters.');
        }
        if (errorMessages.length !== 0) {
            // if errors throw all errors
            errorMessages.map(function(message) {
                toHTML += `<p style="color: red;">* ${message}</p>`;
            });
            $alert.html(toHTML);
            $annotation.css('display', 'block');
        } else {
            // catch all submitted reviews and send request for save
            $.ajax({
                type: "POST",
                url: url,
                data: { 
                    userId: 'GUEST',
                    name: name,
                    rating: starRating,
                    message: msg
                },
                dataType: "json",
                cache: true
            }).done(function(data) {
                if (data.success) {
                    $alert.html(`<p style="color: green;">Review posted successfully.</p>`);
                    $annotation.css('display', 'block');                  
                }  
            }); // end ajax POST request
            // convert date to normal date
            var tempDate = returnDateTime((new Date).toISOString());
            var tempRate = getStarRating(starRating);
            $('.your-msg').val("");
            
            $('.your-name').fadeOut().remove();
            $('.your-msg').before(`<div class="input your-name dived">${name}</div>`);
            
            $(`<img class="avatar" alt="avatar" src="${defaultAvatar}" />`).appendTo(comment);
            $(`<a target="_blank">${name}</a>`).appendTo(contents);
            $(`<span> • ${tempDate}</span><br />${tempRate}<br />`).appendTo(contents);
            $(`<p>${msg}</p>`).appendTo(contents);
            // place to html
            contents.appendTo(comment);
            $('.add-new').after(comment);
            comment.fadeIn('slow');
        }
    });
});