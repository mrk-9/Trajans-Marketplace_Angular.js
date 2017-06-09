module.exports = {
    lib: {
        css: [
            'public/lib/bootstrap/dist/css/bootstrap.css',
            'public/css/icomoon.css',
            'public/lib/textAngular/dist/textAngular.css',
            'public/lib/angular-loading-bar/src/loading-bar.css',
            'public/lib/swiper/src/idangerous.swiper.css',
            'public/lib/angular-toastr/dist/angular-toastr.min.css',
            'public/lib/dropzone/dist/min/dropzone.min.css',
            'public/custom/ng-image-cropper/dist/angular-image-cropper.min.css',
            'public/lib/angular-typewriter/typewriter.css',
            'public/custom/angular-bootstrap-colorpicker/css/colorpicker.min.css',
            'public/lib/angularjs-slider/dist/rzslider.min.css'
        ],
        js: [
            'public/lib/dropzone/dist/dropzone.js',
            'public/lib/jquery/dist/jquery.min.js',
            'public/assets/js/bootstrap.min.js',
            'public/lib/angular/angular.js',
            'public/lib/angular-resource/angular-resource.js',
            'public/lib/angular-scroll/angular-scroll.js',
            'public/lib/angular-cookies/angular-cookies.js',
            'public/lib/angular-animate/angular-animate.js',
            'public/lib/angular-touch/angular-touch.js',
            'public/lib/angular-sanitize/angular-sanitize.js',
            'public/lib/angular-ui-router/release/angular-ui-router.js',
            'public/lib/angular-route/angular-route.js',
            'public/lib/angular-ui-utils/ui-utils.js',
            'public/lib/angular-bootstrap/ui-bootstrap-tpls.js',
            'public/lib/ng-flow/dist/ng-flow.js',
            'public/lib/flow.js/dist/flow.js',
            'public/lib/angular-truncate/src/truncate.js',
            'public/lib/textAngular/dist/textAngular-rangy.min.js',
            'public/lib/textAngular/dist/textAngular-sanitize.min.js',
            'public/lib/textAngular/dist/textAngular.min.js',
            'public/lib/angular-loading-bar/src/loading-bar.js',
            'public/lib/owl-carousel/owl.carousel.js',
            'public/lib/angular-socket-io/socket.js',
            'public/lib/socket.io-client/socket.io.js',
            'public/lib/angular-utils-pagination/dirPagination.js',
            'public/lib/moment/min/moment.min.js',
            'public/lib/angular-momentjs/angular-momentjs.min.js',
            'public/lib/swiper/src/idangerous.swiper.js',
            'public/lib/swiper-scrollbar/dist/idangerous.swiper.scrollbar.min.js',
            'public/lib/angulike/angulike.js',
            'public/lib/angular-toastr/dist/angular-toastr.min.js',
            'public/lib/angular-moment/angular-moment.min.js',
            'public/lib/ng-lodash/build/ng-lodash.min.js',
            'public/lib/angular-typewriter/typewriter.js',
            'public/lib/ngSelect/ngSelect.min.js',
            'public/lib/angular-clipboard/angular-clipboard.js',
            'public/custom/angular-bootstrap-colorpicker/js/bootstrap-colorpicker-module.min.js',
            'public/custom/ng-image-cropper/dev/js/angular-image-cropper/module.js',
            'public/custom/ng-image-cropper/dev/js/angular-image-cropper/constants.js',
            'public/custom/ng-image-cropper/dev/js/angular-image-cropper/factories/helper.js',
            'public/custom/ng-image-cropper/dev/js/angular-image-cropper/factories/cropper.js',
            'public/custom/ng-image-cropper/dev/js/angular-image-cropper/directives/directive.js',
            'public/lib/angular-deckgrid/angular-deckgrid.js',
            'public/lib/ngInfiniteScroll/build/ng-infinite-scroll.min.js',
            'public/lib/angularjs-slider/dist/rzslider.min.js'
        ]
    },
    css: [
        'public/modules/**/css/*.css'
    ],
    js: [
        'public/config.js',
        'public/application.js',
        'public/modules/*/*.js',
        'public/modules/*/*[!tests]*/*.js'
    ],
    tests: [
        'public/lib/angular-mocks/angular-mocks.js',
        'public/modules/*/tests/*.js'
    ]
};
