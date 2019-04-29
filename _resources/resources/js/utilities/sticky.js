(function ($, window, aConfig) {
    'use strict';

    var stickyClassName = 'is-content-sticky',
        stickyAsideTopClassName = 'is-aside-top-sticky',
        stickyMobileMenuClassName = 'is-mobile-menu-sticky',
        html = $('html'),
        header = $('.header'),
        menu = $('.layout__menu'),
        aside = $('.layout__aside'),
        content = $('main.layout__wrapper');


    var updateMainContent = function () {
        if (!aConfig.isDesktop()) {
            header.css('transform', 'translate3d(0, 0, 0)');
            return;
        }

        var top = $(window).scrollTop() / 3 + 'px';

        header.css('transform', 'translate3d(0, ' + top + ', 0)');
    };


    var checkDistance = function () {
        var menuFromTop = content.offset().top - menu.height();

        if ($(window).scrollTop() >= menuFromTop) {
            html.addClass(stickyClassName);
        } else {
            html.removeClass(stickyClassName);
        }
    };


    var checkAside = function () {
        if (html.hasClass(stickyClassName)) {
            if (aside.height() + menu.height() > document.body.clientHeight) {
                html.removeClass(stickyAsideTopClassName);
            } else {
                html.addClass(stickyAsideTopClassName);
            }
        } else {
            html.removeClass(stickyAsideTopClassName);
        }
    };


    var stickMobileMenu = function () {
        if (!aConfig.isMobile()) {
            html.removeClass(stickyMobileMenuClassName);
            return;
        }

        if (menu.offset().top < $(window).scrollTop() + header.height() - 10) {
            html.addClass(stickyMobileMenuClassName);
        } else {
            html.removeClass(stickyMobileMenuClassName);
        }
    };


    var init = function () {
        updateMainContent();
        stickMobileMenu();

        if (aConfig.breakpoint.md > window.innerWidth) {
            html.removeClass(stickyClassName);
            html.removeClass(stickyAsideTopClassName);
            return;
        }

        checkDistance();
        checkAside();
    };

    $(window).on('scroll load resize', function () {
        init();
    });

})(jQuery, window, window.aConfig);