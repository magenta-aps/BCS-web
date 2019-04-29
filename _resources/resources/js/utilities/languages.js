(function ($) {
    'use strict';

    var selectedClassName = 'is-selected';


    /**
     * Show language list
     */
    $('.languages__selected').on('click', function () {
        var parent = $(this).closest('.languages');

        if (parent.hasClass(selectedClassName)) {
            parent.removeClass(selectedClassName);
        } else {
            parent.addClass(selectedClassName);
        }
    });


    /**
     * Change language text
     */
    $('.languages__link').on('click', function () {
        var lang = $(this);
        var parent = lang.closest('.languages');
        var clickedLang = lang.closest('.languages__item');

        parent.removeClass('is-selected');
        clickedLang.addClass(selectedClassName).siblings().not(this).removeClass(selectedClassName);
        parent.find('.languages__selected span').text(lang.text());
    });


    /**
     * Stop closing language list
     */
    $('.languages__selected, .languages__link').on('click', function (e) {
        e.stopPropagation();
    });


    /**
     * Close language list when clicked not on language tags
     */
    $(document).on('click', function () {
        var langBlock = $('.languages');

        if (langBlock.hasClass(selectedClassName)) {
            langBlock.removeClass(selectedClassName);
        }
    });
})(jQuery);