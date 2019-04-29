(function ($, aConfig) {
    'use strict';

    var collapsedClassName = 'is-collapsed';

    var expand = function (parent) {
        parent.removeClass(collapsedClassName);
    };

    var collapse = function (parent) {
        parent.addClass(collapsedClassName);
    };


    $('.js-expand-block').on('click', function () {
        if (document.body.clientWidth >= aConfig.breakpoint.md) {
            return;
        }

        var title = $(this);
        var parent = title.closest('.block');

        if (parent.hasClass(collapsedClassName)) {
            expand(parent);
        } else {
            collapse(parent);
        }
    });
})(jQuery, window.aConfig);