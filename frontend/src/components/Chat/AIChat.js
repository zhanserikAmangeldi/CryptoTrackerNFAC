import React, { useState, useEffect, useRef } from 'react';
import sendMessageToAPI from "../../services/chatService";

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
        setInput('');
        setIsLoading(true);

        setMessages(prevMessages => [...prevMessages, userMessage]);

        try {
            const data = await sendMessageToAPI([...messages, userMessage]);

            setMessages(prevMessages => [
                ...prevMessages,
                {role: 'assistant', content: data.message}
            ]);
        } catch (error) {
            setMessages(prevMessages => [
                ...prevMessages,
                {role: 'system', content: `${error.message}`}
            ]);
        } finally {
            setIsLoading(false);
            inputRef.current?.focus();
        }
    };

    return (
        <div className="ai-chat-container">
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