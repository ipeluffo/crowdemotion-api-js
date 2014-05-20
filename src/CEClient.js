/**
 * CrowdEmotion REST API JS client.
 *
 * @author diego
 */
function CEClient() {

    this.user = null;
    this.errorlog = '';
    this.responseId = null;
    this.last_ms = Date.now();
    this.token = null;
    this.userId = null;



    this.logout = function (){
        javaRest.user.logout();
    }

    this.init  = function(debug, http){
        javaRest(debug, http);
    }
    /**
     * user login
     */
    this.login = function(username, password, cb) {
        var ceclient = this;

        javaRest.user.login(username,password, function (response) {
            if (response.success=true) {
                ceclient.userId = response.userId;
                ceclient.token = response.token;
            } else {
                ceclient.errorlog = ceclient.errorlog + "\n" + error;
            };
            if(cb){ cb();}

        });

    }

    /**
     * Upload a video using a full http url
     * @param mediaURL
     */
    this.uploadLink = function (mediaURL, cb) {
        var ceclient = this;


        javaRest.facevideo.uploadLink(mediaURL, function (res){
            ceclient.responseId = res.responseId;
            if(cb) cb(res);
        });


    }

    this.sendFile =function (element_id, cb){
        var ceclient = this;

        var file = document.getElementById(element_id).files[0]; //Files[0] = 1st file
        var reader = new FileReader();
        reader.readAsText(file, 'UTF-8');
        reader.onload = (function(theFile){
            //var fileName = theFile.name;
            javaRest.facevideo.upload(theFile, function (res){
                ceclient.responseId = res.responseId;
                if(cb) cb(res);
            });
        })(file);
    }



    /**
     *
     * @param responseId numeric id
     * @param metricId  numeric id
     * @param data  array
     */
    this.writeTimeSeries = function (responseId, metricId, data, cb){
        javaRest.postAuth('timeseries?response_id='+ responseId +'&metric_id=' + metricId, {'data': data},
            function(res){},
            function (res){
                if(cb) cb(res);
            }
        );
    }


    this.readTimeseries = function (responseId, metricId, cb, normalize) {
        var metricquery = '';

        if (Array.isArray(metricId)){ for (var i = 0; i < metricId.length; i++) { metricquery  = metricquery + "&metric_id=" +  metricId[i];}
        }else{ metricquery = "&metric_id="+ metricId;}

        if( normalize == undefined){ normalize = '&normalize=false';}
        else{ normalize = '&normalize='+normalize.toString();}

        javaRest.get("timeseries?response_id="+responseId+metricquery+normalize, null,
            function (res){
                if(cb) {cb(res);}
            },function (res){
                if(cb) {cb(res);}
            }
        );
    }

    this.readMetrics = function (metricId, cb) {
        var url = "metric";
        if(metricId == undefined || metricId == null){
            url = "metric";
        }else{
            url = "metric/?metric_id="+metricId;
        }
        javaRest.get(url, null,
            function (res){
                if(cb) {cb(res);}
            },function (res){
                if(cb) {cb(res);}
            }
        );
    }

    /**
     * Console log
     * @param msg
     */
    function ce_log(msg) {
        if (window.console) {
            var now = Date.now();
            console.log('CE JS API [' + now + ', ' + String("000000" + (now - this.last_ms)).slice(-6) + ']: ' +  msg);
            console.log(msg);
            this.last_ms = now;
        }
    }


}
//==========================JAVAREST==========================================
/*
 * Client crowdemotion js
 *
 * @version 0.1
 *
 */


javaRest.protocol = "https";
javaRest.domain = "api.crowdemotion.co.uk";
javaRest.version = "v1";
javaRest.debug = false;

/**
 * Singleton used for Namespace
 */
function javaRest(debug, http_fallback) {
    if(debug==undefined) debug = false;
    if(http_fallback==undefined) http_fallback = false;

    javaRest.debug = debug;

    if(http_fallback) {
        var connection = javaRest.httpGet('https://'+javaRest.domain+'/'+javaRest.version+'/');
        if (connection) {
            javaRest.protocol = 'https';
        } else {
            javaRest.protocol = 'http';
        }
    }
}

