(function ($) {
    'use strict';

    var errorClass = 'is-error';


    var validateField = function (field) {
        return field.val() === '';
    };


    $('.form-block__element').on('keyup', function () {
        var field = $(this);

        if (validateField(field)) {
            field.addClass(errorClass);
        } else {
            field.removeClass(errorClass);
        }
    });


    $('.form-block').on('submit', function (e) {
        var form = $(this),
            inputs = form.find('input, textarea'),
            isError = false;

        inputs.each(function () {
            var field = $(this);

            if (validateField(field)) {
                field.addClass(errorClass);
                isError = true;
            } else {
                field.removeClass(errorClass);
            }
        });

        if (isError) {
            e.preventDefault();
        }
    });
})(jQuery);