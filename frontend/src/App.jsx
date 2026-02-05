import React, { useEffect, useState, useRef } from 'react';
import Nav from './component/Nav';
import { io } from "socket.io-client";
import { useForm } from "react-hook-form";
import ReactMarkdown from "react-markdown";
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { oneDark } from 'react-syntax-highlighter/dist/esm/styles/prism';

const App = () => {
  const [socket, setSocket] = useState(null);
  const [chat, setChat] = useState([
    {
      sender: "ai",
      name: "Saarthi",
      text: "Hello 👋, I am Saarthi - your AI assistant. How can I help you today?",
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }
  ]);

  const { register, handleSubmit, reset } = useForm();
  const chatEndRef = useRef(null);

  useEffect(() => {
    // Connect to the local backend URL
    const socketInstance = io("http://localhost:3000");
    setSocket(socketInstance);

    socketInstance.on("message-response", (data) => {
      setChat(prevChat => [...prevChat, {
        sender: "ai",
        name: "Saarthi",
        text: data.response || "No response",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
      }]);
    });

    socketInstance.on("message-stream", (chunk) => {
      setChat(prevChat => {
        const lastMessage = prevChat[prevChat.length - 1];
        if (lastMessage && lastMessage.sender === "ai") {
          return prevChat.map((msg, index) => {
            if (index === prevChat.length - 1) {
              return { ...msg, text: msg.text + chunk };
            }
            return msg;
          });
        } else {
          return [...prevChat, {
            sender: "ai",
            name: "Saarthi",
            text: chunk,
            time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
          }];
        }
      });
    });

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chat]);

  const onSubmit = (data) => {
    const usermsg = data.message.trim();
    if (!usermsg) return;

    setChat(prevChat => [...prevChat, {
      sender: "user",
      name: "You",
      text: usermsg,
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true })
    }]);

    if (socket) socket.emit("message", usermsg);
    reset();
  };

  const handleCopy = (code) => {
    navigator.clipboard.writeText(code)
      .then(() => alert("Code copied to clipboard!"))
      .catch(() => alert("Failed to copy code"));
  };

  return (
    <div className='min-h-screen flex flex-col bg-black text-white'>
      <Nav />

      <div className="flex-1 overflow-y-auto p-4 space-y-3 pb-24">
        {chat.map((msg, idx) => {
          const isCode = /```[\s\S]*```/.test(msg.text);

          return (
            <div
              key={idx}
              className={`max-w-[70%] p-4 rounded-2xl break-words shadow-xl
                ${msg.sender === "user"
                  ? "bg-gradient-to-r from-blue-600 to-blue-700 ml-auto text-white border border-blue-500"
                  : "bg-gradient-to-r from-gray-900 to-gray-800 mr-auto text-white border border-blue-900"
                }`}
            >
              <div className="flex justify-between text-xs text-gray-300 mb-1">
                <span className="font-semibold">{msg.name}</span>
                <span>{msg.time}</span>
              </div>

              {isCode ? (
                <div className="relative">
                  <ReactMarkdown
                    components={{
                      code({ node, inline, className, children, ...props }) {
                        const match = /language-(\w+)/.exec(className || '');
                        return !inline && match ? (
                          <SyntaxHighlighter
                            style={oneDark}
                            language={match[1]}
                            PreTag="div"
                            {...props}
                          >
                            {String(children).replace(/\n$/, '')}
                          </SyntaxHighlighter>
                        ) : (
                          <code className={className} {...props}>
                            {children}
                          </code>
                        );
                      }
                    }}
                  >
                    {msg.text}
                  </ReactMarkdown>
                  <button
                    className="absolute top-2 right-2 text-sm bg-gray-800 text-white px-2 py-1 rounded hover:bg-gray-700"
                    onClick={() => handleCopy(msg.text.replace(/```[a-zA-Z]*\n|```/g, '').trim())}
                  >
                    Copy
                  </button>
                </div>
              ) : (
                <ReactMarkdown>{msg.text}</ReactMarkdown>
              )}
            </div>
          );
        })}
        <div ref={chatEndRef} />
      </div>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className='flex gap-3 p-4 bg-gradient-to-r from-black to-gray-900 fixed bottom-0 w-full z-10 border-t border-blue-900 shadow-2xl'
      >
        <input
          {...register("message", { required: true })}
          type="text"
          placeholder='Type a message...'
          className='flex-1 p-3 rounded-xl border-2 border-blue-900 bg-gray-900 text-white focus:border-blue-500 focus:outline-none placeholder-gray-500 shadow-inner'
        />
        <button
          type='submit'
          className='bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-3 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all font-semibold shadow-lg hover:shadow-blue-500/50'
        >
          Send
        </button>
      </form>
    </div>
  );
};

export default App;
