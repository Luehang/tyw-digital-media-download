// mobile dropdown menu click event for icon list
$('.icon-list').click(function() {
    if ($('#dropdown-menu-1').css('display') === "none") {
        $('#dropdown-menu-1').css('display', 'block');
    } else {
        $('#dropdown-menu-1').css('display', 'none');
    }
});

// mobile dropdown menu click event for menu tab
$('.menu-text').click(function() {
    if ($(this).find('li').css('display') === "none") {
        $('.menu-text li').css('display', 'block');
    } else {
        $('.menu-text li').css('display', 'none');
    }
});

// mobile dropdown menu click event for social login
$('.login-text').click(function() {
    if ($(this).find('li').css('display') === "none") {
        $('.login-text li').css('display', 'block');
    } else {
        $('.login-text li').css('display', 'none');
    }
});
    
// mobile close dropdown menu after click event
$('nav a').click(function() {
    $('#dropdown-menu-1').css('display', 'none');
    $('nav a').removeClass('selected');
    $(this).addClass('selected');
});