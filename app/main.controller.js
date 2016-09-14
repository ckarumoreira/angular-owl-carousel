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

            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '15'),
            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '16'),
            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '17'),
            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '18'),
            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '19'),
            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '20'),
            new Video('https://www.youtube.com/watch?v=15', 'carousel/img/300x150.png', '21')
        ];  

        $scope.carouselConfig = {
            items: 7,
            margin: 15,
            slideBy: 7,
            dots: true,
            dotsEach: 7,
            nav: true,
            stagePadding: 0,
            startPosition: 1,
            dotsSpeed: 500,
            navSpeed: 500,
            dragEndSpeed: 1000,
            mouseDrag: true,
            touchDrag: true,
            pullDrag: true,
            autoplay: true,
            autoplaySpeed: 2000,
            autoplayTimeout: 5000,
            autoplayHoverPause: true,
            responsive: {
                0: {
                    items: 1,
                    slideBy: 1,
                    dotsEach: 1
                },
                300: {
                    items: 2,
                    slideBy: 2,
                    dotsEach: 2
                },
                500: {
                    items: 3,
                    slideBy: 3,
                    dotsEach: 3
                },
                700: {
                    items: 4,
                    slideBy: 4,
                    dotsEach: 4
                },
                900: {
                    items: 5,
                    slideBy: 5,
                    dotsEach: 5
                }
            },
            navText: ['proxima', 'anterior']
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