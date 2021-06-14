/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';
import "core-js/es6";
import "core-js/es7/reflect";
import "zone.js";

// if (process.env.NODE_ENV === "production") {
//   // Production
// } else {
//   // Development
//   Error["stackTraceLimit"] = Infinity;
//   require("zone.js/dist/long-stack-trace-zone");
// }
