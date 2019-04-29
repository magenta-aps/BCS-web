/*
     _ _      _       _
 ___| (_) ___| | __  (_)___
/ __| | |/ __| |/ /  | / __|
\__ \ | | (__|   < _ | \__ \
|___/_|_|\___|_|\_(_)/ |___/
                   |__/

 Version: 1.8.1
  Author: Ken Wheeler
 Website: http://kenwheeler.github.io
    Docs: http://kenwheeler.github.io/slick
    Repo: http://github.com/kenwheeler/slick
  Issues: http://github.com/kenwheeler/slick/issues

 */
/* global window, document, define, jQuery, setInterval, clearInterval */
;
(function(factory) {
    'use strict';
    if (typeof define === 'function' && define.amd) {
        define(['jquery'], factory);
    } else if (typeof exports !== 'undefined') {
        module.exports = factory(require('jquery'));
    } else {
        factory(jQuery);
    }

}(function($) {
    'use strict';
    var Slick = window.Slick || {};

    Slick = (function() {

        var instanceUid = 0;

        function Slick(element, settings) {

            var _ = this,
                dataSettings;

            _.defaults = {
                accessibility: true,
                adaptiveHeight: false,
                appendArrows: $(element),
                appendDots: $(element),
                arrows: true,
                asNavFor: null,
                prevArrow: '<button class="slick-prev" aria-label="Previous" type="button">Previous</button>',
                nextArrow: '<button class="slick-next" aria-label="Next" type="button">Next</button>',
                autoplay: false,
                autoplaySpeed: 3000,
                centerMode: false,
                centerPadding: '50px',
                cssEase: 'ease',
                customPaging: function(slider, i) {
                    return $('<button type="button" />').text(i + 1);
                },
                dots: false,
                dotsClass: 'slick-dots',
                draggable: true,
                easing: 'linear',
                edgeFriction: 0.35,
                fade: false,
                focusOnSelect: false,
                focusOnChange: false,
                infinite: true,
                initialSlide: 0,
                lazyLoad: 'ondemand',
                mobileFirst: false,
                pauseOnHover: true,
                pauseOnFocus: true,
                pauseOnDotsHover: false,
                respondTo: 'window',
                responsive: null,
                rows: 1,
                rtl: false,
                slide: '',
                slidesPerRow: 1,
                slidesToShow: 1,
                slidesToScroll: 1,
                speed: 500,
                swipe: true,
                swipeToSlide: false,
                touchMove: true,
                touchThreshold: 5,
                useCSS: true,
                useTransform: true,
                variableWidth: false,
                vertical: false,
                verticalSwiping: false,
                waitForAnimate: true,
                zIndex: 1000
            };

            _.initials = {
                animating: false,
                dragging: false,
                autoPlayTimer: null,
                currentDirection: 0,
                currentLeft: null,
                currentSlide: 0,
                direction: 1,
                $dots: null,
                listWidth: null,
                listHeight: null,
                loadIndex: 0,
                $nextArrow: null,
                $prevArrow: null,
                scrolling: false,
                slideCount: null,
                slideWidth: null,
                $slideTrack: null,
                $slides: null,
                sliding: false,
                slideOffset: 0,
                swipeLeft: null,
                swiping: false,
                $list: null,
                touchObject: {},
                transformsEnabled: false,
                unslicked: false
            };

            $.extend(_, _.initials);

            _.activeBreakpoint = null;
            _.animType = null;
            _.animProp = null;
            _.breakpoints = [];
            _.breakpointSettings = [];
            _.cssTransitions = false;
            _.focussed = false;
            _.interrupted = false;
            _.hidden = 'hidden';
            _.paused = true;
            _.positionProp = null;
            _.respondTo = null;
            _.rowCount = 1;
            _.shouldClick = true;
            _.$slider = $(element);
            _.$slidesCache = null;
            _.transformType = null;
            _.transitionType = null;
            _.visibilityChange = 'visibilitychange';
            _.windowWidth = 0;
            _.windowTimer = null;

            dataSettings = $(element).data('slick') || {};

            _.options = $.extend({}, _.defaults, settings, dataSettings);

            _.currentSlide = _.options.initialSlide;

            _.originalSettings = _.options;

            if (typeof document.mozHidden !== 'undefined') {
                _.hidden = 'mozHidden';
                _.visibilityChange = 'mozvisibilitychange';
            } else if (typeof document.webkitHidden !== 'undefined') {
                _.hidden = 'webkitHidden';
                _.visibilityChange = 'webkitvisibilitychange';
            }

            _.autoPlay = $.proxy(_.autoPlay, _);
            _.autoPlayClear = $.proxy(_.autoPlayClear, _);
            _.autoPlayIterator = $.proxy(_.autoPlayIterator, _);
            _.changeSlide = $.proxy(_.changeSlide, _);
            _.clickHandler = $.proxy(_.clickHandler, _);
            _.selectHandler = $.proxy(_.selectHandler, _);
            _.setPosition = $.proxy(_.setPosition, _);
            _.swipeHandler = $.proxy(_.swipeHandler, _);
            _.dragHandler = $.proxy(_.dragHandler, _);
            _.keyHandler = $.proxy(_.keyHandler, _);

            _.instanceUid = instanceUid++;

            // A simple way to check for HTML strings
            // Strict HTML recognition (must start with <)
            // Extracted from jQuery v1.11 source
            _.htmlExpr = /^(?:\s*(<[\w\W]+>)[^>]*)$/;


            _.registerBreakpoints();
            _.init(true);

        }

        return Slick;

    }());

    Slick.prototype.activateADA = function() {
        var _ = this;

        _.$slideTrack.find('.slick-active').attr({
            'aria-hidden': 'false'
        }).find('a, input, button, select').attr({
            'tabindex': '0'
        });

    };

    Slick.prototype.addSlide = Slick.prototype.slickAdd = function(markup, index, addBefore) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            addBefore = index;
            index = null;
        } else if (index < 0 || (index >= _.slideCount)) {
            return false;
        }

        _.unload();

        if (typeof(index) === 'number') {
            if (index === 0 && _.$slides.length === 0) {
                $(markup).appendTo(_.$slideTrack);
            } else if (addBefore) {
                $(markup).insertBefore(_.$slides.eq(index));
            } else {
                $(markup).insertAfter(_.$slides.eq(index));
            }
        } else {
            if (addBefore === true) {
                $(markup).prependTo(_.$slideTrack);
            } else {
                $(markup).appendTo(_.$slideTrack);
            }
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slides.each(function(index, element) {
            $(element).attr('data-slick-index', index);
        });

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.animateHeight = function() {
        var _ = this;
        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.animate({
                height: targetHeight
            }, _.options.speed);
        }
    };

    Slick.prototype.animateSlide = function(targetLeft, callback) {

        var animProps = {},
            _ = this;

        _.animateHeight();

        if (_.options.rtl === true && _.options.vertical === false) {
            targetLeft = -targetLeft;
        }
        if (_.transformsEnabled === false) {
            if (_.options.vertical === false) {
                _.$slideTrack.animate({
                    left: targetLeft
                }, _.options.speed, _.options.easing, callback);
            } else {
                _.$slideTrack.animate({
                    top: targetLeft
                }, _.options.speed, _.options.easing, callback);
            }

        } else {

            if (_.cssTransitions === false) {
                if (_.options.rtl === true) {
                    _.currentLeft = -(_.currentLeft);
                }
                $({
                    animStart: _.currentLeft
                }).animate({
                    animStart: targetLeft
                }, {
                    duration: _.options.speed,
                    easing: _.options.easing,
                    step: function(now) {
                        now = Math.ceil(now);
                        if (_.options.vertical === false) {
                            animProps[_.animType] = 'translate(' +
                                now + 'px, 0px)';
                            _.$slideTrack.css(animProps);
                        } else {
                            animProps[_.animType] = 'translate(0px,' +
                                now + 'px)';
                            _.$slideTrack.css(animProps);
                        }
                    },
                    complete: function() {
                        if (callback) {
                            callback.call();
                        }
                    }
                });

            } else {

                _.applyTransition();
                targetLeft = Math.ceil(targetLeft);

                if (_.options.vertical === false) {
                    animProps[_.animType] = 'translate3d(' + targetLeft + 'px, 0px, 0px)';
                } else {
                    animProps[_.animType] = 'translate3d(0px,' + targetLeft + 'px, 0px)';
                }
                _.$slideTrack.css(animProps);

                if (callback) {
                    setTimeout(function() {

                        _.disableTransition();

                        callback.call();
                    }, _.options.speed);
                }

            }

        }

    };

    Slick.prototype.getNavTarget = function() {

        var _ = this,
            asNavFor = _.options.asNavFor;

        if (asNavFor && asNavFor !== null) {
            asNavFor = $(asNavFor).not(_.$slider);
        }

        return asNavFor;

    };

    Slick.prototype.asNavFor = function(index) {

        var _ = this,
            asNavFor = _.getNavTarget();

        if (asNavFor !== null && typeof asNavFor === 'object') {
            asNavFor.each(function() {
                var target = $(this).slick('getSlick');
                if (!target.unslicked) {
                    target.slideHandler(index, true);
                }
            });
        }

    };

    Slick.prototype.applyTransition = function(slide) {

        var _ = this,
            transition = {};

        if (_.options.fade === false) {
            transition[_.transitionType] = _.transformType + ' ' + _.options.speed + 'ms ' + _.options.cssEase;
        } else {
            transition[_.transitionType] = 'opacity ' + _.options.speed + 'ms ' + _.options.cssEase;
        }

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.autoPlay = function() {

        var _ = this;

        _.autoPlayClear();

        if (_.slideCount > _.options.slidesToShow) {
            _.autoPlayTimer = setInterval(_.autoPlayIterator, _.options.autoplaySpeed);
        }

    };

    Slick.prototype.autoPlayClear = function() {

        var _ = this;

        if (_.autoPlayTimer) {
            clearInterval(_.autoPlayTimer);
        }

    };

    Slick.prototype.autoPlayIterator = function() {

        var _ = this,
            slideTo = _.currentSlide + _.options.slidesToScroll;

        if (!_.paused && !_.interrupted && !_.focussed) {

            if (_.options.infinite === false) {

                if (_.direction === 1 && (_.currentSlide + 1) === (_.slideCount - 1)) {
                    _.direction = 0;
                } else if (_.direction === 0) {

                    slideTo = _.currentSlide - _.options.slidesToScroll;

                    if (_.currentSlide - 1 === 0) {
                        _.direction = 1;
                    }

                }

            }

            _.slideHandler(slideTo);

        }

    };

    Slick.prototype.buildArrows = function() {

        var _ = this;

        if (_.options.arrows === true) {

            _.$prevArrow = $(_.options.prevArrow).addClass('slick-arrow');
            _.$nextArrow = $(_.options.nextArrow).addClass('slick-arrow');

            if (_.slideCount > _.options.slidesToShow) {

                _.$prevArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');
                _.$nextArrow.removeClass('slick-hidden').removeAttr('aria-hidden tabindex');

                if (_.htmlExpr.test(_.options.prevArrow)) {
                    _.$prevArrow.prependTo(_.options.appendArrows);
                }

                if (_.htmlExpr.test(_.options.nextArrow)) {
                    _.$nextArrow.appendTo(_.options.appendArrows);
                }

                if (_.options.infinite !== true) {
                    _.$prevArrow
                        .addClass('slick-disabled')
                        .attr('aria-disabled', 'true');
                }

            } else {

                _.$prevArrow.add(_.$nextArrow)

                    .addClass('slick-hidden')
                    .attr({
                        'aria-disabled': 'true',
                        'tabindex': '-1'
                    });

            }

        }

    };

    Slick.prototype.buildDots = function() {

        var _ = this,
            i, dot;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$slider.addClass('slick-dotted');

            dot = $('<ul />').addClass(_.options.dotsClass);

            for (i = 0; i <= _.getDotCount(); i += 1) {
                dot.append($('<li />').append(_.options.customPaging.call(this, _, i)));
            }

            _.$dots = dot.appendTo(_.options.appendDots);

            _.$dots.find('li').first().addClass('slick-active');

        }

    };

    Slick.prototype.buildOut = function() {

        var _ = this;

        _.$slides =
            _.$slider
            .children(_.options.slide + ':not(.slick-cloned)')
            .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        _.$slides.each(function(index, element) {
            $(element)
                .attr('data-slick-index', index)
                .data('originalStyling', $(element).attr('style') || '');
        });

        _.$slider.addClass('slick-slider');

        _.$slideTrack = (_.slideCount === 0) ?
            $('<div class="slick-track"/>').appendTo(_.$slider) :
            _.$slides.wrapAll('<div class="slick-track"/>').parent();

        _.$list = _.$slideTrack.wrap(
            '<div class="slick-list"/>').parent();
        _.$slideTrack.css('opacity', 0);

        if (_.options.centerMode === true || _.options.swipeToSlide === true) {
            _.options.slidesToScroll = 1;
        }

        $('img[data-lazy]', _.$slider).not('[src]').addClass('slick-loading');

        _.setupInfinite();

        _.buildArrows();

        _.buildDots();

        _.updateDots();


        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        if (_.options.draggable === true) {
            _.$list.addClass('draggable');
        }

    };

    Slick.prototype.buildRows = function() {

        var _ = this,
            a, b, c, newSlides, numOfSlides, originalSlides, slidesPerSection;

        newSlides = document.createDocumentFragment();
        originalSlides = _.$slider.children();

        if (_.options.rows > 0) {

            slidesPerSection = _.options.slidesPerRow * _.options.rows;
            numOfSlides = Math.ceil(
                originalSlides.length / slidesPerSection
            );

            for (a = 0; a < numOfSlides; a++) {
                var slide = document.createElement('div');
                for (b = 0; b < _.options.rows; b++) {
                    var row = document.createElement('div');
                    for (c = 0; c < _.options.slidesPerRow; c++) {
                        var target = (a * slidesPerSection + ((b * _.options.slidesPerRow) + c));
                        if (originalSlides.get(target)) {
                            row.appendChild(originalSlides.get(target));
                        }
                    }
                    slide.appendChild(row);
                }
                newSlides.appendChild(slide);
            }

            _.$slider.empty().append(newSlides);
            _.$slider.children().children().children()
                .css({
                    'width': (100 / _.options.slidesPerRow) + '%',
                    'display': 'inline-block'
                });

        }

    };

    Slick.prototype.checkResponsive = function(initial, forceUpdate) {

        var _ = this,
            breakpoint, targetBreakpoint, respondToWidth, triggerBreakpoint = false;
        var sliderWidth = _.$slider.width();
        var windowWidth = window.innerWidth || $(window).width();

        if (_.respondTo === 'window') {
            respondToWidth = windowWidth;
        } else if (_.respondTo === 'slider') {
            respondToWidth = sliderWidth;
        } else if (_.respondTo === 'min') {
            respondToWidth = Math.min(windowWidth, sliderWidth);
        }

        if (_.options.responsive &&
            _.options.responsive.length &&
            _.options.responsive !== null) {

            targetBreakpoint = null;

            for (breakpoint in _.breakpoints) {
                if (_.breakpoints.hasOwnProperty(breakpoint)) {
                    if (_.originalSettings.mobileFirst === false) {
                        if (respondToWidth < _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    } else {
                        if (respondToWidth > _.breakpoints[breakpoint]) {
                            targetBreakpoint = _.breakpoints[breakpoint];
                        }
                    }
                }
            }

            if (targetBreakpoint !== null) {
                if (_.activeBreakpoint !== null) {
                    if (targetBreakpoint !== _.activeBreakpoint || forceUpdate) {
                        _.activeBreakpoint =
                            targetBreakpoint;
                        if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                            _.unslick(targetBreakpoint);
                        } else {
                            _.options = $.extend({}, _.originalSettings,
                                _.breakpointSettings[
                                    targetBreakpoint]);
                            if (initial === true) {
                                _.currentSlide = _.options.initialSlide;
                            }
                            _.refresh(initial);
                        }
                        triggerBreakpoint = targetBreakpoint;
                    }
                } else {
                    _.activeBreakpoint = targetBreakpoint;
                    if (_.breakpointSettings[targetBreakpoint] === 'unslick') {
                        _.unslick(targetBreakpoint);
                    } else {
                        _.options = $.extend({}, _.originalSettings,
                            _.breakpointSettings[
                                targetBreakpoint]);
                        if (initial === true) {
                            _.currentSlide = _.options.initialSlide;
                        }
                        _.refresh(initial);
                    }
                    triggerBreakpoint = targetBreakpoint;
                }
            } else {
                if (_.activeBreakpoint !== null) {
                    _.activeBreakpoint = null;
                    _.options = _.originalSettings;
                    if (initial === true) {
                        _.currentSlide = _.options.initialSlide;
                    }
                    _.refresh(initial);
                    triggerBreakpoint = targetBreakpoint;
                }
            }

            // only trigger breakpoints during an actual break. not on initialize.
            if (!initial && triggerBreakpoint !== false) {
                _.$slider.trigger('breakpoint', [_, triggerBreakpoint]);
            }
        }

    };

    Slick.prototype.changeSlide = function(event, dontAnimate) {

        var _ = this,
            $target = $(event.currentTarget),
            indexOffset, slideOffset, unevenOffset;

        // If target is a link, prevent default action.
        if ($target.is('a')) {
            event.preventDefault();
        }

        // If target is not the <li> element (ie: a child), find the <li>.
        if (!$target.is('li')) {
            $target = $target.closest('li');
        }

        unevenOffset = (_.slideCount % _.options.slidesToScroll !== 0);
        indexOffset = unevenOffset ? 0 : (_.slideCount - _.currentSlide) % _.options.slidesToScroll;

        switch (event.data.message) {

            case 'previous':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : _.options.slidesToShow - indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide - slideOffset, false, dontAnimate);
                }
                break;

            case 'next':
                slideOffset = indexOffset === 0 ? _.options.slidesToScroll : indexOffset;
                if (_.slideCount > _.options.slidesToShow) {
                    _.slideHandler(_.currentSlide + slideOffset, false, dontAnimate);
                }
                break;

            case 'index':
                var index = event.data.index === 0 ? 0 :
                    event.data.index || $target.index() * _.options.slidesToScroll;

                _.slideHandler(_.checkNavigable(index), false, dontAnimate);
                $target.children().trigger('focus');
                break;

            default:
                return;
        }

    };

    Slick.prototype.checkNavigable = function(index) {

        var _ = this,
            navigables, prevNavigable;

        navigables = _.getNavigableIndexes();
        prevNavigable = 0;
        if (index > navigables[navigables.length - 1]) {
            index = navigables[navigables.length - 1];
        } else {
            for (var n in navigables) {
                if (index < navigables[n]) {
                    index = prevNavigable;
                    break;
                }
                prevNavigable = navigables[n];
            }
        }

        return index;
    };

    Slick.prototype.cleanUpEvents = function() {

        var _ = this;

        if (_.options.dots && _.$dots !== null) {

            $('li', _.$dots)
                .off('click.slick', _.changeSlide)
                .off('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .off('mouseleave.slick', $.proxy(_.interrupt, _, false));

            if (_.options.accessibility === true) {
                _.$dots.off('keydown.slick', _.keyHandler);
            }
        }

        _.$slider.off('focus.slick blur.slick');

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow && _.$prevArrow.off('click.slick', _.changeSlide);
            _.$nextArrow && _.$nextArrow.off('click.slick', _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow && _.$prevArrow.off('keydown.slick', _.keyHandler);
                _.$nextArrow && _.$nextArrow.off('keydown.slick', _.keyHandler);
            }
        }

        _.$list.off('touchstart.slick mousedown.slick', _.swipeHandler);
        _.$list.off('touchmove.slick mousemove.slick', _.swipeHandler);
        _.$list.off('touchend.slick mouseup.slick', _.swipeHandler);
        _.$list.off('touchcancel.slick mouseleave.slick', _.swipeHandler);

        _.$list.off('click.slick', _.clickHandler);

        $(document).off(_.visibilityChange, _.visibility);

        _.cleanUpSlideEvents();

        if (_.options.accessibility === true) {
            _.$list.off('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().off('click.slick', _.selectHandler);
        }

        $(window).off('orientationchange.slick.slick-' + _.instanceUid, _.orientationChange);

        $(window).off('resize.slick.slick-' + _.instanceUid, _.resize);

        $('[draggable!=true]', _.$slideTrack).off('dragstart', _.preventDefault);

        $(window).off('load.slick.slick-' + _.instanceUid, _.setPosition);

    };

    Slick.prototype.cleanUpSlideEvents = function() {

        var _ = this;

        _.$list.off('mouseenter.slick', $.proxy(_.interrupt, _, true));
        _.$list.off('mouseleave.slick', $.proxy(_.interrupt, _, false));

    };

    Slick.prototype.cleanUpRows = function() {

        var _ = this,
            originalSlides;

        if (_.options.rows > 0) {
            originalSlides = _.$slides.children().children();
            originalSlides.removeAttr('style');
            _.$slider.empty().append(originalSlides);
        }

    };

    Slick.prototype.clickHandler = function(event) {

        var _ = this;

        if (_.shouldClick === false) {
            event.stopImmediatePropagation();
            event.stopPropagation();
            event.preventDefault();
        }

    };

    Slick.prototype.destroy = function(refresh) {

        var _ = this;

        _.autoPlayClear();

        _.touchObject = {};

        _.cleanUpEvents();

        $('.slick-cloned', _.$slider).detach();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.$prevArrow.length) {

            _.$prevArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.prevArrow)) {
                _.$prevArrow.remove();
            }
        }

        if (_.$nextArrow && _.$nextArrow.length) {

            _.$nextArrow
                .removeClass('slick-disabled slick-arrow slick-hidden')
                .removeAttr('aria-hidden aria-disabled tabindex')
                .css('display', '');

            if (_.htmlExpr.test(_.options.nextArrow)) {
                _.$nextArrow.remove();
            }
        }


        if (_.$slides) {

            _.$slides
                .removeClass('slick-slide slick-active slick-center slick-visible slick-current')
                .removeAttr('aria-hidden')
                .removeAttr('data-slick-index')
                .each(function() {
                    $(this).attr('style', $(this).data('originalStyling'));
                });

            _.$slideTrack.children(this.options.slide).detach();

            _.$slideTrack.detach();

            _.$list.detach();

            _.$slider.append(_.$slides);
        }

        _.cleanUpRows();

        _.$slider.removeClass('slick-slider');
        _.$slider.removeClass('slick-initialized');
        _.$slider.removeClass('slick-dotted');

        _.unslicked = true;

        if (!refresh) {
            _.$slider.trigger('destroy', [_]);
        }

    };

    Slick.prototype.disableTransition = function(slide) {

        var _ = this,
            transition = {};

        transition[_.transitionType] = '';

        if (_.options.fade === false) {
            _.$slideTrack.css(transition);
        } else {
            _.$slides.eq(slide).css(transition);
        }

    };

    Slick.prototype.fadeSlide = function(slideIndex, callback) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).css({
                zIndex: _.options.zIndex
            });

            _.$slides.eq(slideIndex).animate({
                opacity: 1
            }, _.options.speed, _.options.easing, callback);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 1,
                zIndex: _.options.zIndex
            });

            if (callback) {
                setTimeout(function() {

                    _.disableTransition(slideIndex);

                    callback.call();
                }, _.options.speed);
            }

        }

    };

    Slick.prototype.fadeSlideOut = function(slideIndex) {

        var _ = this;

        if (_.cssTransitions === false) {

            _.$slides.eq(slideIndex).animate({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            }, _.options.speed, _.options.easing);

        } else {

            _.applyTransition(slideIndex);

            _.$slides.eq(slideIndex).css({
                opacity: 0,
                zIndex: _.options.zIndex - 2
            });

        }

    };

    Slick.prototype.filterSlides = Slick.prototype.slickFilter = function(filter) {

        var _ = this;

        if (filter !== null) {

            _.$slidesCache = _.$slides;

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.filter(filter).appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.focusHandler = function() {

        var _ = this;

        _.$slider
            .off('focus.slick blur.slick')
            .on('focus.slick blur.slick', '*', function(event) {

                event.stopImmediatePropagation();
                var $sf = $(this);

                setTimeout(function() {

                    if (_.options.pauseOnFocus) {
                        _.focussed = $sf.is(':focus');
                        _.autoPlay();
                    }

                }, 0);

            });
    };

    Slick.prototype.getCurrent = Slick.prototype.slickCurrentSlide = function() {

        var _ = this;
        return _.currentSlide;

    };

    Slick.prototype.getDotCount = function() {

        var _ = this;

        var breakPoint = 0;
        var counter = 0;
        var pagerQty = 0;

        if (_.options.infinite === true) {
            if (_.slideCount <= _.options.slidesToShow) {
                ++pagerQty;
            } else {
                while (breakPoint < _.slideCount) {
                    ++pagerQty;
                    breakPoint = counter + _.options.slidesToScroll;
                    counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
                }
            }
        } else if (_.options.centerMode === true) {
            pagerQty = _.slideCount;
        } else if (!_.options.asNavFor) {
            pagerQty = 1 + Math.ceil((_.slideCount - _.options.slidesToShow) / _.options.slidesToScroll);
        } else {
            while (breakPoint < _.slideCount) {
                ++pagerQty;
                breakPoint = counter + _.options.slidesToScroll;
                counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
            }
        }

        return pagerQty - 1;

    };

    Slick.prototype.getLeft = function(slideIndex) {

        var _ = this,
            targetLeft,
            verticalHeight,
            verticalOffset = 0,
            targetSlide,
            coef;

        _.slideOffset = 0;
        verticalHeight = _.$slides.first().outerHeight(true);

        if (_.options.infinite === true) {
            if (_.slideCount > _.options.slidesToShow) {
                _.slideOffset = (_.slideWidth * _.options.slidesToShow) * -1;
                coef = -1

                if (_.options.vertical === true && _.options.centerMode === true) {
                    if (_.options.slidesToShow === 2) {
                        coef = -1.5;
                    } else if (_.options.slidesToShow === 1) {
                        coef = -2
                    }
                }
                verticalOffset = (verticalHeight * _.options.slidesToShow) * coef;
            }
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                if (slideIndex + _.options.slidesToScroll > _.slideCount && _.slideCount > _.options.slidesToShow) {
                    if (slideIndex > _.slideCount) {
                        _.slideOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * _.slideWidth) * -1;
                        verticalOffset = ((_.options.slidesToShow - (slideIndex - _.slideCount)) * verticalHeight) * -1;
                    } else {
                        _.slideOffset = ((_.slideCount % _.options.slidesToScroll) * _.slideWidth) * -1;
                        verticalOffset = ((_.slideCount % _.options.slidesToScroll) * verticalHeight) * -1;
                    }
                }
            }
        } else {
            if (slideIndex + _.options.slidesToShow > _.slideCount) {
                _.slideOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * _.slideWidth;
                verticalOffset = ((slideIndex + _.options.slidesToShow) - _.slideCount) * verticalHeight;
            }
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.slideOffset = 0;
            verticalOffset = 0;
        }

        if (_.options.centerMode === true && _.slideCount <= _.options.slidesToShow) {
            _.slideOffset = ((_.slideWidth * Math.floor(_.options.slidesToShow)) / 2) - ((_.slideWidth * _.slideCount) / 2);
        } else if (_.options.centerMode === true && _.options.infinite === true) {
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2) - _.slideWidth;
        } else if (_.options.centerMode === true) {
            _.slideOffset = 0;
            _.slideOffset += _.slideWidth * Math.floor(_.options.slidesToShow / 2);
        }

        if (_.options.vertical === false) {
            targetLeft = ((slideIndex * _.slideWidth) * -1) + _.slideOffset;
        } else {
            targetLeft = ((slideIndex * verticalHeight) * -1) + verticalOffset;
        }

        if (_.options.variableWidth === true) {

            if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
            } else {
                targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow);
            }

            if (_.options.rtl === true) {
                if (targetSlide[0]) {
                    targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                } else {
                    targetLeft = 0;
                }
            } else {
                targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
            }

            if (_.options.centerMode === true) {
                if (_.slideCount <= _.options.slidesToShow || _.options.infinite === false) {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex);
                } else {
                    targetSlide = _.$slideTrack.children('.slick-slide').eq(slideIndex + _.options.slidesToShow + 1);
                }

                if (_.options.rtl === true) {
                    if (targetSlide[0]) {
                        targetLeft = (_.$slideTrack.width() - targetSlide[0].offsetLeft - targetSlide.width()) * -1;
                    } else {
                        targetLeft = 0;
                    }
                } else {
                    targetLeft = targetSlide[0] ? targetSlide[0].offsetLeft * -1 : 0;
                }

                targetLeft += (_.$list.width() - targetSlide.outerWidth()) / 2;
            }
        }

        return targetLeft;

    };

    Slick.prototype.getOption = Slick.prototype.slickGetOption = function(option) {

        var _ = this;

        return _.options[option];

    };

    Slick.prototype.getNavigableIndexes = function() {

        var _ = this,
            breakPoint = 0,
            counter = 0,
            indexes = [],
            max;

        if (_.options.infinite === false) {
            max = _.slideCount;
        } else {
            breakPoint = _.options.slidesToScroll * -1;
            counter = _.options.slidesToScroll * -1;
            max = _.slideCount * 2;
        }

        while (breakPoint < max) {
            indexes.push(breakPoint);
            breakPoint = counter + _.options.slidesToScroll;
            counter += _.options.slidesToScroll <= _.options.slidesToShow ? _.options.slidesToScroll : _.options.slidesToShow;
        }

        return indexes;

    };

    Slick.prototype.getSlick = function() {

        return this;

    };

    Slick.prototype.getSlideCount = function() {

        var _ = this,
            slidesTraversed, swipedSlide, centerOffset;

        centerOffset = _.options.centerMode === true ? _.slideWidth * Math.floor(_.options.slidesToShow / 2) : 0;

        if (_.options.swipeToSlide === true) {
            _.$slideTrack.find('.slick-slide').each(function(index, slide) {
                if (slide.offsetLeft - centerOffset + ($(slide).outerWidth() / 2) > (_.swipeLeft * -1)) {
                    swipedSlide = slide;
                    return false;
                }
            });

            slidesTraversed = Math.abs($(swipedSlide).attr('data-slick-index') - _.currentSlide) || 1;

            return slidesTraversed;

        } else {
            return _.options.slidesToScroll;
        }

    };

    Slick.prototype.goTo = Slick.prototype.slickGoTo = function(slide, dontAnimate) {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'index',
                index: parseInt(slide)
            }
        }, dontAnimate);

    };

    Slick.prototype.init = function(creation) {

        var _ = this;

        if (!$(_.$slider).hasClass('slick-initialized')) {

            $(_.$slider).addClass('slick-initialized');

            _.buildRows();
            _.buildOut();
            _.setProps();
            _.startLoad();
            _.loadSlider();
            _.initializeEvents();
            _.updateArrows();
            _.updateDots();
            _.checkResponsive(true);
            _.focusHandler();

        }

        if (creation) {
            _.$slider.trigger('init', [_]);
        }

        if (_.options.accessibility === true) {
            _.initADA();
        }

        if (_.options.autoplay) {

            _.paused = false;
            _.autoPlay();

        }

    };

    Slick.prototype.initADA = function() {
        var _ = this,
            numDotGroups = Math.ceil(_.slideCount / _.options.slidesToShow),
            tabControlIndexes = _.getNavigableIndexes().filter(function(val) {
                return (val >= 0) && (val < _.slideCount);
            });

        _.$slides.add(_.$slideTrack.find('.slick-cloned')).attr({
            'aria-hidden': 'true',
            'tabindex': '-1'
        }).find('a, input, button, select').attr({
            'tabindex': '-1'
        });

        if (_.$dots !== null) {
            _.$slides.not(_.$slideTrack.find('.slick-cloned')).each(function(i) {
                var slideControlIndex = tabControlIndexes.indexOf(i);

                $(this).attr({
                    'role': 'tabpanel',
                    'id': 'slick-slide' + _.instanceUid + i,
                    'tabindex': -1
                });

                if (slideControlIndex !== -1) {
                    var ariaButtonControl = 'slick-slide-control' + _.instanceUid + slideControlIndex
                    if ($('#' + ariaButtonControl).length) {
                        $(this).attr({
                            'aria-describedby': ariaButtonControl
                        });
                    }
                }
            });

            _.$dots.attr('role', 'tablist').find('li').each(function(i) {
                var mappedSlideIndex = tabControlIndexes[i];

                $(this).attr({
                    'role': 'presentation'
                });

                $(this).find('button').first().attr({
                    'role': 'tab',
                    'id': 'slick-slide-control' + _.instanceUid + i,
                    'aria-controls': 'slick-slide' + _.instanceUid + mappedSlideIndex,
                    'aria-label': (i + 1) + ' of ' + numDotGroups,
                    'aria-selected': null,
                    'tabindex': '-1'
                });

            }).eq(_.currentSlide).find('button').attr({
                'aria-selected': 'true',
                'tabindex': '0'
            }).end();
        }

        for (var i = _.currentSlide, max = i + _.options.slidesToShow; i < max; i++) {
            if (_.options.focusOnChange) {
                _.$slides.eq(i).attr({
                    'tabindex': '0'
                });
            } else {
                _.$slides.eq(i).removeAttr('tabindex');
            }
        }

        _.activateADA();

    };

    Slick.prototype.initArrowEvents = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {
            _.$prevArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'previous'
                }, _.changeSlide);
            _.$nextArrow
                .off('click.slick')
                .on('click.slick', {
                    message: 'next'
                }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$prevArrow.on('keydown.slick', _.keyHandler);
                _.$nextArrow.on('keydown.slick', _.keyHandler);
            }
        }

    };

    Slick.prototype.initDotEvents = function() {

        var _ = this;

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {
            $('li', _.$dots).on('click.slick', {
                message: 'index'
            }, _.changeSlide);

            if (_.options.accessibility === true) {
                _.$dots.on('keydown.slick', _.keyHandler);
            }
        }

        if (_.options.dots === true && _.options.pauseOnDotsHover === true && _.slideCount > _.options.slidesToShow) {

            $('li', _.$dots)
                .on('mouseenter.slick', $.proxy(_.interrupt, _, true))
                .on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initSlideEvents = function() {

        var _ = this;

        if (_.options.pauseOnHover) {

            _.$list.on('mouseenter.slick', $.proxy(_.interrupt, _, true));
            _.$list.on('mouseleave.slick', $.proxy(_.interrupt, _, false));

        }

    };

    Slick.prototype.initializeEvents = function() {

        var _ = this;

        _.initArrowEvents();

        _.initDotEvents();
        _.initSlideEvents();

        _.$list.on('touchstart.slick mousedown.slick', {
            action: 'start'
        }, _.swipeHandler);
        _.$list.on('touchmove.slick mousemove.slick', {
            action: 'move'
        }, _.swipeHandler);
        _.$list.on('touchend.slick mouseup.slick', {
            action: 'end'
        }, _.swipeHandler);
        _.$list.on('touchcancel.slick mouseleave.slick', {
            action: 'end'
        }, _.swipeHandler);

        _.$list.on('click.slick', _.clickHandler);

        $(document).on(_.visibilityChange, $.proxy(_.visibility, _));

        if (_.options.accessibility === true) {
            _.$list.on('keydown.slick', _.keyHandler);
        }

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        $(window).on('orientationchange.slick.slick-' + _.instanceUid, $.proxy(_.orientationChange, _));

        $(window).on('resize.slick.slick-' + _.instanceUid, $.proxy(_.resize, _));

        $('[draggable!=true]', _.$slideTrack).on('dragstart', _.preventDefault);

        $(window).on('load.slick.slick-' + _.instanceUid, _.setPosition);
        $(_.setPosition);

    };

    Slick.prototype.initUI = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.show();
            _.$nextArrow.show();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.show();

        }

    };

    Slick.prototype.keyHandler = function(event) {

        var _ = this;
        //Dont slide if the cursor is inside the form fields and arrow keys are pressed
        if (!event.target.tagName.match('TEXTAREA|INPUT|SELECT')) {
            if (event.keyCode === 37 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'next' : 'previous'
                    }
                });
            } else if (event.keyCode === 39 && _.options.accessibility === true) {
                _.changeSlide({
                    data: {
                        message: _.options.rtl === true ? 'previous' : 'next'
                    }
                });
            }
        }

    };

    Slick.prototype.lazyLoad = function() {

        var _ = this,
            loadRange, cloneRange, rangeStart, rangeEnd;

        function loadImages(imagesScope) {

            $('img[data-lazy]', imagesScope).each(function() {

                var image = $(this),
                    imageSource = $(this).attr('data-lazy'),
                    imageSrcSet = $(this).attr('data-srcset'),
                    imageSizes = $(this).attr('data-sizes') || _.$slider.attr('data-sizes'),
                    imageToLoad = document.createElement('img');

                imageToLoad.onload = function() {

                    image
                        .animate({
                            opacity: 0
                        }, 100, function() {

                            if (imageSrcSet) {
                                image
                                    .attr('srcset', imageSrcSet);

                                if (imageSizes) {
                                    image
                                        .attr('sizes', imageSizes);
                                }
                            }

                            image
                                .attr('src', imageSource)
                                .animate({
                                    opacity: 1
                                }, 200, function() {
                                    image
                                        .removeAttr('data-lazy data-srcset data-sizes')
                                        .removeClass('slick-loading');
                                });
                            _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                        });

                };

                imageToLoad.onerror = function() {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                };

                imageToLoad.src = imageSource;

            });

        }

        if (_.options.centerMode === true) {
            if (_.options.infinite === true) {
                rangeStart = _.currentSlide + (_.options.slidesToShow / 2 + 1);
                rangeEnd = rangeStart + _.options.slidesToShow + 2;
            } else {
                rangeStart = Math.max(0, _.currentSlide - (_.options.slidesToShow / 2 + 1));
                rangeEnd = 2 + (_.options.slidesToShow / 2 + 1) + _.currentSlide;
            }
        } else {
            rangeStart = _.options.infinite ? _.options.slidesToShow + _.currentSlide : _.currentSlide;
            rangeEnd = Math.ceil(rangeStart + _.options.slidesToShow);
            if (_.options.fade === true) {
                if (rangeStart > 0) rangeStart--;
                if (rangeEnd <= _.slideCount) rangeEnd++;
            }
        }

        loadRange = _.$slider.find('.slick-slide').slice(rangeStart, rangeEnd);

        if (_.options.lazyLoad === 'anticipated') {
            var prevSlide = rangeStart - 1,
                nextSlide = rangeEnd,
                $slides = _.$slider.find('.slick-slide');

            for (var i = 0; i < _.options.slidesToScroll; i++) {
                if (prevSlide < 0) prevSlide = _.slideCount - 1;
                loadRange = loadRange.add($slides.eq(prevSlide));
                loadRange = loadRange.add($slides.eq(nextSlide));
                prevSlide--;
                nextSlide++;
            }
        }

        loadImages(loadRange);

        if (_.slideCount <= _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-slide');
            loadImages(cloneRange);
        } else
        if (_.currentSlide >= _.slideCount - _.options.slidesToShow) {
            cloneRange = _.$slider.find('.slick-cloned').slice(0, _.options.slidesToShow);
            loadImages(cloneRange);
        } else if (_.currentSlide === 0) {
            cloneRange = _.$slider.find('.slick-cloned').slice(_.options.slidesToShow * -1);
            loadImages(cloneRange);
        }

    };

    Slick.prototype.loadSlider = function() {

        var _ = this;

        _.setPosition();

        _.$slideTrack.css({
            opacity: 1
        });

        _.$slider.removeClass('slick-loading');

        _.initUI();

        if (_.options.lazyLoad === 'progressive') {
            _.progressiveLazyLoad();
        }

    };

    Slick.prototype.next = Slick.prototype.slickNext = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'next'
            }
        });

    };

    Slick.prototype.orientationChange = function() {

        var _ = this;

        _.checkResponsive();
        _.setPosition();

    };

    Slick.prototype.pause = Slick.prototype.slickPause = function() {

        var _ = this;

        _.autoPlayClear();
        _.paused = true;

    };

    Slick.prototype.play = Slick.prototype.slickPlay = function() {

        var _ = this;

        _.autoPlay();
        _.options.autoplay = true;
        _.paused = false;
        _.focussed = false;
        _.interrupted = false;

    };

    Slick.prototype.postSlide = function(index) {

        var _ = this;

        if (!_.unslicked) {

            _.$slider.trigger('afterChange', [_, index]);

            _.animating = false;

            if (_.slideCount > _.options.slidesToShow) {
                _.setPosition();
            }

            _.swipeLeft = null;

            if (_.options.autoplay) {
                _.autoPlay();
            }

            if (_.options.accessibility === true) {
                _.initADA();

                if (_.options.focusOnChange) {
                    var $currentSlide = $(_.$slides.get(_.currentSlide));
                    $currentSlide.attr('tabindex', 0).focus();
                }
            }

        }

    };

    Slick.prototype.prev = Slick.prototype.slickPrev = function() {

        var _ = this;

        _.changeSlide({
            data: {
                message: 'previous'
            }
        });

    };

    Slick.prototype.preventDefault = function(event) {

        event.preventDefault();

    };

    Slick.prototype.progressiveLazyLoad = function(tryCount) {

        tryCount = tryCount || 1;

        var _ = this,
            $imgsToLoad = $('img[data-lazy]', _.$slider),
            image,
            imageSource,
            imageSrcSet,
            imageSizes,
            imageToLoad;

        if ($imgsToLoad.length) {

            image = $imgsToLoad.first();
            imageSource = image.attr('data-lazy');
            imageSrcSet = image.attr('data-srcset');
            imageSizes = image.attr('data-sizes') || _.$slider.attr('data-sizes');
            imageToLoad = document.createElement('img');

            imageToLoad.onload = function() {

                if (imageSrcSet) {
                    image
                        .attr('srcset', imageSrcSet);

                    if (imageSizes) {
                        image
                            .attr('sizes', imageSizes);
                    }
                }

                image
                    .attr('src', imageSource)
                    .removeAttr('data-lazy data-srcset data-sizes')
                    .removeClass('slick-loading');

                if (_.options.adaptiveHeight === true) {
                    _.setPosition();
                }

                _.$slider.trigger('lazyLoaded', [_, image, imageSource]);
                _.progressiveLazyLoad();

            };

            imageToLoad.onerror = function() {

                if (tryCount < 3) {

                    /**
                     * try to load the image 3 times,
                     * leave a slight delay so we don't get
                     * servers blocking the request.
                     */
                    setTimeout(function() {
                        _.progressiveLazyLoad(tryCount + 1);
                    }, 500);

                } else {

                    image
                        .removeAttr('data-lazy')
                        .removeClass('slick-loading')
                        .addClass('slick-lazyload-error');

                    _.$slider.trigger('lazyLoadError', [_, image, imageSource]);

                    _.progressiveLazyLoad();

                }

            };

            imageToLoad.src = imageSource;

        } else {

            _.$slider.trigger('allImagesLoaded', [_]);

        }

    };

    Slick.prototype.refresh = function(initializing) {

        var _ = this,
            currentSlide, lastVisibleIndex;

        lastVisibleIndex = _.slideCount - _.options.slidesToShow;

        // in non-infinite sliders, we don't want to go past the
        // last visible index.
        if (!_.options.infinite && (_.currentSlide > lastVisibleIndex)) {
            _.currentSlide = lastVisibleIndex;
        }

        // if less slides than to show, go to start.
        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;

        }

        currentSlide = _.currentSlide;

        _.destroy(true);

        $.extend(_, _.initials, {
            currentSlide: currentSlide
        });

        _.init();

        if (!initializing) {

            _.changeSlide({
                data: {
                    message: 'index',
                    index: currentSlide
                }
            }, false);

        }

    };

    Slick.prototype.registerBreakpoints = function() {

        var _ = this,
            breakpoint, currentBreakpoint, l,
            responsiveSettings = _.options.responsive || null;

        if ($.type(responsiveSettings) === 'array' && responsiveSettings.length) {

            _.respondTo = _.options.respondTo || 'window';

            for (breakpoint in responsiveSettings) {

                l = _.breakpoints.length - 1;

                if (responsiveSettings.hasOwnProperty(breakpoint)) {
                    currentBreakpoint = responsiveSettings[breakpoint].breakpoint;

                    // loop through the breakpoints and cut out any existing
                    // ones with the same breakpoint number, we don't want dupes.
                    while (l >= 0) {
                        if (_.breakpoints[l] && _.breakpoints[l] === currentBreakpoint) {
                            _.breakpoints.splice(l, 1);
                        }
                        l--;
                    }

                    _.breakpoints.push(currentBreakpoint);
                    _.breakpointSettings[currentBreakpoint] = responsiveSettings[breakpoint].settings;

                }

            }

            _.breakpoints.sort(function(a, b) {
                return (_.options.mobileFirst) ? a - b : b - a;
            });

        }

    };

    Slick.prototype.reinit = function() {

        var _ = this;

        _.$slides =
            _.$slideTrack
            .children(_.options.slide)
            .addClass('slick-slide');

        _.slideCount = _.$slides.length;

        if (_.currentSlide >= _.slideCount && _.currentSlide !== 0) {
            _.currentSlide = _.currentSlide - _.options.slidesToScroll;
        }

        if (_.slideCount <= _.options.slidesToShow) {
            _.currentSlide = 0;
        }

        _.registerBreakpoints();

        _.setProps();
        _.setupInfinite();
        _.buildArrows();
        _.updateArrows();
        _.initArrowEvents();
        _.buildDots();
        _.updateDots();
        _.initDotEvents();
        _.cleanUpSlideEvents();
        _.initSlideEvents();

        _.checkResponsive(false, true);

        if (_.options.focusOnSelect === true) {
            $(_.$slideTrack).children().on('click.slick', _.selectHandler);
        }

        _.setSlideClasses(typeof _.currentSlide === 'number' ? _.currentSlide : 0);

        _.setPosition();
        _.focusHandler();

        _.paused = !_.options.autoplay;
        _.autoPlay();

        _.$slider.trigger('reInit', [_]);

    };

    Slick.prototype.resize = function() {

        var _ = this;

        if ($(window).width() !== _.windowWidth) {
            clearTimeout(_.windowDelay);
            _.windowDelay = window.setTimeout(function() {
                _.windowWidth = $(window).width();
                _.checkResponsive();
                if (!_.unslicked) {
                    _.setPosition();
                }
            }, 50);
        }
    };

    Slick.prototype.removeSlide = Slick.prototype.slickRemove = function(index, removeBefore, removeAll) {

        var _ = this;

        if (typeof(index) === 'boolean') {
            removeBefore = index;
            index = removeBefore === true ? 0 : _.slideCount - 1;
        } else {
            index = removeBefore === true ? --index : index;
        }

        if (_.slideCount < 1 || index < 0 || index > _.slideCount - 1) {
            return false;
        }

        _.unload();

        if (removeAll === true) {
            _.$slideTrack.children().remove();
        } else {
            _.$slideTrack.children(this.options.slide).eq(index).remove();
        }

        _.$slides = _.$slideTrack.children(this.options.slide);

        _.$slideTrack.children(this.options.slide).detach();

        _.$slideTrack.append(_.$slides);

        _.$slidesCache = _.$slides;

        _.reinit();

    };

    Slick.prototype.setCSS = function(position) {

        var _ = this,
            positionProps = {},
            x, y;

        if (_.options.rtl === true) {
            position = -position;
        }
        x = _.positionProp == 'left' ? Math.ceil(position) + 'px' : '0px';
        y = _.positionProp == 'top' ? Math.ceil(position) + 'px' : '0px';

        positionProps[_.positionProp] = position;

        if (_.transformsEnabled === false) {
            _.$slideTrack.css(positionProps);
        } else {
            positionProps = {};
            if (_.cssTransitions === false) {
                positionProps[_.animType] = 'translate(' + x + ', ' + y + ')';
                _.$slideTrack.css(positionProps);
            } else {
                positionProps[_.animType] = 'translate3d(' + x + ', ' + y + ', 0px)';
                _.$slideTrack.css(positionProps);
            }
        }

    };

    Slick.prototype.setDimensions = function() {

        var _ = this;

        if (_.options.vertical === false) {
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: ('0px ' + _.options.centerPadding)
                });
            }
        } else {
            _.$list.height(_.$slides.first().outerHeight(true) * _.options.slidesToShow);
            if (_.options.centerMode === true) {
                _.$list.css({
                    padding: (_.options.centerPadding + ' 0px')
                });
            }
        }

        _.listWidth = _.$list.width();
        _.listHeight = _.$list.height();


        if (_.options.vertical === false && _.options.variableWidth === false) {
            _.slideWidth = Math.ceil(_.listWidth / _.options.slidesToShow);
            _.$slideTrack.width(Math.ceil((_.slideWidth * _.$slideTrack.children('.slick-slide').length)));

        } else if (_.options.variableWidth === true) {
            _.$slideTrack.width(5000 * _.slideCount);
        } else {
            _.slideWidth = Math.ceil(_.listWidth);
            _.$slideTrack.height(Math.ceil((_.$slides.first().outerHeight(true) * _.$slideTrack.children('.slick-slide').length)));
        }

        var offset = _.$slides.first().outerWidth(true) - _.$slides.first().width();
        if (_.options.variableWidth === false) _.$slideTrack.children('.slick-slide').width(_.slideWidth - offset);

    };

    Slick.prototype.setFade = function() {

        var _ = this,
            targetLeft;

        _.$slides.each(function(index, element) {
            targetLeft = (_.slideWidth * index) * -1;
            if (_.options.rtl === true) {
                $(element).css({
                    position: 'relative',
                    right: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            } else {
                $(element).css({
                    position: 'relative',
                    left: targetLeft,
                    top: 0,
                    zIndex: _.options.zIndex - 2,
                    opacity: 0
                });
            }
        });

        _.$slides.eq(_.currentSlide).css({
            zIndex: _.options.zIndex - 1,
            opacity: 1
        });

    };

    Slick.prototype.setHeight = function() {

        var _ = this;

        if (_.options.slidesToShow === 1 && _.options.adaptiveHeight === true && _.options.vertical === false) {
            var targetHeight = _.$slides.eq(_.currentSlide).outerHeight(true);
            _.$list.css('height', targetHeight);
        }

    };

    Slick.prototype.setOption =
        Slick.prototype.slickSetOption = function() {

            /**
             * accepts arguments in format of:
             *
             *  - for changing a single option's value:
             *     .slick("setOption", option, value, refresh )
             *
             *  - for changing a set of responsive options:
             *     .slick("setOption", 'responsive', [{}, ...], refresh )
             *
             *  - for updating multiple values at once (not responsive)
             *     .slick("setOption", { 'option': value, ... }, refresh )
             */

            var _ = this,
                l, item, option, value, refresh = false,
                type;

            if ($.type(arguments[0]) === 'object') {

                option = arguments[0];
                refresh = arguments[1];
                type = 'multiple';

            } else if ($.type(arguments[0]) === 'string') {

                option = arguments[0];
                value = arguments[1];
                refresh = arguments[2];

                if (arguments[0] === 'responsive' && $.type(arguments[1]) === 'array') {

                    type = 'responsive';

                } else if (typeof arguments[1] !== 'undefined') {

                    type = 'single';

                }

            }

            if (type === 'single') {

                _.options[option] = value;


            } else if (type === 'multiple') {

                $.each(option, function(opt, val) {

                    _.options[opt] = val;

                });


            } else if (type === 'responsive') {

                for (item in value) {

                    if ($.type(_.options.responsive) !== 'array') {

                        _.options.responsive = [value[item]];

                    } else {

                        l = _.options.responsive.length - 1;

                        // loop through the responsive object and splice out duplicates.
                        while (l >= 0) {

                            if (_.options.responsive[l].breakpoint === value[item].breakpoint) {

                                _.options.responsive.splice(l, 1);

                            }

                            l--;

                        }

                        _.options.responsive.push(value[item]);

                    }

                }

            }

            if (refresh) {

                _.unload();
                _.reinit();

            }

        };

    Slick.prototype.setPosition = function() {

        var _ = this;

        _.setDimensions();

        _.setHeight();

        if (_.options.fade === false) {
            _.setCSS(_.getLeft(_.currentSlide));
        } else {
            _.setFade();
        }

        _.$slider.trigger('setPosition', [_]);

    };

    Slick.prototype.setProps = function() {

        var _ = this,
            bodyStyle = document.body.style;

        _.positionProp = _.options.vertical === true ? 'top' : 'left';

        if (_.positionProp === 'top') {
            _.$slider.addClass('slick-vertical');
        } else {
            _.$slider.removeClass('slick-vertical');
        }

        if (bodyStyle.WebkitTransition !== undefined ||
            bodyStyle.MozTransition !== undefined ||
            bodyStyle.msTransition !== undefined) {
            if (_.options.useCSS === true) {
                _.cssTransitions = true;
            }
        }

        if (_.options.fade) {
            if (typeof _.options.zIndex === 'number') {
                if (_.options.zIndex < 3) {
                    _.options.zIndex = 3;
                }
            } else {
                _.options.zIndex = _.defaults.zIndex;
            }
        }

        if (bodyStyle.OTransform !== undefined) {
            _.animType = 'OTransform';
            _.transformType = '-o-transform';
            _.transitionType = 'OTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.MozTransform !== undefined) {
            _.animType = 'MozTransform';
            _.transformType = '-moz-transform';
            _.transitionType = 'MozTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.MozPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.webkitTransform !== undefined) {
            _.animType = 'webkitTransform';
            _.transformType = '-webkit-transform';
            _.transitionType = 'webkitTransition';
            if (bodyStyle.perspectiveProperty === undefined && bodyStyle.webkitPerspective === undefined) _.animType = false;
        }
        if (bodyStyle.msTransform !== undefined) {
            _.animType = 'msTransform';
            _.transformType = '-ms-transform';
            _.transitionType = 'msTransition';
            if (bodyStyle.msTransform === undefined) _.animType = false;
        }
        if (bodyStyle.transform !== undefined && _.animType !== false) {
            _.animType = 'transform';
            _.transformType = 'transform';
            _.transitionType = 'transition';
        }
        _.transformsEnabled = _.options.useTransform && (_.animType !== null && _.animType !== false);
    };


    Slick.prototype.setSlideClasses = function(index) {

        var _ = this,
            centerOffset, allSlides, indexOffset, remainder;

        allSlides = _.$slider
            .find('.slick-slide')
            .removeClass('slick-active slick-center slick-current')
            .attr('aria-hidden', 'true');

        _.$slides
            .eq(index)
            .addClass('slick-current');

        if (_.options.centerMode === true) {

            var evenCoef = _.options.slidesToShow % 2 === 0 ? 1 : 0;

            centerOffset = Math.floor(_.options.slidesToShow / 2);

            if (_.options.infinite === true) {

                if (index >= centerOffset && index <= (_.slideCount - 1) - centerOffset) {
                    _.$slides
                        .slice(index - centerOffset + evenCoef, index + centerOffset + 1)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    indexOffset = _.options.slidesToShow + index;
                    allSlides
                        .slice(indexOffset - centerOffset + 1 + evenCoef, indexOffset + centerOffset + 2)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

                if (index === 0) {

                    allSlides
                        .eq(allSlides.length - 1 - _.options.slidesToShow)
                        .addClass('slick-center');

                } else if (index === _.slideCount - 1) {

                    allSlides
                        .eq(_.options.slidesToShow)
                        .addClass('slick-center');

                }

            }

            _.$slides
                .eq(index)
                .addClass('slick-center');

        } else {

            if (index >= 0 && index <= (_.slideCount - _.options.slidesToShow)) {

                _.$slides
                    .slice(index, index + _.options.slidesToShow)
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else if (allSlides.length <= _.options.slidesToShow) {

                allSlides
                    .addClass('slick-active')
                    .attr('aria-hidden', 'false');

            } else {

                remainder = _.slideCount % _.options.slidesToShow;
                indexOffset = _.options.infinite === true ? _.options.slidesToShow + index : index;

                if (_.options.slidesToShow == _.options.slidesToScroll && (_.slideCount - index) < _.options.slidesToShow) {

                    allSlides
                        .slice(indexOffset - (_.options.slidesToShow - remainder), indexOffset + remainder)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                } else {

                    allSlides
                        .slice(indexOffset, indexOffset + _.options.slidesToShow)
                        .addClass('slick-active')
                        .attr('aria-hidden', 'false');

                }

            }

        }

        if (_.options.lazyLoad === 'ondemand' || _.options.lazyLoad === 'anticipated') {
            _.lazyLoad();
        }
    };

    Slick.prototype.setupInfinite = function() {

        var _ = this,
            i, slideIndex, infiniteCount;

        if (_.options.fade === true) {
            _.options.centerMode = false;
        }

        if (_.options.infinite === true && _.options.fade === false) {

            slideIndex = null;

            if (_.slideCount > _.options.slidesToShow) {

                if (_.options.centerMode === true) {
                    infiniteCount = _.options.slidesToShow + 1;
                } else {
                    infiniteCount = _.options.slidesToShow;
                }

                for (i = _.slideCount; i > (_.slideCount -
                        infiniteCount); i -= 1) {
                    slideIndex = i - 1;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex - _.slideCount)
                        .prependTo(_.$slideTrack).addClass('slick-cloned');
                }
                for (i = 0; i < infiniteCount + _.slideCount; i += 1) {
                    slideIndex = i;
                    $(_.$slides[slideIndex]).clone(true).attr('id', '')
                        .attr('data-slick-index', slideIndex + _.slideCount)
                        .appendTo(_.$slideTrack).addClass('slick-cloned');
                }
                _.$slideTrack.find('.slick-cloned').find('[id]').each(function() {
                    $(this).attr('id', '');
                });

            }

        }

    };

    Slick.prototype.interrupt = function(toggle) {

        var _ = this;

        if (!toggle) {
            _.autoPlay();
        }
        _.interrupted = toggle;

    };

    Slick.prototype.selectHandler = function(event) {

        var _ = this;

        var targetElement =
            $(event.target).is('.slick-slide') ?
            $(event.target) :
            $(event.target).parents('.slick-slide');

        var index = parseInt(targetElement.attr('data-slick-index'));

        if (!index) index = 0;

        if (_.slideCount <= _.options.slidesToShow) {

            _.slideHandler(index, false, true);
            return;

        }

        _.slideHandler(index);

    };

    Slick.prototype.slideHandler = function(index, sync, dontAnimate) {

        var targetSlide, animSlide, oldSlide, slideLeft, targetLeft = null,
            _ = this,
            navTarget;

        sync = sync || false;

        if (_.animating === true && _.options.waitForAnimate === true) {
            return;
        }

        if (_.options.fade === true && _.currentSlide === index) {
            return;
        }

        if (sync === false) {
            _.asNavFor(index);
        }

        targetSlide = index;
        targetLeft = _.getLeft(targetSlide);
        slideLeft = _.getLeft(_.currentSlide);

        _.currentLeft = _.swipeLeft === null ? slideLeft : _.swipeLeft;

        if (_.options.infinite === false && _.options.centerMode === false && (index < 0 || index > _.getDotCount() * _.options.slidesToScroll)) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        } else if (_.options.infinite === false && _.options.centerMode === true && (index < 0 || index > (_.slideCount - _.options.slidesToScroll))) {
            if (_.options.fade === false) {
                targetSlide = _.currentSlide;
                if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
                    _.animateSlide(slideLeft, function() {
                        _.postSlide(targetSlide);
                    });
                } else {
                    _.postSlide(targetSlide);
                }
            }
            return;
        }

        if (_.options.autoplay) {
            clearInterval(_.autoPlayTimer);
        }

        if (targetSlide < 0) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = _.slideCount - (_.slideCount % _.options.slidesToScroll);
            } else {
                animSlide = _.slideCount + targetSlide;
            }
        } else if (targetSlide >= _.slideCount) {
            if (_.slideCount % _.options.slidesToScroll !== 0) {
                animSlide = 0;
            } else {
                animSlide = targetSlide - _.slideCount;
            }
        } else {
            animSlide = targetSlide;
        }

        _.animating = true;

        _.$slider.trigger('beforeChange', [_, _.currentSlide, animSlide]);

        oldSlide = _.currentSlide;
        _.currentSlide = animSlide;

        _.setSlideClasses(_.currentSlide);

        if (_.options.asNavFor) {

            navTarget = _.getNavTarget();
            navTarget = navTarget.slick('getSlick');

            if (navTarget.slideCount <= navTarget.options.slidesToShow) {
                navTarget.setSlideClasses(_.currentSlide);
            }

        }

        _.updateDots();
        _.updateArrows();

        if (_.options.fade === true) {
            if (dontAnimate !== true) {

                _.fadeSlideOut(oldSlide);

                _.fadeSlide(animSlide, function() {
                    _.postSlide(animSlide);
                });

            } else {
                _.postSlide(animSlide);
            }
            _.animateHeight();
            return;
        }

        if (dontAnimate !== true && _.slideCount > _.options.slidesToShow) {
            _.animateSlide(targetLeft, function() {
                _.postSlide(animSlide);
            });
        } else {
            _.postSlide(animSlide);
        }

    };

    Slick.prototype.startLoad = function() {

        var _ = this;

        if (_.options.arrows === true && _.slideCount > _.options.slidesToShow) {

            _.$prevArrow.hide();
            _.$nextArrow.hide();

        }

        if (_.options.dots === true && _.slideCount > _.options.slidesToShow) {

            _.$dots.hide();

        }

        _.$slider.addClass('slick-loading');

    };

    Slick.prototype.swipeDirection = function() {

        var xDist, yDist, r, swipeAngle, _ = this;

        xDist = _.touchObject.startX - _.touchObject.curX;
        yDist = _.touchObject.startY - _.touchObject.curY;
        r = Math.atan2(yDist, xDist);

        swipeAngle = Math.round(r * 180 / Math.PI);
        if (swipeAngle < 0) {
            swipeAngle = 360 - Math.abs(swipeAngle);
        }

        if ((swipeAngle <= 45) && (swipeAngle >= 0)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle <= 360) && (swipeAngle >= 315)) {
            return (_.options.rtl === false ? 'left' : 'right');
        }
        if ((swipeAngle >= 135) && (swipeAngle <= 225)) {
            return (_.options.rtl === false ? 'right' : 'left');
        }
        if (_.options.verticalSwiping === true) {
            if ((swipeAngle >= 35) && (swipeAngle <= 135)) {
                return 'down';
            } else {
                return 'up';
            }
        }

        return 'vertical';

    };

    Slick.prototype.swipeEnd = function(event) {

        var _ = this,
            slideCount,
            direction;

        _.dragging = false;
        _.swiping = false;

        if (_.scrolling) {
            _.scrolling = false;
            return false;
        }

        _.interrupted = false;
        _.shouldClick = (_.touchObject.swipeLength > 10) ? false : true;

        if (_.touchObject.curX === undefined) {
            return false;
        }

        if (_.touchObject.edgeHit === true) {
            _.$slider.trigger('edge', [_, _.swipeDirection()]);
        }

        if (_.touchObject.swipeLength >= _.touchObject.minSwipe) {

            direction = _.swipeDirection();

            switch (direction) {

                case 'left':
                case 'down':

                    slideCount =
                        _.options.swipeToSlide ?
                        _.checkNavigable(_.currentSlide + _.getSlideCount()) :
                        _.currentSlide + _.getSlideCount();

                    _.currentDirection = 0;

                    break;

                case 'right':
                case 'up':

                    slideCount =
                        _.options.swipeToSlide ?
                        _.checkNavigable(_.currentSlide - _.getSlideCount()) :
                        _.currentSlide - _.getSlideCount();

                    _.currentDirection = 1;

                    break;

                default:


            }

            if (direction != 'vertical') {

                _.slideHandler(slideCount);
                _.touchObject = {};
                _.$slider.trigger('swipe', [_, direction]);

            }

        } else {

            if (_.touchObject.startX !== _.touchObject.curX) {

                _.slideHandler(_.currentSlide);
                _.touchObject = {};

            }

        }

    };

    Slick.prototype.swipeHandler = function(event) {

        var _ = this;

        if ((_.options.swipe === false) || ('ontouchend' in document && _.options.swipe === false)) {
            return;
        } else if (_.options.draggable === false && event.type.indexOf('mouse') !== -1) {
            return;
        }

        _.touchObject.fingerCount = event.originalEvent && event.originalEvent.touches !== undefined ?
            event.originalEvent.touches.length : 1;

        _.touchObject.minSwipe = _.listWidth / _.options
            .touchThreshold;

        if (_.options.verticalSwiping === true) {
            _.touchObject.minSwipe = _.listHeight / _.options
                .touchThreshold;
        }

        switch (event.data.action) {

            case 'start':
                _.swipeStart(event);
                break;

            case 'move':
                _.swipeMove(event);
                break;

            case 'end':
                _.swipeEnd(event);
                break;

        }

    };

    Slick.prototype.swipeMove = function(event) {

        var _ = this,
            edgeWasHit = false,
            curLeft, swipeDirection, swipeLength, positionOffset, touches, verticalSwipeLength;

        touches = event.originalEvent !== undefined ? event.originalEvent.touches : null;

        if (!_.dragging || _.scrolling || touches && touches.length !== 1) {
            return false;
        }

        curLeft = _.getLeft(_.currentSlide);

        _.touchObject.curX = touches !== undefined ? touches[0].pageX : event.clientX;
        _.touchObject.curY = touches !== undefined ? touches[0].pageY : event.clientY;

        _.touchObject.swipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curX - _.touchObject.startX, 2)));

        verticalSwipeLength = Math.round(Math.sqrt(
            Math.pow(_.touchObject.curY - _.touchObject.startY, 2)));

        if (!_.options.verticalSwiping && !_.swiping && verticalSwipeLength > 4) {
            _.scrolling = true;
            return false;
        }

        if (_.options.verticalSwiping === true) {
            _.touchObject.swipeLength = verticalSwipeLength;
        }

        swipeDirection = _.swipeDirection();

        if (event.originalEvent !== undefined && _.touchObject.swipeLength > 4) {
            _.swiping = true;
            event.preventDefault();
        }

        positionOffset = (_.options.rtl === false ? 1 : -1) * (_.touchObject.curX > _.touchObject.startX ? 1 : -1);
        if (_.options.verticalSwiping === true) {
            positionOffset = _.touchObject.curY > _.touchObject.startY ? 1 : -1;
        }


        swipeLength = _.touchObject.swipeLength;

        _.touchObject.edgeHit = false;

        if (_.options.infinite === false) {
            if ((_.currentSlide === 0 && swipeDirection === 'right') || (_.currentSlide >= _.getDotCount() && swipeDirection === 'left')) {
                swipeLength = _.touchObject.swipeLength * _.options.edgeFriction;
                _.touchObject.edgeHit = true;
            }
        }

        if (_.options.vertical === false) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        } else {
            _.swipeLeft = curLeft + (swipeLength * (_.$list.height() / _.listWidth)) * positionOffset;
        }
        if (_.options.verticalSwiping === true) {
            _.swipeLeft = curLeft + swipeLength * positionOffset;
        }

        if (_.options.fade === true || _.options.touchMove === false) {
            return false;
        }

        if (_.animating === true) {
            _.swipeLeft = null;
            return false;
        }

        _.setCSS(_.swipeLeft);

    };

    Slick.prototype.swipeStart = function(event) {

        var _ = this,
            touches;

        _.interrupted = true;

        if (_.touchObject.fingerCount !== 1 || _.slideCount <= _.options.slidesToShow) {
            _.touchObject = {};
            return false;
        }

        if (event.originalEvent !== undefined && event.originalEvent.touches !== undefined) {
            touches = event.originalEvent.touches[0];
        }

        _.touchObject.startX = _.touchObject.curX = touches !== undefined ? touches.pageX : event.clientX;
        _.touchObject.startY = _.touchObject.curY = touches !== undefined ? touches.pageY : event.clientY;

        _.dragging = true;

    };

    Slick.prototype.unfilterSlides = Slick.prototype.slickUnfilter = function() {

        var _ = this;

        if (_.$slidesCache !== null) {

            _.unload();

            _.$slideTrack.children(this.options.slide).detach();

            _.$slidesCache.appendTo(_.$slideTrack);

            _.reinit();

        }

    };

    Slick.prototype.unload = function() {

        var _ = this;

        $('.slick-cloned', _.$slider).remove();

        if (_.$dots) {
            _.$dots.remove();
        }

        if (_.$prevArrow && _.htmlExpr.test(_.options.prevArrow)) {
            _.$prevArrow.remove();
        }

        if (_.$nextArrow && _.htmlExpr.test(_.options.nextArrow)) {
            _.$nextArrow.remove();
        }

        _.$slides
            .removeClass('slick-slide slick-active slick-visible slick-current')
            .attr('aria-hidden', 'true')
            .css('width', '');

    };

    Slick.prototype.unslick = function(fromBreakpoint) {

        var _ = this;
        _.$slider.trigger('unslick', [_, fromBreakpoint]);
        _.destroy();

    };

    Slick.prototype.updateArrows = function() {

        var _ = this,
            centerOffset;

        centerOffset = Math.floor(_.options.slidesToShow / 2);

        if (_.options.arrows === true &&
            _.slideCount > _.options.slidesToShow &&
            !_.options.infinite) {

            _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');
            _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            if (_.currentSlide === 0) {

                _.$prevArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$nextArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - _.options.slidesToShow && _.options.centerMode === false) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            } else if (_.currentSlide >= _.slideCount - 1 && _.options.centerMode === true) {

                _.$nextArrow.addClass('slick-disabled').attr('aria-disabled', 'true');
                _.$prevArrow.removeClass('slick-disabled').attr('aria-disabled', 'false');

            }

        }

    };

    Slick.prototype.updateDots = function() {

        var _ = this;

        if (_.$dots !== null) {

            _.$dots
                .find('li')
                .removeClass('slick-active')
                .end();

            _.$dots
                .find('li')
                .eq(Math.floor(_.currentSlide / _.options.slidesToScroll))
                .addClass('slick-active');

        }

    };

    Slick.prototype.visibility = function() {

        var _ = this;

        if (_.options.autoplay) {

            if (document[_.hidden]) {

                _.interrupted = true;

            } else {

                _.interrupted = false;

            }

        }

    };

    $.fn.slick = function() {
        var _ = this,
            opt = arguments[0],
            args = Array.prototype.slice.call(arguments, 1),
            l = _.length,
            i,
            ret;
        for (i = 0; i < l; i++) {
            if (typeof opt == 'object' || typeof opt == 'undefined')
                _[i].slick = new Slick(_[i], opt);
            else
                ret = _[i].slick[opt].apply(_[i].slick, args);
            if (typeof ret != 'undefined') return ret;
        }
        return _;
    };

}));

