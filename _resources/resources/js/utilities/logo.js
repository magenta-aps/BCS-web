(function ($, window, aConfig) {
    'use strict';

    $('.js-logo').on('click', function (e) {
        $('[href="#aboutUs"]').trigger('click');

        e.preventDefault();
    });


})(jQuery, window, window.aConfig);