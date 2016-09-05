(function () { 
    angular.module('main')
    .controller('MainCtrl', MainController);

    MainController.$inject = ['$scope'];
    function MainController($scope) {
        $scope.videos = [
            new Video('https://www.youtube.com/watch?v=1', 'http://placehold.it/200x100', '1'),
            new Video('https://www.youtube.com/watch?v=2', 'http://placehold.it/300x150', '2'),
            new Video('https://www.youtube.com/watch?v=3', 'http://placehold.it/250x125', '3'),
            new Video('https://www.youtube.com/watch?v=4', 'http://placehold.it/350x175', '4'),
            new Video('https://www.youtube.com/watch?v=5', 'http://placehold.it/400x200', '5'),

            new Video('https://www.youtube.com/watch?v=6', 'http://placehold.it/200x100', '6'),
            new Video('https://www.youtube.com/watch?v=7', 'http://placehold.it/300x150', '7'),
            new Video('https://www.youtube.com/watch?v=8', 'http://placehold.it/150x75', '8'),
            new Video('https://www.youtube.com/watch?v=9', 'http://placehold.it/250x125', '9'),
            new Video('https://www.youtube.com/watch?v=10', 'http://placehold.it/350x175', '10'),
            
            new Video('https://www.youtube.com/watch?v=11', 'http://placehold.it/150x75', '11'),
            new Video('https://www.youtube.com/watch?v=12', 'http://placehold.it/200x100', '12'),
            new Video('https://www.youtube.com/watch?v=13', 'http://placehold.it/250x125', '13'),
            new Video('https://www.youtube.com/watch?v=14', 'http://placehold.it/300x150', '14'),
            new Video('https://www.youtube.com/watch?v=15', 'http://placehold.it/350x175', '15')
        ];  

        $scope.carouselConfig = {
            items: 7,
            margin: 15,
            dots: true,
            dotsEach: 7,
            nav: true
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