(function () {
 
    // Method signature matching $.fn.each()'s, for easy use in the .each loop later.
    var initialize = function(i, el) {
        // el is the input element that we need to initialize a map for, jQuery-ize it,
        //  and cache that since we'll be using it a few times.
        var $input = $(el);

        // Create the map div and insert it into the page.
        var $map = $('<div>', {
            css: {
                width: '100%',
                height: '400px',
                position: 'relative'
            }
        }).insertAfter($input);

        // Attempt to parse the lat/long coordinates out of this input element.
        var latLong = parseLatLong(this.value);
        //The default zoom level
        var defaultZoomlevel = 14;
        //shoud we opt in in using the current location
        var useCurrentLocation = true;

        // If there was a problem attaining a lat/long from the input element's value,
        //  set it to a sensible default that isn't in the middle of the ocean.
        if (!latLong || !latLong.latitude || !latLong.longitude) {
            latLong = {
                latitude: 40.716948,
                longitude: -74.003563
            };
            //maybe it's create, and we can use current location to give him a heads up
            useCurrentLocation = true;
        } else {
            useCurrentLocation = false;
        }

        //Create a "Bing(r)(tm)" LatLong object representing our DBGeometry's lat/long
        var position = new Microsoft.Maps.Location(latLong.latitude, latLong.longitude);
        //Create Pushpin
        var pushpin = new Microsoft.Maps.Pushpin(position);
        var searchManager = null;
        var infoboxOptions = { width: 200, height: 100, showCloseButton: true, zIndex: 0, offset: new Microsoft.Maps.Point(10, 0), showPointer: true, title: 'Is it here?', description: 'its close to..' };
        var defaultInfobox = new Microsoft.Maps.Infobox(position, infoboxOptions);
        defaultInfobox.setOptions({ visible: true });

        var endDragDetails = function(e) {
            position = e.entity.getLocation();
            $input.val(position.latitude.toString() + "," + position.longitude.toString());
            updateInfoBox();
        };

        var updateInfoBox = function () {
            defaultInfobox.setOptions({ visible: true });
            defaultInfobox.setLocation(position);
            if (searchManager == null)
                Microsoft.Maps.loadModule('Microsoft.Maps.Search', { callback: initSearchManager });
            else
                reverseGeocodeRequest();

        };
        //create the request toReverse our location to something meaningful
        var reverseGeocodeRequest = function () {
            //some user data 
            var userData = { name: 'Maps Test User', id: 'XYZ' };
            //create a request with the current postion
            var request =
                {
                    location: position,
                    callback: onReverseGeocodeSuccess,
                    errorCallback: onReverseGeocodeFailed,
                    userData: userData
                };
            searchManager.reverseGeocode(request);
        };

       var onReverseGeocodeSuccess = function(result, userData) {
            if (result) {

                map.setView({ center: result.location, zoom: defaultZoomlevel });
                //update the info box
                var infoboxOptions = { description: result.name };
                defaultInfobox.setOptions(infoboxOptions);
            } else {
                alert('no Location found, try panning map');
            }
        };

        var onReverseGeocodeFailed = function(result, userData) {
            alert('Rev geocode failed');
        };

        //Initialize the map widget.
        //use your own credentials please
        var map = Microsoft.Maps.loadModule('Microsoft.Maps.Themes.BingTheme', {
            callback: function() {
                map = new Microsoft.Maps.Map($map[0], {
                    credentials: 'AqTvhJT1tKQjRwvP742mqvrE1cyVUlP-0TGW9iiS74d_GDkiEKxFwWC0cGlQnryr',
                    theme: new Microsoft.Maps.Themes.BingTheme(),
                    showBreadcrumb: true,
                    zoom: defaultZoomlevel
                });


                //if we opt in
                if (useCurrentLocation) {
                    //get currentlocation
                    var geoLocationProvider = new Microsoft.Maps.GeoLocationProvider(map);
                    //on sucess update the marker position
                    geoLocationProvider.getCurrentPosition(({ successCallback: function(object) { updateMarker(object.center); } }));
                } else {
                    updateMarker(position);

                }
                map.entities.push(defaultInfobox);

            }
        });
        var initSearchManager = function() {
            map.addComponent('searchManager', new Microsoft.Maps.Search.SearchManager(map));
            searchManager = map.getComponent('searchManager');
            reverseGeocodeRequest();
        };

      
        var updateMarker = function(updateEvent) {
            position = new Microsoft.Maps.Location(updateEvent.latitude, updateEvent.longitude);
            pushpin.setLocation(position);
            map.entities.push(pushpin);
            //  // This new location might be outside the current viewport, especially
            //  //  if it was manually entered. Pan to center on the new marker location.
            map.setView({ center: position, zoom: defaultZoomlevel });
            $input.val(position.latitude.toString() + "," + position.longitude.toString());
            updateInfoBox();
        };

        //// If the input came from an EditorFor, initialize editing-related events.
        if ($input.hasClass('editor-for-dbgeography')) {

            //Make the pushpin draggable
            pushpin.setOptions({ draggable: true });

            //Add the drag event end
            Microsoft.Maps.Events.addHandler(pushpin, 'dragend', endDragDetails);
            //  Attempt to react to user edits in the input field.
            $input.on('change', function() {
                var latLong = parseLatLong(this.value);
                updateMarker(latLong);
            });
        }

    };

    var parseLatLong = function(value) {
        if (!value) {
            return undefined;
        }

        var latLong = value.match(/-?\d+\.\d+/g);

        return {
            latitude: latLong[0],
            longitude: latLong[1]
        };
    };

    // Find all DBGeography inputs and initialize maps for them.
    $('.editor-for-dbgeography, .display-for-dbgeography').each(initialize);
})();

