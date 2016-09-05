(function () {
    angular.module('main')
    .directive('owlCarousel', CarouselDirective);

    function CarouselDirective () {

        function CarouselLink(scope, element, attrs, controller) {
            scope.$watch('items', function () {
                scope.refreshItems();
            });
            
            scope.initialize();
            scope.refreshItems();
        }

        CarouselController.$inject = ['$element', '$scope', 'CarouselItemFactory'];
        function CarouselController($element, $scope, CarouselItemFactory) {
            var carousel = $($element);
            if (!carousel.hasClass('owl-carousel')) {
                carousel.addClass('owl-carousel');
            }

            // init owl carousel via jquery plugin
            $scope.initialize = function () {
                carousel.owlCarousel($scope.config);
            }

            // 
            $scope.refreshItems = function () {
                for (var i = 0; i < $scope.items.length; i++) {
                    var itemScope = $scope.$new(true);
                    itemScope.item = $scope.items[i];
                    var carouselItem = CarouselItemFactory.get('video', itemScope, $scope.config);
                    carousel.owlCarousel('add', carouselItem);
                }
                carousel.owlCarousel('update');
            }
        }

        return {
            restrict: 'C',
            scope: {
                config: '=',
                items: '=',
                clickItem: '='
            },
            controller: CarouselController,
            link: CarouselLink
        };
    }
})();

