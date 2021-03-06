(function () {
    angular.module('redeUi')
    .directive('owlCarousel', OwlCarouselDirective);

    OwlCarouselDirective.$inject = ['CarouselItemFactory', '$window'];
    function OwlCarouselDirective(CarouselItemFactory, $window) {
        var divOwlStageOuter, divOwlStage, divOwlNav, divOwlDots, divControls;

        function OwlCarouselLink (scope, element, attrs, controller) {
                // size variables
            var intOwlItemWidth = undefined,
                intOwlItemWholeWidth = undefined,
                intOwlStageWidth = undefined,
                intStagePadding = undefined,
                intMarginPerItem = undefined,
                objResponsiveConfig = undefined,
                // autoplay variables
                bolEnableAutoplay = undefined,
                objAutoplayInterval = undefined,
                bolEnableAutoplayHoverPause = undefined,
                intAutoplayTimeout = undefined,
                intAutoplaySpeed = undefined,
                // count variables
                intSlideBy = undefined,
                intItemCount = undefined,
                intMaxItemWindow = undefined,
                // dots variables
                bolEnableDots = undefined,
                intDotsEach = undefined,
                intDotsSpeed = undefined,
                // drag variables
                bolEnableTouchDrag = undefined,
                bolEnableMouseDrag = undefined,
                bolEnablePullDrag = undefined,
                intMaxTranslate = undefined,
                intMinTranslate = undefined,
                intDragEndSpeed = undefined,
                intItemsOnScreen = undefined,
                // nav variables
                bolEnableNav = undefined,
                arrNavText = undefined,
                intNavSpeed = undefined,
                // position variables
                intStartPosition = undefined,
                intPosition = 0,
                arrBestTranslate = [],
                // elements
                divContainer = element;

            // Start configuration
            InitOwlConfig();

            // Create basic container elements
            InitElements();

            // Apply templates and everything related to item config
            InitItems(scope.items);

            // Enable dragging
            InitStage();

            // Enable navigation next/prev
            InitNav();

            // Load carousel
            InitCarousel();

            // Enable navigation and indication by dots
            InitDots();
            
            // Apply item size control 
            InitItemSize();

            // Apply start position 
            InitPosition();

            // Apply autoplay configuration
            InitAutoplay();

            function InitOwlConfig() {

                try {
                    // features
                    bolEnableDots =               GetConfigValue(scope.config.dots, scope.config.dots === true, true);
                    bolEnableNav =                GetConfigValue(scope.config.nav, scope.config.nav === true, true);
                    bolEnableAutoplay =           GetConfigValue(scope.config.autoplay, scope.config.autoplay === true, false);
                    bolEnableTouchDrag =          GetConfigValue(scope.config.touchDrag, scope.config.touchDrag === true, true);
                    bolEnableMouseDrag =          GetConfigValue(scope.config.mouseDrag, scope.config.mouseDrag === true, true);
                    bolEnablePullDrag =           GetConfigValue(scope.config.pullDrag, scope.config.pullDrag === true, false);
                    bolEnableAutoplayHoverPause = GetConfigValue(scope.config.autoplayHoverPause, scope.config.autoplayHoverPause === true, false);
                    // speed
                    intDotsSpeed =                GetConfigValue(scope.config.dotsSpeed, scope.config.dotsSpeed, 250);
                    intDragEndSpeed =             GetConfigValue(scope.config.dragEndSpeed, scope.config.dragEndSpeed, 250);
                    intNavSpeed =                 GetConfigValue(scope.config.navSpeed, scope.config.navSpeed, 250);
                    intAutoplaySpeed =            GetConfigValue(scope.config.autoplaySpeed, scope.config.autoplaySpeed, 250);
                    // 
                    intMaxItemWindow =            GetConfigValue(scope.config.items, scope.config.items, 3);
                    intDotsEach =                 GetConfigValue(scope.config.dotsEach, scope.config.dotsEach, intMaxItemWindow);
                    intStartPosition =            GetConfigValue(scope.config.startPosition, scope.config.startPosition, 1);
                    intAutoplayTimeout =          GetConfigValue(scope.config.autoplayTimeout, scope.config.autoplayTimeout, 5000);
                    intSlideBy =                  GetConfigValue(scope.config.slideBy, scope.config.slideBy, 1);
                    intStagePadding =             GetConfigValue(scope.config.stagePadding, scope.config.stagePadding, 0);
                    intMarginPerItem =            GetConfigValue(scope.config.margin, scope.config.margin, 0);
                    //
                    arrNavText =                  GetConfigValue(scope.config.navText, scope.config.navText, [ 'next', 'prev' ]);
                    objResponsiveConfig =         GetConfigValue(scope.config.responsive, scope.config.responsive, {});
                    
                    intItemCount = typeof scope.items === undefined ? 0 : scope.items.length;  
                    intItemsOnScreen = intItemCount < intMaxItemWindow ? intItemCount : intMaxItemWindow;
                } catch (err) {
                    console.log('ERR: error during initialization', err);
                }

                function GetConfigValue(config, configValue, defaultValue) { 
                    if (typeof config === 'undefined') {
                        return defaultValue;
                    }
                    return configValue;
                }
            }

            function InitItemSize() {
                // Set initial size of items
                SetItemSize();

                // Resize elements to fit the viewport
                angular.element($window).bind('resize', function(){
                    SetItemSize();
                    MoveToItem(intPosition, 1);
                    scope.$digest();
                });

                // Use viewport size to resize its elements
                function SetItemSize() {
                    var intWindowWidth = $window.innerWidth;

                    if (typeof intWindowWidth === 'undefined') {
                        intWindowWidth = window.document.documentElement.clientWidth;
                    }

                    // Set responsive configuration
                    if (objResponsiveConfig) {
                        for (var intSize in objResponsiveConfig) {
                            if (objResponsiveConfig.hasOwnProperty(intSize) && intWindowWidth >= intSize) {
                                ApplyResponsiveConfig(objResponsiveConfig[intSize]);
                            }
                        }
                    }
                    
                    // Calculating widths
                    ApplySizes();
                    
                    // Translate tops to a third of an item
                    DefineTranslateLimits();

                    // Best position to apply the final translate (won't cut any item)
                    CreateBestTranslation();

                    function ApplySizes() {
                        var intMarginTotalSize = intItemsOnScreen * intMarginPerItem,
                            intStagePaddingTotalSize = intStagePadding * 2;
                        
                        intOwlItemWidth = parseInt((intWindowWidth - intMarginTotalSize - intStagePaddingTotalSize) / intItemsOnScreen);
                        intOwlItemWholeWidth = intOwlItemWidth + intMarginPerItem;
                        intOwlStageWidth = intOwlItemWholeWidth * intItemCount;

                        divOwlStage.css('width', intOwlStageWidth + 'px');
                        divOwlStage.children().css('width', intOwlItemWidth + 'px');
                    }

                    function DefineTranslateLimits() {
                        if (bolEnablePullDrag) {
                            intMaxTranslate = intOwlItemWholeWidth / 3;
                            intMinTranslate = (intOwlItemWholeWidth * (intMaxItemWindow - (1/3))) - intOwlStageWidth;
                        } else {
                            intMaxTranslate = 0;
                            intMinTranslate = (intOwlItemWholeWidth * intMaxItemWindow) - intOwlStageWidth;
                        }
                    }

                    function CreateBestTranslation() {
                        arrBestTranslate = [];
                        for (var intCounter = 0; intCounter < intItemCount; intCounter++) {
                            arrBestTranslate.push(intCounter * intOwlItemWholeWidth * -1);
                        }
                    }

                    function ApplyResponsiveConfig(responsiveConfig) {
                        var intResponsiveItems = responsiveConfig.items,
                            intResponsiveSlideBy = responsiveConfig.slideBy,
                            intResponsiveDotsEach = responsiveConfig.dotsEach;

                        if (typeof intResponsiveItems !== undefined) {
                            intMaxItemWindow = intResponsiveItems;
                            intItemsOnScreen = intItemCount < intMaxItemWindow ? intItemCount : intMaxItemWindow;
                        }

                        if (typeof intResponsiveSlideBy !== undefined) {
                            intSlideBy = intResponsiveSlideBy;
                        }

                        if (typeof intResponsiveDotsEach !== undefined) {
                            intDotsEach = intResponsiveDotsEach;
                            InitDots();
                        }
                    }
                }
            }

            function InitPosition() {
                intPosition = intStartPosition - 1;
                MoveToItem(intPosition);
            }

            function InitElements() {
                divOwlStageOuter = angular.element('<div class="owl-stage-outer"></div>');
                divOwlStage = angular.element('<div class="owl-stage"></div>');
                divOwlNav = angular.element('<div class="owl-nav"></div>');
                divOwlDots = angular.element('<div class="owl-dots"></div>');
                divControls = angular.element('<div class="owl-controls"></div>');
            }

            function InitItems(arrItems) {
                for (var intCounter = 0, intSize = arrItems.length; intCounter < intSize; intCounter++) {
                    CreateItem(arrItems[intCounter], scope.$new(true));
                }

                function CreateItem(objItem, itemScope) {
                    var divOwlItem = angular.element('<div class="owl-item"></div>'),
                        divCarouselItem = undefined;

                    // Init scope with item data.
                    itemScope.item = objItem;
                    
                    // Generate carousel item.
                    divCarouselItem = CarouselItemFactory.get(objItem.itemType, itemScope);

                    // Append to templated item to owl-item.
                    divOwlItem
                        .append(divCarouselItem)
                        .css('margin-right', intMarginPerItem + 'px');

                    // Append owl-item to stage.
                    divOwlStage.append(divOwlItem);
                }
            }

            function InitStage() {
                var bolDragging = false,
                    bolDragged = false,
                    intDragStart = 0,
                    intTranslateX = 0;

                // Apply left-right-padding.
                divOwlStageOuter
                    .css({
                        'padding-left':  intStagePadding + 'px',
                        'padding-right': intStagePadding + 'px'
                    });

                // Init mouse events.
                if (bolEnableMouseDrag) {
                    divOwlStage
                        .bind('mousedown', StartDrag)
                        .bind('mousemove', OnDrag)
                        .bind('mouseup', EndDrag)
                        .bind('mouseleave', EndDrag);
                }

                if (!IsInternetExplorer(10)) {
                    divOwlStage
                        .css('-ms-filter', '"progid:DXImageTransform.Microsoft.Matrix(M11=1, M12=0, M21=0, M22=1, SizingMethod=' + "'auto expand'" + ')";');
                }

                // Init touch events.
                if (bolEnableTouchDrag) {
                    divOwlStage
                        .bind('tapstart', StartDrag)
                        .bind('tapmove', OnDrag)
                        .bind('tapend', EndDrag);
                }

                function GetCurrentTranslation() {
                    var strTransform = divOwlStage.css('transform'),
                        strMarginLeft = divOwlStage.css('margin-left'),
                        strTranslateX = strTransform ? strTransform.split('(') : undefined,
                        intTranslationNumber = undefined;

                    if (!IsInternetExplorer(10)) {
                        // IE translation.
                        intTranslationNumber = typeof strMarginLeft !== 'undefined' ? parseInt(strMarginLeft) : 0;
                    } else {
                        // Other browsers translation.
                        intTranslationNumber = strTranslateX.length > 1 ? parseInt(strTranslateX[1]) : 0;
                    }

                    return intTranslationNumber;
                }

                function StartDrag(event) {
                    // Event prevention and stop propagation
                    event.stopPropagation();
                    event.preventDefault();

                    // Actual Drag Start event
                    bolDragging = true;
                    intDragStart = event.screenX || event.position.x || 0;
                    intTranslateX = GetCurrentTranslation();
                    divOwlStage.css('transition', '0s');
                }

                function OnDrag(event) {
                    // Event prevention and stop propagation
                    event.preventDefault();
                    event.stopPropagation();

                    // Actual On Drag
                    if (bolDragging) {
                        Grab();
                        DragTranslation(GetCurrentTranslation(), event.screenX || event.position.x || 0);
                    }

                    // Autoplay pause.
                    if (bolEnableAutoplay && bolEnableAutoplayHoverPause) {
                        $window.clearInterval(objAutoplayInterval);
                    }

                    function Grab() {
                        if (!bolDragged) {
                            bolDragged = true;
                            divContainer.addClass('owl-grab');
                        }
                    }

                    function DragTranslation(intCurrentPosition, intDraggedPosition) {
                        var intDragDistance = intDragStart - intDraggedPosition;
                        intDragStart = intDraggedPosition;

                        // Apply dragging restrictions.
                        if (intCurrentPosition > intMaxTranslate) {
                            intCurrentPosition = intMaxTranslate;
                        } else if (intCurrentPosition < intMinTranslate) {
                            intCurrentPosition = intMinTranslate;
                        } else {
                            intCurrentPosition -= intDragDistance;
                        }

                        // Apply drag.
                        if (!IsInternetExplorer(10)) {
                            divOwlStage.css('margin-left', intCurrentPosition + 'px');
                        } else {
                            divOwlStage.css('transform', 'translateX(' + intCurrentPosition + 'px)');
                        }

                        intTranslateX = intCurrentPosition;
                    }
                }

                function EndDrag() {
                    // Autoplay restart
                    if (bolEnableAutoplayHoverPause) {
                        InitAutoplay();
                    }
                    
                    // Actual Drag End
                    if (bolDragging) {
                        MoveToItem(GetBestTranslationPosition(), intDragEndSpeed);
                        Release();
                    }

                    function GetBestTranslationPosition() {
                        var intTargetPosition = undefined;

                        if (typeof intTranslateX !== 'undefined') {
                            intTargetPosition = Math.abs(Math.round(intTranslateX / intOwlItemWholeWidth));

                            if (intTargetPosition > intItemCount - intMaxItemWindow) {
                                intTargetPosition = intItemCount - intMaxItemWindow;
                            }
                        }

                        return intTargetPosition;
                    }

                    function Release() {
                        bolDragging = false;
                        intDragStart = undefined;
                        intTranslateX = undefined;

                        if (bolDragged) {
                            $window.setTimeout(function () {
                                divContainer.removeClass('owl-grab');
                                bolDragged = false;
                            }, 10);
                        }
                    }
                }
            }

            function InitNav() {
                var divNavPrev = angular.element('<div class="owl-prev"></div>'),
                    divNavNext = angular.element('<div class="owl-next"></div>');

                if (bolEnableNav) {
                    InitNavText();
                    InitNavEvents();

                    divOwlNav
                        .append(divNavPrev)
                        .append(divNavNext);
                } else {
                    divOwlNav.addClass('disabled');
                }

                function InitNavText() {
                    if (arrNavText && arrNavText instanceof Array && arrNavText.length == 2) {
                        divNavNext.text(arrNavText[0]);
                        divNavPrev.text(arrNavText[1]);
                    } else {
                        divNavNext.text('next');
                        divNavPrev.text('prev');
                    }
                }

                function InitNavEvents() {
                    divNavPrev.bind('click', MoveToPrevious)
                    divNavNext.bind('click', MoveToNext);

                    function MoveToNext (event) {
                        var intMaxPosition = intItemCount - intItemsOnScreen;
                        intPosition += intSlideBy;
                        
                        if (intPosition > intMaxPosition) {
                            intPosition = intMaxPosition;
                        }

                        MoveToItem(intPosition, intNavSpeed);
                        event.preventDefault();
                    }

                    function MoveToPrevious (event) {
                        intPosition -= intSlideBy;

                        if (intPosition < 0) {
                            intPosition = 0;
                        }

                        MoveToItem(intPosition, intNavSpeed);
                        event.preventDefault();
                    }
                }
            }

            function InitDots() {
                var intDotCount = Math.ceil(intItemCount / intDotsEach);

                divOwlDots.empty();
                
                if (bolEnableDots) {
                    for (var intCounter = 0; intCounter < intDotCount; intCounter++) {
                        CreateDot(intCounter);
                    }
                }

                function CreateDot(intDotNumber) {
                    var divCurrentDot = angular.element('<div class="owl-dot"><span></span></div>');
                    
                    divCurrentDot.data('dot-position', intDotNumber);
                    divCurrentDot.bind('click', OnDotClick);
                    divOwlDots.append(divCurrentDot);

                    function OnDotClick() {
                        var intDotPosition = angular.element(this).data('dot-position');    
                        MoveToItem(intDotsEach * intDotPosition, intDotsSpeed);
                    }
                }
            }

            function InitCarousel() {
                divOwlStageOuter
                    .append(divOwlStage);

                divControls
                    .append(divOwlNav)
                    .append(divOwlDots);

                divContainer
                    .append(divOwlStageOuter)
                    .append(divControls);

                divContainer
                    .addClass('owl-loaded')
                    .addClass('owl-theme');
            }

            function InitAutoplay() {
                if (bolEnableAutoplay) {
                    objAutoplayInterval = setInterval(AutoplayMove, intAutoplayTimeout);
                }

                function AutoplayMove() {
                    if (intPosition > (intItemCount - intItemsOnScreen)) {
                        intPosition = 0;
                    }
                    
                    intPosition += intSlideBy;
                    MoveToItem(intPosition, intAutoplaySpeed);
                }
            }

            function MoveToItem(intTargetPosition, intSpeed) {
                var intTranslation = arrBestTranslate[intTargetPosition],
                    intActiveDot = Math.floor(intTargetPosition / intDotsEach),
                    arrDivDots = divOwlDots.children();

                ActivateItems(intTargetPosition, intTargetPosition + intItemsOnScreen);
                TranslateXAxisTo(intTranslation, (intSpeed || 250) + 'ms');
                intPosition = intTargetPosition;
                
                for (var intCounter = 0, intLength = arrDivDots.length; intCounter < intLength; intCounter++) {
                    UpdateDot(arrDivDots[intCounter]);
                }

                function UpdateDot(divDot) {
                    var divCurrentDot = angular.element(divDot);
                    if (divCurrentDot.data('dot-position') == intActiveDot) {
                        divCurrentDot.addClass('active');
                    } else {
                        divCurrentDot.removeClass('active');
                    }
                }

                function ActivateItems(intStartIndex, intEndIndex) {
                    var arrItems = divOwlStage.children();

                    for (var intCount = 0; intCount < intItemCount; intCount++) {
                        UpdateItem(arrItems[intCount]);
                    }

                    function UpdateItem(divItem) {
                        var divOwlCurrentItem = angular.element(divItem);

                        if (intCount >= intStartIndex && intCount < intEndIndex) {
                            divOwlCurrentItem.addClass('active');
                        } else {
                            divOwlCurrentItem.removeClass('active');
                        }
                    }
                }

                function TranslateXAxisTo(intXAxis, strTransitionSpeed) {
                    divOwlStage.css('transition', strTransitionSpeed || '0s');
                    if (!IsInternetExplorer(10)) {
                        divOwlStage.css('margin-left', intXAxis + 'px');
                    } else {
                        divOwlStage.css('transform', 'translateX(' + intXAxis + 'px)');
                    }
                }
            }
        }

        // Check if browser is Internet Explorer (or if is this version or greater).
        function IsInternetExplorer(intVersion) {
            var bolIsInternetExplorer = $window.navigator.userAgent.indexOf('MSIE') !== -1,
                bolFilterVersion = typeof intVersion !== 'undefined',
                intInternetExplorerVersion = undefined;

            if (bolIsInternetExplorer && bolFilterVersion) {
                intInternetExplorerVersion = parseInt(navigator.userAgent.split('MSIE')[1]);
                return intInternetExplorerVersion >= intVersion;
            }

            return bolIsInternetExplorer;
        }

        return {
            restrict: 'C',
            scope: {
                items: '=',
                config: '='
            },
            link: OwlCarouselLink
        }
    }
})();