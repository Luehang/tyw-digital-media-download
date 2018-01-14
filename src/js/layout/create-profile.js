

// handle selection of legal entity
document.body.addEventListener('change', function(e) {
    if (e.target.name !== 'sell_type') {
        return;
    }

    // Show the correct header for the select legal entity
    var headerPrefix = (e.target.value === 'individual') ? 'Billing' : 'Company';
    document.querySelector('.seller-info-header').innerText = `${headerPrefix} Information`;
    document.querySelector('.billing-options label').innerText = `Home Address same as ${headerPrefix}?`;
    
    // Show any fields that apply to the new type
    var companyName = document.getElementById('company-name-row');
    if (headerPrefix === 'Billing') {
        companyName.style.display = 'none';
    } else {
        companyName.style.display = 'block';
    }
});

$(document).ready(function() {
    // preset values for form check boxes
    //console.log($('isSame').val() === undefined);
    if (document.getElementById('is-individual').value === "true") {
        document.querySelector('#individual-type').checked = true;
    }
    if (document.getElementById('is-company').value === "true") {
        document.querySelector('#company-type').checked = true;
    }
    if (document.getElementById('is-same').value === "true") {
        document.querySelector('#same-address').checked = true;
        $('#home-fieldset').hide();
    }

    // toggle to show and hide home address form
    document.getElementById('same-address').addEventListener("click", function() {
        if (document.getElementById('same-address').checked) {
            document.getElementById('home-fieldset').style.display = 'none';
        } else {
            document.getElementById('home-fieldset').style.display = 'block';
        }
    });

    $form = $('#profile-form');
    $firstName = $('#first-name');
    $lastName = $('#last-name');
    $phoneNumber = $('#phone-number');
    $billingAddress = $('#billing-address');
    $billingCity = $('#billing-city');
    $billingState = $('#billing-state');
    $billingCountry = $('#billing-country');
    $billingZip = $('#billing-zip');
    $address = $('#address');
    $city = $('#address-city');
    $state = $('#address-state');
    $country = $('#address-country');
    $zip = $('#address-zip');

    // disable update button
    $form.find('button').prop('disabled', true);

    let total = 0;
    let index = null;

    const validateForm = setInterval(function() {
        
        // if required fields are filled
        if ($firstName.val() !== "" && $lastName.val() !== "" 
            && $phoneNumber.val() !== "" && $billingAddress.val() !== "" 
            && $billingCity.val() !== "" && $billingState.val() !== "" 
            && $billingCountry.val() !== "" && $billingZip.val() !== "" 
            && $address.val() !== "" && $city.val() !== "" && $state.val() !== "" 
            && $country.val() !== "" && $zip.val() !== "") {
                // activate update button
                $form.find('button').prop('disabled', false);
        // else if checked is false
        } else if ($('#same-address').is(':checked') === false) {
            // disable update button
            $form.find('button').prop('disabled', true);
        }

        // if billing and home address are the same
        // and required fields are filled
        if ($('#same-address').is(':checked')
            && $firstName.val() !== "" && $lastName.val() !== "" 
            && $phoneNumber.val() !== "" && $billingAddress.val() !== "" 
            && $billingCity.val() !== "" && $billingState.val() !== "" 
            && $billingCountry.val() !== "" && $billingZip.val() !== "") {
                // activate update button
                $form.find('button').prop('disabled', false);
        // else if checked
        } else if ($('#same-address').is(':checked')) {
            // disable update button
            $form.find('button').prop('disabled', true);
        }
    }, 100);
});