(ns orbital-playback.core
  (:require
   [om.core :as om :include-macros true]
   [om.dom :as dom :include-macros true]
   [cljsjs.leaflet]))

(enable-console-print!)

(defonce app-state (atom {:text "Hello Chestnut!"}))


(defn latlon [lat lon]
  (js/L.LatLng. lat lon))

(defn make-tile-layer []
  (js/L.TileLayer.
   "http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
   (clj->js {:attribution "&copy; <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a>"
             :maxZoom 19})))


(defn main []
  (-> js/L
      (.map "map"
            (clj->js {:center (latlon 34.156149756733 -118.222884689317)
                      :zoom 16}))
      (.addLayer (make-tile-layer))))
