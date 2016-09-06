(function () {
    angular.module('redeUi')
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
                intMaxItemWindow = scope.config.items || 3,
                intStagePadding = scope.config.stagePadding || 0,
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

            intPosition = (scope.config.startPosition || 1) - 1;
            MoveToItem(intPosition);

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
                    bolPullDrag = scope.config.pullDrag,
                    intStagePaddingTotalSize = intStagePadding * 2,
                    intMarginTotalSize = intItemsOnScreen * intMarginPerItem;
                
                intCarouselItemWidth = parseInt((intWindowWidth - intMarginTotalSize - intStagePaddingTotalSize) / intItemsOnScreen);
                intItemWholeWidth = intCarouselItemWidth + intMarginPerItem;
                intStageWidth = intItemWholeWidth * intItemCount;
                
                // Apply width on Stage and Children.
                divOwlStage.css('width', intStageWidth + 'px');
                divOwlStage.children().css('width', intCarouselItemWidth + 'px');
                
                // Translate tops to a third of an item.
                if (bolPullDrag) {
                    intMaxTranslate = intItemWholeWidth / 3;
                    intMinTranslate = intItemWholeWidth * (intMaxItemWindow - (1/3)) - intStageWidth;
                } else {
                    intMaxTranslate = 0;
                    intMinTranslate = (intItemWholeWidth * intMaxItemWindow) - intStageWidth;
                }

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

                divOwlStageOuter
                    .css({
                        'padding-left':  intStagePadding + 'px',
                        'padding-right': intStagePadding + 'px'
                    });

                if (scope.config.mouseDrag === true) {
                    divOwlStage.bind('mousedown', StartDrag);
                    divOwlStage.bind('mousemove', OnDrag);
                    divOwlStage.bind('mouseup', EndDrag);
                    divOwlStage.bind('mouseleave', EndDrag);
                }

                if (scope.config.touchDrag === true) {
                    divOwlStage.bind('tapstart', StartDrag);
                    divOwlStage.bind('tapmove', OnDrag);
                    divOwlStage.bind('tapend', EndDrag);
                }


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
                        var strTransform = divOwlStage.css('transform'),
                            strTranslateX = strTransform.split('('),
                            intDiff = intDragStart - (event.screenX || event.position.x);

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
                    var intDragEndSpeed = scope.config.dragEndSpeed || 0.25;

                    if (bolDragging) {
                        var intTargetPosition = Math.abs(Math.round(intTranslateX / intItemWholeWidth));

                        if (intTargetPosition > intItemCount - intMaxItemWindow) {
                            intTargetPosition = intItemCount - intMaxItemWindow;
                        }

                        // Apply the best translate.
                        MoveToItem(intTargetPosition, intDragEndSpeed);

                        // Reset values.    
                        divContainer.removeClass('owl-grab');
                        bolDragging = false;
                        intDragStart = 0;
                        intTranslateX = 0;
                    }
                }
            }

            function InitNav() {
                var divNavPrev = angular.element('<div class="owl-prev"></div>'),
                    divNavNext = angular.element('<div class="owl-next"></div>'),
                    arrNavText = scope.config.navText,
                    intSlideBy = scope.config.slideBy,
                    intNavSpeed = scope.config.navSpeed || 0.25;

                if (scope.config.nav) {
                    if (arrNavText && arrNavText instanceof Array && arrNavText.length == 2) {
                        divNavNext.text(scope.config.navText[0]);
                        divNavPrev.text(scope.config.navText[1]);
                    } else {
                        divNavNext.text('next');
                        divNavPrev.text('prev');
                    }
                        
                    divNavPrev.bind('click', MoveToPrevious)
                    divNavNext.bind('click', MoveToNext);

                    divOwlNav
                        .append(divNavPrev)
                        .append(divNavNext);
                } else {
                    divOwlNav.addClass('disabled');
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
                    intDotsSpeed = scope.config.dotsSpeed || 0.25,
                    divCurrentDot = undefined,
                    divActiveDot = undefined;

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

            function DragToPosition(intPosition, strTransition) {
                divOwlStage.css('transition', strTransition || '0s');
                divOwlStage.css('transform', 'translateX(' + intPosition + 'px)');
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