/* ========================================================================
 * Bootstrap: tab.js v3.3.7
 * http://getbootstrap.com/javascript/#tabs
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // TAB CLASS DEFINITION
    // ====================

    var Tab = function(element) {
        // jscs:disable requireDollarBeforejQueryAssignment
        this.element = $(element)
        // jscs:enable requireDollarBeforejQueryAssignment
    }

    Tab.VERSION = '3.3.7'

    Tab.TRANSITION_DURATION = 150

    Tab.prototype.show = function() {
        var $this = this.element
        var $ul = $this.closest('ul:not(.dropdown-menu)')
        var selector = $this.data('target')

        if (!selector) {
            selector = $this.attr('href')
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, '') // strip for ie7
        }

        if ($this.parent('li').hasClass('active')) return

        var $previous = $ul.find('.active:last a')
        var hideEvent = $.Event('hide.bs.tab', {
            relatedTarget: $this[0]
        })
        var showEvent = $.Event('show.bs.tab', {
            relatedTarget: $previous[0]
        })

        $previous.trigger(hideEvent)
        $this.trigger(showEvent)

        if (showEvent.isDefaultPrevented() || hideEvent.isDefaultPrevented()) return

        var $target = $(selector)

        this.activate($this.closest('li'), $ul)
        this.activate($target, $target.parent(), function() {
            $previous.trigger({
                type: 'hidden.bs.tab',
                relatedTarget: $this[0]
            })
            $this.trigger({
                type: 'shown.bs.tab',
                relatedTarget: $previous[0]
            })
        })
    }

    Tab.prototype.activate = function(element, container, callback) {
        var $active = container.find('> .active')
        var transition = callback &&
            $.support.transition &&
            ($active.length && $active.hasClass('fade') || !!container.find('> .fade').length)

        function next() {
            $active
                .removeClass('active')
                .find('> .dropdown-menu > .active')
                .removeClass('active')
                .end()
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', false)

            element
                .addClass('active')
                .find('[data-toggle="tab"]')
                .attr('aria-expanded', true)

            if (transition) {
                element[0].offsetWidth // reflow for transition
                element.addClass('in')
            } else {
                element.removeClass('fade')
            }

            if (element.parent('.dropdown-menu').length) {
                element
                    .closest('li.dropdown')
                    .addClass('active')
                    .end()
                    .find('[data-toggle="tab"]')
                    .attr('aria-expanded', true)
            }

            callback && callback()
        }

        $active.length && transition ?
            $active
            .one('bsTransitionEnd', next)
            .emulateTransitionEnd(Tab.TRANSITION_DURATION) :
            next()

        $active.removeClass('in')
    }


    // TAB PLUGIN DEFINITION
    // =====================

    function Plugin(option) {
        return this.each(function() {
            var $this = $(this)
            var data = $this.data('bs.tab')

            if (!data) $this.data('bs.tab', (data = new Tab(this)))
            if (typeof option == 'string') data[option]()
        })
    }

    var old = $.fn.tab

    $.fn.tab = Plugin
    $.fn.tab.Constructor = Tab


    // TAB NO CONFLICT
    // ===============

    $.fn.tab.noConflict = function() {
        $.fn.tab = old
        return this
    }


    // TAB DATA-API
    // ============

    var clickHandler = function(e) {
        e.preventDefault()
        Plugin.call($(this), 'show')
    }

    $(document)
        .on('click.bs.tab.data-api', '[data-toggle="tab"]', clickHandler)
        .on('click.bs.tab.data-api', '[data-toggle="pill"]', clickHandler)

}(jQuery);

/* ========================================================================
 * Bootstrap: transition.js v3.3.7
 * http://getbootstrap.com/javascript/#transitions
 * ========================================================================
 * Copyright 2011-2016 Twitter, Inc.
 * Licensed under MIT (https://github.com/twbs/bootstrap/blob/master/LICENSE)
 * ======================================================================== */


