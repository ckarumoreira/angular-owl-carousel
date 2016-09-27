(function () {
    angular.module('redeUi')
    .directive('carouselVideoItem', CarouselVideoItemDirective);
    
    CarouselVideoItemDirective.$inject = ['$window', '$compile'];
    function CarouselVideoItemDirective ($window, $compile) {
        return {
            restrict: 'A',
            scope: {
                item: '='
            },
            template: '<img ng-src="{{ thumbnail }}" display="title" />',
            link: function (scope, element, attrs, controller) {
                var divTemplate = element,
                    divTitleHolder = undefined;
                
                scope.url = scope.item.url;
                scope.thumbnail = scope.item.thumbnail;
                scope.display = scope.item.display;

                divTitleHolder = angular.element($compile('<div class="title-holder" ng-bind="display"></div>')(scope));

                divTemplate.bind('click', Click);
                divTemplate.bind('mousemove', StartHover);
                divTemplate.bind('mouseleave', EndHover);

                divTemplate.append(divTitleHolder);
                divTitleHolder.css({
                    'display': 'none',
                    'position': 'absolute',
                    'top': 0,
                    'left': 0,
                    'right': 0,
                    'bottom': 0,
                    'background': '#777',
                    'color': '#fff',
                    'padding': '25px',
                    'text-align': 'center',
                    'font-size': '32px',
                    'transition': '0.5s',
                    'font-family': 'sans-serif'
                });

                angular.element($window).bind('resize', function() {
                    EndHover();
                    divTitleHolder.css('display', 'none');
                });

                function EndHover() {
                    var intHeight = divTemplate.prop('offsetHeight');
                    divTitleHolder.css({
                        'display': 'block',
                        'transform': 'translateY(' + intHeight + 'px)'
                    });

                    if (navigator.userAgent.indexOf('MSIE') !== -1 && parseInt(navigator.userAgent.split('MSIE')[1]) < 10) {
                        divTitleHolder.css('display', 'none');
                    }
                }

                function StartHover() {
                    divTitleHolder.css({
                        'display': 'block',
                        'transform': 'translateY(0px)'
                    });
                }

                function Click() {
                    var divItem = divTemplate.parent(),
                        divOwlStage = divItem.parent(),
                        divOwlStageOuter = divOwlStage.parent(),
                        divContainer = divOwlStageOuter.parent();

                    if (!divContainer.hasClass('owl-grab')) {
                        scope.item.action();
                    }
                }
            }
        }
    }
})();