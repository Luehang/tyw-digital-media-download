'use strict';

const functionController = {};

/**
 * Function round number to nearest hundredths
 *
 */
functionController.nearestHundredths = (number) => {
  return decimalAdjust('round', number, -2);
};

function decimalAdjust(type, value, exp) {
    // If the exp is undefined or zero...
    if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
    }
    value = +value;
    exp = +exp;
    // If the value is not a number or the exp is not an integer...
    if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
    }
    // If the value is negative...
    if (value < 0) {
        return -decimalAdjust(type, -value, exp);
    }
    // Shift
    value = value.toString().split('e');
    value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
    // Shift back
    value = value.toString().split('e');
    return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
}

/**
 * Function to change price to string ex. "2.00"
 *
 */
functionController.priceToCompleteString = (number) => {
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
 * Function to format phone number to (999) 999-9999
 *
 */
functionController.formatPhoneNumber = (s) => {
    var s2 = (""+s).replace(/\D/g, '');
    var m = s2.match(/^(\d{3})(\d{3})(\d{4})$/);
    return (!m) ? null : "(" + m[1] + ") " + m[2] + "-" + m[3];
}

/**
 * Function to check if it is USD currency format Ex. "99.90"
 *
 */
functionController.isCurrency = (number) => {
    var regex  = /^\d+(?:\.\d{0,2})$/;
    var numStr = number;
    if (regex.test(numStr)) {return true};
    return false;
}

/**
 * Function to return normal formatted time date.
 *
 */
functionController.returnDateTime = (ISOdate) => {
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

/**
 * Function to generate random string at vary length.
 *
 */
functionController.randomString = (num) => {
    let string = "";
    for (var i = 0; i < num; i++) {
        string += Math.random().toString(36).substring(2);
    }
    return string;
}

/**
 * Function to parse given url and add query strings for settings.
 *
 */
functionController.queryUrl = (url) => {
    // if youtube url
    if (/youtube/i.test(url)) {
        const videoID = url.split("/").pop();
        const youtubeUrl = `${url}?autoplay=1&showinfo=0&mute=1` +
            `&controls=0&disablekb=1&iv_load_policy=1&modestbranding=0` +
            `&enablejsapi=1&origin=${process.env.APP_URL}&loop=1&playlist=${videoID}`;
        return youtubeUrl;
    // if vimeo url
    } else if (/vimeo/i.test(url)) {
        const vimeoUrl = `${url}?autoplay=1&background=1&loop=1&quality=1080p`;
        return vimeoUrl;
    }
}

module.exports = functionController;