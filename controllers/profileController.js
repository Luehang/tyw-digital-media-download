'use strict';

const addressValidator      = require('address-validator');
const Address               = addressValidator.Address;
const _                     = require('underscore');

// models
const User                  = require('../models/User');
const Profile               = require('../models/Profile');

// controllers
const functionController    = require('./functionController');
const formatPhoneNumber     = functionController.formatPhoneNumber;

const profileController = {}

/**
 * GET /user/update-profile
 *
 * Show user's profile information form.
 */
profileController.getProfileUpdate = (req, res) => {
    const messages = req.flash('error');
    // find user profile data
    Profile.findOne({user: req.user}, (err, profile) => {
        // if profile data
        if (profile !== null) {
            // perset values for form check boxes
            const isIndividual = profile.business_type === 'individual' ? 'true' : 'false';
            const isCompany = profile.business_type === 'company' ? 'true' : 'false';
            const isSame = profile.home_address.same_as_billing === 'true' ? 'true' : 'false';
            // render create-profile view page
            return res.render('user/create-profile', {
                title: 'Update Profile',
                csrfToken: req.csrfToken(),
                profile: profile,
                messages: messages, 
                hasErrors: messages.length > 0,
                isIndividual: isIndividual,
                isCompany: isCompany,
                isSame: isSame
            });
        }
        // render create-profile view page
        res.render('user/create-profile', {
            title: 'Update Profile',
            csrfToken: req.csrfToken(),
            messages: messages, 
            hasErrors: messages.length > 0
        });
    });
}

/**
 * POST /user/update-profile
 *
 * After submission, it validates then create or update profile information.
 */
profileController.postProfileUpdate = (req, res) => {
    let { first_name, last_name, business_number, phone_number, company_name,
        billing_address, billing_city, billing_state, billing_country,
        billing_zip } = req.body;
    let home_address = req.body.address;
    let home_city = req.body.city;
    let home_state = req.body.state;
    let home_zip = req.body.zip;
    let home_country = req.body.country;
    const { sell_type, same_address } = req.body;
    let validatedBillingAddress = {};
    let validatedHomeAddress = {};
    // validate phone number
    if ((/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/).test(phone_number)) {
        phone_number = formatPhoneNumber(phone_number);
    } else {
        req.flash('error', 'Invalid phone number.');
    }
    // if input business number then validate
    if (business_number !== '' &&
        (/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/).test(business_number) === false) {
        req.flash('error', 'Invalid business phone number.');
    } else if ((/^(1\s|1|)?((\(\d{3}\))|\d{3})(\-|\s)?(\d{3})(\-|\s)?(\d{4})$/).test(business_number)) {
        business_number = formatPhoneNumber(business_number);
    }
    const billingAddress = new Address({
        street: billing_address,
        city: billing_city,
        state: billing_state,
        country: billing_country
    });
    const homeAddress = new Address({
        street: home_address,
        city: home_city,
        state: home_state,
        country: home_country
    });
    if (same_address === "true") {
        home_address = billing_address;
        home_city = billing_city;
        home_state = billing_state;
        home_zip = billing_zip;
        home_country = billing_country;
    }
    // validate billing address
    addressValidator.validate(billingAddress, addressValidator.match.unknowns, function(err, exact, inexact){
        // console.log('input: ', billingAddress.toString());
        // console.log('match: ', _.map(exact, function(a) {
        //     return a.toString();
        // }));
        if (inexact[0] !== undefined) {
            let tempArr = _.map(inexact, function(a) {
                return a.toString();
            });
            req.flash('error', `Did you mean this billing address: ${tempArr}`);
        }
        // access some props on the exact match 
        const first = exact[0];
        if (first !== undefined) {
            billing_address = `${first.streetNumber} ${first.street}`;
            billing_city = first.city;
            billing_state = first.state;
            billing_zip = first.postalCode;
            billing_country = first.country;
        }
        if (first !== undefined && same_address === "true") {
            home_address = `${first.streetNumber} ${first.street}`;
            home_city = first.city;
            home_state = first.state;
            home_zip = first.postalCode;
            home_country = first.country;
        }
    });
    // if home and billing address aren't the same
    if (same_address !== "true") {
        // validate home address
        addressValidator.validate(homeAddress, addressValidator.match.unknowns, function(err, exact, inexact){
            // console.log('input: ', homeAddress.toString());
            // console.log('match: ', _.map(exact, function(a) {
            //     return a.toString();
            // }));
            if (inexact[0] !== undefined) {
                let tempArr = _.map(inexact, function(a) {
                    return a.toString();
                });
                req.flash('error', `Did you mean this home address: ${tempArr}`);
            }         
            // access some props on the exact match 
            const first = exact[0];
            if (first !== undefined) {
                home_address = `${first.streetNumber} ${first.street}`;
                home_city = first.city;
                home_state = first.state;
                home_zip = first.postalCode;
                home_country = first.country;
            }
        });
    }
    // perset values for form check boxes
    const isIndividual = sell_type === 'individual' ? 'true' : 'false';
    const isCompany = sell_type === 'company' ? 'true' : 'false';
    const isSame = same_address === 'true' ? 'true' : 'false';
    // store input for easy input when returning to page
    const profile = {
        first_name: first_name,
        last_name: last_name,
        business_number: business_number,
        phone_number: phone_number,
        business_type: sell_type,
        company_name: company_name,
        billing_address: {
            address: billing_address,
            city: billing_city,
            state: billing_state,
            zip: billing_zip,
            country: billing_country
        },
        home_address: {
            same_as_billing: isSame,
            address: home_address,
            city: home_city,
            state: home_state,
            zip: home_zip,
            country: home_country
        }
    }
    // store any errors in variable
    const messages = req.flash('error');
    // if any errors
    if (messages.length > 0) {
        return res.render('user/create-profile', {
            title: 'Update Profile',
            csrfToken: req.csrfToken(),
            profile: profile,
            isIndividual: isIndividual,
            isCompany: isCompany,
            isSame: isSame,
            messages: messages, 
            hasErrors: messages.length > 0
        });
    } else {
        // add or update profile data
        Profile.update({user: req.user}, { $set: {
            first_name: first_name,
            last_name: last_name,
            business_number: business_number,
            phone_number: phone_number,
            business_type: sell_type,
            company_name: company_name,
            billing_address: {
                address: billing_address,
                city: billing_city,
                state: billing_state,
                zip: billing_zip,
                country: billing_country
            },
            home_address: {
                same_as_billing: isSame,
                address: home_address,
                city: home_city,
                state: home_state,
                zip: home_zip,
                country: home_country
            },
            last_updated: new Date()
        }}, {upsert: true, new: true}, (err, updatedProfile) => {
            if (err) {
                req.flash('error', 'Database error.  Please try again.');
                return res.redirect('/user/create-profile');
            }
            User.update({_id: req.user._id}, { $set: {
                business_type: sell_type,
                company_name: company_name
            }}, {new: true}, (err, user) => {
                if (req.session.oldUrl) {
                    const oldUrl = req.session.oldUrl;
                    req.session.oldUrl = null;
                    return res.redirect(oldUrl);
                } else {
                    return res.redirect('/user/orderhistory');
                }
            });
        });
    }
}

module.exports = profileController;