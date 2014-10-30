

L.mapbox.accessToken = 'pk.eyJ1IjoiZ2VyYWxkYmF1ZXIiLCJhIjoic091TFBNOCJ9.LV4KlBAqm0thFqeW60cwEQ';

// load in GeoJSON data
var atUrl = 'at.geojson';
var nUrl  = 'n.geojson';


var AT = {
  title: 'Austria',
  latLng: [47.2000338, 13.199959],
  zoom:    7,   // default zoom level (for overview) e.g.  use 7 for austria

  N: {   // province N - Niederösterreich
    latLng: [48.2817813, 15.7632457],
    zoom:   8  // default zoom level (for overview) e.g.  use 8 for province
  },

  states: {  // NOTE: use AT NUTS sort order for states
    'Burgenland': 11,
    'Niederösterreich': 12,
    'Wien': 13,
    'Kärnten': 21,
    'Steiermark': 22,
    'Oberösterreich': 31,
    'Salzburg': 32,
    'Tirol': 33,
    'Vorarlberg': 34
  }
};



var BeerMap = {};

BeerMap.create = function( opts )
{
  var markerList;
  var map;
  var place;

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

  var ICONS = {
   'berwery (l)': { className: 'icon-brewery-l', size: [40,40]},
   'brewery (m)': { className: 'icon-brewery-m', size: [30,30]},
   'brewery':     { className: 'icon-brewery',   size: [20,20]},
   'brewpub':     { className: 'icon-brewpub',   size: [20,20]},
  };


  function init( opts )
  {
    markerList = document.getElementById('marker-list');

    place = AT;  // use AT - austria for now
    
    var urlGeoJSON = atUrl;
    
    map = L.mapbox.map('map', 'examples.map-i86nkdio', { scrollWheelZoom: false } )
              .setView( place.latLng, place.zoom );



readJSON( urlGeoJSON, function( json ) {

  console.log( "before sortGeoJSON" );
  sortGeoJSON( json );

  console.log( "before setGeoJSON" );

///
// fix: use var zipLayer = L.mapbox.featureLayer('data/blah.json');
// zipLayer.addTo(map);   - why? why not??

  map.featureLayer.setGeoJSON( json );
  console.log( "after setGeoJSON" );

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
        console.log( "map.getZoom():" + map.getZoom());
        if( map.getZoom() < 10 ) {
          map.setZoom( 10 );
        }
        map.panTo( e.layer.getLatLng() );
    });

     // first entry - Austria Overview (for "reset" zoom level and center)  

     var item = markerList.appendChild(document.createElement('li'));
     item.innerHTML = place.title + " (Overview)";
     item.onclick = function() {
       map.setView( place.latLng, place.zoom );
     };

      var i=0;
      var lastState = null;

      map.featureLayer.eachLayer( function(layer) {
          i+=1;

          var props = layer.toGeoJSON().properties;

          var state = props['state'];
          if( lastState !== state ) {
            // add state header
            //   todo: add click handler to use centroid point for state!!!!
            var item = markerList.appendChild(document.createElement('li'));
            item.innerHTML = state;
            lastState = state;
          }
 
          var counterClassName = COUNTER_CLASS_NAMES[ props['type'] ];

          var item = markerList.appendChild(document.createElement('li'));
          item.innerHTML = "<span class='"+ counterClassName +"'>"+i + "</span> "
                             + props['title']
                             + "<br><span class='desc'>" + props['description'] + "</span>";
          // console.log( "layer marker item:" + props['title'] );
         
          item.onclick = function() {
            // check zoom level before setZoom
             var mapZoom = map.getZoom();
             if( mapZoom < 10 ) {   // zoom in if clicked (and not alreay zoomed in)
               mapZoom = 10;
             }
             map.setView(layer.getLatLng(), mapZoom);
             layer.openPopup();
          };

         var icon = ICONS[ props['type'] ];

         layer.setIcon( L.divIcon({
            // Specify a class name we can refer to in CSS.
            className: icon.className,
            // Set a markers width and height.
            iconSize: icon.size,
            // Define what HTML goes in each marker.
            html: ""+i,
         }));
      });
});

  } // fn init


function sortCompare( l, r ) {
  return (l < r) ? -1 : (l > r) ? 1 : 0;
}

  function sortGeoJSON( data ) {
////
// sort geojson features
//   by 1) state
//   by 2/ size (brewery)
//   by 3/ title       

        var features = data['features'];
        console.log( "features.length:" + features.length );
        
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

           console.log( l_state + " " +l_state_num + "<=>" + r_state_num + " " + r_state );
           console.log( l_type + " " +l_type_num + "<=>" + r_type_num + " " + r_type );

           var value = sortCompare( l_state_num, r_state_num );
           if( value == 0 ) {
              value = sortCompare( l_type_num, r_type_num );
              if( value == 0 ) {
                value = sortCompare( l_title, r_title );
              }
           }
           return value;   
        });
  }

// read in JSON files
function readJSON( url, success ) {
  $.get( url, function( data ) {
       console.log( "readJSON success");
       console.log( "type: " + typeof data );
       // console.log( data );
       
       if( typeof data == 'string' ) {
         // convert data to json if returned as "plain" text
         data = JSON.parse( data );
       }
       success( data );
  });
};


  // call "c'tor/constructor"
  init( opts );

  function reset() {
    // reset map
    map.setView( place.latLng, place.zoom );
  }
  
  // return/export public api
  return {
     reset: reset
  }
};  // end of Map.create
