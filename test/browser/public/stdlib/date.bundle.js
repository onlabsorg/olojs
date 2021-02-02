(window["webpackJsonp"] = window["webpackJsonp"] || []).push([["/stdlib/date"],{

/***/ "../../node_modules/@onlabsorg/swan-js/lib/stdlib/date.js":
/*!****************************************************************************************!*\
  !*** /home/marcello/mdb/Code/olojs/node_modules/@onlabsorg/swan-js/lib/stdlib/date.js ***!
  \****************************************************************************************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("/**\n *  date - swan stdlib module\n *  ============================================================================\n *  Contains functions to handle date and time.\n */\n\n\nmodule.exports = {\n\n    /**\n     *  date - function\n     *  ------------------------------------------------------------------------\n     *  Creates a date given all the date components expressed in the local\n     *  timezone.\n     *  ```\n     *  dt = date(y, m, d, h, min, s, ms)\n     *  ```\n     *  - `y` is the year in the local timezone\n     *  - `m` is the month in the local timezone (1:January, ..., 12:December)\n     *  - `d` is the day in the local timezone\n     *  - `h` is the hour in the local timezone\n     *  - `min` is the minute in the local timezone\n     *  - `s` is the number of seconds\n     *  - `ms` is the number of milliseconds\n     *  - `dt` is the number of milliseconds from the epoch (Jan 1, 1970)\n     */\n    __apply__: (y, m=1, d=1, h=0, min=0, s=0, ms=0) => Number(new Date(y, m-1, d, h, min, s, ms)),\n\n\n    /**\n     *  date.timezone - number\n     *  ------------------------------------------------------------------------\n     *  It contains the current time zone in hours. For example in UTC+1 it\n     *  will hold the value +1.\n     */\n    timezone: -(new Date()).getTimezoneOffset()/60,\n\n\n    /**\n     *  date.parse - function\n     *  ------------------------------------------------------------------------\n     *  Creates a date given its string representation.\n     *  ```\n     *  dt = date.parse(dstr)\n     *  ```\n     *  - `dstr` is a string rapresentation of the date to be created (e.g. `'2021-02-27T10:30:45.327'`)\n     *  - `dt` is the number of milliseconds from the epoch (Jan 1, 1970)\n     */\n    parse: str => Number(Date.parse(str)),\n\n\n    /**\n     *  date.stringify - function\n     *  ------------------------------------------------------------------------\n     *  Given a date in ms, it returns its ISO string representation\n     *  ```\n     *  dstr = date.stringify(dt)\n     *  ```\n     */\n    stringify: date => D(date).toISOString(),\n\n\n    /**\n     *  date.now - function\n     *  ------------------------------------------------------------------------\n     *  It returns the current date in ms from the epoch.\n     *  ```\n     *  dt = date.now()\n     *  ```\n     */\n    now: () => Date.now(),\n\n\n    /**\n     *  date.year - function\n     *  ------------------------------------------------------------------------\n     *  It returns the year of a given date, in the loacal timezone.\n     *  ```\n     *  y = date.year(dt)\n     *  ```\n     */\n    year: date => D(date).getFullYear(),\n\n\n    /**\n     *  date.month - function\n     *  ------------------------------------------------------------------------\n     *  It returns the month of a given date, in the loacal timezone. January is 1,\n     *  Febrary is 2, etc.\n     *  ```\n     *  m = date.month(dt)\n     *  ```\n     */\n    month: date => D(date).getMonth()+1,\n\n\n    // Return the year week number of a give date\n    week: date => {\n        date = new Date(Number(date));\n        date.setHours(0, 0, 0, 0);\n        // Thursday in current week decides the year.\n        date.setDate(date.getDate() + 3 - (date.getDay() + 6) % 7);\n        // January 4 is always in week 1.\n        var week1 = new Date(date.getFullYear(), 0, 4);\n        // Adjust to Thursday in week 1 and count number of weeks from date to week1.\n        return 1 + Math.round(((date.getTime() - week1.getTime()) / 86400000 - 3 + (week1.getDay() + 6) % 7) / 7);\n    },\n\n\n    /**\n     *  date.weekDay - function\n     *  ------------------------------------------------------------------------\n     *  It returns the day of the week of a given date, in the loacal timezone.\n     *  Sunday is 0, monday is 1, tuesday is 2, etc.\n     *  ```\n     *  wd = date.weekDay(dt)\n     *  ```\n     */\n    weekDay: date => D(date).getDay(),\n\n\n    /**\n     *  date.day - function\n     *  ------------------------------------------------------------------------\n     *  It returns the month day of a given date, in the loacal timezone.\n     *  ```\n     *  d = date.day(dt)\n     *  ```\n     */\n    day: date => D(date).getDate(),\n\n\n    /**\n     *  date.hours - function\n     *  ------------------------------------------------------------------------\n     *  It returns the hour a given date, in the loacal timezone.\n     *  ```\n     *  h = date.day(dt)\n     *  ```\n     */\n    hours: date => D(date).getHours(),\n\n\n    /**\n     *  date.minutes - function\n     *  ------------------------------------------------------------------------\n     *  It returns the minutes of a given date, in the loacal timezone.\n     *  ```\n     *  min = date.minutes(dt)\n     *  ```\n     */\n    minutes: date => D(date).getMinutes(),\n\n\n    /**\n     *  date.seconds - function\n     *  ------------------------------------------------------------------------\n     *  It returns the seconds of a given date, in the loacal timezone.\n     *  ```\n     *  s = date.seconds(dt)\n     *  ```\n     */\n    seconds: date => D(date).getSeconds(),\n\n\n    /**\n     *  date.milliseconds - function\n     *  ------------------------------------------------------------------------\n     *  It returns the milliseconds of a given date, in the loacal timezone.\n     *  ```\n     *  ms = date.milliseconds(dt)\n     *  ```\n     */\n    milliseconds: date => D(date).getMilliseconds(),\n\n\n    UTC: {\n\n        /**\n         *  date.UTC - function\n         *  ------------------------------------------------------------------------\n         *  Creates a date given all the date components expressed in the UTC-0\n         *  timezone.\n         *  ```\n         *  dt = date.UTC(y, m, d, h, min, s, ms)\n         *  ```\n         *  - `y` is the year in the local timezone\n         *  - `m` is the month in the local timezone (1:January, ..., 12:December)\n         *  - `d` is the day in the local timezone\n         *  - `h` is the hour in the local timezone\n         *  - `min` is the minute in the local timezone\n         *  - `s` is the number of seconds\n         *  - `ms` is the number of milliseconds\n         *  - `dt` is the number of milliseconds from the epoch (Jan 1, 1970)\n         */\n        __apply__: (y, m=1, d=1, h=0, min=0, s=0, ms=0) => Date.UTC(y, m-1, d, h, min, s, ms),\n\n\n        /**\n         *  date.UTC.year - function\n         *  ------------------------------------------------------------------------\n         *  It returns the year of a given date, in the UTC-0 timezone.\n         *  ```\n         *  y = date.UTC.year(dt)\n         *  ```\n         */\n        year: date => D(date).getUTCFullYear(),\n\n\n        /**\n         *  date.UTC.month - function\n         *  ------------------------------------------------------------------------\n         *  It returns the month of a given date, in the UTC-0 timezone. January is 1,\n         *  Febrary is 2, etc.\n         *  ```\n         *  m = date.UTC.month(dt)\n         *  ```\n         */\n        month: date => D(date).getUTCMonth()+1,\n\n\n        /**\n         *  date.UTC.weekDay - function\n         *  ------------------------------------------------------------------------\n         *  It returns the day of the week of a given date, in the UTC-0 timezone.\n         *  Sunday is 0, monday is 1, tuesday is 2, etc.\n         *  ```\n         *  wd = date.UTC.weekDay(dt)\n         *  ```\n         */\n        weekDay: date => D(date).getUTCDay(),\n\n\n        /**\n         *  date.UTC.day - function\n         *  ------------------------------------------------------------------------\n         *  It returns the month day of a given date, in the UTC-0 timezone.\n         *  ```\n         *  d = date.day(dt)\n         *  ```\n         */\n        day: date => D(date).getUTCDate(),\n\n\n        /**\n         *  date.UTC.hours - function\n         *  ------------------------------------------------------------------------\n         *  It returns the hour a given date, in the UTC-0 timezone.\n         *  ```\n         *  h = date.UTC.day(dt)\n         *  ```\n         */\n        hours: date => D(date).getUTCHours(),\n\n\n        /**\n         *  date.UTC.minutes - function\n         *  ------------------------------------------------------------------------\n         *  It returns the minutes of a given date, in the UTC-0 timezone.\n         *  ```\n         *  min = date.UTC.minutes(dt)\n         *  ```\n         */\n        minutes: date => D(date).getUTCMinutes(),\n\n\n        /**\n         *  date.UTC.seconds - function\n         *  ------------------------------------------------------------------------\n         *  It returns the seconds of a given date, in the UTC-0 timezone.\n         *  ```\n         *  s = date.UTC.seconds(dt)\n         *  ```\n         */\n        seconds: date => D(date).getUTCSeconds(),\n\n\n        /**\n         *  date.UTC.milliseconds - function\n         *  ------------------------------------------------------------------------\n         *  It returns the milliseconds of a given date, in the UTC-0 timezone.\n         *  ```\n         *  ms = date.UTC.milliseconds(dt)\n         *  ```\n         */\n        milliseconds: date => D(date).getUTCMilliseconds(),\n    }\n};\n\nconst D = date => new Date(date);\n\n\n//# sourceURL=webpack:////home/marcello/mdb/Code/olojs/node_modules/@onlabsorg/swan-js/lib/stdlib/date.js?");

/***/ })

}]);