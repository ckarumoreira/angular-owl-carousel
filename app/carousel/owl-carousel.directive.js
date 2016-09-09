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
                // autoplay variables
                bolAutoplay = undefined,
                objAutoplayInterval = undefined,
                bolAutoplayHoverPause = undefined,
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
                bolPullDrag = undefined,
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
                divContainer = element;
            
            // Start configuration.
            InitOwlConfig();

            // Create basic container elements.
            InitElements();

            // Apply templates and everything related to item config.
            InitItems(scope.items);

            // Enable navigation next/prev.
            InitNav();

            // Enable dragging.
            InitStage();

            // Load carousel.
            InitCarousel();

            // Enable navigation and indication by dots.
            InitDots();
            
            // Apply item size control. 
            InitItemSize();

            // Apply start position. 
            InitPosition();

            // Apply autoplay configuration.
            InitAutoplay();

            function InitItemSize() {
                // Set initial size of items.
                SetItemSize();

                // Resize elements to fit the viewport.
                angular.element($window).bind('resize', function(){
                    SetItemSize();
                    scope.$digest();
                });

                // Use viewport size to resize its elements.
                function SetItemSize() {
                    var intWindowWidth = $window.innerWidth,
                        intStagePaddingTotalSize = intStagePadding * 2,
                        intMarginTotalSize = intItemsOnScreen * intMarginPerItem;
                    
                    intOwlItemWidth = parseInt((intWindowWidth - intMarginTotalSize - intStagePaddingTotalSize) / intItemsOnScreen);
                    intOwlItemWholeWidth = intOwlItemWidth + intMarginPerItem;
                    intOwlStageWidth = intOwlItemWholeWidth * intItemCount;
                    
                    // Apply width on Stage and Children.
                    divOwlStage.css('width', intOwlStageWidth + 'px');
                    divOwlStage.children().css('width', intOwlItemWidth + 'px');
                    
                    // Translate tops to a third of an item.
                    if (bolPullDrag) {
                        intMaxTranslate = intOwlItemWholeWidth / 3;
                        intMinTranslate = intOwlItemWholeWidth * (intMaxItemWindow - (1/3)) - intOwlStageWidth;
                    } else {
                        intMaxTranslate = 0;
                        intMinTranslate = (intOwlItemWholeWidth * intMaxItemWindow) - intOwlStageWidth;
                    }

                    // Best position to apply the final translate (won't cut any item)
                    arrBestTranslate = [];
                    for (var intCounter = 0; intCounter < intItemCount; intCounter++) {
                        arrBestTranslate.push(intCounter * intOwlItemWholeWidth * -1);
                    }
                }
            }

            function InitPosition() {
                intPosition = intStartPosition - 1;
                MoveToItem(intPosition);
            }

            function InitOwlConfig() {
                bolEnableDots = scope.config.dots === true;
                bolEnableNav = scope.config.nav === true;
                bolAutoplayHoverPause = scope.config.autoplayHoverPause;
                bolAutoplay = scope.config.autoplay;
                intAutoplayTimeout = scope.config.autoplayTimeout;
                intAutoplaySpeed = scope.config.autoplaySpeed;
                intSlideBy = scope.config.slideBy;
                intMaxItemWindow = scope.config.items || 3;
                intStagePadding = scope.config.stagePadding || 0;
                intDotsEach = scope.config.dotsEach || intMaxItemWindow;
                intDotsSpeed = scope.config.dotsSpeed || 0.25;
                intMarginPerItem = scope.config.margin;
                bolPullDrag = scope.config.pullDrag;
                intDragEndSpeed = scope.config.dragEndSpeed || 0.25;
                arrNavText = scope.config.navText;
                intNavSpeed = scope.config.navSpeed || 0.25;
                bolEnableTouchDrag = scope.config.touchDrag === true;
                bolEnableMouseDrag = scope.config.mouseDrag === true;
                intStartPosition = scope.config.startPosition || 1;
                
                intItemsOnScreen = intItemCount < intMaxItemWindow ? intItemCount : intMaxItemWindow;
                intItemCount = scope.items.length;
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
                    var objItem = arrItems[intCounter],
                        divOwlItem = angular.element('<div class="owl-item"></div>')
                        divCarouselItem = undefined,
                        itemScope = scope.$new(true);

                    itemScope.item = objItem;
                    divCarouselItem = CarouselItemFactory.get(objItem.itemType, itemScope);
                    divOwlItem
                        .append(divCarouselItem)
                        .css('margin-right', intMarginPerItem);
                    divOwlStage.append(divOwlItem);
                }

                MarkActive(0, intMaxItemWindow);
            }

            function InitStage() {
                var bolDragging = false,
                    bolDragged = false,
                    intDragStart = 0,
                    intTranslateX = 0;

                divOwlStageOuter
                    .css({
                        'padding-left':  intStagePadding + 'px',
                        'padding-right': intStagePadding + 'px'
                    });

                if (bolEnableMouseDrag) {
                    divOwlStage.bind('mousedown', StartDrag);
                    divOwlStage.bind('mousemove', OnDrag);
                    divOwlStage.bind('mouseup', EndDrag);
                    divOwlStage.bind('mouseleave', EndDrag);
                }

                if (bolEnableTouchDrag) {
                    divOwlStage.bind('tapstart', StartDrag);
                    divOwlStage.bind('tapmove', OnDrag);
                    divOwlStage.bind('tapend', EndDrag);
                }


                function StartDrag(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    bolDragging = true;
                    intDragStart = event.screenX;
                    divOwlStage.css('transition', '0s');

                    if (bolAutoplay && bolAutoplayHoverPause) {
                        $window.clearInterval(objAutoplayInterval);
                    }
                }

                function OnDrag(event) {
                    var strTransform = divOwlStage.css('transform'),
                        strTranslateX = strTransform.split('('),
                        intDiff = intDragStart - (event.screenX || event.position.x || 0);
                    
                    event.preventDefault();
                    event.stopPropagation();

                    if (bolDragging) {
                        if (!bolDragged) {
                            bolDragged = true;
                            divContainer.addClass('owl-grab');
                        }

                        intTranslateX = strTranslateX.length > 1 ? parseInt(strTranslateX[1]) : 0;
                        intDragStart = event.screenX;

                        // Apply dragging restrictions.
                        if (intTranslateX > intMaxTranslate) {
                            intTranslateX = intMaxTranslate;
                        } else if (intTranslateX < intMinTranslate) {
                            intTranslateX = intMinTranslate;
                        } else {
                            intTranslateX -= intDiff;
                        }

                        // Apply drag.
                        divOwlStage.css('transform', 'translateX(' + intTranslateX + 'px)');
                        if (intTranslateX > 0) {
                            intTranslateX = 0;
                        }
                    }

                    if (bolAutoplay && bolAutoplayHoverPause) {
                        $window.clearInterval(objAutoplayInterval);
                    }
                }

                function EndDrag() {
                    if (bolAutoplayHoverPause) {
                        InitAutoplay();
                    }

                    if (bolDragging) {
                        var intTargetPosition = Math.abs(Math.round(intTranslateX / intOwlItemWholeWidth));

                        if (intTargetPosition > intItemCount - intMaxItemWindow) {
                            intTargetPosition = intItemCount - intMaxItemWindow;
                        }

                        // Apply the best translate.
                        MoveToItem(intTargetPosition, intDragEndSpeed);

                        // Reset values.    
                        bolDragging = false;
                        intDragStart = 0;
                        intTranslateX = 0;
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
                    divNavPrev.bind('click', MoveToPrevious)
                    divNavNext.bind('click', MoveToNext);

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

            function InitDots() {
                var strDivDotElement = '<div class="owl-dot"><span></span></div>',
                    intDotCount = Math.ceil(intItemCount / intDotsEach),
                    intActiveDot = Math.ceil(intPosition / intDotsEach),
                    divCurrentDot = undefined,
                    divActiveDot = undefined;
                
                if (bolEnableDots) {
                    for (var intCounter = 0; intCounter < intDotCount; intCounter++) {
                        divCurrentDot = angular.element(strDivDotElement);
                        divCurrentDot.data('dot-position', intCounter);
                        
                        divCurrentDot.bind('click', function () {
                            var divDot = angular.element(this),
                                intDotPosition = divDot.data('dot-position');
                            
                            MoveToItem(intDotsEach * intDotPosition, intDotsSpeed);
                        });
                        
                        divOwlDots.append(divCurrentDot);
                    }

                    divActiveDot = angular.element(divOwlDots.children()[intActiveDot]);
                    divActiveDot.addClass('active');
                }
            }

            function InitCarousel() {
                divOwlStageOuter.append(divOwlStage);

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
                if (bolAutoplay) {
                    objAutoplayInterval = setInterval(AutoplayMove, intAutoplayTimeout * 1000);
                }

                function AutoplayMove() {
                    var intMaxIndex = intItemCount - intItemsOnScreen;
                    intPosition += intSlideBy;

                    if (intPosition > intMaxIndex) {
                        intPosition = 0;
                    }

                    MoveToItem(intPosition, intAutoplaySpeed);
                }
            }

            function MarkActive(intActiveStartIndex, intActiveEndIndex) {
                var arrItems = divOwlStage.children(),
                    divOwlCurrentItem = undefined;

                for (var intCount = 0, intLength = arrItems.length; intCount < intLength; intCount++) {
                    divOwlCurrentItem = angular.element(arrItems[intCount]);
                    if (intCount >= intActiveStartIndex && intCount < intActiveEndIndex) {
                        divOwlCurrentItem.addClass('active');
                    } else {
                        divOwlCurrentItem.removeClass('active');
                    }
                }

                intPosition = intActiveStartIndex;
            }

            function MoveToItem(intTargetPosition, intSpeed) {
                var intTranslation = arrBestTranslate[intTargetPosition],
                    intActiveDot = Math.floor(intTargetPosition / intDotsEach),
                    divCurrentDot = undefined,
                    arrDivDots = divOwlDots.children();

                MarkActive(intTargetPosition, intTargetPosition + intItemsOnScreen);

                DragToPosition(intTranslation, (intSpeed || 0.25) + 's');

                intPosition = intTargetPosition;
                
                for (var intCounter = 0, intLength = arrDivDots.length; intCounter < intLength; intCounter++) {
                    divCurrentDot = angular.element(arrDivDots[intCounter]);
                    if (divCurrentDot.data('dot-position') == intActiveDot) {
                        divCurrentDot.addClass('active');
                    } else {
                        divCurrentDot.removeClass('active');
                    }
                }

                function DragToPosition(intPosition, strTransition) {
                    divOwlStage.css('transition', strTransition || '0s');
                    divOwlStage.css('transform', 'translateX(' + intPosition + 'px)');
                }
            }
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