(function ($) {
    'use strict';

    $('a[data-toggle="tab"]').on('touchstart', function () {
        var href = $(this).attr('href');

        $(href).tab('show');
    });

})(jQuery);