const $PAYPAL_SANDBOX_KEY = $('#PAYPAL_SANDBOX_KEY').val();
const $PAYPAL_PRODUCTION_KEY = $('#PAYPAL_PRODUCTION_KEY').val();
const $STRIPE_PUB_KEY = $('#STRIPE_PUB_KEY').val();
const $APP_URL = $('#APP_URL').val();
// Set your publishable key: remember to change this to your live publishable key in production
// See your keys here: https://dashboard.stripe.com/account/apikeys
Stripe.setPublishableKey($STRIPE_PUB_KEY);

const $number = $('#card-number');
const $numberRow = $('#card-number-row');
const $cvc = $('#card-cvc');
const $cvcRow = $('#card-cvc-row');
const $expMonth = $('#card-expiry-month');
const $expMonthRow = $('#card-expiry-month-row');
const $expYear = $('#card-expiry-year');
const $expYearRow = $('#card-expiry-year-row');
const $cardName = $('#card-name');
const $form = $('#checkout-form');

const $annotation = $('#front-annotation');
const $alert = $('#alert');
const $priceTag = $('#price-tag').html();

/**
 * MULTIPLE STEP FORM
 */
let currentTab = 0; // Current tab is set to be the first tab (0)
showTab(currentTab); // Display the current tab

function showTab(n) {
    // This function will display the specified tab of the form ...
    var x = document.getElementsByClassName("tab");
    x[n].style.display = "block";
    // ... and fix the Previous/Next buttons:
    if (n == 0) {
        document.getElementById("prevBtn").style.display = "none";
        document.getElementById("nextBtn").style.display = "block";
    } else {
        document.getElementById("prevBtn").style.display = "block";
    }
    if (n == (x.length - 1)) {
        document.getElementById("nextBtn").style.display = "none";
    }
    // ... and run a function that displays the correct step indicator:
    fixStepIndicator(n)
}
function nextPrev(n) {
    // This function will figure out which tab to display
    var x = document.getElementsByClassName("tab");
    // Exit the function if any field in the current tab is invalid:
    if (n == 1 && !validateForm()) return false;
    // Hide the current tab:
    x[currentTab].style.display = "none";
    // Increase or decrease the current tab by 1:
    currentTab = currentTab + n;
    // Otherwise, display the correct tab:
    showTab(currentTab);
}
function validateEmail(email) {
    var re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    return re.test(email.toLowerCase());
}
function validateForm() {
    const nameInput = document.getElementById('name').value;
    const emailInput = document.getElementById('email').value;
    let errorMessages = [];
    let toHTML = "";
    if (nameInput === "") {
        errorMessages.push('Name field needs to be filled out.');
    }
    if (validateEmail(emailInput) === false) {
        errorMessages.push('Invalid email address.');
    }
    if (errorMessages.length !== 0) {
        // if errors throw all errors
        errorMessages.map(function(message) {
            toHTML += `<p style="color: red;">* ${message}</p>`;
        });
        $alert.html(toHTML);
        $annotation.css('display', 'block');
        return false;
    }
    return true;
}
function fixStepIndicator(n) {
    // This function removes the "active" class of all steps...
    var i, x = document.getElementsByClassName("step");
    for (i = 0; i < x.length; i++) {
        x[i].className = x[i].className.replace(" active", "");
    }
    //... and adds the "active" class to the current step:
    x[n].className += " active";
}

/**
 * PAY WITH PAYPAL
 */
const CREATE_PAYMENT_URL  = `${$APP_URL}/paypal/create-payment`;
const EXECUTE_PAYMENT_URL = `${$APP_URL}/paypal/execute-payment`;
paypal.Button.render({
    // Set environment
    env: 'sandbox', // 'sandbox' or 'production'
    // PayPal Client IDs - replace with your own
    // Create a PayPal app: https://developer.paypal.com/developer/applications/create
    client: {
        sandbox: $PAYPAL_SANDBOX_KEY,
        production: $PAYPAL_PRODUCTION_KEY
    },
    commit: true, // Show a 'Pay Now' button
    // Specify the style of the button
    style: {
        label: 'paypal',
        size:  'responsive',    // small | medium | large | responsive
        shape: 'rect',          // pill | rect
        color: 'gold',          // gold | blue | silver | black
        tagline: false    
    },
    // payment() is called when the button is clicked
    payment: function(data, actions) {
        // Make a call to the REST api to create the payment
        return actions.payment.create({
            payment: {
                transactions: [
                    {
                        amount: { total: $priceTag, currency: 'USD' }
                    }
                ]
            }
        });
    },
    // onAuthorize() is called when the buyer approves the payment
    onAuthorize: function(data, actions) {
        // Make a call to the REST api to execute the payment
        return actions.payment.execute().then(function() {
            $form.submit();
        });
    }
}, '#paypal-button');

$(document).ready(function() {
    /**
     * PAY WITH INPUT CARD
     */
    $form.find('#submit-button').prop('disabled', true);

    const validateForm = setInterval(function() {
        if ( $number.val() !== "" ) {
            if (Stripe.card.validateCardNumber($number.val())) {
                $number.css('background-color', 'white');
                $numberRow.css('background-color', 'white');
            } else {
                $number.css('background-color', '#EF3838');
                $numberRow.css('background-color', '#EF3838');
            } 
        } 
        if ($expMonth.val() !== "" && $expYear.val() !== "") {
            if (Stripe.card.validateExpiry($expMonth.val(), $expYear.val())) {
                $expMonth.css('background-color', 'white');
                $expMonthRow.css('background-color', 'white');
                $expYear.css('background-color', 'white');
                $expYearRow.css('background-color', 'white');
            } else {
                $expMonth.css('background-color', '#EF3838');
                $expMonthRow.css('background-color', '#EF3838');
                $expYear.css('background-color', '#EF3838');
                $expYearRow.css('background-color', '#EF3838');
            }
        }
        if ($cvc.val() !== "") {
            if (Stripe.card.validateCVC($cvc.val())) {
                $cvc.css('background-color', 'white');
                $cvcRow.css('background-color', 'white');
            } else {
                $cvc.css('background-color', '#EF3838');
                $cvcRow.css('background-color', '#EF3838');
            }
        }
        if (Stripe.card.validateCardNumber($number.val()) 
        && Stripe.card.validateExpiry($expMonth.val(), $expYear.val())
        && Stripe.card.validateCVC($cvc.val())
        && $cardName.val() !== "") {
            $form.find('#submit-button').prop('disabled', false);
        }
    }, 100);

    $form.find('.submit-button').click(function() {
        $form.submit();
    });

    $form.submit(function(event) {
        $annotation.css('display', 'none');
        $form.find('#submit-button').prop('disabled', true);
        Stripe.card.createToken({
            number: $number.val(),
            cvc: $cvc.val(),
            exp_month: $expMonth.val(),
            exp_year: $expYear.val(),
            name: $cardName.val()
        }, stripeResponseHandler);
        return false;
    });

    function stripeResponseHandler(status, response) {
        if (response.error) { // Problem!
            // Show the errors on the form
            $alert.html(`<p style="color: red;">* ${response.error.message}</p>`);
            $annotation.css('display', 'block');
            $form.find('#submit-button').prop('disabled', false); // Re-enable submission
        } else { // Token was created!
            // Get the token ID:
            var token = response.id;
            // Insert the token into the form so it gets submitted to the server:
            $form.append($('<input type="hidden" name="stripeToken" />').val(token));
            // Submit the form:
            $form.get(0).submit();
        }
    }
});


