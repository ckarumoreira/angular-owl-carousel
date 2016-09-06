(function () {
    angular.module('redeUi')
    .directive('carouselVideoItem', CarouselVideoItemDirective);
    
    CarouselVideoItemDirective.$inject = ['$window', '$compile'];
    function CarouselVideoItemDirective ($window, $compile) {
        return {
            restrict: 'A',
            scope: {
                url: '=',
                thumbnail: '=',
                display: '='
            },
            template: '<img ng-src="{{ thumbnail }}" display="title" />',
            link: function (scope, element, attrs, controller) {
                var divItem = element,
                    divOwlStage = divItem.parent(),
                    divTitleHolder = angular.element($compile('<div class="title-holder" style="display: none;">{{ display }}</div>')(scope)),
                    divOwlStageOuter = divOwlStage.parent(),
                    divContainer = divOwlStageOuter.parent();

                divItem.bind('click', Click);
                divItem.bind('mousemove', StartHover);
                divItem.bind('mouseleave', EndHover);

                divItem.append(divTitleHolder);
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

                function EndHover() {
                    var intHeight = divItem.prop('offsetHeight');
                    divTitleHolder.css({
                        'display': 'block',
                        'transform': 'translateY(' + intHeight + 'px)'
                    });
                }

                function StartHover() {
                    divTitleHolder.css({
                        'display': 'block',
                        'transform': 'translateY(0px)'
                    });
                }

                function Click() {
                    if (!divContainer.hasClass('owl-grab')) {
                        $window.open(scope.url, '_blank');
                    }
                }
            }
        }
    }
})();