(function ($, location) {
    'use strict';

    if (location.hash) {
        var $element = $('[href="' + location.hash + '"]');

        if ($element.length) {
            $element.trigger('click');
        }
    }

    /**
     * Change url
     */
    $('.menu__link').on('shown.bs.tab', function (e) {
        var hash = $(e.target).attr('href');

        window.history.replaceState(hash, hash, hash);

        e.preventDefault();
    });
})(jQuery, location);