
/**
 * POST请求
 * @param {*} req 
 * @param {*} callback 
 * @param {*} fail 
 * @param {*} loading 
 */
const post = (req, callback, fail, loading) => {
    startLoading(loading);
    fetch(req.url, {
        method: 'POST',
        body: JSON.stringify(req.body),
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => {
        res.json().then((data) => {

            if (!data || data.success !== true) {

                finishLoading(loading);
                if (fail) fail(data);
                return;
            }

            finishLoading(loading);
            if (callback) callback(data.data, data);
        })
    }).catch(e => {
        finishLoading(loading);
        if (fail) fail({ errorMsg: '请求失败', errorCode: 'REQUEST_HTTP_FAIL', error: e });
    });
};

const startLoading = (loading) => {
    if (loading) loading(true);
}

const finishLoading = (loading) => {
    if (loading) loading(false);
}


/**
 * POST请求
 * @param {*} req 
 * @param {*} callback 
 * @param {*} fail 
 * @param {*} loading 
 */
const commonPost = (req, callback, fail) => {
    fetch(req.url, {
        method: 'POST',
        body: req.body,
        headers: {
            'content-type': 'application/json'
        }
    }).then(res => {
        res.json().then((data) => {
            if (callback) callback(data);
        });
    }).catch(e => {
        if (fail) fail({ errorMsg: '请求失败', errorCode: 'REQUEST_HTTP_FAIL', error: e });
    });
};

const getRequest = (param, url) => {
    let req = {};
    // 请求地址
    req.url = url;
    // 请求参数
    req.body = param;
    return req;
};


export default {
    normalPost: post,
    purePost: commonPost,
    getRequest: getRequest
}
