(function () {
    angular.module('redeUi')
    .factory('CarouselItemFactory', CarouselItemFactory);

    CarouselItemFactory.$inject = ['$compile'];
    function CarouselItemFactory($compile) {
        return { 
            get: function (strItemType, objScope) {
                var strDirectiveAttribute = GetCarouselItemDirective(strItemType);
                var divCarouselItem = $compile('<div ' + strDirectiveAttribute + ' item="item"></div>')(objScope);
                return divCarouselItem;
            }
        }
        
        function GetCarouselItemDirective(strItemType) {
            switch (strItemType) {
                case 'video': return 'carousel-video-item';
                case 'image': return 'carousel-image-item';
                case 'text': return 'carousel-text-item';
                default: return 'carousel-' + strItemType + '-item';
            }
        }
    }
})();