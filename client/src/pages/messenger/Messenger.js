import React, { useContext, useEffect, useRef, useState } from "react";
// import Topbar from "../"
import "./messenger.css";
import Conversation from "../../components/conversation/Converstaion";
import Chatonline from "../../components/chatonline/Chatonline";
import Message from "../../components/messege/Messege";
// import Topbar from '../../components/topbar/Topbar'
import { NavLink } from "react-router-dom";
import logo from "../../VConnectfinal.svg";
import { AuthContext } from "../../context/AuthContext";
import axios from "axios";

import { io } from "socket.io-client";

function Messenger() {
  const [conversation, setConversation] = useState([]);
  const [currentChat, setCurrentChat] = useState(null);
  const [messages, setMessages] = useState([]);
  const [arrivalMessage, setArrivalMessage] = useState(null);
  const [newMessage, setNewMessage] = useState("");
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [searchUser, setSearchUser] = useState("");
  const { user } = useContext(AuthContext);
  const socket = useRef();
  const scrollRef = useRef();
  // const  [socket, setSocket] = useState(null)

  // useEffect(()=>{
  //   setSocket(io("ws://localhost:8900"))
  // }, [])

  const converHandler = async () => {
    await axios.post("/conversations", {
      senderId: user._id,
      receiverId: searchUser._id,
    });
    window.location.reload();
  };
  const handleKeyPress = async (event) => {
    if (event.key === "Enter") {
      console.log(searchUser);
      try {
        const res = await axios("/users?username=" + searchUser);
        setSearchUser(res.data);
      } catch (e) {
        console.log(e);
      }
    }
  };

  useEffect(() => {
    socket.current = io("ws://localhost:8900");
    socket.current.on("getMessage", (data) => {
      setArrivalMessage({
        sender: data.senderId,
        text: data.text,
        createdAt: Date.now(),
      });
    });
  }, []);

  useEffect(() => {
    arrivalMessage &&
      currentChat?.members.includes(arrivalMessage.sender) &&
      setMessages((prev) => [...prev, arrivalMessage]);
  }, [arrivalMessage, currentChat]);

  useEffect(() => {
    socket.current.emit("addUser", user._id);
    socket.current.on("getUsers", (users) => {
      setOnlineUsers(
        user.following.filter((f) => users.some((u) => u.userId === f))
      );
    });
  }, [user]);
  console.log(onlineUsers)

  // useEffect(()=>{
  //   socket?.on("welcome", message=>{
  //     console.log(message)
  //   })
  // },[socket])

  useEffect(() => {
    const getConversations = async () => {
      try {
        const res = await axios.get("/conversations/" + user._id);
        setConversation(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getConversations();
  }, [user._id]);

  // console.log(currentChat);

  useEffect(() => {
    const getMessages = async () => {
      try {
        const res = await axios.get("/messages/" + currentChat._id);
        setMessages(res.data);
      } catch (err) {
        console.log(err);
      }
    };
    getMessages();
  }, [currentChat]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const message = {
      sender: user._id,
      text: newMessage,
      conversationId: currentChat._id,
    };

    const receiverId = currentChat.members.find(
      (member) => member !== user._id
    );

    socket.current.emit("sendMessage", {
      senderId: user._id,
      receiverId,
      text: newMessage,
    });

    try {
      const res = await axios.post("/messages", message);
      setMessages([...messages, res.data]);
      setNewMessage("");
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // console.log(messages);
  return (
    <>
      <div
        style={{
          height: "70px",
          position: "sticky",
          width: "100%",
          zIndex: "1",
          background: "#0b011f",
          borderBottom: "1px solid black",
        }}
      >
        <div className="topbarContainer">
          <div className="topbarleft">
            <NavLink to="/">
              <img style={{ height: 50, width: 200 }} src={logo} alt="logo" />
            </NavLink>
          </div>
          <div className="topbarCenter">
            <a href="" style={{ textDecoration: "none" }}>
              <h1
                style={{
                  color: "gray",
                  textAlign: "center",
                  fontFamily: "Roboto",
                  fontWeight: "bold",
                  textShadow: "1px 1px 1px white",
                }}
              >
                VConnect Messenger
              </h1>
            </a>
          </div>
          <div className="topbarRight">
            <div className="topbarLinks">
              <NavLink to="/">
                <span className="topbarLink">Homepage</span>
              </NavLink>
            </div>
          </div>
        </div>
      </div>
      <div className="messenger">
        <div className="chatmenu">
          <div className="menuwrap" style={{ color: "white" }}>
            <input
              className="search"
              placeholder="Add people for conversation"
              onChange={(e) => setSearchUser(e.target.value)}
              // value={searchUser}
              onKeyDown={handleKeyPress}
            />
            {searchUser ? (
              <div className="divi">
                <div
                  className="searchText"
                  onClick={converHandler}
                  style={{ cursor: "pointer" }}
                >
                  {searchUser.username}
                </div>
              </div>
            ) : (
              <></>
            )}

            {conversation.map((c) => (
              <div onClick={() => setCurrentChat(c)}>
                <Conversation conversation={c} currentUser={user} />
              </div>
            ))}
          </div>
        </div>
        <div className="chatbox" style={{ color: "white" }}>
          <div className="chatwrap">
            {currentChat ? (
              <>
                <div className="chattop" style={{ overflowY: "scroll" }}>
                  {messages.map((m) => (
                    <div ref={scrollRef}>
                      <Message message={m} own={m.sender === user._id} />
                    </div>
                  ))}
                </div>
                <div className="chatbot">
                  <textarea
                    className="type"
                    placeholder="Write to send"
                    onChange={(e) => setNewMessage(e.target.value)}
                    value={newMessage}
                  ></textarea>
                  <button className="send" onClick={handleSubmit}>
                    Send
                  </button>
                </div>
              </>
            ) : (
              <span className="noConversationText">
                Open a conversation to start a chat.
              </span>
            )}
          </div>
        </div>
        <div className="chatonl">
          <div className="onlwrap" style={{ color: "white" }}>
            <Chatonline
              onlineUsers={onlineUsers}
              currentId={user._id}
              setCurrentChat={setCurrentChat}
            />
          </div>
        </div>
      </div>
    </>
  );
}

export default Messenger;
