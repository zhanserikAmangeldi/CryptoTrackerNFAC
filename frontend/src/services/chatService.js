import {getAuthToken} from "./authService";
import {CHAT_URL} from "../utils/Constants";

const sendMessageToAPI = async (allMessages) => {
    try {
        const authToken = getAuthToken();
        if (!authToken) throw new Error('No auth token available');

        const response = await fetch(CHAT_URL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${authToken}`
            },
            body: JSON.stringify({
                system_prompt: "You should help the user with questions connected with crypto currency and etc. If there will be any topics like sexual/racism or etc. just say I will not answer for this, or I will not continue this this theme ",
                messages: allMessages
            })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `API responded with status: ${response.status}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error calling chat API:', error);
        throw error;
    }
};

export default sendMessageToAPI;