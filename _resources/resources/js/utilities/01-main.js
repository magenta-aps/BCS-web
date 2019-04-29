(function () {
    'use strict';

    var aConfig = {};

    aConfig.breakpoint = {
        sm: 620,
        md: 920,
        lg: 1220
    };

    aConfig.isMobile = function() {
        return window.innerWidth < aConfig.breakpoint.md;
    };

    aConfig.isDesktop = function() {
        return window.innerWidth >= aConfig.breakpoint.md;
    };

    window.aConfig = aConfig;
})();