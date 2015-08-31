(ns orbital-playback.core
  (:require
   [om.core :as om :include-macros true]
   [om.dom :as dom :include-macros true]
   [cljsjs.leaflet]))

(enable-console-print!)

(defonce app-state (atom {:text "Hello Chestnut!"}))


(defn latlon [lat lon]
  (js/L.LatLng. lat lon))

(defn main []
  (.log js/console "1")
  (om/root
    (fn [app owner]
      (reify
        om/IRender
        (render [_]
          (dom/h1 nil (:text app)))))
    app-state
    {:target (. js/document (getElementById "app"))})
  (.log js/console "2")
  (-> js/L
      ;; (.map "map"
      ;;       (clj->js {:center (latlon 34.156149756733 -118.222884689317)
      ;;                 :zoom 16}))
      ;; (.addLayer (js/L.TileLayer.
      ;;             "http://otile{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.jpg"
      ;;             (clj->js {:subdomains ["1" "2" "3" "4"]
      ;;                       :maxzoom 18})))

      ;; (.tileLayer "https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token={accessToken}"
      ;;             {maxZoom: 18,
      ;;              id: "your.mapbox.project.id",
      ;;              accessToken: "your.mapbox.public.access.token"})
      )
  (.log js/console "3"))
