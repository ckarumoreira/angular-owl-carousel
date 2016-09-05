(function () {
    angular.module('main')
    .directive('owlCarousel', OwlCarouselDirective);

    OwlCarouselDirective.$inject = ['CarouselItemFactory', '$window'];
    function OwlCarouselDirective(CarouselItemFactory, $window) {
        var divOwlStageOuter, divOwlStage, divOwlNav, divOwlDots;

        function OwlCarouselLink (scope, element, attrs, controller) {
            var intCarouselItemWidth = undefined,
                intItemWholeWidth = undefined,
                intStageWidth = undefined,
                intMaxTranslate = undefined,
                intMinTranslate = undefined,
                arrBestTranslate = [],
                intPosition = 0,
                divContainer = element,
                intItemCount = scope.items.length,
                intMaxItemWindow = scope.config.items,
                intDotsEach = scope.config.dotsEach || intMaxItemWindow,
                intItemsOnScreen = intItemCount < intMaxItemWindow ? intItemCount : intMaxItemWindow;
            
            // Create basic container elements.
            divOwlStageOuter = angular.element('<div class="owl-stage-outer"></div>');
            divOwlStage = angular.element('<div class="owl-stage"></div>');
            divOwlNav = angular.element('<div class="owl-nav"></div>');
            divOwlDots = angular.element('<div class="owl-dots"></div>');

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
            
            // Set initial size of items.
            SetItemSize();

            // Resize elements to fit the viewport.
            angular.element($window).bind('resize', function(){
                SetItemSize();
                scope.$digest();
            });

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

            function SetItemSize() {
                var intWindowWidth = $window.innerWidth,
                    intMarginPerItem = scope.config.margin,
                    intMarginTotalSize = intItemsOnScreen * intMarginPerItem;
                
                intCarouselItemWidth = parseInt((intWindowWidth - intMarginTotalSize) / intItemsOnScreen);
                intItemWholeWidth = intCarouselItemWidth + intMarginPerItem;
                intStageWidth = intItemWholeWidth * intItemCount;
                
                // Apply width on Stage and Children.
                divOwlStage.css('width', intStageWidth + 'px');
                divOwlStage.children().css('width', intCarouselItemWidth + 'px');
                
                // Translate tops to a third of an item.  
                intMaxTranslate = intItemWholeWidth / 3;
                intMinTranslate = (intItemWholeWidth * (intMaxItemWindow - (1/3))) - intStageWidth;

                // Best position to apply the final translate (won't cut any item)
                arrBestTranslate = [];
                for (var intCounter = 0; intCounter < intItemCount; intCounter++) {
                    arrBestTranslate.push(intCounter * intItemWholeWidth * -1);
                }
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
                        .css('margin-right', scope.config.margin);
                    divOwlStage.append(divOwlItem);
                }

                MarkActive(0, scope.config.items);
            }

            function InitStage() {
                var bolDragging = false,
                    intDragStart = 0,
                    intTranslateX = 0;

                divOwlStage.bind('mousedown', StartDrag);
                divOwlStage.bind('mousemove', OnDrag);
                divOwlStage.bind('mouseup', EndDrag);
                divOwlStage.bind('mouseleave', EndDrag);

                function StartDrag(event) {
                    event.stopPropagation();
                    event.preventDefault();
                    bolDragging = true;
                    intDragStart = event.screenX;
                    divContainer.addClass('owl-grab');
                    divOwlStage.css('transition', '0s');
                }

                function OnDrag(event) {
                    event.preventDefault();
                    if (bolDragging) {
                        var strTransform = divOwlStage.css('transform');
                        var strTranslateX = strTransform.split('(');
                        var intDiff = intDragStart - event.screenX;
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
                }

                function EndDrag() {
                    if (bolDragging) {
                        var intTargetPosition = Math.abs(Math.round(intTranslateX / intItemWholeWidth));

                        if (intTargetPosition > intItemCount - intMaxItemWindow) {
                            intTargetPosition = intItemCount - intMaxItemWindow;
                        }

                        // Apply the best translate.
                        MoveToItem(intTargetPosition);

                        // Reset values.    
                        divContainer.removeClass('owl-grab');
                        bolDragging = false;
                        intDragStart = 0;
                        intTranslateX = 0;
                    }
                }
            }

            function InitNav() {
                if (scope.config.nav) {
                    var navPrev = angular.element('<div class="owl-prev">prev</div>'),
                        navNext = angular.element('<div class="owl-next">next</div>');
                        
                    navPrev.bind('click', MoveToPrevious)
                    navNext.bind('click', MoveToNext);

                    divOwlNav
                        .append(navPrev)
                        .append(navNext);
                } else {
                    divOwlNav.addClass('disabled');
                }
                
                function MoveToNext (event) {
                    if (intPosition < intItemCount - intItemsOnScreen) {
                        intPosition++;
                    }

                    MoveToItem(intPosition);
                    event.preventDefault();
                }

                function MoveToPrevious (event) {
                    if (intPosition > 0) {
                        intPosition--;
                    }

                    MoveToItem(intPosition);
                    event.preventDefault();
                }
            }

            function InitDots() {
                var strDivDotElement = '<div class="owl-dot"><span></span></div>',
                    intDotCount = Math.ceil(intItemCount / intDotsEach),
                    intActiveDot = Math.ceil(intPosition / intDotsEach),
                    divCurrentDot = undefined,
                    divActiveDot = undefined;

                for (var intCounter = 0; intCounter < intDotCount; intCounter++) {
                    divCurrentDot = angular.element(strDivDotElement);
                    divCurrentDot.data('dot-position', intCounter);
                    divCurrentDot.bind('click', function () {
                        var divDot = angular.element(this),
                            intDotPosition = divDot.data('dot-position');
                        
                        MoveToItem(intDotsEach * intDotPosition);
                    });
                    
                    divOwlDots.append(divCurrentDot);
                }

                divActiveDot = angular.element(divOwlDots.children()[intActiveDot]);
                divActiveDot.addClass('active');
            }

            function InitCarousel() {
                divOwlStageOuter.append(divOwlStage);

                divContainer
                    .append(divOwlStageOuter)
                    .append(divOwlNav)
                    .append(divOwlDots);

                divContainer
                    .addClass('owl-loaded')
                    .addClass('owl-theme');
            }

            function DragToPosition(intPosition, transition) {
                divOwlStage.css('transition', transition || '0s');
                divOwlStage.css('transform', 'translateX(' + intPosition + 'px)');
            }

            function MoveToItem(intTargetPosition) {
                var intTranslation = arrBestTranslate[intTargetPosition],
                    intActiveDot = Math.floor(intTargetPosition / intDotsEach),
                    divCurrentDot = undefined,
                    arrDivDots = divOwlDots.children();

                MarkActive(intTargetPosition, intTargetPosition + intItemsOnScreen);

                DragToPosition(intTranslation, '0.25s');

                intPosition = intTargetPosition;
                
                for (var intCounter = 0, intLength = arrDivDots.length; intCounter < intLength; intCounter++) {
                    divCurrentDot = angular.element(arrDivDots[intCounter]);
                    if (divCurrentDot.data('dot-position') == intActiveDot) {
                        divCurrentDot.addClass('active');
                    } else {
                        divCurrentDot.removeClass('active');
                    }
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