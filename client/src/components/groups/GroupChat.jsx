import React, { useEffect, useState, useContext, useRef } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  IconButton,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Dialog,
  DialogContent,
  DialogActions,
  Divider,
  Chip,
} from "@mui/material";
import RemoveIcon from "@mui/icons-material/Remove";
import axiosInstance from "../../utils/axiosInstance";
import { useParams } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext";
import ThumbUpIcon from "@mui/icons-material/ThumbUp";
import ThumbUpOffAltIcon from "@mui/icons-material/ThumbUpOffAlt";
import AddIcon from "@mui/icons-material/Add";

const GroupChat = () => {
  const { groupId } = useParams();
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState("");
  const [members, setMembers] = useState([]);
  const [admins, setAdmins] = useState([]);
  const [allUsers, setAllUsers] = useState([]);
  const [groupName, setGroupName] = useState("");
  const [openMembers, setOpenMembers] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const { user } = useContext(AuthContext);
  const currentUser = user;

  const messageEndRef = useRef(null);
  const scrollToBottom = () => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    const fetchMessages = async () => {
        try {
          const response = await axiosInstance.get(
            `/api/groups/${groupId}/messages`
          );
          const sortedMessages = response.data
            .map((msg) => ({
              ...msg,
              likes: msg.likeCount || 0,
              likedBy: msg.likedBy || [],
            }))
            .sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));
    
          setMessages(sortedMessages);
          scrollToBottom();
        } catch (error) {
          console.error("Error fetching messages:", error);
        }
      };

    const fetchGroupDetails = async () => {
      try {
        const response = await axiosInstance.get(
          `/api/groups/${groupId}/details`
        );
        setGroupName(response.data?.group?.name);
        setMembers(response.data?.group?.members || []);
        setAdmins(response.data?.group?.admins || []);

        const usersResponse = await axiosInstance.get("/api/admin/users");
        setAllUsers(usersResponse.data.users);
      } catch (error) {
        console.error("Error fetching group details:", error);
      }
    };

    fetchMessages();
    fetchGroupDetails();
  }, [groupId]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendMessage = async () => {
    if (newMessage.trim() === "") return;
    try {
      const response = await axiosInstance.post(
        `/api/groups/${groupId}/messages`,
        { text: newMessage }
      );
      setMessages((prev) => [...prev, response.data]);
      setNewMessage("");
      scrollToBottom();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const handleAddMember = async (userId) => {
    try {
      await axiosInstance.post(`/api/groups/${groupId}/members/add`, {
        userId,
      });
      const newMember = allUsers.find((user) => user._id === userId);
      if (newMember) {
        setMembers((prev) => [...prev, newMember]);
      }
    } catch (error) {
      console.error("Error adding member:", error);
    }
  };

  const handleRemoveMember = async (userId) => {
    try {
      const response = await axiosInstance.delete(
        `/api/groups/${groupId}/members/${userId}`
      );
      if (response.status === 200) {
        setMembers((prev) => prev.filter((member) => member._id !== userId));
      }
    } catch (error) {
      console.error("Error removing member:", error);
    }
  };

  const handleLikeMessage = async (messageId) => {
    try {
      const response = await axiosInstance.post(
        `/api/groups/${groupId}/messages/${messageId}/like`
      );
      setMessages((prevMessages) =>
        prevMessages.map((msg) =>
          msg._id === messageId
            ? {
                ...msg,
                likes: response.data.likes,
                likedBy: response.data.likedBy,
              }
            : msg
        )
      );
    } catch (error) {
      console.error("Error liking message:", error);
    }
  };

  const filteredUsersToAdd = allUsers.filter((user) =>
    user.username.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const usersToAdd = filteredUsersToAdd.filter(
    (user) =>
      !members.some((member) => member._id === user._id) &&
      !admins.some((admin) => admin._id === user._id)
  );

  return (
    <Box sx={{ height: "100vh", display: "flex", flexDirection: "column" }}>
      <Box
        sx={{
          position: "fixed",
          top: 64,
          width: "72%",
          backgroundColor: "white",
          zIndex: 100,
          boxShadow: "0px 2px 5px rgba(0, 0, 0, 0.1)",
          p: 2,
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
        <Typography variant="h6" gutterBottom>
        {groupName.toUpperCase() || "GROUP CHAT"}
      </Typography>
          <Box />
          <Button variant="contained" startIcon={<AddIcon />} onClick={() => setOpenMembers(true)}>
            Manage Members
          </Button>
        </Box>
      </Box>

      <Box
  sx={{
    flexGrow: 1,
    overflowY: "auto",
    p: 2,
    scrollBehavior: "smooth",
    bgcolor: "background.paper",
  }}
>
  <List>
    {messages.map((msg, index) => {
      const isCurrentUser = msg.sender._id === currentUser._id;
      const isLikedByCurrentUser =
        msg.likedBy?.includes(currentUser._id) || false;

      return (
        <ListItem
          key={index}
          sx={{
            display: "flex",
            justifyContent: isCurrentUser ? "flex-end" : "flex-start",
          }}
        >
          <Box
            sx={{
              backgroundColor: isCurrentUser ? "#d1e7dd" : "#f8d7da",
              borderRadius: "12px",
              padding: "10px",
              maxWidth: "75%",
              wordWrap: "break-word",
              boxShadow: "0px 3px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <Typography
              variant="body2"
              sx={{
                fontWeight: "bold",
                color: isCurrentUser ? "#155724" : "#721c24",
                textAlign: isCurrentUser ? "right" : "left",
                marginBottom: "5px",
              }}
            >
              {isCurrentUser ? "You" : msg.sender.username}
            </Typography>

            <ListItemText
              primary={msg.text}
              sx={{ textAlign: isCurrentUser ? "right" : "left" }}
            />
            <Box
              sx={{
                display: "flex",
                justifyContent: "flex-end",
                alignItems: "center",
                marginTop: "5px",
              }}
            >
              <IconButton
                onClick={() => handleLikeMessage(msg._id)}
                color="primary"
              >
                {isLikedByCurrentUser ? (
                  <ThumbUpIcon />
                ) : (
                  <ThumbUpOffAltIcon />
                )}
              </IconButton>
              <Typography variant="body2" sx={{ marginLeft: "5px" }}>
                {msg.likes} {msg.likes === 1 ? "Like" : "Likes"}
              </Typography>
            </Box>
          </Box>
        </ListItem>
      );
    })}
  </List>

  <div ref={messageEndRef} />
</Box>

      <div
        style={{
          position: "sticky",
          bottom: "-15px",
          width: "100%",
          backgroundColor: "white",
          zIndex: 100,
          boxShadow: "0 -2px 10px rgba(0,0,0,0.1)",
        }}
      >
        <Divider />
        <Box sx={{ display: "flex", p: 1, bgcolor: "background.paper" }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Type a message..."
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            sx={{ marginRight: 1, bgcolor: "white" }}
          />
          <Button
            onClick={handleSendMessage}
            color="primary"
            variant="contained"
          >
            Send
          </Button>
        </Box>
      </div>

      <Dialog open={openMembers} onClose={() => setOpenMembers(false)}>
        <DialogContent>
          <Typography variant="h6" sx={{ paddingBottom: 1 }}>
            Current Members
          </Typography>
          <List>
            {[...admins, ...members].map((user) => {
              const userInfo = allUsers.find((u) => u._id === user._id);
              const isAdmin = admins.some((admin) => admin._id === user._id);
              const isCurrentUserAdmin = admins.some((admin) => admin._id === currentUser._id);
              return (
                <ListItem key={user._id}>
                  <ListItemText
                    primary={
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "space-between",
                          padding: "4px 0",
                        }}
                      >
                        <span style={{ display: "flex", alignItems: "center" }}>
                          {userInfo?.username}
                          {isAdmin ? (
                            <Chip
                              label="Admin"
                              color="primary"
                              size="small"
                              sx={{
                                marginLeft: 5,
                                backgroundColor: "red",
                                color: "white",
                                borderRadius: "10px",
                                padding: "1px 1px",
                              }}
                            />
                          ) : (
                            <Chip
                              label="Member"
                              size="small"
                              sx={{
                                marginLeft: 4,
                                backgroundColor: "#1976d2",
                                color: "white",
                                borderRadius: "10px",
                                padding: "1px 1px",
                              }}
                            />
                          )}
                        </span>
                      </Box>
                    }
                  />
                  <ListItemSecondaryAction>
                    {isCurrentUserAdmin ? (
                      <IconButton
                        edge="end"
                        onClick={() => handleRemoveMember(user._id)}
                      >
                        <RemoveIcon />
                      </IconButton>
                    ) : null}
                  </ListItemSecondaryAction>
                </ListItem>
              );
            })}
          </List>
          <Divider />
          <Typography variant="h6" sx={{ paddingTop: 2, paddingBottom: 1 }}>
            Add Members
          </Typography>
          <TextField
            fullWidth
            label="Search Users"
            variant="outlined"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            sx={{ marginBottom: 2 }}
          />
          <List>
            {usersToAdd.map((user) => (
              <ListItem key={user._id}>
                <ListItemText primary={user.username} />
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => handleAddMember(user._id)}
                  >
                    <AddIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </ListItem>
            ))}
          </List>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenMembers(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default GroupChat;
