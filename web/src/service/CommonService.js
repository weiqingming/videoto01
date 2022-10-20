
import Request from '../utils/Request';

/**
 * 通用的请求方法
 * @param {*} param 
 * @param {*} callback 
 */
 const requestSend = (url, param, success, fail, loading) => {
    let req = Request.getRequest(param, url);
    Request.normalPost(req, success, fail, loading);
};

export default {
    requestSend: requestSend
}