javaRest.httpGet = function (theUrl){
    var xmlHttp = null;


    try{
        xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", theUrl, false );
        xmlHttp.send( null );
        return (xmlHttp.statusText=='OK') ? true : false;
    }catch(e){
        return false;
    }

}

javaRest.baseurl = function(){
    if(this.debug == true){
        return this.protocol + '://' + this.domain + '/'; // + this.version + '/';
    }else{
        return this.protocol + '://' + this.domain + '/' + this.version + '/';
    }
}
/**
 * Wrap the API so we can proxy calls while testing.
 */
javaRest.get = function (url, data, success, error) {

    var s = url; var n = s.indexOf('?'); var url_simple = s.substring(0, n != -1 ? n : s.length);

    var time = javaRest.get_iso_date()
    var nonce = makeRandomString()
    var string_to_hash = javaRest.cookie.get('token') + ':' + url_simple + ',GET,' + time + "," + nonce
    var authorization = javaRest.cookie.get('userId') + ':' + javaRest.hash(string_to_hash)



    var request = $.ajax({
        url: this.baseurl() + url,
        type: "GET",
        data: data,
        crossDomain: true,
        /* async: false, */
        headers: {
            'Authorization' : authorization,
            'x-ce-rest-date' : time,
            'nonce' : nonce
        },
        dataType: "json"
    })

    request.done(success)

    request.fail(error)

}

function makeRandomString() {
    return Math.random().toString(36).substring(2, 15) +
        Math.random().toString(36).substring(2, 15);
}

/**
 * Return the current time as an ISO 8061 Date
 * @return {string} 2012-06-30T12:00:00+01:00
 */
javaRest.get_iso_date = function () {
    var d = new Date()
    function pad(n) {return n<10 ? '0'+n : n}
    return d.getUTCFullYear()+'-'
        + pad(d.getUTCMonth()+1)+'-'
        + pad(d.getUTCDate())+'T'
        + pad(d.getUTCHours())+':'
        + pad(d.getUTCMinutes())+':'
        + pad(d.getUTCSeconds())+'Z'
}

/**
 * Get a query string var
 * @param {string}
 * @return {string}
 */
javaRest.get_query = function (name) {
    var query = window.location.search.substring(1)
    var vars = query.split('&')
    for (var i = 0; i < vars.length; i++) {
        var pair = vars[i].split('=')
        if (decodeURIComponent(pair[0]) == name) {
            return decodeURIComponent(pair[1])
        }
    }
}

/**
 * SHA256, then base64 encode a string
 * @param {string}
 * @return {string}
 */
javaRest.hash = function (string) {
    var hash = CryptoJS.SHA256(string)
    return hash.toString(CryptoJS.enc.Base64)
}

/**
 * Is the visitor on iPhone or Ipad?
 * @return {bool}
 */
javaRest.isIos = function () {
    return (navigator.userAgent.match(/iPad|iPhone|iPod/i) != null)
}

/**
 * Wrap the API so we can proxy calls while testing.
 */
javaRest.post = function (url, data, success, error) {

    $.ajax({
        url: this.baseurl()+url,
        type: "POST",
        crossDomain: true,
        contentType: "application/json", // send as JSON
        data: JSON.stringify(data),
        dataType: "json",
        success : success,
        error : error
    })


}

/**
 * Post with authentication
 */
javaRest.postAuth = function (url, data, success, error) {

    var s = url; var n = s.indexOf('?'); var url_simple = s.substring(0, n != -1 ? n : s.length);

    var time = javaRest.get_iso_date()
    var nonce = makeRandomString()
    var string_to_hash = javaRest.cookie.get('token') + ':' + url_simple + ',POST,' + time + "," + nonce
    var authorization = javaRest.cookie.get('userId') + ':' + javaRest.hash(string_to_hash)


    $.ajax({
        url: this.baseurl()+url,
        type: "POST",
        contentType: "application/json", // send as JSON
        data: JSON.stringify(data),
        crossDomain: true,
        headers: {
            'Authorization' : authorization,
            'x-ce-rest-date' : time ,
            'nonce' : nonce
        },
        dataType: "json",
        success : success,
        error : error
    })


}

