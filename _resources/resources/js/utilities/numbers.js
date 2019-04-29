(function ($) {
    'use strict';

    var NumberList = function (block) {
        this.$block = $(block);

        this.options = {
            angle: 0.5,
            lineWidth: 0.04,
            radiusScale: 1,
            pointer: {
                length: 0.6,
                strokeWidth: 0.04,
                color: '#000000'
            },
            limitMax: false,
            limitMin: false,
            colorStart: '#dd252b',
            colorStop: '#dd252b',
            strokeColor: '#f0b9bb',
            generateGradient: true,
            highDpiSupport: true
        };

        this.init();
    };


    NumberList.prototype = {
        init: function () {
            this.donut = new Donut(this.$block.get(0));
            this.donut.setOptions(this.options);

            this.donut.maxValue = 100;
            this.donut.setMinValue(0);
            this.donut.animationSpeed = 30;
            this.donut.set(this.getValue());
        },

        getValue: function () {
            return this.$block.data('number');
        }
    };


    var $numbers = $('.js-number');

    if ($numbers.length) {
        var initNumberList = function () {
            $numbers.each(function () {
                new NumberList(this);
            });
        };

        initNumberList();

        $('[href="#services"]').on('shown.bs.tab', function () {
            initNumberList();
        });
    }

})(jQuery);
