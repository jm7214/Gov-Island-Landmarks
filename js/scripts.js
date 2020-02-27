mapboxgl.accessToken = 'pk.eyJ1Ijoiam03MjE0IiwiYSI6ImNrNnNwdjFmYTBodTczbXF4bnJzaGR1Z2oifQ.Jl92KHVxrXt33RDS85IXAg';

  // we want to return to this point and zoom level after the user interacts
// with the map, so store them in variables
var initialCenterPoint = [-74.019054,40.688873]
var initialZoom = 15.4



var initOptions ={
    container: 'govisland-map', // container id
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: initialCenterPoint, // starting position [lng, lat]
    zoom: initialZoom, // starting zoom
}

// a helper function for looking up colors and descriptions for NYC land use codes
var StyleLookup = (code) => {
  switch (code) {
    case 1:
      return {
        color: '#f6bd60',
        description: 'Colonial Revival',
      };
    case 2:
      return {
        color: '#ee817f',
        description: 'Dutch Utilitarian',
      };
    case 3:
      return {
        color: '#84c68a',
        description: 'Georgian',
      };
    case 4:
      return {
        color: '#68b7da',
        description: 'Greek Revival',
      };
    case 5:
      return {
        color: '#96ceb4',
        description: 'Italianate Vernacular',
      };
    case 6:
      return {
        color: '#17828d',
        description: 'Military',
      };
    case 7:
      return {
        color: '#feeaab',
        description: 'Military: Fort Circulaires',
      };
    case 8:
      return {
        color: '#ffc3fe',
        description: 'Modified Arts & Crafts',
      };
    case 9:
      return {
        color: '#41e0f8',
        description: 'neo-Georgian',
      };
    case 10:
      return {
        color: '#e9c97f',
        description: 'neo-Gothic',
      };
    case 11:
      return {
        color: '#beb571',
        description: 'Not determined',
      };
    case 12:
      return {
        color: '#90463e',
        description: 'Romanesque Revival',
      };
    case 13:
        return {
          color: '#6f8c76',
          description: 'Utilitarian',
        };
    case 14:
      return {
        color: '#1f285f',
        description: 'Utilitarian Arched',
      };
      case 15:
        return {
          color: '#5583a6',
          description: 'Utilitarian Romanesque Revival',
        };
      case 16:
          return {
            color: '#efa885',
            description: 'Vernacular',
          };
      case 17:
            return {
              color: '#670000',
              description: 'Victorian',
            };
      case 18:
              return {
                color: '#414b67',
                description: 'Victorian Vernacular',
              };
    default:
      return {
        color: '#696863',
        description: 'None',
      };
  }
};


// set the default text for the feature-info div
var defaultText = '<p>Move the mouse over the map to get more info on a property</p>'
$('#feature-info').html(defaultText)

//create an object to hold the initialization options for a mapboxGL map
var initOptions ={
    container: 'govisland-map', // container id
    style: 'mapbox://styles/mapbox/light-v10', // stylesheet location
    center: initialCenterPoint, // starting position [lng, lat]
    zoom: initialZoom, // starting zoom
}
// create the new map
var map = new mapboxgl.Map(initOptions);

// add zoom and rotation controls to the map.
map.addControl(new mapboxgl.NavigationControl());

// wait for the initial style to Load
map.on('style.load', function() {

// add a geojson source to the map using our external geojson file
map.addSource('geojson_gov_island', {
  type: 'geojson',
  data: './data/geojson_gov_island.gpkg.geojson',
});

// let's make sure the source got added by logging the current map state to the console
 console.log(map.getStyle().sources)


// add a layer for our custom source
map.addLayer({
  id: 'fill-geojson_gov_island',
  type: 'fill',
  source: 'geojson_gov_island',
  paint: {
      'fill-color': {
        type: 'categorical',
        property: 'style_prim',
        stops: [
          [
            'Colonial Revival',
            StyleLookup(1).color,
          ],
          [
            'Dutch Utilitarian',
            StyleLookup(2).color,
          ],
          [
            'Georgian',
            StyleLookup(3).color,
          ],
          [
            'Greek Revival',
            StyleLookup(4).color,
          ],
          [
            'Italianate Vernacular',
            StyleLookup(5).color,
          ],
          [
            'Military',
            StyleLookup(6).color,
          ],
          [
            'Military: Fort Circulaires',
            StyleLookup(7).color,
          ],
          [
            'Modified Arts & Crafts',
            StyleLookup(8).color,
          ],
          [
            'neo-Georgian',
            StyleLookup(9).color,
          ],
          [
            'neo-Gothic',
          StyleLookup(10).color,
          ],
          [
            'Not determined',
            StyleLookup(11).color,
          ],
          [
            'Romanesque Revival',
            StyleLookup(12).color,
          ],
          [
            'Utilitarian',
            StyleLookup(13).color,
          ],
          [
            'Utilitarian Arched',
            StyleLookup(14).color,
          ],
          [
            'Utilitarian Romanesque Revival',
            StyleLookup(15).color,
          ],
          [
            'Vernacular',
            StyleLookup(16).color,
          ],
          [
            'Victorian',
            StyleLookup(17).color,
          ],
          [
            'Victorian Vernacular',
            StyleLookup(18).color,
          ],
        ]
      }
    }
  })

// add an empty data source, which we will use to highlight the lot the user is hovering over
map.addSource('highlight-feature', {
  type: 'geojson',
  data: {
    type: 'FeatureCollection',
    features: []
  }
})
// add a layer for the highlighted lot
map.addLayer({
  id: 'highlight-line',
  type: 'line',
  source: 'highlight-feature',
  paint: {
    'line-width': 2,
    'line-opacity': 0.9,
    'line-color': 'white',
  }
});

// listen for the mouse moving over the map and react when the cursor is over our data

map.on('mousemove', function (e) {
  
  // query for the features under the mouse, but only in the lots layer
  var features = map.queryRenderedFeatures(e.point, {
      layers: ['fill-geojson_gov_island'],
  });
  // if the mouse pointer is over a feature on our layer of interest
  // take the data for that feature and display it in the sidebar
  if (features.length > 0) {
    map.getCanvas().style.cursor = 'pointer';  // make the cursor a pointer

    var hoveredFeature = features[0]
    var featureInfo = `
      <h4>${hoveredFeature.properties.build_nme}</h4>
      <p><strong>Building Type:</strong> ${hoveredFeature.properties.build_type}</p>
      <p><strong>Architecture Style:</strong> ${hoveredFeature.properties.style_prim}</p>
      <p><strong>Year Built:</strong> ${hoveredFeature.properties.year_built}</p>
      <p><strong>Primary Building Material:</strong> ${hoveredFeature.properties.mat_prim}</p>
      <p><strong>Original Use:</strong> ${hoveredFeature.properties.use_orig}</p>
    `
    $('#feature-info').html(featureInfo)

    // set this lot's polygon feature as the data for the highlight source
    map.getSource('highlight-feature').setData(hoveredFeature.geometry);
  } else {
    // if there is no feature under the mouse, reset things:
    map.getCanvas().style.cursor = 'default'; // make the cursor default

    // reset the highlight source to an empty featurecollection
    map.getSource('highlight-feature').setData({
      type: 'FeatureCollection',
      features: []
    });

    // reset the default message
    $('#feature-info').html(defaultText)
  }
})
})
