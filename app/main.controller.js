(function () { 
    angular.module('redeUi')
    .controller('MainCtrl', MainController);

    MainController.$inject = ['$scope'];
    function MainController($scope) {
        $scope.videos = [
            new Video('https://www.youtube.com/watch?v=1', 'carousel/img/300x150.png', '1'),
            new Video('https://www.youtube.com/watch?v=2', 'carousel/img/300x150.png', '2'),
            new Video('https://www.youtube.com/watch?v=3', 'carousel/img/300x150.png', '3'),
            new Video('https://www.youtube.com/watch?v=4', 'carousel/img/300x150.png', '4'),
            new Video('https://www.youtube.com/watch?v=5', 'carousel/img/300x150.png', '5'),

            new Video('https://www.youtube.com/watch?v=6', 'carousel/img/300x150.png', '6'),
            new Video('https://www.youtube.com/watch?v=7', 'carousel/img/300x150.png', '7'),
            new Video('https://www.youtube.com/watch?v=8', 'carousel/img/300x150.png', '8'),
            new Video('https://www.youtube.com/watch?v=9', 'carousel/img/300x150.png', '9'),
            new Video('https://www.youtube.com/watch?v=10', 'carousel/img/300x150.png', '10'),
            
            new Video('https://www.youtube.com/watch?v=11', 'carousel/img/300x150.png', '11'),
            new Video('https://www.youtube.com/watch?v=12', 'carousel/img/300x150.png', '12'),
            new Video('https://www.youtube.com/watch?v=13', 'carousel/img/300x150.png', '13'),
            new Video('https://www.youtube.com/watch?v=14', 'carousel/img/300x150.png', '14'),
            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '15')
        ];  

        $scope.carouselConfig = {
            items: 7,
            margin: 15,
            slideBy: 2,
            dots: true,
            dotsEach: 7,
            nav: true,
            stagePadding: 0,
            startPosition: 5,
            dotsSpeed: 0.5,
            navSpeed: 0.5,
            dragEndSpeed: 1,
            mouseDrag: true,
            touchDrag: true,
            autoplay: false,
            pullDrag: false,
            autoplaySpeed: 2,
            autoplayTimeout: 5,
            autoplayHoverPause: true,
            navText: ['proximo', 'anterior']
        };
    }

    function Video(url, thumbnail, display, duration) {
        this.itemType = 'video';    
        
        this.url = url;
        this.thumbnail = thumbnail;
        this.display = display;
        this.duration = duration;
    }
})();