/**
 * Wrap the API so we can proxy calls while testing.
 */
javaRest.put = function (url, data, success, error) {

    var time = javaRest.get_iso_date()
    var nonce = makeRandomString()
    var string_to_hash = javaRest.cookie.get('token') + ':' + url + ',PUT,' + time + "," + nonce
    var authorization = javaRest.cookie.get('userId') + ':' + javaRest.hash(string_to_hash)

    $.ajax({
        url: this.baseurl()+url,
        type: "PUT",
        contentType: "application/json", // send as JSON
        data: JSON.stringify(data),
        crossDomain: true,
        headers: {
            'Authorization' : authorization,
            'x-ce-rest-date' : time,
            'nonce' : nonce
        },
        dataType: "json",
        success : success,
        error : error
    })


}

/**
 * Holds cookie methods
 */
javaRest.cookie = {};

/**
 * Get the value of a cookie.
 * @param {string}
 * @return {string}
 */
javaRest.cookie.get = function (name) {
    var pairs = document.cookie.split(/\; /g)
    var cookie = {}
    for (var i in pairs) {
        var parts = pairs[i].split(/\=/)
        cookie[parts[0]] = unescape(parts[1])
    }
    return cookie[name]
}

/**
 * Delete a cookie
 * @param {string}
 */
javaRest.cookie.remove = function (name) {
    document.cookie = name + '=; expires=Thu, 01 Jan 1970 00:00:01 GMT;'
}

/**
 * Set a cookie
 * @param {string}
 * @param {string}
 */
javaRest.cookie.set = function (name, value) {
    // document.cookie = "name=value[; expires=UTCString][; domain=domainName][; path=pathName][; secure]";
    document.cookie = name + '=' + value;
}



javaRest.user = {};


/**
 * Create a user
 *
 * @param {string}
 * @param {string}
 * @param {string}
 * @param {string}
 * @param {function}
 */
javaRest.user.create = function (firstName, emailAddress, password, lastName, callback) {


    javaRest.post(
        'user',
        {user :
        {
            "firstName" : firstName,
            "emailAddress" : emailAddress
        },
            "password" : password
        },
        function (response) {
            javaRest.cookie.set('token', response.token)
            javaRest.cookie.set('userId', response.userId)
            javaRest.cookie.set('email', emailAddress)
            callback()
        },
        function(jqXHR, textStatus) {
            console.log(jqXHR)
            callback(jqXHR)
        })

}


/**
 * Get user info
 * @param {function}
 */
javaRest.user.download = function (callback) {

    javaRest.get(
        'user/' + javaRest.cookie.get('userId'),
        {},
        function (response) {
            console.log(response)

            javaRest.user.user = response

            // If the cached version is the same as the most recent
            // version, just return. Else, we will run the callback.
            var sResponse = JSON.stringify(response);
            if (store.get('userResponse') === sResponse) {
                console.log('cached')
                return false
            }

            store.set('userResponse', sResponse)

            if (callback)
                callback()
        },
        function(jqXHR, textStatus) {
            if (callback)
                callback(jqXHR)
        })

}

/**
 * Get user info
 * @param {function}
 */
javaRest.user.get = function (callback) {


    var userResponse = store.get('userResponse')


    if (userResponse) {
        var response = JSON.parse(userResponse)
        javaRest.user.user = response
        // We still download the latest data in the background to make sure
        // cache is current. But we return immediately.
        javaRest.user.download()
        callback()
        return
    }


    javaRest.user.download(callback)

}

/**
 * @return {bool}
 */
javaRest.user.is_logged_in = function () {
    return !!javaRest.cookie.get('token')
}