+
function($) {
    'use strict';

    // CSS TRANSITION SUPPORT (Shoutout: http://www.modernizr.com/)
    // ============================================================

    function transitionEnd() {
        var el = document.createElement('bootstrap')

        var transEndEventNames = {
            WebkitTransition: 'webkitTransitionEnd',
            MozTransition: 'transitionend',
            OTransition: 'oTransitionEnd otransitionend',
            transition: 'transitionend'
        }

        for (var name in transEndEventNames) {
            if (el.style[name] !== undefined) {
                return {
                    end: transEndEventNames[name]
                }
            }
        }

        return false // explicit for ie8 (  ._.)
    }

    // http://blog.alexmaccaw.com/css-transitions
    $.fn.emulateTransitionEnd = function(duration) {
        var called = false
        var $el = this
        $(this).one('bsTransitionEnd', function() {
            called = true
        })
        var callback = function() {
            if (!called) $($el).trigger($.support.transition.end)
        }
        setTimeout(callback, duration)
        return this
    }

    $(function() {
        $.support.transition = transitionEnd()

        if (!$.support.transition) return

        $.event.special.bsTransitionEnd = {
            bindType: $.support.transition.end,
            delegateType: $.support.transition.end,
            handle: function(e) {
                if ($(e.target).is(this)) return e.handleObj.handler.apply(this, arguments)
            }
        }
    })

}(jQuery);

