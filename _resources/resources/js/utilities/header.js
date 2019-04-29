(function ($, window, aConfig) {
    'use strict';


    var Slider = {
        element: $('.js-header-slider'),

        isInit: false,

        options: {
            arrows: false,
            dots: false,
            fade: true,
            speed: 1000,
            cssEase: 'ease-in-out',
            autoplay: true,
            autoplaySpeed: 5000
        },

        init: function () {
            if (!Slider.isInit) {
                Slider.element.slick(Slider.options);
                Slider.isInit = true;
            }
        },

        destroy: function () {
            if (Slider.isInit) {
                Slider.element.slick('unslick');
            }
        }
    };

    if (Slider.element.length) {
        var init = function () {
            var isStarted = false;

            if (aConfig.isMobile()) {
                if (isStarted) {
                    isStarted = false;
                    Slider.destroy();
                }
            } else {
                if (!isStarted) {
                    isStarted = true;
                    Slider.init();
                }
            }
        };

        window.addEventListener('resize', init);
        window.addEventListener('load', init);
    }
})(jQuery, window, window.aConfig);