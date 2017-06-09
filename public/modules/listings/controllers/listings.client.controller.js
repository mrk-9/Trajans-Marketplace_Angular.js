'use strict';

/*global $:false */

// Listings controller
angular.module('listings').controller('ListingsController', ['$scope', '$rootScope', '$modal', '$timeout', '$stateParams',
    '$location', 'Authentication', 'Listings', 'Uploads', 'Categories', 'Orders', 'Menus', 'Bitcoin', 'Search', 'toastr',
    'CategoryFactory', 'ListingsFactory', 'ImageFactory', 'Users', 'lodash', 'Uuid', 'Utilities', '$q', 'Subscription',
    function($scope, $rootScope, $modal, $timeout, $stateParams, $location, Authentication, Listings, Uploads, Categories,
             Orders, Menus, Bitcoin, Search, toastr, CategoryFactory, ListingsFactory, ImageFactory, Users, _, Uuid,
             Utilities, $q, Subscription) {
        if ($location.$$path.match('dashboard')) {
            Utilities.hideFooter();
            Utilities.scrollTop();
            Utilities.isDashboard();
        } else {
            Utilities.notDashboard();
            Utilities.scrollTop();
            Utilities.showFooter();
        }

        $scope.submitted = false;
        $scope.imageDeleted = false;
        $scope.primaryImageChanged = false;
        $scope.listing = {};
        $scope.listingService = Listings;
        $scope.imageService = Listings.images;
        $scope.images = [];
        $scope.authentication = Authentication;
        $scope.uploadedImages = [];
        $scope.user = Authentication.user;
        $scope.menus = Menus;
        $scope.amount = 1;
        $scope.buyNow = 'Add to basket';
        $scope.wishlist = 'Save to wishlist';
        $scope.condition = 'New';
        $scope.exchangeRate = 0;
        $scope.reviewHidden = false;
        $scope.multiple = 'false';
        $scope.shippingCostToggled = false;
        $scope.shippingOptions = [];
        $scope.shippingAdditionalCost = 0;
        $scope.shippingCost = 0;
        $scope.sliderInterval = 5000;
        $scope.uploadUrl = '/upload';
        $scope.uploadingCropped = false;
        $scope.keyFeatures = [];
        $scope.visibleListingImage = {};
        $scope.countries = [];
        $scope.shippingAreas = [];
        $scope.locationAreas = [];
        $scope.defaultAddress = {
            exists: false,
            address: Utilities.getFormattedUserAddress($scope.user)
        };

        // Remove All from categories.
        Categories.categories.query().$promise.then(function(response) {
            $scope.categories = _.rest(_.sortBy(response, function(cat) {
                return cat.title;
            }));
        });

        var uuid = Uuid.newUuid.query();
        uuid.$promise.then(function(data) {
            $scope.uuid = data.uuid;
        });

        $scope.isAuthenticated = function() {
            if (!$scope.user) $location.path('/signin');
        };

        $scope.currentSubscription = Subscription.subscription.query();
        $scope.currentSubscription.$promise.then(function(subscription) {
            $scope.user.subscription = subscription;
        });

        $rootScope.$on('dismissOrder', function(rootQuantityAvailable) {
            $scope.listing.quantityAvailable = rootQuantityAvailable;
        });

        //Dropzone config

        $scope.dropZoneConfig = {
            success: function(response) {
                $scope.images.push(response.data.doc);
            },
            addedfile: function() {
                $scope.imageAdded = true;
                $scope.$apply(function() {
                    $scope.uploadingImage = true;
                });
            },
            queuecomplete: function() {
                $scope.$apply(function() {
                    $scope.showMustSave = true;
                    $scope.uploadingImage = false;
                });
            }
        };

        if ($scope.user) {
            $scope.shippingInformation = $scope.user.shippingInformation;
            $scope.defaultReturns = true;
        }

        $scope.shippingLocations = ListingsFactory.getShippingLocations();
        /*TODO - Facebook App ID goes here for live environment*/
        $rootScope.facebookAppId = '[1571861203103317]';

        $scope.LoadEditableCategories = function(category, primary, secondary) {
            var primaryCategories;
            var secondaryCategories;
            var tertiaryCategories;

            if (primary) {
                primaryCategories = CategoryFactory.getPrimaryCategories(category);
                primaryCategories.$promise.then(function(data) {
                    $scope.primaryCategories = data.categories;
                });
            }
            if (secondary) {
                secondaryCategories = CategoryFactory.getSecondaryCategories(primary);
                secondaryCategories.$promise.then(function(data) {
                    $scope.secondaryCategories = data.categories;
                });
                tertiaryCategories = CategoryFactory.getTertiaryCategories(secondary);
                tertiaryCategories.$promise.then(function(data) {
                    $scope.tertiaryCategories = data.categories;
                });
            } else {
                if (primary) {
                    tertiaryCategories = CategoryFactory.getTertiaryCategories(primary);
                    tertiaryCategories.$promise.then(function(data) {
                        $scope.tertiaryCategories = data.categories;
                    });
                } else {
                    tertiaryCategories = CategoryFactory.getTertiaryCategories(category);
                    tertiaryCategories.$promise.then(function(data) {
                        $scope.tertiaryCategories = data.categories;
                    });
                }

            }
        };

        $scope.getListingsForUser = function() {
            Listings.userListings.query().$promise.then(function(listings) {
                $scope.userListings = listings;
                $rootScope.completedOrdersBuyer = 0;

                $scope.$watch('bitcoinExchangeRate', function(bitcoinExchangeRate) {
                    for (var i = 0; i < $scope.userListings.length; i++) {
                        var btcPriceToPay = $scope.userListings[i].priceFiat / $rootScope.bitcoinExchangeRate;
                        $scope.userListings[i].priceBTC = btcPriceToPay.toFixed(8);
                    }
                });

                $scope.featuredCount = 0;

                angular.forEach(listings, function(listing, key) {
                    if (listing.isFeatured) {
                        $scope.featuredCount++;
                    }
                });
            });
        };

        $scope.clearListingCaregories = function() {
            if ($scope.listing) {
                $scope.listing.primaryCategory = null;
                $scope.listing.secondaryCategory = null;
                $scope.listing.tertiaryCategory = null;
            }
        };

        $scope.mainCategoryChanged = function(category) {
            $scope.clearListingCaregories();
            $scope.primaryCategories = null;
            $scope.secondaryCategories = null;
            $scope.tertiaryCategories = null;
            $scope.getTertiary = null;
            $scope.chosenCategory = category;
            $scope.categories.forEach(function(foundCategory) {
                if (foundCategory.alias === $scope.chosenCategory) {
                    $scope.getTertiary = foundCategory.end;
                }
            });
            if ($scope.getTertiary) {
                $scope.getTertiaryCategories(category);
            } else {
                var primaryCategories = CategoryFactory.getPrimaryCategories(category);
                primaryCategories.$promise.then(function(data) {
                    $scope.primaryCategories = data.categories;
                    $scope.getTertiary = data.end;
                });
            }

        };

        $scope.primaryCategorySelected = function(category) {
            $scope.primaryCategory = category;
            $scope.secondaryCategories = null;
            $scope.tertiaryCategories = null;
            if ($scope.getTertiary) {
                $scope.getTertiaryCategories(category);
            } else {
                var secondaryCategories = CategoryFactory.getSecondaryCategories(category);
                secondaryCategories.$promise.then(function(data) {
                    if (data.end) {
                        $scope.getTertiaryCategories(category);
                    } else {
                        $scope.secondaryCategories = data.categories;
                        $scope.getTertiary = data.end;
                    }
                });
            }
        };

        $scope.secondaryCategorySelected = function(category) {
            $scope.secondaryCategory = category;
            $scope.tertiaryCategories = null;
            $scope.getTertiaryCategories(category);
        };

        $scope.getTertiaryCategories = function(category) {
            var tertiaryCategories = CategoryFactory.getTertiaryCategories(category);
            tertiaryCategories.$promise.then(function(data) {
                $scope.tertiaryCategories = data.categories;
            });
        };

        $scope.tertiaryCategorySelected = function(category) {
            $scope.tertiaryCategory = category;
        };

        $scope.removeImage = function(imageId) {
            $scope.imageDeleted = true;
            if (!$scope.disableDelete) {
                $scope.disableDelete = true;
                $scope.imageService.remove({
                    imageId: imageId,
                    listingId: $scope.listing._id
                }).$promise.then(function(response) {
                    if (response.success && !response.isImage) {
                        $scope.listing = response.data;
                        $scope.images = $scope.listing.images;
                        $('#' + imageId).fadeOut('slow', function() {
                            $scope.disableDelete = false;
                        });
                    } else if (response.isImage) {
                        $('#' + imageId).fadeOut('slow', function() {
                            $scope.disableDelete = false;
                        });
                    } else {
                        toastr.error(response.error);
                        $scope.disableDelete = false;
                    }
                });
            }
        };

        $scope.makePrimary = function(imageId) {
            var listing = $scope.listing;
            $scope.primaryImageChanged = true;
            $scope.imageService.save({
                imageId: imageId,
                listingId: listing._id
            }).$promise.then(function(data) {
                if (data.success) {
                    angular.forEach(listing.images, function(image, key) {
                        if (image._id === imageId) {
                            image.primaryImage = true;
                        } else {
                            image.primaryImage = false;
                        }
                    });
                }
            });
        };

        $scope.removeShippingMethod = function(shipping, index) {
            $scope.shippingOptions.splice(index, 1);
        };

        $scope.toggleShippingHelp = function() {
            $scope.shippingCostToggled = !$scope.shippingCostToggled;
        };

        $scope.createEditListingInit = function() {
            $scope.getAllCountries();
        };

        $scope.getAllCountries = function() {
            Listings.countries.query().$promise.then(function(countries) {
                if (_.isEmpty(countries)) {
                    toastr.error('Error retrieving shipping countries. Please contact support for help with this issue.');
                    return;
                }

                countries.forEach(function(country) {
                    var countryObject = {};

                    countryObject.countryName = country.name;
                    countryObject.countryCode = country.code;
                    countryObject.areas = country.areas;
                    $scope.countries.push(countryObject);
                });
            });
        };

        $scope.getShippingAreas = function(country, type) {
            if (!country) {
                $scope.shippingAreas = [];
                $scope.locationAreas = [];
                return;
            }

            // If not already empty - clear to ensure results are new
            if (type === 'shipping' && $scope.shippingAreas.length) {
                $scope.shippingAreas = [];
            }
            if (type === 'location' && $scope.locationAreas.length) {
                $scope.locationAreas = [];
            }

            country.areas.forEach(function(area) {
                var areaObject = {
                    id: area.geonameId,
                    name: area.name
                };

                if (area.isAllAreas) {
                    areaObject.name = '- All Areas, ' + area.name;
                }

                if (type === 'shipping') {
                    $scope.shippingAreas.push(areaObject);
                } else if (type === 'location') {
                    $scope.locationAreas.push(areaObject);
                }
            });
        };

        $scope.addShippingOption = function(shipping) {
            if (!shipping) {
                toastr.info('Select a shipping location...');
                return;
            }

            if (!shipping.country || !shipping.area) {
                toastr.error('You must select both a shipping country and area to add this as an option.');
                return;
            }

            var isExists = false;

            if (!_.isEmpty($scope.shippingOptions)) {
                // Loop through existing options and check it doesn't already exist
                _.forEach($scope.shippingOptions, function(option) {
                    if (option.area.id === shipping.area.id) {
                        isExists = true;
                    }
                });
            }

            if (isExists) {
                toastr.error('You have already added this shipping location - no need to add it again.');
                return;
            }

            var newShipping = {
                country: shipping.country,
                area: shipping.area,
                shippingAdditionalCost: shipping.shippingAdditionalCost || 0,
                shippingCost: shipping.shippingCost || 0
            };

            $scope.shippingOptions.push(newShipping);

            $scope.shipping.shippingAdditionalCost = 0;
            $scope.shipping.shippingCost = 0;
            $scope.shipping.country = '';
            $scope.shipping.area = '';
        };

        $scope.create = function() {
            $scope.submitted = true;

            //use for description validation, does'nt work without
            if (this.description !== undefined) {
                this.description = this.description.trim() === '' ? undefined : this.description;
            }
            
            if (!$scope.listingForm.$valid) {
                animateTop();
                toastr.warning('Form is not valid. Please specify all required fields.');
                return;
            }

            var needBuyerProtection = $scope.user.subscription &&
                ($scope.user.subscription.group !== 'Pro' || $scope.user.subscription.group === 'Business') &&
                !$scope.listing.offerBuyerProtection && !$scope.listing.offerBitcoinDirect;

            if (needBuyerProtection) {
                toastr.error('You must select buyer protection/bitcoin direct or both.');
                return;
            }

            if (_.isEmpty($scope.images)) {
                toastr.error('You must add at least one image.');
                return;
            }

            var itemLocation = $scope.defaultAddress.exists ? $scope.defaultAddress.address : this.itemLocation ? this.itemLocation.area.name + ', ' + this.itemLocation.country.countryName : '';

            var listing = new Listings.listing({
                name: this.name,
                sku: this.sku,
                priceFiat: this.price,
                offerBuyerProtection: $scope.listing.offerBuyerProtection,
                offerBitcoinDirect: $scope.listing.offerBitcoinDirect,
                category: this.category,
                primaryCategory: $scope.primaryCategory,
                secondaryCategory: $scope.secondaryCategory,
                tertiaryCategory: $scope.tertiaryCategory,
                keyFeatures: $scope.keyFeatures,
                description: this.description,
                multiple: this.multiple,
                condition: this.condition,
                quantityAvailable: this.quantityAvailable,
                shippingOptions: $scope.shippingOptions,
                etaDeliveryNational: $scope.listing.etaDeliveryNational,
                etaDeliveryInternational: $scope.listing.etaDeliveryInternational,
                shippingInformation: this.shippingInformation,
                itemLocation: itemLocation,
                defaultShippingInformation: this.defaultShippingInformation,
                images: _.map($scope.images, function(image) {
                    if (image._id) {
                        return image._id;
                    } else {
                        return image;
                    }
                })
            });

            listing.$save(function(listing) {
                var user = $scope.user;
                user.listing = listing;

                $location.path('listings/' + listing._id);
                $scope.name = '';
                $scope.priceUsd = '';
                $scope.category = '';
                $scope.multiple = '';
                $scope.itemWeight = '';
                $scope.quantityAvailable = '';
                $scope.shippingInformation = '';
                $scope.licence = '';
                $scope.cropModal(listing);
            }, function(errorResponse) {
                _.forEach(errorResponse.data.message.split('|'), function(err) {
                    if (err !== ' ') {
                        toastr.error(err);
                    }
                });
            });
        };

        // Remove existing Listing
        $scope.remove = function(listing) {
            if (listing) {
                listing.$remove();
                for (var i in $scope.listings) {
                    if ($scope.listings[i] === listing) {
                        $scope.listings.splice(i, 1);
                    }
                }
                var user = $scope.user;
                var userServiceRemove = new Users.removeListing(user);
                userServiceRemove.$remove({
                    userListingId: listing._id
                }, function(user) {
                    alert(user);
                });
            } else {
                $scope.listing.$remove(function() {
                    $location.path('/dashboard/home');
                });
            }
        };

        // Update existing Listing
        $scope.update = function() {
            if (!$scope.editListingForm.$valid) {
                animateTop();
                toastr.warning('Form is not valid. Please specify all required fields.');
                return;
            }

            if (!$scope.listing.offerBuyerProtection && !$scope.listing.offerBitcoinDirect) {
                toastr.error('You must select buyer protection/bitcoin direct or both.');
                return;
            }

            var listing = $scope.listing;

            if ($scope.oldPrice !== listing.priceFiat) listing.oldPriceFiat = $scope.oldPrice;

            if ($scope.itemLocation && $scope.itemLocation.country && $scope.itemLocation.area) {
                listing.itemLocation = $scope.itemLocation.area.name + ', ' + $scope.itemLocation.country.countryName;
            }

            if (!$scope.primaryImageChanged || $scope.imageDeleted || $scope.imageAdded) {
                listing.images = _.map($scope.images, function(image) {
                    if (image._id) {
                        return image._id;
                    } else {
                        return image;
                    }
                });
            } else {
                delete $scope.listing.images;
                delete $scope.listing.primaryImage;
            }

            if ($scope.imageAdded) listing.imagesDownloaded = false;

            listing.$update(function() {
                $location.path('listings/' + listing._id);
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Find a list of Listings
        $scope.find = function() {
            $scope.listings = Listings.listing.query();
        };

        // Find a list of Listings
        //Mark order shipped
        $scope.updateViewCount = function(listing) {
            var listingId = $stateParams.listingId;
            var listingService = new Listings.updateViewCount();
            listingService.$update({
                listingIdViewCount: listingId
            }, function(listing) {});
        };

        $scope.removeShippingMethodsEdit = function(shippingOptions) {
            $scope.shippingLocations = ListingsFactory.removeShippingOptions($scope.shippingLocations, shippingOptions);
        };

        // Find existing Listing
        $scope.findOne = function(page) {
            animateTop();

            $scope.createEditListingInit();
            $scope.isLoading = true;

            $scope.getListing = Listings.listing.get({
                listingId: $stateParams.listingId
            }).$promise.then(function(listing) {
                if (page === 'edit' && listing.user._id !== $scope.user._id) $location.path('/dashboard/home');

                if (page === 'edit' || page === 'crop') $scope.oldPrice = listing.priceFiat;

                $scope.listing = listing;

                if ($scope.listing.images.length) {
                    $scope.images = $scope.listing.images;

                    angular.forEach($scope.listing.images, function(image) {
                        if (listing.primaryImage._id === image._id) {
                            image.primaryImage = true;
                            $scope.visibleListingImage = image;
                        }
                    });

                    $scope.listingImage = $scope.listing.primaryImage;

                    $scope.cropOptions = {
                        selectedImage: listing.images[0],
                        imageResult: '',
                        showControls: true
                    };

                    if (page === 'crop') {
                        if (!listing.imagesDownloaded) $scope.downloadImagesToLocal();
                    }
                }

                $scope.getTotalOrders = Orders.totalSellerCompletedOrders.get({
                    sellerId: listing.user._id
                }).$promise.then(function(data) {
                    $scope.listing.user.totalTransactions = data.orderCount;
                });

                $scope.showSavingFunc([listing]);

                $scope.shippingOptions = listing.shippingOptions;

                $scope.removeShippingMethodsEdit($scope.shippingOptions);

                $scope.staticListingPrice = $scope.listing.priceFiat;

                if ($scope.authentication.user) {
                    if ($scope.authentication.user._id !== $scope.listing.user._id) {
                        $scope.reviewHidden = true;
                    }
                }

                if ($scope.listing.category) {
                    $scope.LoadEditableCategories(listing.category, listing.primaryCategory, listing.secondaryCategory, listing.tertiaryCategory);
                }

                if ($scope.listing.user.sellerRating) $scope.calculateSellerRating(listing.user.sellerRating);

                $scope.getRecommendedListings();

                $scope.isLoading = false;

                $scope.getReviews($scope.listing.user._id);

                $scope.getSubscriptionInfo($scope.listing.user._id);
            });
        };

        $scope.setAsLargeImage = function(img) {
            $scope.visibleListingImage = img;
        };

        $scope.toggleFeatured = function(listing) {
            var user = $scope.user;

            // if listing is currently featured - ensure that mainFeaturedListing is set to false
            // after removing featured status
            if (listing.featured) {
                listing.mainFeaturedListing = false;
            }

            var listingService = new Listings.listingFeatured({
                listingId: listing._id,
                featured: !listing.isFeatured,
                mainFeaturedListing: listing.mainFeaturedListing
            });
            listingService.$save(function(response) {

                $scope.listings = Listings.userListings.query();

                $scope.listings.$promise.then(function(listings) {
                    $scope.userListings = listings;
                    $scope.featuredCount = 0;
                    angular.forEach(listings, function(listing) {
                        if (listing.isFeatured) {
                            $scope.featuredCount++;
                        }
                    });
                    $scope.getFeaturedListings();
                });
            });
        };

        $scope.toggleActivation = function(listing) {

            var user = $scope.user;
            user.userListings = [];

            if (!listing.listingActive) {

                // Add Listing Reference to User
                user.listing = listing;

                // Connect listing to the user by adding it into the userListings field on the user model
                var userService = new Users.addListing(user);
                userService.$update({}, function(u) {
                    $rootScope.$broadcast('reloadHeader', true);
                });

            } else if (listing.listingActive) {

                var userServiceRemove = new Users.removeListing(user);
                userServiceRemove.$remove({
                    userListingId: listing._id
                }, function(u) {
                    $rootScope.$broadcast('reloadHeader', true);
                });

                // Remove featured flag
                if (listing.isFeatured) {
                    var listingService = new Listings.listingFeatured({
                        listingId: listing._id,
                        featured: false
                    });

                    listingService.$save(function(response) {
                        $scope.listings = Listings.userListings.query();
                        $scope.listings.$promise.then(function(listings) {
                            $scope.featuredCount = 0;
                            angular.forEach(listings, function(listing) {
                                if (listing.isFeatured) {
                                    $scope.featuredCount++;
                                }
                            });
                        });
                    });
                }
            }

            var listingServiceStatus = new Listings.listingsStatus({
                listingId: listing._id,
                listingActive: !listing.listingActive
            });
            listingServiceStatus.$save(function(response) {

                $scope.userListings = Listings.userListings.query();
                $scope.listings = $scope.userListings;
                $scope.user.userListings = $scope.userListings;
                $rootScope.completedOrdersBuyer = 0;

                $scope.$watch('bitcoinExchangeRate', function(bitcoinExchangeRate) {
                    for (var i = 0; i < $scope.userListings.length; i++) {
                        var btcPriceToPay = $scope.listings[i].priceFiat / $rootScope.bitcoinExchangeRate;
                        $scope.listings[i].priceBTC = btcPriceToPay.toFixed(8);
                    }
                });

            });

        };

        $scope.getFeaturedListings = function() {
            if (!$scope.user.featuredMerchant) {
                $location.path('/dashboard/home');
                return;
            }

            $scope.merchant = $scope.user;
            $scope.merchant.visibleListings = [];
            $scope.merchant.activeListings = 0;

            Listings.userListings.query().$promise.then(function(userListings) {
                var featured = ListingsFactory.getFeatured(userListings);

                $scope.merchant.visibleListings = featured;
                $scope.merchant.activeListings = userListings.length;
            });
        };

        $scope.setAsMainFeatured = function(listing) {
            if (!$scope.user.featuredMerchant) {
                $location.path('/dashboard/home');
                return;
            }

            Listings.listing.get({
                listingId: listing._id
            }).$promise.then(function(listing) {
                var mainFeaturedCount = 0;

                angular.forEach($scope.merchant.visibleListings, function(featuredListing) {
                    if (featuredListing.mainFeaturedListing) {

                        Listings.listing.get({
                            listingId: featuredListing._id
                        }).$promise.then(function(currentlyMain) {
                            currentlyMain.mainFeaturedListing = false;

                            currentlyMain.$update(function() {
                                listing.mainFeaturedListing = true;
                                listing.isFeatured = true;

                                listing.$update(function() {
                                    $scope.getFeaturedListings();
                                    $scope.getListingsForUser();
                                });

                            }, function(errorResponse) {
                                $scope.error = errorResponse.data.message;
                            });
                        }, function(errorResponse) {
                            $scope.error = errorResponse.data.message;
                        });

                        mainFeaturedCount++;
                    }

                    if (!mainFeaturedCount) {
                        listing.mainFeaturedListing = true;
                        listing.isFeatured = true;

                        listing.$update(function() {
                            $scope.getFeaturedListings();
                            $scope.getListingsForUser();
                        });
                    }
                });
            });
        };

        $scope.cropModal = function(listing) {
            var cropModal = $modal.open({
                templateUrl: 'modules/listings/views/includes/modal-crop.client.view.html',
                controller: 'ModalCropController',
                resolve: {
                    listing: function() {
                        return listing;
                    }
                }
            });
        };

        $scope.selectImageToCrop = function(img) {
            $scope.cropOptions.selectedImage = img;
        };

        $scope.changePrimarySrc = function(img) {
            var listing = $scope.listing;
            if (img.croppedPath) {
                listing.primaryImage = img.croppedPath;
            } else {
                listing.primaryImage = img.path;
            }
            listing.$update(function(listing) {}, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // download images from amazon s3 to local
        $scope.downloadImagesToLocal = function() {
            var listing = $scope.listing;

            $scope.downloading = true;

            angular.forEach(listing.images, function(img, key) {
                Uploads.downloadImage.query({
                    path: img.path
                }).$promise.then(function(img) {
                    // swap image with the one that's been downloaded which has localPath
                    listing.images[key] = img;

                    if (key === 0) $scope.selectImageToCrop(listing.images[0]);

                    // if final image downloaded
                    if (listing.images.length === key + 1) $scope.downloading = false;

                    listing.imagesDownloaded = true;
                });
            });

            $scope.listingService.listing.update({
                listingId: listing._id
            }, listing).$promise.then(function(listing) {}, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // Delete the images that have been downloaded
        $scope.deleteImagesFromLocal = function() {

            $scope.listing.imagesDownloaded = false;

            $scope.listingService.listing.update({
                listingId: $scope.listing._id
            }, $scope.listing).$promise.then(function(listing) {
                angular.forEach($scope.listing.images, function(img) {
                    Uploads.localImage.remove({
                        localPath: img.localPath
                    }).$promise.then(function(response) {});
                });
            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
            });
        };

        // if user navigates away to a different route, delete the local images.
        $scope.$on('$locationChangeStart', function(event, next, current) {
            if (current.match('crop')) {
                $scope.deleteImagesFromLocal();
            }
        });

        // gets the base64 from cropper, and sends the string 
        // to server to convert to image and upload to amazon s3 image store
        $scope.uploadCroppedImage = function() {

            var listing = $scope.listing;

            var upload = $scope.cropOptions.selectedImage;
            upload.base64 = $scope.cropOptions.imageResult.split(',')[1];

            if ($scope.cropOptions.imageResult.indexOf('image/jpeg') > -1) {
                upload.extension = '.jpg';
            } else {
                upload.extension = '.png';
            }

            $scope.uploadingCropped = true;

            var img = new Uploads.image(upload);
            img.$update({}, function(img) {

                if (img.data.image.path === listing.primaryImage || img.data.image.croppedPath === listing.primaryImage) {
                    $scope.changePrimarySrc(img);
                }

                angular.forEach(listing.images, function(i, key) {
                    if (i._id === upload._id) {
                        listing.images[key] = img.data.image;
                    }
                });

                $scope.uploadingCropped = false;

                toastr.success('Image cropped successfully.');

            }, function(errorResponse) {
                $scope.error = errorResponse.data.message;
                $scope.uploadingCropped = false;
            });

        };

        $scope.getRecommendedListings = function() {
            ListingsFactory.getRecommendedListings($scope.listing).then(function(recommendedListings) {
                $scope.recommendedListings = _.filter(recommendedListings, function(listing) {
                    return listing._id !== $scope.listing._id;
                });
                $scope.showSavingFunc($scope.recommendedListings);
            });
        };

        // Add to basket
        $scope.addToBasket = function() {
            ListingsFactory.addToBasket($scope.listing);
        };

        $scope.addToBasketRecommended = function(listing) {
            ListingsFactory.addToBasket(listing);
        };

        // Item location
        $scope.getLocation = function(value) {
            return Users.userSearch.query({
                location: value
            }).$promise.then(function(res) {
                return res;
            });
        };

        $scope.calculateSellerRating = function(rating) {
            if (rating.length) {
                var total = rating.reduce(function(previousValue, currentValue) {
                    return previousValue + currentValue;
                });
                $scope.sellerRating = Math.round(total / rating.length);
            } else {
                $scope.sellerRating = 0;
            }
        };

        $scope.getReviews = function(userId) {
            $scope.userReviews = Users.reviews.query({
                userIdForReviews: userId
            });
            $scope.userReviews.$promise.then(function(reviews) {
                $scope.allReviews = reviews;

                var totalRating = 0;
                angular.forEach(reviews, function(review) {
                    totalRating += review.rating;
                });
                if (totalRating) {
                    $scope.overallSellerRating = totalRating / reviews.length;
                    $scope.decimalScore = parseFloat($scope.overallSellerRating.toFixed(2));
                    $scope.starScore = parseInt($scope.overallSellerRating.toFixed());
                } else {
                    $scope.decimalScore = 0.00;
                    $scope.starScore = 0;
                }
            });
        };

        $scope.getSubscriptionInfo = function(userId) {
            $scope.getSubscriptionType = Users.currentSubscription.query({
                userId: userId
            });
            $scope.getSubscriptionType.$promise.then(function(plan) {
                $scope.usersPlan = plan[0];
            });
        };

        //report modal
        $scope.reportModal = function() {
            $scope.reportmodal = $modal.open({
                templateUrl: 'modules/core/views/reportlisting.client.view.html',
                controller: 'ReportlistingController'
            });
        };

        //close report modal;
        $rootScope.$on('closeReportModal', function() {
            $scope.reportmodal.close();
        });

        $scope.deleteListing = function(listing) {
            $scope.deleteListingModal = $modal.open({
                templateUrl: 'modules/listings/views/includes/delete-listing-modal.client.view.html',
                scope: $scope
            });
        };

        $scope.confirmDelete = function() {
            Listings.listing.delete({
                listingId: $scope.listing._id
            }).$promise.then(function() {
                $scope.deleteListingModal.close();
                $location.path('/dashboard/managelistings');
            });
        };

        $scope.dontDelete = function() {
            $scope.deleteListingModal.close();
        };

        $scope.showSavingFunc = function(listings) {
            angular.forEach(listings, function(listing) {
                if (listing.oldPriceFiat && listing.oldPriceFiat > listing.priceFiat) {
                    listing.showSaving = true;
                    listing.saving = listing.oldPriceFiat - listing.priceFiat;
                    listing.saving = listing.saving.toFixed(2);
                }
            });
        };

        function animateTop() {
            $('html, body').animate({
                scrollTop: 0
            }, 100);
        }
    }
]);
