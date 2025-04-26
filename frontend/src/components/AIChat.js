import React, { useState, useEffect, useRef } from 'react';
import { getAuthToken } from '../services/authService';

function AIChat() {
    const [messages, setMessages] = useState([]);
    const [input, setInput] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);
    const inputRef = useRef(null);

    useEffect(() => {
        inputRef.current?.focus();
    }, []);

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage = { role: 'user', content: input };
        setMessages((prevMessages) => [...prevMessages, userMessage]);
        setInput('');
        setIsLoading(true);

        try {
            const authToken = getAuthToken();

            const allMessages = [
                ...messages,
                userMessage
            ];

            const response = await fetch('http://localhost:8080/api/v1/chat', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${authToken}`
                },
                body: JSON.stringify({
                    system_prompt: "You should help the user with questions connected with crypto currency and etc.",
                    messages: allMessages
                })
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `API responded with status: ${response.status}`);
            }

            const data = await response.json();

            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'assistant', content: data.message }
            ]);
        } catch (error) {
            console.error('Error calling chat API:', error);
            setMessages((prevMessages) => [
                ...prevMessages,
                { role: 'system', content: `Error: ${error.message}` }
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="ai-chat-container">
            {/* Messages area */}
            <div className="messages-container">
                {messages.length === 0 ? (
                    <div className="empty-chat-message">
                        Start a conversation by sending a message
                    </div>
                ) : (
                    messages.map((msg, index) => (
                        <div
                            key={index}
                            className={`message ${msg.role}`}
                        >
                            <div className="message-content">
                                {msg.content}
                            </div>
                            <div className="message-sender">
                                {msg.role === 'user' ? 'You' : msg.role === 'assistant' ? 'AI' : 'System'}
                            </div>
                        </div>
                    ))
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSubmit} className="message-form">
                <input
                    type="text"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type your message..."
                    className="message-input"
                    disabled={isLoading}
                    ref={inputRef}
                />
                <button
                    type="submit"
                    className="send-button"
                    disabled={isLoading}
                >
                    {isLoading ? '...' : 'Send'}
                </button>
            </form>
        </div>
    );
}

export default AIChat;