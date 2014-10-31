

L.mapbox.accessToken = 'pk.eyJ1IjoiZ2VyYWxkYmF1ZXIiLCJhIjoic091TFBNOCJ9.LV4KlBAqm0thFqeW60cwEQ';


var BeerMap = {};

BeerMap.create = function( opts )
{
  var $breweryList;
  var place;
  var url;
  var map;


  var BREWERY_TYPES = {
    'berwery (l)': 1,   // NOTE: number (int) used for sort order
    'brewery (m)': 2,
    'brewery': 3,
    'brewpub': 4
  };

  var COUNTER_CLASS_NAMES = {
    'berwery (l)': 'counter-brewery-l',
    'brewery (m)': 'counter-brewery-m',
    'brewery':     'counter-brewery',
    'brewpub':     'counter-brewpub',
  };

  var MARKER_ICONS = {
   'berwery (l)': { className: 'icon-brewery-l', size: [40,40]},
   'brewery (m)': { className: 'icon-brewery-m', size: [30,30]},
   'brewery':     { className: 'icon-brewery',   size: [20,20]},
   'brewpub':     { className: 'icon-brewpub',   size: [20,20]},
  };

  function debug( msg ) {
    // console.log( "[debug] " + msg );
  }

  function init( opts )
  {
    $breweryList = $('#brewery-list');

    place = opts['place'];           // use AT - austria for now
    url   = opts['url'];

    map = L.mapbox.map('map', 'examples.map-i86nkdio', { scrollWheelZoom: false } );
    map.setView( place.latLng, place.zoom );

    readJSON( url, function( json ) {
        setupMap( json );
        setupBreweryList();
     });
  } // fn init


  function setupMap( json ) {
    debug( "before sortGeoJSON" );
    sortGeoJSON( json );

    debug( "before setGeoJSON" );
    map.featureLayer.setGeoJSON( json );   // NOTE: assume it's synchronous
    debug( "after setGeoJSON" );

    var i=0;
    map.featureLayer.eachLayer( function( layer ) {
      i+=1;
      var props = layer.toGeoJSON().properties;
      var icon  = MARKER_ICONS[ props['type'] ];

      layer.setIcon(
                L.divIcon({
                   // Specify a class name we can refer to in CSS.
                   className: icon.className,
                   // Set a markers width and height.
                   iconSize: icon.size,
                   // Define what HTML goes in each marker.
                   html: ""+i,
               }));
     });

    ///////////////////////////
    // - show popup on hover
    map.featureLayer.on('mouseover', function(e) {
      e.layer.openPopup();
    });
    map.featureLayer.on('mouseout', function(e) {
      e.layer.closePopup();
    });

    //////////////////////////////////
    // - pan on click
    map.featureLayer.on('click', function(e) {
        // check zoom level before setZoom
        debug( "map.getZoom():" + map.getZoom());
        if( map.getZoom() < 10 ) {
          map.setZoom( 10 );
        }
        map.panTo( e.layer.getLatLng() );
    });
  } // fn setupMap


  function setupBreweryList() {
     // first entry - Austria Overview (for "reset" zoom level and center)  
     var item = document.createElement('li');
     item.innerHTML = place.title + " (Overview)";
     item.onclick = function() {
       map.setView( place.latLng, place.zoom );
     };
     $breweryList.append( item );

      var i=0;
      var lastState = null;

      map.featureLayer.eachLayer( function(layer) {
          i+=1;

          var props = layer.toGeoJSON().properties;

          var state = props['state'];
          if( lastState !== state ) {
            // add state header
            //   todo: add click handler to use centroid point for state!!!!
            var item = document.createElement('li');
            item.innerHTML = state;
            $breweryList.append( item );
            lastState = state;
          }
 
          var counterClassName = COUNTER_CLASS_NAMES[ props['type'] ];

          var item = document.createElement('li');
          item.innerHTML = "<span class='"+ counterClassName +"'>"+i + "</span> "
                             + props['title']
                             + "<br><span class='desc'>" + props['description'] + "</span>";
          // debug( "layer marker item:" + props['title'] );
         
          item.onclick = function() {
            // check zoom level before setZoom
             var mapZoom = map.getZoom();
             if( mapZoom < 10 ) {   // zoom in if clicked (and not alreay zoomed in)
               mapZoom = 10;
             }
             map.setView(layer.getLatLng(), mapZoom);
             layer.openPopup();
          };
          $breweryList.append( item );
      });
  }

  function compare( l, r ) {
     return (l < r) ? -1 : (l > r) ? 1 : 0;
  }

  function sortGeoJSON( data ) {
////
// sort geojson features
//   by 1) state
//   by 2/ size (brewery)
//   by 3/ title       


        var features = data['features'];
        debug( "features.length:" + features.length );
        
        features.sort( function(l,r) {
           l_state = l['properties']['state'];
           l_state_num = place.states[ l_state ];
           l_type  = l['properties']['type'];
           l_type_num = BREWERY_TYPES[ l_type ];
           l_title = l['properties']['title'];
           
           r_state = r['properties']['state'];
           r_state_num = place.states[ r_state ];
           r_type  = r['properties']['type'];
           r_type_num = BREWERY_TYPES[ r_type ];
           r_title = r['properties']['title'];

           // debug( l_state + " " +l_state_num + "<=>" + r_state_num + " " + r_state );
           // debug( l_type + " " +l_type_num + "<=>" + r_type_num + " " + r_type );

           var value = compare( l_state_num, r_state_num );
           if( value == 0 ) {
              value = compare( l_type_num, r_type_num );
              if( value == 0 ) {
                value = compare( l_title, r_title );
              }
           }
           return value;   
        });
  }

// read in JSON files
function readJSON( url, success ) {
  $.get( url, function( data ) {
       debug( "readJSON success");
       debug( "type: " + typeof data );
       // debug( data );
       
       if( typeof data == 'string' ) {
         // convert data to json if returned as "plain" text
         data = JSON.parse( data );
       }
       success( data );
  });
};


  // call "c'tor/constructor"
  init( opts );

   ///////////////
   // new setupMap version - try with layer ??
  function createLayer( data ) {
     var newLayer = L.geoJson( data, {
          onEachFeature: function( feature, layer ) {

            // debug( "onEachFeature:" );
            var props = feature.properties;
            var icon  = MARKER_ICONS[ props['type'] ];

              layer.setIcon(
                L.divIcon({
                   // Specify a class name we can refer to in CSS.
                   className: icon.className,
                   // Set a markers width and height.
                   iconSize: icon.size,
                   // Define what HTML goes in each marker.
                   html: "xx",
               }));
            }});

     return newLayer;
  } // fn setupLayer;


  function setupMapV2( json ) {
    // try to make it work w/ layer
    sortGeoJSON( json );
    debug( "before createLayer" );
    // featureLayer = L.mapbox.featureLayer( json ).addTo( map );
    // featureLayer = L.mapbox.featureLayer();
    var featureLayer = createLayer( json );
    debug( "featureLayer:" + typeof( featureLayer) );
    debug( "after createLayer" );

    debug( "before featureLayer.addTo(map)" );
    featureLayer.addTo( map );
    debug( "after featureLayer.addTo(map)" );
  }

  
  
  function reset() {
    // reset map
    map.setView( place.latLng, place.zoom );
  }
  
  // return/export public api
  return {
     reset: reset
  }
};  // end of Map.create