/*!
 * 
 *         SimpleBar.js - v2.6.1
 *         Scrollbars, simpler.
 *         https://grsmto.github.io/simplebar/
 *         
 *         Made by Adrien Grsmto from a fork by Jonathan Nicol
 *         Under MIT License
 *       
 */
! function(t, e) {
    "object" == typeof exports && "object" == typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define([], e) : "object" == typeof exports ? exports.SimpleBar = e() : t.SimpleBar = e()
}(this, function() {
    return function(t) {
        function e(r) {
            if (n[r]) return n[r].exports;
            var i = n[r] = {
                i: r,
                l: !1,
                exports: {}
            };
            return t[r].call(i.exports, i, i.exports, e), i.l = !0, i.exports
        }
        var n = {};
        return e.m = t, e.c = n, e.d = function(t, n, r) {
            e.o(t, n) || Object.defineProperty(t, n, {
                configurable: !1,
                enumerable: !0,
                get: r
            })
        }, e.n = function(t) {
            var n = t && t.__esModule ? function() {
                return t.default
            } : function() {
                return t
            };
            return e.d(n, "a", n), n
        }, e.o = function(t, e) {
            return Object.prototype.hasOwnProperty.call(t, e)
        }, e.p = "", e(e.s = 27)
    }([function(t, e, n) {
        var r = n(23)("wks"),
            i = n(12),
            o = n(1).Symbol,
            s = "function" == typeof o;
        (t.exports = function(t) {
            return r[t] || (r[t] = s && o[t] || (s ? o : i)("Symbol." + t))
        }).store = r
    }, function(t, e) {
        var n = t.exports = "undefined" != typeof window && window.Math == Math ? window : "undefined" != typeof self && self.Math == Math ? self : Function("return this")();
        "number" == typeof __g && (__g = n)
    }, function(t, e) {
        var n = {}.hasOwnProperty;
        t.exports = function(t, e) {
            return n.call(t, e)
        }
    }, function(t, e) {
        var n = t.exports = {
            version: "2.5.1"
        };
        "number" == typeof __e && (__e = n)
    }, function(t, e, n) {
        var r = n(5),
            i = n(11);
        t.exports = n(7) ? function(t, e, n) {
            return r.f(t, e, i(1, n))
        } : function(t, e, n) {
            return t[e] = n, t
        }
    }, function(t, e, n) {
        var r = n(6),
            i = n(33),
            o = n(34),
            s = Object.defineProperty;
        e.f = n(7) ? Object.defineProperty : function(t, e, n) {
            if (r(t), e = o(e, !0), r(n), i) try {
                return s(t, e, n)
            } catch (t) {}
            if ("get" in n || "set" in n) throw TypeError("Accessors not supported!");
            return "value" in n && (t[e] = n.value), t
        }
    }, function(t, e, n) {
        var r = n(10);
        t.exports = function(t) {
            if (!r(t)) throw TypeError(t + " is not an object!");
            return t
        }
    }, function(t, e, n) {
        t.exports = !n(16)(function() {
            return 7 != Object.defineProperty({}, "a", {
                get: function() {
                    return 7
                }
            }).a
        })
    }, function(t, e) {
        var n = Math.ceil,
            r = Math.floor;
        t.exports = function(t) {
            return isNaN(t = +t) ? 0 : (t > 0 ? r : n)(t)
        }
    }, function(t, e) {
        t.exports = function(t) {
            if (void 0 == t) throw TypeError("Can't call method on  " + t);
            return t
        }
    }, function(t, e) {
        t.exports = function(t) {
            return "object" == typeof t ? null !== t : "function" == typeof t
        }
    }, function(t, e) {
        t.exports = function(t, e) {
            return {
                enumerable: !(1 & t),
                configurable: !(2 & t),
                writable: !(4 & t),
                value: e
            }
        }
    }, function(t, e) {
        var n = 0,
            r = Math.random();
        t.exports = function(t) {
            return "Symbol(".concat(void 0 === t ? "" : t, ")_", (++n + r).toString(36))
        }
    }, function(t, e) {
        t.exports = {}
    }, function(t, e, n) {
        var r = n(23)("keys"),
            i = n(12);
        t.exports = function(t) {
            return r[t] || (r[t] = i(t))
        }
    }, function(t, e, n) {
        var r = n(1),
            i = n(3),
            o = n(4),
            s = n(18),
            c = n(19),
            a = function(t, e, n) {
                var u, l, f, h, d = t & a.F,
                    p = t & a.G,
                    v = t & a.S,
                    b = t & a.P,
                    y = t & a.B,
                    m = p ? r : v ? r[e] || (r[e] = {}) : (r[e] || {}).prototype,
                    g = p ? i : i[e] || (i[e] = {}),
                    E = g.prototype || (g.prototype = {});
                p && (n = e);
                for (u in n) l = !d && m && void 0 !== m[u], f = (l ? m : n)[u], h = y && l ? c(f, r) : b && "function" == typeof f ? c(Function.call, f) : f, m && s(m, u, f, t & a.U), g[u] != f && o(g, u, h), b && E[u] != f && (E[u] = f)
            };
        r.core = i, a.F = 1, a.G = 2, a.S = 4, a.P = 8, a.B = 16, a.W = 32, a.U = 64, a.R = 128, t.exports = a
    }, function(t, e) {
        t.exports = function(t) {
            try {
                return !!t()
            } catch (t) {
                return !0
            }
        }
    }, function(t, e, n) {
        var r = n(10),
            i = n(1).document,
            o = r(i) && r(i.createElement);
        t.exports = function(t) {
            return o ? i.createElement(t) : {}
        }
    }, function(t, e, n) {
        var r = n(1),
            i = n(4),
            o = n(2),
            s = n(12)("src"),
            c = Function.toString,
            a = ("" + c).split("toString");
        n(3).inspectSource = function(t) {
            return c.call(t)
        }, (t.exports = function(t, e, n, c) {
            var u = "function" == typeof n;
            u && (o(n, "name") || i(n, "name", e)), t[e] !== n && (u && (o(n, s) || i(n, s, t[e] ? "" + t[e] : a.join(String(e)))), t === r ? t[e] = n : c ? t[e] ? t[e] = n : i(t, e, n) : (delete t[e], i(t, e, n)))
        })(Function.prototype, "toString", function() {
            return "function" == typeof this && this[s] || c.call(this)
        })
    }, function(t, e, n) {
        var r = n(35);
        t.exports = function(t, e, n) {
            if (r(t), void 0 === e) return t;
            switch (n) {
                case 1:
                    return function(n) {
                        return t.call(e, n)
                    };
                case 2:
                    return function(n, r) {
                        return t.call(e, n, r)
                    };
                case 3:
                    return function(n, r, i) {
                        return t.call(e, n, r, i)
                    }
            }
            return function() {
                return t.apply(e, arguments)
            }
        }
    }, function(t, e, n) {
        var r = n(41),
            i = n(9);
        t.exports = function(t) {
            return r(i(t))
        }
    }, function(t, e) {
        var n = {}.toString;
        t.exports = function(t) {
            return n.call(t).slice(8, -1)
        }
    }, function(t, e, n) {
        var r = n(8),
            i = Math.min;
        t.exports = function(t) {
            return t > 0 ? i(r(t), 9007199254740991) : 0
        }
    }, function(t, e, n) {
        var r = n(1),
            i = r["__core-js_shared__"] || (r["__core-js_shared__"] = {});
        t.exports = function(t) {
            return i[t] || (i[t] = {})
        }
    }, function(t, e) {
        t.exports = "constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")
    }, function(t, e, n) {
        var r = n(5).f,
            i = n(2),
            o = n(0)("toStringTag");
        t.exports = function(t, e, n) {
            t && !i(t = n ? t : t.prototype, o) && r(t, o, {
                configurable: !0,
                value: e
            })
        }
    }, function(t, e, n) {
        var r = n(9);
        t.exports = function(t) {
            return Object(r(t))
        }
    }, function(t, e, n) {
        "use strict";

        function r(t) {
            return t && t.__esModule ? t : {
                default: t
            }
        }

        function i(t, e) {
            if (!(t instanceof e)) throw new TypeError("Cannot call a class as a function")
        }

        function o(t, e) {
            for (var n = 0; n < e.length; n++) {
                var r = e[n];
                r.enumerable = r.enumerable || !1, r.configurable = !0, "value" in r && (r.writable = !0), Object.defineProperty(t, r.key, r)
            }
        }

        function s(t, e, n) {
            return e && o(t.prototype, e), n && o(t, n), t
        }
        Object.defineProperty(e, "__esModule", {
            value: !0
        }), e.default = void 0, n(28);
        var c = r(n(53)),
            a = r(n(54)),
            u = r(n(56));
        n(57), Object.assign = n(58);
        var l = function() {
            function t(e, n) {
                i(this, t), this.el = e, this.flashTimeout, this.contentEl, this.scrollContentEl, this.dragOffset = {
                    x: 0,
                    y: 0
                }, this.isVisible = {
                    x: !0,
                    y: !0
                }, this.scrollOffsetAttr = {
                    x: "scrollLeft",
                    y: "scrollTop"
                }, this.sizeAttr = {
                    x: "offsetWidth",
                    y: "offsetHeight"
                }, this.scrollSizeAttr = {
                    x: "scrollWidth",
                    y: "scrollHeight"
                }, this.offsetAttr = {
                    x: "left",
                    y: "top"
                }, this.globalObserver, this.mutationObserver, this.resizeObserver, this.currentAxis, this.isRtl, this.options = Object.assign({}, t.defaultOptions, n), this.classNames = this.options.classNames, this.scrollbarWidth = (0, c.default)(), this.offsetSize = 20, this.flashScrollbar = this.flashScrollbar.bind(this), this.onDragY = this.onDragY.bind(this), this.onDragX = this.onDragX.bind(this), this.onScrollY = this.onScrollY.bind(this), this.onScrollX = this.onScrollX.bind(this), this.drag = this.drag.bind(this), this.onEndDrag = this.onEndDrag.bind(this), this.onMouseEnter = this.onMouseEnter.bind(this), this.recalculate = (0, a.default)(this.recalculate, 100, {
                    leading: !0
                }), this.init()
            }
            return s(t, [{
                key: "init",
                value: function() {
                    this.el.SimpleBar = this, this.initDOM(), this.scrollbarX = this.trackX.querySelector(".".concat(this.classNames.scrollbar)), this.scrollbarY = this.trackY.querySelector(".".concat(this.classNames.scrollbar)), this.isRtl = "rtl" === getComputedStyle(this.contentEl).direction, this.scrollContentEl.style[this.isRtl ? "paddingLeft" : "paddingRight"] = "".concat(this.scrollbarWidth || this.offsetSize, "px"), this.scrollContentEl.style.marginBottom = "-".concat(2 * this.scrollbarWidth || this.offsetSize, "px"), this.contentEl.style.paddingBottom = "".concat(this.scrollbarWidth || this.offsetSize, "px"), 0 !== this.scrollbarWidth && (this.contentEl.style[this.isRtl ? "marginLeft" : "marginRight"] = "-".concat(this.scrollbarWidth, "px")), this.recalculate(), this.initListeners()
                }
            }, {
                key: "initDOM",
                value: function() {
                    var t = this;
                    if (Array.from(this.el.children).filter(function(e) {
                            return e.classList.contains(t.classNames.scrollContent)
                        }).length) this.trackX = this.el.querySelector(".".concat(this.classNames.track, ".horizontal")), this.trackY = this.el.querySelector(".".concat(this.classNames.track, ".vertical")), this.scrollContentEl = this.el.querySelector(".".concat(this.classNames.scrollContent)), this.contentEl = this.el.querySelector(".".concat(this.classNames.content));
                    else {
                        for (this.scrollContentEl = document.createElement("div"), this.contentEl = document.createElement("div"), this.scrollContentEl.classList.add(this.classNames.scrollContent), this.contentEl.classList.add(this.classNames.content); this.el.firstChild;) this.contentEl.appendChild(this.el.firstChild);
                        this.scrollContentEl.appendChild(this.contentEl), this.el.appendChild(this.scrollContentEl)
                    }
                    if (!this.trackX || !this.trackY) {
                        var e = document.createElement("div"),
                            n = document.createElement("div");
                        e.classList.add(this.classNames.track), n.classList.add(this.classNames.scrollbar), e.appendChild(n), this.trackX = e.cloneNode(!0), this.trackX.classList.add("horizontal"), this.trackY = e.cloneNode(!0), this.trackY.classList.add("vertical"), this.el.insertBefore(this.trackX, this.el.firstChild), this.el.insertBefore(this.trackY, this.el.firstChild)
                    }
                    this.el.setAttribute("data-simplebar", "init")
                }
            }, {
                key: "initListeners",
                value: function() {
                    var t = this;
                    this.options.autoHide && this.el.addEventListener("mouseenter", this.onMouseEnter), this.scrollbarY.addEventListener("mousedown", this.onDragY), this.scrollbarX.addEventListener("mousedown", this.onDragX), this.scrollContentEl.addEventListener("scroll", this.onScrollY), this.contentEl.addEventListener("scroll", this.onScrollX), "undefined" != typeof MutationObserver && (this.mutationObserver = new MutationObserver(function(e) {
                        e.forEach(function(e) {
                            (t.isChildNode(e.target) || e.addedNodes.length) && t.recalculate()
                        })
                    }), this.mutationObserver.observe(this.el, {
                        attributes: !0,
                        childList: !0,
                        characterData: !0,
                        subtree: !0
                    })), this.resizeObserver = new u.default(this.recalculate.bind(this)), this.resizeObserver.observe(this.el)
                }
            }, {
                key: "removeListeners",
                value: function() {
                    this.options.autoHide && this.el.removeEventListener("mouseenter", this.onMouseEnter), this.scrollbarX.removeEventListener("mousedown", this.onDragX), this.scrollbarY.removeEventListener("mousedown", this.onDragY), this.scrollContentEl.removeEventListener("scroll", this.onScrollY), this.contentEl.removeEventListener("scroll", this.onScrollX), this.mutationObserver.disconnect(), this.resizeObserver.disconnect()
                }
            }, {
                key: "onDragX",
                value: function(t) {
                    this.onDrag(t, "x")
                }
            }, {
                key: "onDragY",
                value: function(t) {
                    this.onDrag(t, "y")
                }
            }, {
                key: "onDrag",
                value: function(t) {
                    var e = arguments.length > 1 && void 0 !== arguments[1] ? arguments[1] : "y";
                    t.preventDefault();
                    var n = "y" === e ? this.scrollbarY : this.scrollbarX,
                        r = "y" === e ? t.pageY : t.pageX;
                    this.dragOffset[e] = r - n.getBoundingClientRect()[this.offsetAttr[e]], this.currentAxis = e, document.addEventListener("mousemove", this.drag), document.addEventListener("mouseup", this.onEndDrag)
                }
            }, {
                key: "drag",
                value: function(t) {
                    var e, n, r;
                    t.preventDefault(), "y" === this.currentAxis ? (e = t.pageY, n = this.trackY, r = this.scrollContentEl) : (e = t.pageX, n = this.trackX, r = this.contentEl);
                    var i = e - n.getBoundingClientRect()[this.offsetAttr[this.currentAxis]] - this.dragOffset[this.currentAxis],
                        o = i / n[this.sizeAttr[this.currentAxis]],
                        s = o * this.contentEl[this.scrollSizeAttr[this.currentAxis]];
                    r[this.scrollOffsetAttr[this.currentAxis]] = s
                }
            }, {
                key: "onEndDrag",
                value: function() {
                    document.removeEventListener("mousemove", this.drag), document.removeEventListener("mouseup", this.onEndDrag)
                }
            }, {
                key: "resizeScrollbar",
                value: function() {
                    var t, e, n, r, i, o = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "y";
                    "x" === o ? (t = this.trackX, e = this.scrollbarX, n = this.contentEl[this.scrollOffsetAttr[o]], r = this.contentSizeX, i = this.scrollbarXSize) : (t = this.trackY, e = this.scrollbarY, n = this.scrollContentEl[this.scrollOffsetAttr[o]], r = this.contentSizeY, i = this.scrollbarYSize);
                    var s = i / r,
                        c = n / (r - i),
                        a = Math.max(~~(s * i), this.options.scrollbarMinSize),
                        u = ~~((i - a) * c);
                    this.isVisible[o] = i < r, this.isVisible[o] || this.options.forceVisible ? (t.style.visibility = "visible", this.options.forceVisible ? e.style.visibility = "hidden" : e.style.visibility = "visible", "x" === o ? (e.style.left = "".concat(u, "px"), e.style.width = "".concat(a, "px")) : (e.style.top = "".concat(u, "px"), e.style.height = "".concat(a, "px"))) : t.style.visibility = "hidden"
                }
            }, {
                key: "onScrollX",
                value: function() {
                    this.flashScrollbar("x")
                }
            }, {
                key: "onScrollY",
                value: function() {
                    this.flashScrollbar("y")
                }
            }, {
                key: "onMouseEnter",
                value: function() {
                    this.flashScrollbar("x"), this.flashScrollbar("y")
                }
            }, {
                key: "flashScrollbar",
                value: function() {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "y";
                    this.resizeScrollbar(t), this.showScrollbar(t)
                }
            }, {
                key: "showScrollbar",
                value: function() {
                    var t = arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "y";
                    this.isVisible[t] && ("x" === t ? this.scrollbarX.classList.add("visible") : this.scrollbarY.classList.add("visible"), this.options.autoHide && ("number" == typeof this.flashTimeout && window.clearTimeout(this.flashTimeout), this.flashTimeout = window.setTimeout(this.hideScrollbar.bind(this), 1e3)))
                }
            }, {
                key: "hideScrollbar",
                value: function() {
                    this.scrollbarX.classList.remove("visible"), this.scrollbarY.classList.remove("visible"), "number" == typeof this.flashTimeout && window.clearTimeout(this.flashTimeout)
                }
            }, {
                key: "recalculate",
                value: function() {
                    this.contentSizeX = this.contentEl[this.scrollSizeAttr.x], this.contentSizeY = this.contentEl[this.scrollSizeAttr.y] - (this.scrollbarWidth || this.offsetSize), this.scrollbarXSize = this.trackX[this.sizeAttr.x], this.scrollbarYSize = this.trackY[this.sizeAttr.y], this.resizeScrollbar("x"), this.resizeScrollbar("y"), this.options.autoHide || (this.showScrollbar("x"), this.showScrollbar("y"))
                }
            }, {
                key: "getScrollElement",
                value: function() {
                    return "y" === (arguments.length > 0 && void 0 !== arguments[0] ? arguments[0] : "y") ? this.scrollContentEl : this.contentEl
                }
            }, {
                key: "getContentElement",
                value: function() {
                    return this.contentEl
                }
            }, {
                key: "unMount",
                value: function() {
                    this.removeListeners(), this.el.SimpleBar = null
                }
            }, {
                key: "isChildNode",
                value: function(t) {
                    return null !== t && (t === this.el || this.isChildNode(t.parentNode))
                }
            }], [{
                key: "initHtmlApi",
                value: function() {
                    this.initDOMLoadedElements = this.initDOMLoadedElements.bind(this), "undefined" != typeof MutationObserver && (this.globalObserver = new MutationObserver(function(e) {
                        e.forEach(function(e) {
                            Array.from(e.addedNodes).forEach(function(e) {
                                1 === e.nodeType && (e.hasAttribute("data-simplebar") ? !e.SimpleBar && new t(e, t.getElOptions(e)) : Array.from(e.querySelectorAll("[data-simplebar]")).forEach(function(e) {
                                    !e.SimpleBar && new t(e, t.getElOptions(e))
                                }))
                            }), Array.from(e.removedNodes).forEach(function(t) {
                                1 === t.nodeType && (t.hasAttribute("data-simplebar") ? t.SimpleBar && t.SimpleBar.unMount() : Array.from(t.querySelectorAll("[data-simplebar]")).forEach(function(t) {
                                    t.SimpleBar && t.SimpleBar.unMount()
                                }))
                            })
                        })
                    }), this.globalObserver.observe(document, {
                        childList: !0,
                        subtree: !0
                    })), "complete" === document.readyState || "loading" !== document.readyState && !document.documentElement.doScroll ? window.setTimeout(this.initDOMLoadedElements.bind(this)) : (document.addEventListener("DOMContentLoaded", this.initDOMLoadedElements), window.addEventListener("load", this.initDOMLoadedElements))
                }
            }, {
                key: "getElOptions",
                value: function(e) {
                    return Object.keys(t.htmlAttributes).reduce(function(n, r) {
                        var i = t.htmlAttributes[r];
                        return e.hasAttribute(i) && (n[r] = JSON.parse(e.getAttribute(i) || !0)), n
                    }, {})
                }
            }, {
                key: "removeObserver",
                value: function() {
                    this.globalObserver.disconnect()
                }
            }, {
                key: "initDOMLoadedElements",
                value: function() {
                    document.removeEventListener("DOMContentLoaded", this.initDOMLoadedElements), window.removeEventListener("load", this.initDOMLoadedElements), Array.from(document.querySelectorAll("[data-simplebar]")).forEach(function(e) {
                        e.SimpleBar || new t(e, t.getElOptions(e))
                    })
                }
            }, {
                key: "defaultOptions",
                get: function() {
                    return {
                        autoHide: !0,
                        forceVisible: !1,
                        classNames: {
                            content: "simplebar-content",
                            scrollContent: "simplebar-scroll-content",
                            scrollbar: "simplebar-scrollbar",
                            track: "simplebar-track"
                        },
                        scrollbarMinSize: 25
                    }
                }
            }, {
                key: "htmlAttributes",
                get: function() {
                    return {
                        autoHide: "data-simplebar-auto-hide",
                        forceVisible: "data-simplebar-force-visible",
                        scrollbarMinSize: "data-simplebar-scrollbar-min-size"
                    }
                }
            }]), t
        }();
        e.default = l, l.initHtmlApi()
    }, function(t, e, n) {
        n(29), n(46), t.exports = n(3).Array.from
    }, function(t, e, n) {
        "use strict";
        var r = n(30)(!0);
        n(31)(String, "String", function(t) {
            this._t = String(t), this._i = 0
        }, function() {
            var t, e = this._t,
                n = this._i;
            return n >= e.length ? {
                value: void 0,
                done: !0
            } : (t = r(e, n), this._i += t.length, {
                value: t,
                done: !1
            })
        })
    }, function(t, e, n) {
        var r = n(8),
            i = n(9);
        t.exports = function(t) {
            return function(e, n) {
                var o, s, c = String(i(e)),
                    a = r(n),
                    u = c.length;
                return a < 0 || a >= u ? t ? "" : void 0 : (o = c.charCodeAt(a), o < 55296 || o > 56319 || a + 1 === u || (s = c.charCodeAt(a + 1)) < 56320 || s > 57343 ? t ? c.charAt(a) : o : t ? c.slice(a, a + 2) : s - 56320 + (o - 55296 << 10) + 65536)
            }
        }
    }, function(t, e, n) {
        "use strict";
        var r = n(32),
            i = n(15),
            o = n(18),
            s = n(4),
            c = n(2),
            a = n(13),
            u = n(36),
            l = n(25),
            f = n(45),
            h = n(0)("iterator"),
            d = !([].keys && "next" in [].keys()),
            p = function() {
                return this
            };
        t.exports = function(t, e, n, v, b, y, m) {
            u(n, e, v);
            var g, E, O, _ = function(t) {
                    if (!d && t in A) return A[t];
                    switch (t) {
                        case "keys":
                        case "values":
                            return function() {
                                return new n(this, t)
                            }
                    }
                    return function() {
                        return new n(this, t)
                    }
                },
                x = e + " Iterator",
                w = "values" == b,
                S = !1,
                A = t.prototype,
                k = A[h] || A["@@iterator"] || b && A[b],
                j = k || _(b),
                M = b ? w ? _("entries") : j : void 0,
                L = "Array" == e ? A.entries || k : k;
            if (L && (O = f(L.call(new t))) !== Object.prototype && O.next && (l(O, x, !0), r || c(O, h) || s(O, h, p)), w && k && "values" !== k.name && (S = !0, j = function() {
                    return k.call(this)
                }), r && !m || !d && !S && A[h] || s(A, h, j), a[e] = j, a[x] = p, b)
                if (g = {
                        values: w ? j : _("values"),
                        keys: y ? j : _("keys"),
                        entries: M
                    }, m)
                    for (E in g) E in A || o(A, E, g[E]);
                else i(i.P + i.F * (d || S), e, g);
            return g
        }
    }, function(t, e) {
        t.exports = !1
    }, function(t, e, n) {
        t.exports = !n(7) && !n(16)(function() {
            return 7 != Object.defineProperty(n(17)("div"), "a", {
                get: function() {
                    return 7
                }
            }).a
        })
    }, function(t, e, n) {
        var r = n(10);
        t.exports = function(t, e) {
            if (!r(t)) return t;
            var n, i;
            if (e && "function" == typeof(n = t.toString) && !r(i = n.call(t))) return i;
            if ("function" == typeof(n = t.valueOf) && !r(i = n.call(t))) return i;
            if (!e && "function" == typeof(n = t.toString) && !r(i = n.call(t))) return i;
            throw TypeError("Can't convert object to primitive value")
        }
    }, function(t, e) {
        t.exports = function(t) {
            if ("function" != typeof t) throw TypeError(t + " is not a function!");
            return t
        }
    }, function(t, e, n) {
        "use strict";
        var r = n(37),
            i = n(11),
            o = n(25),
            s = {};
        n(4)(s, n(0)("iterator"), function() {
            return this
        }), t.exports = function(t, e, n) {
            t.prototype = r(s, {
                next: i(1, n)
            }), o(t, e + " Iterator")
        }
    }, function(t, e, n) {
        var r = n(6),
            i = n(38),
            o = n(24),
            s = n(14)("IE_PROTO"),
            c = function() {},
            a = function() {
                var t, e = n(17)("iframe"),
                    r = o.length;
                for (e.style.display = "none", n(44).appendChild(e), e.src = "javascript:", t = e.contentWindow.document, t.open(), t.write("<script>document.F=Object<\/script>"), t.close(), a = t.F; r--;) delete a.prototype[o[r]];
                return a()
            };
        t.exports = Object.create || function(t, e) {
            var n;
            return null !== t ? (c.prototype = r(t), n = new c, c.prototype = null, n[s] = t) : n = a(), void 0 === e ? n : i(n, e)
        }
    }, function(t, e, n) {
        var r = n(5),
            i = n(6),
            o = n(39);
        t.exports = n(7) ? Object.defineProperties : function(t, e) {
            i(t);
            for (var n, s = o(e), c = s.length, a = 0; c > a;) r.f(t, n = s[a++], e[n]);
            return t
        }
    }, function(t, e, n) {
        var r = n(40),
            i = n(24);
        t.exports = Object.keys || function(t) {
            return r(t, i)
        }
    }, function(t, e, n) {
        var r = n(2),
            i = n(20),
            o = n(42)(!1),
            s = n(14)("IE_PROTO");
        t.exports = function(t, e) {
            var n, c = i(t),
                a = 0,
                u = [];
            for (n in c) n != s && r(c, n) && u.push(n);
            for (; e.length > a;) r(c, n = e[a++]) && (~o(u, n) || u.push(n));
            return u
        }
    }, function(t, e, n) {
        var r = n(21);
        t.exports = Object("z").propertyIsEnumerable(0) ? Object : function(t) {
            return "String" == r(t) ? t.split("") : Object(t)
        }
    }, function(t, e, n) {
        var r = n(20),
            i = n(22),
            o = n(43);
        t.exports = function(t) {
            return function(e, n, s) {
                var c, a = r(e),
                    u = i(a.length),
                    l = o(s, u);
                if (t && n != n) {
                    for (; u > l;)
                        if ((c = a[l++]) != c) return !0
                } else
                    for (; u > l; l++)
                        if ((t || l in a) && a[l] === n) return t || l || 0;
                return !t && -1
            }
        }
    }, function(t, e, n) {
        var r = n(8),
            i = Math.max,
            o = Math.min;
        t.exports = function(t, e) {
            return t = r(t), t < 0 ? i(t + e, 0) : o(t, e)
        }
    }, function(t, e, n) {
        var r = n(1).document;
        t.exports = r && r.documentElement
    }, function(t, e, n) {
        var r = n(2),
            i = n(26),
            o = n(14)("IE_PROTO"),
            s = Object.prototype;
        t.exports = Object.getPrototypeOf || function(t) {
            return t = i(t), r(t, o) ? t[o] : "function" == typeof t.constructor && t instanceof t.constructor ? t.constructor.prototype : t instanceof Object ? s : null
        }
    }, function(t, e, n) {
        "use strict";
        var r = n(19),
            i = n(15),
            o = n(26),
            s = n(47),
            c = n(48),
            a = n(22),
            u = n(49),
            l = n(50);
        i(i.S + i.F * !n(52)(function(t) {
            Array.from(t)
        }), "Array", {
            from: function(t) {
                var e, n, i, f, h = o(t),
                    d = "function" == typeof this ? this : Array,
                    p = arguments.length,
                    v = p > 1 ? arguments[1] : void 0,
                    b = void 0 !== v,
                    y = 0,
                    m = l(h);
                if (b && (v = r(v, p > 2 ? arguments[2] : void 0, 2)), void 0 == m || d == Array && c(m))
                    for (e = a(h.length), n = new d(e); e > y; y++) u(n, y, b ? v(h[y], y) : h[y]);
                else
                    for (f = m.call(h), n = new d; !(i = f.next()).done; y++) u(n, y, b ? s(f, v, [i.value, y], !0) : i.value);
                return n.length = y, n
            }
        })
    }, function(t, e, n) {
        var r = n(6);
        t.exports = function(t, e, n, i) {
            try {
                return i ? e(r(n)[0], n[1]) : e(n)
            } catch (e) {
                var o = t.return;
                throw void 0 !== o && r(o.call(t)), e
            }
        }
    }, function(t, e, n) {
        var r = n(13),
            i = n(0)("iterator"),
            o = Array.prototype;
        t.exports = function(t) {
            return void 0 !== t && (r.Array === t || o[i] === t)
        }
    }, function(t, e, n) {
        "use strict";
        var r = n(5),
            i = n(11);
        t.exports = function(t, e, n) {
            e in t ? r.f(t, e, i(0, n)) : t[e] = n
        }
    }, function(t, e, n) {
        var r = n(51),
            i = n(0)("iterator"),
            o = n(13);
        t.exports = n(3).getIteratorMethod = function(t) {
            if (void 0 != t) return t[i] || t["@@iterator"] || o[r(t)]
        }
    }, function(t, e, n) {
        var r = n(21),
            i = n(0)("toStringTag"),
            o = "Arguments" == r(function() {
                return arguments
            }()),
            s = function(t, e) {
                try {
                    return t[e]
                } catch (t) {}
            };
        t.exports = function(t) {
            var e, n, c;
            return void 0 === t ? "Undefined" : null === t ? "Null" : "string" == typeof(n = s(e = Object(t), i)) ? n : o ? r(e) : "Object" == (c = r(e)) && "function" == typeof e.callee ? "Arguments" : c
        }
    }, function(t, e, n) {
        var r = n(0)("iterator"),
            i = !1;
        try {
            var o = [7][r]();
            o.return = function() {
                i = !0
            }, Array.from(o, function() {
                throw 2
            })
        } catch (t) {}
        t.exports = function(t, e) {
            if (!e && !i) return !1;
            var n = !1;
            try {
                var o = [7],
                    s = o[r]();
                s.next = function() {
                    return {
                        done: n = !0
                    }
                }, o[r] = function() {
                    return s
                }, t(o)
            } catch (t) {}
            return n
        }
    }, function(t, e, n) {
        var r, i, o; /*! scrollbarWidth.js v0.1.3 | felixexter | MIT | https://github.com/felixexter/scrollbarWidth */
        ! function(n, s) {
            i = [], r = s, void 0 !== (o = "function" == typeof r ? r.apply(e, i) : r) && (t.exports = o)
        }(0, function() {
            "use strict";

            function t() {
                if ("undefined" == typeof document) return 0;
                var t, e = document.body,
                    n = document.createElement("div"),
                    r = n.style;
                return r.position = "absolute", r.top = r.left = "-9999px", r.width = r.height = "100px", r.overflow = "scroll", e.appendChild(n), t = n.offsetWidth - n.clientWidth, e.removeChild(n), t
            }
            return t
        })
    }, function(t, e, n) {
        (function(e) {
            function n(t, e, n) {
                function i(e) {
                    var n = v,
                        r = b;
                    return v = b = void 0, w = e, m = t.apply(r, n)
                }

                function o(t) {
                    return w = t, g = setTimeout(l, e), S ? i(t) : m
                }

                function a(t) {
                    var n = t - x,
                        r = t - w,
                        i = e - n;
                    return A ? O(i, y - r) : i
                }

                function u(t) {
                    var n = t - x,
                        r = t - w;
                    return void 0 === x || n >= e || n < 0 || A && r >= y
                }

                function l() {
                    var t = _();
                    if (u(t)) return f(t);
                    g = setTimeout(l, a(t))
                }

                function f(t) {
                    return g = void 0, k && v ? i(t) : (v = b = void 0, m)
                }

                function h() {
                    void 0 !== g && clearTimeout(g), w = 0, v = x = b = g = void 0
                }

                function d() {
                    return void 0 === g ? m : f(_())
                }

                function p() {
                    var t = _(),
                        n = u(t);
                    if (v = arguments, b = this, x = t, n) {
                        if (void 0 === g) return o(x);
                        if (A) return g = setTimeout(l, e), i(x)
                    }
                    return void 0 === g && (g = setTimeout(l, e)), m
                }
                var v, b, y, m, g, x, w = 0,
                    S = !1,
                    A = !1,
                    k = !0;
                if ("function" != typeof t) throw new TypeError(c);
                return e = s(e) || 0, r(n) && (S = !!n.leading, A = "maxWait" in n, y = A ? E(s(n.maxWait) || 0, e) : y, k = "trailing" in n ? !!n.trailing : k), p.cancel = h, p.flush = d, p
            }

            function r(t) {
                var e = typeof t;
                return !!t && ("object" == e || "function" == e)
            }

            function i(t) {
                return !!t && "object" == typeof t
            }

            function o(t) {
                return "symbol" == typeof t || i(t) && g.call(t) == u
            }

            function s(t) {
                if ("number" == typeof t) return t;
                if (o(t)) return a;
                if (r(t)) {
                    var e = "function" == typeof t.valueOf ? t.valueOf() : t;
                    t = r(e) ? e + "" : e
                }
                if ("string" != typeof t) return 0 === t ? t : +t;
                t = t.replace(l, "");
                var n = h.test(t);
                return n || d.test(t) ? p(t.slice(2), n ? 2 : 8) : f.test(t) ? a : +t
            }
            var c = "Expected a function",
                a = NaN,
                u = "[object Symbol]",
                l = /^\s+|\s+$/g,
                f = /^[-+]0x[0-9a-f]+$/i,
                h = /^0b[01]+$/i,
                d = /^0o[0-7]+$/i,
                p = parseInt,
                v = "object" == typeof e && e && e.Object === Object && e,
                b = "object" == typeof self && self && self.Object === Object && self,
                y = v || b || Function("return this")(),
                m = Object.prototype,
                g = m.toString,
                E = Math.max,
                O = Math.min,
                _ = function() {
                    return y.Date.now()
                };
            t.exports = n
        }).call(e, n(55))
    }, function(t, e) {
        var n;
        n = function() {
            return this
        }();
        try {
            n = n || Function("return this")() || (0, eval)("this")
        } catch (t) {
            "object" == typeof window && (n = window)
        }
        t.exports = n
    }, function(t, e, n) {
        "use strict";

        function r(t) {
            return parseFloat(t) || 0
        }

        function i(t) {
            return Array.prototype.slice.call(arguments, 1).reduce(function(e, n) {
                return e + r(t["border-" + n + "-width"])
            }, 0)
        }

        function o(t) {
            for (var e = ["top", "right", "bottom", "left"], n = {}, i = 0, o = e; i < o.length; i += 1) {
                var s = o[i],
                    c = t["padding-" + s];
                n[s] = r(c)
            }
            return n
        }

        function s(t) {
            var e = t.getBBox();
            return f(0, 0, e.width, e.height)
        }

        function c(t) {
            var e = t.clientWidth,
                n = t.clientHeight;
            if (!e && !n) return _;
            var s = getComputedStyle(t),
                c = o(s),
                u = c.left + c.right,
                l = c.top + c.bottom,
                h = r(s.width),
                d = r(s.height);
            if ("border-box" === s.boxSizing && (Math.round(h + u) !== e && (h -= i(s, "left", "right") + u), Math.round(d + l) !== n && (d -= i(s, "top", "bottom") + l)), !a(t)) {
                var p = Math.round(h + u) - e,
                    v = Math.round(d + l) - n;
                1 !== Math.abs(p) && (h -= p), 1 !== Math.abs(v) && (d -= v)
            }
            return f(c.left, c.top, h, d)
        }

        function a(t) {
            return t === document.documentElement
        }

        function u(t) {
            return d ? x(t) ? s(t) : c(t) : _
        }

        function l(t) {
            var e = t.x,
                n = t.y,
                r = t.width,
                i = t.height,
                o = "undefined" != typeof DOMRectReadOnly ? DOMRectReadOnly : Object,
                s = Object.create(o.prototype);
            return O(s, {
                x: e,
                y: n,
                width: r,
                height: i,
                top: n,
                right: e + r,
                bottom: i + n,
                left: e
            }), s
        }

        function f(t, e, n, r) {
            return {
                x: t,
                y: e,
                width: n,
                height: r
            }
        }
        Object.defineProperty(e, "__esModule", {
            value: !0
        });
        var h = function() {
                function t(t, e) {
                    var n = -1;
                    return t.some(function(t, r) {
                        return t[0] === e && (n = r, !0)
                    }), n
                }
                return "undefined" != typeof Map ? Map : function() {
                    function e() {
                        this.__entries__ = []
                    }
                    var n = {
                        size: {}
                    };
                    return n.size.get = function() {
                        return this.__entries__.length
                    }, e.prototype.get = function(e) {
                        var n = t(this.__entries__, e),
                            r = this.__entries__[n];
                        return r && r[1]
                    }, e.prototype.set = function(e, n) {
                        var r = t(this.__entries__, e);
                        ~r ? this.__entries__[r][1] = n : this.__entries__.push([e, n])
                    }, e.prototype.delete = function(e) {
                        var n = this.__entries__,
                            r = t(n, e);
                        ~r && n.splice(r, 1)
                    }, e.prototype.has = function(e) {
                        return !!~t(this.__entries__, e)
                    }, e.prototype.clear = function() {
                        this.__entries__.splice(0)
                    }, e.prototype.forEach = function(t, e) {
                        void 0 === e && (e = null);
                        for (var n = 0, r = this.__entries__; n < r.length; n += 1) {
                            var i = r[n];
                            t.call(e, i[1], i[0])
                        }
                    }, Object.defineProperties(e.prototype, n), e
                }()
            }(),
            d = "undefined" != typeof window && "undefined" != typeof document && window.document === document,
            p = function() {
                return "function" == typeof requestAnimationFrame ? requestAnimationFrame : function(t) {
                    return setTimeout(function() {
                        return t(Date.now())
                    }, 1e3 / 60)
                }
            }(),
            v = 2,
            b = function(t, e) {
                function n() {
                    o && (o = !1, t()), s && i()
                }

                function r() {
                    p(n)
                }

                function i() {
                    var t = Date.now();
                    if (o) {
                        if (t - c < v) return;
                        s = !0
                    } else o = !0, s = !1, setTimeout(r, e);
                    c = t
                }
                var o = !1,
                    s = !1,
                    c = 0;
                return i
            },
            y = ["top", "right", "bottom", "left", "width", "height", "size", "weight"],
            m = "undefined" != typeof navigator && /Trident\/.*rv:11/.test(navigator.userAgent),
            g = "undefined" != typeof MutationObserver && !m,
            E = function() {
                this.connected_ = !1, this.mutationEventsAdded_ = !1, this.mutationsObserver_ = null, this.observers_ = [], this.onTransitionEnd_ = this.onTransitionEnd_.bind(this), this.refresh = b(this.refresh.bind(this), 20)
            };
        E.prototype.addObserver = function(t) {
            ~this.observers_.indexOf(t) || this.observers_.push(t), this.connected_ || this.connect_()
        }, E.prototype.removeObserver = function(t) {
            var e = this.observers_,
                n = e.indexOf(t);
            ~n && e.splice(n, 1), !e.length && this.connected_ && this.disconnect_()
        }, E.prototype.refresh = function() {
            this.updateObservers_() && this.refresh()
        }, E.prototype.updateObservers_ = function() {
            var t = this.observers_.filter(function(t) {
                return t.gatherActive(), t.hasActive()
            });
            return t.forEach(function(t) {
                return t.broadcastActive()
            }), t.length > 0
        }, E.prototype.connect_ = function() {
            d && !this.connected_ && (document.addEventListener("transitionend", this.onTransitionEnd_), window.addEventListener("resize", this.refresh), g ? (this.mutationsObserver_ = new MutationObserver(this.refresh), this.mutationsObserver_.observe(document, {
                attributes: !0,
                childList: !0,
                characterData: !0,
                subtree: !0
            })) : (document.addEventListener("DOMSubtreeModified", this.refresh), this.mutationEventsAdded_ = !0), this.connected_ = !0)
        }, E.prototype.disconnect_ = function() {
            d && this.connected_ && (document.removeEventListener("transitionend", this.onTransitionEnd_), window.removeEventListener("resize", this.refresh), this.mutationsObserver_ && this.mutationsObserver_.disconnect(), this.mutationEventsAdded_ && document.removeEventListener("DOMSubtreeModified", this.refresh), this.mutationsObserver_ = null, this.mutationEventsAdded_ = !1, this.connected_ = !1)
        }, E.prototype.onTransitionEnd_ = function(t) {
            var e = t.propertyName;
            y.some(function(t) {
                return !!~e.indexOf(t)
            }) && this.refresh()
        }, E.getInstance = function() {
            return this.instance_ || (this.instance_ = new E), this.instance_
        }, E.instance_ = null;
        var O = function(t, e) {
                for (var n = 0, r = Object.keys(e); n < r.length; n += 1) {
                    var i = r[n];
                    Object.defineProperty(t, i, {
                        value: e[i],
                        enumerable: !1,
                        writable: !1,
                        configurable: !0
                    })
                }
                return t
            },
            _ = f(0, 0, 0, 0),
            x = function() {
                return "undefined" != typeof SVGGraphicsElement ? function(t) {
                    return t instanceof SVGGraphicsElement
                } : function(t) {
                    return t instanceof SVGElement && "function" == typeof t.getBBox
                }
            }(),
            w = function(t) {
                this.broadcastWidth = 0, this.broadcastHeight = 0, this.contentRect_ = f(0, 0, 0, 0), this.target = t
            };
        w.prototype.isActive = function() {
            var t = u(this.target);
            return this.contentRect_ = t, t.width !== this.broadcastWidth || t.height !== this.broadcastHeight
        }, w.prototype.broadcastRect = function() {
            var t = this.contentRect_;
            return this.broadcastWidth = t.width, this.broadcastHeight = t.height, t
        };
        var S = function(t, e) {
                var n = l(e);
                O(this, {
                    target: t,
                    contentRect: n
                })
            },
            A = function(t, e, n) {
                if ("function" != typeof t) throw new TypeError("The callback provided as parameter 1 is not a function.");
                this.activeObservations_ = [], this.observations_ = new h, this.callback_ = t, this.controller_ = e, this.callbackCtx_ = n
            };
        A.prototype.observe = function(t) {
            if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
            if ("undefined" != typeof Element && Element instanceof Object) {
                if (!(t instanceof Element)) throw new TypeError('parameter 1 is not of type "Element".');
                var e = this.observations_;
                e.has(t) || (e.set(t, new w(t)), this.controller_.addObserver(this), this.controller_.refresh())
            }
        }, A.prototype.unobserve = function(t) {
            if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
            if ("undefined" != typeof Element && Element instanceof Object) {
                if (!(t instanceof Element)) throw new TypeError('parameter 1 is not of type "Element".');
                var e = this.observations_;
                e.has(t) && (e.delete(t), e.size || this.controller_.removeObserver(this))
            }
        }, A.prototype.disconnect = function() {
            this.clearActive(), this.observations_.clear(), this.controller_.removeObserver(this)
        }, A.prototype.gatherActive = function() {
            var t = this;
            this.clearActive(), this.observations_.forEach(function(e) {
                e.isActive() && t.activeObservations_.push(e)
            })
        }, A.prototype.broadcastActive = function() {
            if (this.hasActive()) {
                var t = this.callbackCtx_,
                    e = this.activeObservations_.map(function(t) {
                        return new S(t.target, t.broadcastRect())
                    });
                this.callback_.call(t, e, t), this.clearActive()
            }
        }, A.prototype.clearActive = function() {
            this.activeObservations_.splice(0)
        }, A.prototype.hasActive = function() {
            return this.activeObservations_.length > 0
        };
        var k = "undefined" != typeof WeakMap ? new WeakMap : new h,
            j = function(t) {
                if (!(this instanceof j)) throw new TypeError("Cannot call a class as a function");
                if (!arguments.length) throw new TypeError("1 argument required, but only 0 present.");
                var e = E.getInstance(),
                    n = new A(t, e, this);
                k.set(this, n)
            };
        ["observe", "unobserve", "disconnect"].forEach(function(t) {
            j.prototype[t] = function() {
                return (e = k.get(this))[t].apply(e, arguments);
                var e
            }
        });
        var M = function() {
            return "undefined" != typeof ResizeObserver ? ResizeObserver : j
        }();
        e.default = M
    }, function(t, e) {}, function(t, e, n) {
        "use strict";

        function r(t) {
            if (null === t || void 0 === t) throw new TypeError("Object.assign cannot be called with null or undefined");
            return Object(t)
        }
        /*
        object-assign
        (c) Sindre Sorhus
        @license MIT
        */
        var i = Object.getOwnPropertySymbols,
            o = Object.prototype.hasOwnProperty,
            s = Object.prototype.propertyIsEnumerable;
        t.exports = function() {
            try {
                if (!Object.assign) return !1;
                var t = new String("abc");
                if (t[5] = "de", "5" === Object.getOwnPropertyNames(t)[0]) return !1;
                for (var e = {}, n = 0; n < 10; n++) e["_" + String.fromCharCode(n)] = n;
                if ("0123456789" !== Object.getOwnPropertyNames(e).map(function(t) {
                        return e[t]
                    }).join("")) return !1;
                var r = {};
                return "abcdefghijklmnopqrst".split("").forEach(function(t) {
                    r[t] = t
                }), "abcdefghijklmnopqrst" === Object.keys(Object.assign({}, r)).join("")
            } catch (t) {
                return !1
            }
        }() ? Object.assign : function(t, e) {
            for (var n, c, a = r(t), u = 1; u < arguments.length; u++) {
                n = Object(arguments[u]);
                for (var l in n) o.call(n, l) && (a[l] = n[l]);
                if (i) {
                    c = i(n);
                    for (var f = 0; f < c.length; f++) s.call(n, c[f]) && (a[c[f]] = n[c[f]])
                }
            }
            return a
        }
    }]).default
});
(function() {
    var t, i, e, s, n, o, a, h, r, l, p, c, u, d = [].slice,
        g = {}.hasOwnProperty,
        m = function(t, i) {
            function e() {
                this.constructor = t
            }
            for (var s in i) g.call(i, s) && (t[s] = i[s]);
            return e.prototype = i.prototype, t.prototype = new e, t.__super__ = i.prototype, t
        };
    ! function() {
        var t, i, e, s, n, o, a;
        for (a = ["ms", "moz", "webkit", "o"], e = 0, n = a.length; e < n && (o = a[e], !window.requestAnimationFrame); e++) window.requestAnimationFrame = window[o + "RequestAnimationFrame"], window.cancelAnimationFrame = window[o + "CancelAnimationFrame"] || window[o + "CancelRequestAnimationFrame"];
        t = null, s = 0, i = {}, requestAnimationFrame ? window.cancelAnimationFrame || (t = window.requestAnimationFrame, window.requestAnimationFrame = function(e, n) {
            var o;
            return o = ++s, t(function() {
                if (!i[o]) return e()
            }, n), o
        }, window.cancelAnimationFrame = function(t) {
            return i[t] = !0
        }) : (window.requestAnimationFrame = function(t, i) {
            var e, s, n, o;
            return e = (new Date).getTime(), o = Math.max(0, 16 - (e - n)), s = window.setTimeout(function() {
                return t(e + o)
            }, o), n = e + o, s
        }, window.cancelAnimationFrame = function(t) {
            return clearTimeout(t)
        })
    }(), u = function(t) {
            var i, e;
            for (i = Math.floor(t / 3600), e = Math.floor((t - 3600 * i) / 60), t -= 3600 * i + 60 * e, t += "", e += ""; e.length < 2;) e = "0" + e;
            for (; t.length < 2;) t = "0" + t;
            return (i = i ? i + ":" : "") + e + ":" + t
        }, p = function() {
            var t, i, e;
            return i = 1 <= arguments.length ? d.call(arguments, 0) : [], e = i[0], t = i[1], r(e.toFixed(t))
        }, c = function(t, i) {
            var e, s, n;
            s = {};
            for (e in t) g.call(t, e) && (n = t[e], s[e] = n);
            for (e in i) g.call(i, e) && (n = i[e], s[e] = n);
            return s
        }, r = function(t) {
            var i, e, s, n;
            for (t += "", e = t.split("."), s = e[0], n = "", e.length > 1 && (n = "." + e[1]), i = /(\d+)(\d{3})/; i.test(s);) s = s.replace(i, "$1,$2");
            return s + n
        }, l = function(t) {
            return "#" === t.charAt(0) ? t.substring(1, 7) : t
        }, h = function() {
            function t(t, i) {
                null == t && (t = !0), this.clear = null == i || i, t && AnimationUpdater.add(this)
            }
            return t.prototype.animationSpeed = 32, t.prototype.update = function(t) {
                var i;
                return null == t && (t = !1), !(!t && this.displayedValue === this.value) && (this.ctx && this.clear && this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), i = this.value - this.displayedValue, Math.abs(i / this.animationSpeed) <= .001 ? this.displayedValue = this.value : this.displayedValue = this.displayedValue + i / this.animationSpeed, this.render(), !0)
            }, t
        }(), e = function(t) {
            function i() {
                return i.__super__.constructor.apply(this, arguments)
            }
            return m(i, t), i.prototype.displayScale = 1, i.prototype.forceUpdate = !0, i.prototype.setTextField = function(t, i) {
                return this.textField = t instanceof a ? t : new a(t, i)
            }, i.prototype.setMinValue = function(t, i) {
                var e, s, n, o, a;
                if (this.minValue = t, null == i && (i = !0), i) {
                    for (this.displayedValue = this.minValue, o = this.gp || [], a = [], s = 0, n = o.length; s < n; s++) e = o[s], a.push(e.displayedValue = this.minValue);
                    return a
                }
            }, i.prototype.setOptions = function(t) {
                return null == t && (t = null), this.options = c(this.options, t), this.textField && (this.textField.el.style.fontSize = t.fontSize + "px"), this.options.angle > .5 && (this.options.angle = .5), this.configDisplayScale(), this
            }, i.prototype.configDisplayScale = function() {
                var t, i, e, s, n;
                return s = this.displayScale, !1 === this.options.highDpiSupport ? delete this.displayScale : (i = window.devicePixelRatio || 1, t = this.ctx.webkitBackingStorePixelRatio || this.ctx.mozBackingStorePixelRatio || this.ctx.msBackingStorePixelRatio || this.ctx.oBackingStorePixelRatio || this.ctx.backingStorePixelRatio || 1, this.displayScale = i / t), this.displayScale !== s && (n = this.canvas.G__width || this.canvas.width, e = this.canvas.G__height || this.canvas.height, this.canvas.width = n * this.displayScale, this.canvas.height = e * this.displayScale, this.canvas.style.width = n + "px", this.canvas.style.height = e + "px", this.canvas.G__width = n, this.canvas.G__height = e), this
            }, i.prototype.parseValue = function(t) {
                return t = parseFloat(t) || Number(t), isFinite(t) ? t : 0
            }, i
        }(h), a = function() {
            function t(t, i) {
                this.el = t, this.fractionDigits = i
            }
            return t.prototype.render = function(t) {
                return this.el.innerHTML = p(t.displayedValue, this.fractionDigits)
            }, t
        }(), t = function(t) {
            function i(t, e) {
                if (this.elem = t, this.text = null != e && e, i.__super__.constructor.call(this), void 0 === this.elem) throw new Error("The element isn't defined.");
                this.value = 1 * this.elem.innerHTML, this.text && (this.value = 0)
            }
            return m(i, t), i.prototype.displayedValue = 0, i.prototype.value = 0, i.prototype.setVal = function(t) {
                return this.value = 1 * t
            }, i.prototype.render = function() {
                var t;
                return t = this.text ? u(this.displayedValue.toFixed(0)) : r(p(this.displayedValue)), this.elem.innerHTML = t
            }, i
        }(h), o = function(t) {
            function i(t) {
                if (this.gauge = t, void 0 === this.gauge) throw new Error("The element isn't defined.");
                this.ctx = this.gauge.ctx, this.canvas = this.gauge.canvas, i.__super__.constructor.call(this, !1, !1), this.setOptions()
            }
            return m(i, t), i.prototype.displayedValue = 0, i.prototype.value = 0, i.prototype.options = {
                strokeWidth: .035,
                length: .1,
                color: "#000000",
                iconPath: null,
                iconScale: 1,
                iconAngle: 0
            }, i.prototype.img = null, i.prototype.setOptions = function(t) {
                if (null == t && (t = null), this.options = c(this.options, t), this.length = 2 * this.gauge.radius * this.gauge.options.radiusScale * this.options.length, this.strokeWidth = this.canvas.height * this.options.strokeWidth, this.maxValue = this.gauge.maxValue, this.minValue = this.gauge.minValue, this.animationSpeed = this.gauge.animationSpeed, this.options.angle = this.gauge.options.angle, this.options.iconPath) return this.img = new Image, this.img.src = this.options.iconPath
            }, i.prototype.render = function() {
                var t, i, e, s, n, o, a, h, r;
                if (t = this.gauge.getAngle.call(this, this.displayedValue), h = Math.round(this.length * Math.cos(t)), r = Math.round(this.length * Math.sin(t)), o = Math.round(this.strokeWidth * Math.cos(t - Math.PI / 2)), a = Math.round(this.strokeWidth * Math.sin(t - Math.PI / 2)), i = Math.round(this.strokeWidth * Math.cos(t + Math.PI / 2)), e = Math.round(this.strokeWidth * Math.sin(t + Math.PI / 2)), this.ctx.beginPath(), this.ctx.fillStyle = this.options.color, this.ctx.arc(0, 0, this.strokeWidth, 0, 2 * Math.PI, !1), this.ctx.fill(), this.ctx.beginPath(), this.ctx.moveTo(o, a), this.ctx.lineTo(h, r), this.ctx.lineTo(i, e), this.ctx.fill(), this.img) return s = Math.round(this.img.width * this.options.iconScale), n = Math.round(this.img.height * this.options.iconScale), this.ctx.save(), this.ctx.translate(h, r), this.ctx.rotate(t + Math.PI / 180 * (90 + this.options.iconAngle)), this.ctx.drawImage(this.img, -s / 2, -n / 2, s, n), this.ctx.restore()
            }, i
        }(h),
        function() {
            function t(t) {
                this.elem = t
            }
            t.prototype.updateValues = function(t) {
                return this.value = t[0], this.maxValue = t[1], this.avgValue = t[2], this.render()
            }, t.prototype.render = function() {
                var t, i;
                return this.textField && this.textField.text(p(this.value)), 0 === this.maxValue && (this.maxValue = 2 * this.avgValue), i = this.value / this.maxValue * 100, t = this.avgValue / this.maxValue * 100, $(".bar-value", this.elem).css({
                    width: i + "%"
                }), $(".typical-value", this.elem).css({
                    width: t + "%"
                })
            }
        }(), n = function(t) {
            function i(t) {
                var e, s;
                this.canvas = t, i.__super__.constructor.call(this), this.percentColors = null, "undefined" != typeof G_vmlCanvasManager && (this.canvas = window.G_vmlCanvasManager.initElement(this.canvas)), this.ctx = this.canvas.getContext("2d"), e = this.canvas.clientHeight, s = this.canvas.clientWidth, this.canvas.height = e, this.canvas.width = s, this.gp = [new o(this)], this.setOptions()
            }
            return m(i, t), i.prototype.elem = null, i.prototype.value = [20], i.prototype.maxValue = 80, i.prototype.minValue = 0, i.prototype.displayedAngle = 0, i.prototype.displayedValue = 0, i.prototype.lineWidth = 40, i.prototype.paddingTop = .1, i.prototype.paddingBottom = .1, i.prototype.percentColors = null, i.prototype.options = {
                colorStart: "#6fadcf",
                colorStop: void 0,
                gradientType: 0,
                strokeColor: "#e0e0e0",
                pointer: {
                    length: .8,
                    strokeWidth: .035,
                    iconScale: 1
                },
                angle: .15,
                lineWidth: .44,
                radiusScale: 1,
                fontSize: 40,
                limitMax: !1,
                limitMin: !1
            }, i.prototype.setOptions = function(t) {
                var e, s, n, o, a;
                for (null == t && (t = null), i.__super__.setOptions.call(this, t), this.configPercentColors(), this.extraPadding = 0, this.options.angle < 0 && (o = Math.PI * (1 + this.options.angle), this.extraPadding = Math.sin(o)), this.availableHeight = this.canvas.height * (1 - this.paddingTop - this.paddingBottom), this.lineWidth = this.availableHeight * this.options.lineWidth, this.radius = (this.availableHeight - this.lineWidth / 2) / (1 + this.extraPadding), this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height), a = this.gp, s = 0, n = a.length; s < n; s++) e = a[s], e.setOptions(this.options.pointer), e.render();
                return this.render(), this
            }, i.prototype.configPercentColors = function() {
                var t, i, e, s, n, o, a;
                if (this.percentColors = null, void 0 !== this.options.percentColors) {
                    for (this.percentColors = new Array, o = [], e = s = 0, n = this.options.percentColors.length - 1; 0 <= n ? s <= n : s >= n; e = 0 <= n ? ++s : --s) a = parseInt(l(this.options.percentColors[e][1]).substring(0, 2), 16), i = parseInt(l(this.options.percentColors[e][1]).substring(2, 4), 16), t = parseInt(l(this.options.percentColors[e][1]).substring(4, 6), 16), o.push(this.percentColors[e] = {
                        pct: this.options.percentColors[e][0],
                        color: {
                            r: a,
                            g: i,
                            b: t
                        }
                    });
                    return o
                }
            }, i.prototype.set = function(t) {
                var i, e, s, n, a, h, r, l, p;
                for (t instanceof Array || (t = [t]), e = s = 0, r = t.length - 1; 0 <= r ? s <= r : s >= r; e = 0 <= r ? ++s : --s) t[e] = this.parseValue(t[e]);
                if (t.length > this.gp.length)
                    for (e = n = 0, l = t.length - this.gp.length; 0 <= l ? n < l : n > l; e = 0 <= l ? ++n : --n) i = new o(this), i.setOptions(this.options.pointer), this.gp.push(i);
                else t.length < this.gp.length && (this.gp = this.gp.slice(this.gp.length - t.length));
                for (e = 0, a = 0, h = t.length; a < h; a++) p = t[a], p > this.maxValue ? this.options.limitMax ? p = this.maxValue : this.maxValue = p + 1 : p < this.minValue && (this.options.limitMin ? p = this.minValue : this.minValue = p - 1), this.gp[e].value = p, this.gp[e++].setOptions({
                    minValue: this.minValue,
                    maxValue: this.maxValue,
                    angle: this.options.angle
                });
                return this.value = Math.max(Math.min(t[t.length - 1], this.maxValue), this.minValue), AnimationUpdater.run(this.forceUpdate), this.forceUpdate = !1
            }, i.prototype.getAngle = function(t) {
                return (1 + this.options.angle) * Math.PI + (t - this.minValue) / (this.maxValue - this.minValue) * (1 - 2 * this.options.angle) * Math.PI
            }, i.prototype.getColorForPercentage = function(t, i) {
                var e, s, n, o, a, h, r;
                if (0 === t) e = this.percentColors[0].color;
                else
                    for (e = this.percentColors[this.percentColors.length - 1].color, n = o = 0, h = this.percentColors.length - 1; 0 <= h ? o <= h : o >= h; n = 0 <= h ? ++o : --o)
                        if (t <= this.percentColors[n].pct) {
                            !0 === i ? (r = this.percentColors[n - 1] || this.percentColors[0], s = this.percentColors[n], a = (t - r.pct) / (s.pct - r.pct), e = {
                                r: Math.floor(r.color.r * (1 - a) + s.color.r * a),
                                g: Math.floor(r.color.g * (1 - a) + s.color.g * a),
                                b: Math.floor(r.color.b * (1 - a) + s.color.b * a)
                            }) : e = this.percentColors[n].color;
                            break
                        } return "rgb(" + [e.r, e.g, e.b].join(",") + ")"
            }, i.prototype.getColorForValue = function(t, i) {
                var e;
                return e = (t - this.minValue) / (this.maxValue - this.minValue), this.getColorForPercentage(e, i)
            }, i.prototype.renderStaticLabels = function(t, i, e, s) {
                var n, o, a, h, r, l, c, u, d, g;
                for (this.ctx.save(), this.ctx.translate(i, e), n = t.font || "10px Times", l = /\d+\.?\d?/, r = n.match(l)[0], u = n.slice(r.length), o = parseFloat(r) * this.displayScale, this.ctx.font = o + u, this.ctx.fillStyle = t.color || "#000000", this.ctx.textBaseline = "bottom", this.ctx.textAlign = "center", c = t.labels, a = 0, h = c.length; a < h; a++) g = c[a], void 0 !== g.label ? (!this.options.limitMin || g >= this.minValue) && (!this.options.limitMax || g <= this.maxValue) && (n = g.font || t.font, r = n.match(l)[0], u = n.slice(r.length), o = parseFloat(r) * this.displayScale, this.ctx.font = o + u, d = this.getAngle(g.label) - 3 * Math.PI / 2, this.ctx.rotate(d), this.ctx.fillText(p(g.label, t.fractionDigits), 0, -s - this.lineWidth / 2), this.ctx.rotate(-d)) : (!this.options.limitMin || g >= this.minValue) && (!this.options.limitMax || g <= this.maxValue) && (d = this.getAngle(g) - 3 * Math.PI / 2, this.ctx.rotate(d), this.ctx.fillText(p(g, t.fractionDigits), 0, -s - this.lineWidth / 2), this.ctx.rotate(-d));
                return this.ctx.restore()
            }, i.prototype.renderTicks = function(t, i, e, s) {
                var n, o, a, h, r, l, p, c, u, d, g, m, x, f, v, y, V, w, S, M, C;
                if (t !== {}) {
                    for (l = t.divisions || 0, S = t.subDivisions || 0, a = t.divColor || "#fff", v = t.subColor || "#fff", h = t.divLength || .7, V = t.subLength || .2, u = parseFloat(this.maxValue) - parseFloat(this.minValue), d = parseFloat(u) / parseFloat(t.divisions), y = parseFloat(d) / parseFloat(t.subDivisions), n = parseFloat(this.minValue), o = 0 + y, c = u / 400, r = c * (t.divWidth || 1), w = c * (t.subWidth || 1), m = [], M = p = 0, g = l + 1; p < g; M = p += 1) this.ctx.lineWidth = this.lineWidth * h, x = this.lineWidth / 2 * (1 - h), C = this.radius * this.options.radiusScale + x, this.ctx.strokeStyle = a, this.ctx.beginPath(), this.ctx.arc(0, 0, C, this.getAngle(n - r), this.getAngle(n + r), !1), this.ctx.stroke(), o = n + y, n += d, M !== t.divisions && S > 0 ? m.push(function() {
                        var t, i, e;
                        for (e = [], f = t = 0, i = S - 1; t < i; f = t += 1) this.ctx.lineWidth = this.lineWidth * V, x = this.lineWidth / 2 * (1 - V), C = this.radius * this.options.radiusScale + x, this.ctx.strokeStyle = v, this.ctx.beginPath(), this.ctx.arc(0, 0, C, this.getAngle(o - w), this.getAngle(o + w), !1), this.ctx.stroke(), e.push(o += y);
                        return e
                    }.call(this)) : m.push(void 0);
                    return m
                }
            }, i.prototype.render = function() {
                var t, i, e, s, n, o, a, h, r, l, p, c, u, d, g, m, x;
                if (m = this.canvas.width / 2, s = this.canvas.height * this.paddingTop + this.availableHeight - (this.radius + this.lineWidth / 2) * this.extraPadding, t = this.getAngle(this.displayedValue), this.textField && this.textField.render(this), this.ctx.lineCap = "butt", p = this.radius * this.options.radiusScale, this.options.staticLabels && this.renderStaticLabels(this.options.staticLabels, m, s, p), this.options.staticZones)
                    for (this.ctx.save(), this.ctx.translate(m, s), this.ctx.lineWidth = this.lineWidth, c = this.options.staticZones, n = 0, a = c.length; n < a; n++) x = c[n], l = x.min, this.options.limitMin && l < this.minValue && (l = this.minValue), r = x.max, this.options.limitMax && r > this.maxValue && (r = this.maxValue), g = this.radius * this.options.radiusScale, x.height && (this.ctx.lineWidth = this.lineWidth * x.height, d = this.lineWidth / 2 * (x.offset || 1 - x.height), g = this.radius * this.options.radiusScale + d), this.ctx.strokeStyle = x.strokeStyle, this.ctx.beginPath(), this.ctx.arc(0, 0, g, this.getAngle(l), this.getAngle(r), !1), this.ctx.stroke();
                else void 0 !== this.options.customFillStyle ? i = this.options.customFillStyle(this) : null !== this.percentColors ? i = this.getColorForValue(this.displayedValue, this.options.generateGradient) : void 0 !== this.options.colorStop ? (i = 0 === this.options.gradientType ? this.ctx.createRadialGradient(m, s, 9, m, s, 70) : this.ctx.createLinearGradient(0, 0, m, 0), i.addColorStop(0, this.options.colorStart), i.addColorStop(1, this.options.colorStop)) : i = this.options.colorStart, this.ctx.strokeStyle = i, this.ctx.beginPath(), this.ctx.arc(m, s, p, (1 + this.options.angle) * Math.PI, t, !1), this.ctx.lineWidth = this.lineWidth, this.ctx.stroke(), this.ctx.strokeStyle = this.options.strokeColor, this.ctx.beginPath(), this.ctx.arc(m, s, p, t, (2 - this.options.angle) * Math.PI, !1), this.ctx.stroke(), this.ctx.save(), this.ctx.translate(m, s);
                for (this.options.renderTicks && this.renderTicks(this.options.renderTicks, m, s, p), this.ctx.restore(), this.ctx.translate(m, s), u = this.gp, o = 0, h = u.length; o < h; o++) e = u[o], e.update(!0);
                return this.ctx.translate(-m, -s)
            }, i
        }(e), i = function(t) {
            function i(t) {
                this.canvas = t, i.__super__.constructor.call(this), "undefined" != typeof G_vmlCanvasManager && (this.canvas = window.G_vmlCanvasManager.initElement(this.canvas)), this.ctx = this.canvas.getContext("2d"), this.setOptions(), this.render()
            }
            return m(i, t), i.prototype.lineWidth = 15, i.prototype.displayedValue = 0, i.prototype.value = 33, i.prototype.maxValue = 80, i.prototype.minValue = 0, i.prototype.options = {
                lineWidth: .1,
                colorStart: "#6f6ea0",
                colorStop: "#c0c0db",
                strokeColor: "#eeeeee",
                shadowColor: "#d5d5d5",
                angle: .35,
                radiusScale: 1
            }, i.prototype.getAngle = function(t) {
                return (1 - this.options.angle) * Math.PI + (t - this.minValue) / (this.maxValue - this.minValue) * (2 + this.options.angle - (1 - this.options.angle)) * Math.PI
            }, i.prototype.setOptions = function(t) {
                return null == t && (t = null), i.__super__.setOptions.call(this, t), this.lineWidth = this.canvas.height * this.options.lineWidth, this.radius = this.options.radiusScale * (this.canvas.height / 2 - this.lineWidth / 2), this
            }, i.prototype.set = function(t) {
                return this.value = this.parseValue(t), this.value > this.maxValue ? this.options.limitMax ? this.value = this.maxValue : this.maxValue = this.value : this.value < this.minValue && (this.options.limitMin ? this.value = this.minValue : this.minValue = this.value), AnimationUpdater.run(this.forceUpdate), this.forceUpdate = !1
            }, i.prototype.render = function() {
                var t, i, e, s;
                return t = this.getAngle(this.displayedValue), s = this.canvas.width / 2, e = this.canvas.height / 2, this.textField && this.textField.render(this), i = this.ctx.createRadialGradient(s, e, 39, s, e, 70), i.addColorStop(0, this.options.colorStart), i.addColorStop(1, this.options.colorStop), this.radius - this.lineWidth / 2, this.radius + this.lineWidth / 2, this.ctx.strokeStyle = this.options.strokeColor, this.ctx.beginPath(), this.ctx.arc(s, e, this.radius, (1 - this.options.angle) * Math.PI, (2 + this.options.angle) * Math.PI, !1), this.ctx.lineWidth = this.lineWidth, this.ctx.lineCap = "round", this.ctx.stroke(), this.ctx.strokeStyle = i, this.ctx.beginPath(), this.ctx.arc(s, e, this.radius, (1 - this.options.angle) * Math.PI, t, !1), this.ctx.stroke()
            }, i
        }(e), s = function(t) {
            function i() {
                return i.__super__.constructor.apply(this, arguments)
            }
            return m(i, t), i.prototype.strokeGradient = function(t, i, e, s) {
                var n;
                return n = this.ctx.createRadialGradient(t, i, e, t, i, s), n.addColorStop(0, this.options.shadowColor), n.addColorStop(.12, this.options._orgStrokeColor), n.addColorStop(.88, this.options._orgStrokeColor), n.addColorStop(1, this.options.shadowColor), n
            }, i.prototype.setOptions = function(t) {
                var e, s, n, o;
                return null == t && (t = null), i.__super__.setOptions.call(this, t), o = this.canvas.width / 2, e = this.canvas.height / 2, s = this.radius - this.lineWidth / 2, n = this.radius + this.lineWidth / 2, this.options._orgStrokeColor = this.options.strokeColor, this.options.strokeColor = this.strokeGradient(o, e, s, n), this
            }, i
        }(i), window.AnimationUpdater = {
            elements: [],
            animId: null,
            addAll: function(t) {
                var i, e, s, n;
                for (n = [], e = 0, s = t.length; e < s; e++) i = t[e], n.push(AnimationUpdater.elements.push(i));
                return n
            },
            add: function(t) {
                return AnimationUpdater.elements.push(t)
            },
            run: function(t) {
                var i, e, s, n, o;
                if (null == t && (t = !1), isFinite(parseFloat(t)) || !0 === t) {
                    for (e = !0, o = AnimationUpdater.elements, s = 0, n = o.length; s < n; s++) i = o[s], i.update(!0 === t) && (e = !1);
                    return AnimationUpdater.animId = e ? null : requestAnimationFrame(AnimationUpdater.run)
                }
                if (!1 === t) return !0 === AnimationUpdater.animId && cancelAnimationFrame(AnimationUpdater.animId), AnimationUpdater.animId = requestAnimationFrame(AnimationUpdater.run)
            }
        }, "function" == typeof window.define && null != window.define.amd ? define(function() {
            return {
                Gauge: n,
                Donut: s,
                BaseDonut: i,
                TextRenderer: a
            }
        }) : "undefined" != typeof module && null != module.exports ? module.exports = {
            Gauge: n,
            Donut: s,
            BaseDonut: i,
            TextRenderer: a
        } : (window.Gauge = n, window.Donut = s, window.BaseDonut = i, window.TextRenderer = a)
}).call(this);
(function() {
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
(function($, aConfig) {
    'use strict';

    var collapsedClassName = 'is-collapsed';

    var expand = function(parent) {
        parent.removeClass(collapsedClassName);
    };

    var collapse = function(parent) {
        parent.addClass(collapsedClassName);
    };


    $('.js-expand-block').on('click', function() {
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
(function($) {
    'use strict';

    var errorClass = 'is-error';


    var validateField = function(field) {
        return field.val() === '';
    };


    $('.form-block__element').on('keyup', function() {
        var field = $(this);

        if (validateField(field)) {
            field.addClass(errorClass);
        } else {
            field.removeClass(errorClass);
        }
    });


    $('.form-block').on('submit', function(e) {
        var form = $(this),
            inputs = form.find('input, textarea'),
            isError = false;

        inputs.each(function() {
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
(function($, window, aConfig) {
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

        init: function() {
            if (!Slider.isInit) {
                Slider.element.slick(Slider.options);
                Slider.isInit = true;
            }
        },

        destroy: function() {
            if (Slider.isInit) {
                Slider.element.slick('unslick');
            }
        }
    };

    if (Slider.element.length) {
        var init = function() {
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
(function($) {
    'use strict';

    $('.item__figure').on('touchstart', function() {
        $(this).addClass('is-hover');
    });

})(jQuery);
(function($) {
    'use strict';

    var selectedClassName = 'is-selected';


    /**
     * Show language list
     */
    $('.languages__selected').on('click', function() {
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
    $('.languages__link').on('click', function() {
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
    $('.languages__selected, .languages__link').on('click', function(e) {
        e.stopPropagation();
    });


    /**
     * Close language list when clicked not on language tags
     */
    $(document).on('click', function() {
        var langBlock = $('.languages');

        if (langBlock.hasClass(selectedClassName)) {
            langBlock.removeClass(selectedClassName);
        }
    });
})(jQuery);
(function($, window, aConfig) {
    'use strict';

    /*$('.js-logo').on('click', function(e) {
        $('[href="#aboutUs"]').trigger('click');

        e.preventDefault();
    });*/


})(jQuery, window, window.aConfig);
(function($, location) {
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
    $('.menu__link').on('shown.bs.tab', function(e) {
        var hash = $(e.target).attr('href');

        window.history.replaceState(hash, hash, hash);

        e.preventDefault();
    });
})(jQuery, location);
(function($) {
    'use strict';

    var NumberList = function(block) {
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
        init: function() {
            this.donut = new Donut(this.$block.get(0));
            this.donut.setOptions(this.options);

            this.donut.maxValue = 100;
            this.donut.setMinValue(0);
            this.donut.animationSpeed = 30;
            this.donut.set(this.getValue());
        },

        getValue: function() {
            return this.$block.data('number');
        }
    };


    var $numbers = $('.js-number');

    if ($numbers.length) {
        var initNumberList = function() {
            $numbers.each(function() {
                new NumberList(this);
            });
        };

        initNumberList();

        $('[href="#services"]').on('shown.bs.tab', function() {
            initNumberList();
        });
    }

})(jQuery);

(function($, window, aConfig) {
    'use strict';

    var stickyClassName = 'is-content-sticky',
        stickyAsideTopClassName = 'is-aside-top-sticky',
        stickyMobileMenuClassName = 'is-mobile-menu-sticky',
        html = $('html'),
        header = $('.header'),
        menu = $('.layout__menu'),
        aside = $('.layout__aside'),
        content = $('main.layout__wrapper');


    var updateMainContent = function() {
        if (!aConfig.isDesktop()) {
            header.css('transform', 'translate3d(0, 0, 0)');
            return;
        }

        var top = $(window).scrollTop() / 3 + 'px';

        header.css('transform', 'translate3d(0, ' + top + ', 0)');
    };


    var checkDistance = function() {
        var menuFromTop = content.offset().top - menu.height();

        if ($(window).scrollTop() >= menuFromTop) {
            html.addClass(stickyClassName);
        } else {
            html.removeClass(stickyClassName);
        }
    };


    var checkAside = function() {
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


    var stickMobileMenu = function() {
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


    var init = function() {
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

    $(window).on('scroll load resize', function() {
        init();
    });

})(jQuery, window, window.aConfig);
(function($) {
    'use strict';

    $('a[data-toggle="tab"]').on('touchstart', function() {
        var href = $(this).attr('href');

        $(href).tab('show');
    });

})(jQuery);
