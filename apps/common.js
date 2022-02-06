(function () {
    var request = new XMLHttpRequest();
    var url = window.location.href;
    var userAgent = navigator.userAgent || navigator.vendor || window.opera;
    request.onload = function () {
        console.log('page-hit response', request.response);
    };
    request.open("POST", "https://us-west1-wombatnomad-blog-metrics.cloudfunctions.net/page-hit");
    request.setRequestHeader("Content-Type", "application/json");
    request.send(JSON.stringify({ "url": url, "userAgent": userAgent }));
})();
