var DATE_UTIL_MODULE = (function() {
    return {
        formatDateNumber: function(number) {
            return number < 10 ? "0" + number : number;
        },

        formatDateToString: function(dateNumber) {
            var expirationDate = new Date(parseInt(dateNumber)),
                month = DATE_UTIL_MODULE.formatDateNumber(expirationDate.getUTCMonth() + 1),
                day = DATE_UTIL_MODULE.formatDateNumber(expirationDate.getUTCDate()),
                year = DATE_UTIL_MODULE.formatDateNumber(expirationDate.getUTCFullYear()),
                hours = DATE_UTIL_MODULE.formatDateNumber(expirationDate.getHours()),
                minutes = DATE_UTIL_MODULE.formatDateNumber(expirationDate.getMinutes()),
                seconds = DATE_UTIL_MODULE.formatDateNumber(expirationDate.getSeconds()),
                checkBoxCheckedEvent;

            return month + "/" + day + "/" + year + " " + hours + ":" + minutes + ":" + seconds;
        }
    };
}());
