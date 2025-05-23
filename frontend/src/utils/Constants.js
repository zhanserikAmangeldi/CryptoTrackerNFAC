const BASE_URL = process.env.REACT_APP_API_URL || "http://localhost:8080/api/v1";
const DEAL_URL = BASE_URL + '/deals';
const CHAT_URL = BASE_URL + "/chat"
const UPDATE_INTERVAL = 20000;


export {
    BASE_URL,
    DEAL_URL,
    CHAT_URL,
    UPDATE_INTERVAL,
};