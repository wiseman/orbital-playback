(ns woo.test-runner
  (:require
   [cljs.test :refer-macros [run-tests]]
   [woo.core-test]))

(enable-console-print!)

(defn runner []
  (if (cljs.test/successful?
       (run-tests
        'woo.core-test))
    0
    1))
