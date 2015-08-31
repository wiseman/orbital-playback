(ns orbital_playback.test-runner
  (:require
   [cljs.test :refer-macros [run-tests]]
   [orbital_playback.core-test]))

(enable-console-print!)

(defn runner []
  (if (cljs.test/successful?
       (run-tests
        'orbital_playback.core-test))
    0
    1))