/**
 * Log the user in
 * @param {string}
 * @param {string}
 * @param {function} Callback. First parameter is error, if any.
 */
javaRest.user.login = function (email, password, callback) {

    javaRest.post(
        'user/login',
        {
            "username" : email,
            "password" : password
        },
        function (response) { //success
            javaRest.cookie.set('token', response.token);
            javaRest.cookie.set('userId', response.userId);
            javaRest.cookie.set('email', email);
            response.success = true;
            callback(response)

        },
        function(jqXHR, textStatus) { //login
            jqXHR.success = false;
            callback(jqXHR)
        })

}

/**
 * Log the user in via facebook
 * @param {string}
 * @param {function} Callback. First parameter is error, if any.
 */
javaRest.user.loginSocial = function (accessToken, callback) {

    javaRest.post(
        'user/login/facebook',
        {
            "accessToken" : accessToken
        },
        function (response) {
            javaRest.cookie.set('token', response.token)
            javaRest.cookie.set('userId', response.userId)
            callback()

        },
        function(jqXHR, textStatus) {
            callback(jqXHR)
        })

}


/**
 * Delete the users cookies.
 */
javaRest.user.logout = function () {
    javaRest.cookie.remove('token');
    javaRest.cookie.remove('userId');
    javaRest.cookie.remove('email');
    store.clear();
    //window.location = 'index.html'
}

/**
 * Delete the users cookies.
 */
javaRest.user.reset_password = function (token, password, callback) {
    javaRest.post(
        'password/tokens/' + token,
        {
            "password" : password
        },
        function (response) {
            callback()
        },
        function(jqXHR, textStatus) {
            callback(jqXHR)
        })
}

/**
 * Delete the users cookies.
 */
javaRest.user.send_reset_email = function (email, callback) {
    javaRest.post(
        'password/tokens',
        {
            "emailAddress" : email
        },
        function (response) {
            callback()

        },
        function(jqXHR, textStatus) {
            callback(jqXHR)
        })
}



/**
 * Update first name
 * @param {function}
 */
javaRest.user.updateName = function (value, callback) {

    javaRest.put(
        'user/' + javaRest.cookie.get('userId'),
        {
            "emailAddress" : javaRest.cookie.get('email'),
            "firstName" : value
        },
        function (response) {
            console.log(response)
            if (callback)
                callback()
            // Clear user cache
            javaRest.user.download()
        },
        function(jqXHR, textStatus) {
            if (callback)
                callback(jqXHR)
            // Clear user cache
            javaRest.user.download()
        })
}

 javaRest.facevideo = {}


/**
 * Upload a facevideo
 *
 * @param {string}
 * @param {string}
 * @param {string}
 * @param {string}
 * @param {function}
 */
javaRest.facevideo.uploadLink = function(videoLink, callback) {


    javaRest.postAuth(
        'facevideo',
        {'link': videoLink},
        function(response) {
            if (callback) {
                callback(response);
            }
        },
        function(jqXHR, textStatus) {
            console.log(jqXHR);
            if (callback) {
                callback(jqXHR);
            }
        }
    )
}

javaRest.facevideo.upload = function(file, callback) {


    javaRest.postAuth(
        'facevideo/upload',
        {'file': file},
        function(response) {
            if (callback) {
                callback();
            }
        },
        function(jqXHR, textStatus) {
            console.log(jqXHR)
            callback(jqXHR)
        }
    )
}


javaRest.verify = {}

/**
 * Sends an email to user for verification
 */
javaRest.verify.request_email = function (email, callback) {
    javaRest.post(
        'verify/tokens',
        {
            'emailAddress' : email
        },
        function (response) {
            console.log(response)
            callback()
        },
        function(jqXHR, textStatus) {
            callback(jqXHR)
        })
}

/**
 * Validate an email address.
 */
javaRest.verify.verify = function (token, callback) {
    javaRest.post(
        'verify/tokens/' + token,
        {},
        function (response) {
            callback()
        },
        function(jqXHR, textStatus) {
            callback(jqXHR)
        })
}
