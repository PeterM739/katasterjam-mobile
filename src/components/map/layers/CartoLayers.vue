<template>
  <ol-tile-layer>
    <ol-source-osm />
  </ol-tile-layer>
  <ol-tile-layer>
    <ol-source-xyz url="https://services7.arcgis.com/V2VriwTjJDabpGg6/ArcGIS/rest/services/2022_marec_export_ekataster_tile_layer/MapServer/WMTS/tile/1.0.0/2022_marec_export_ekataster_tile_layer/default/default028mm/{z}/{y}/{x}.png"/>
  </ol-tile-layer>
</template>

<script>
export default {
  data () {
    return {
    }
  }
}
</script>
