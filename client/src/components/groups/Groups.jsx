import React, { useEffect, useState } from 'react';
import {
  Box,
  Button,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Typography,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import axiosInstance from '../../utils/axiosInstance';
import { useNavigate } from 'react-router-dom';

const Groups = () => {
  const [groups, setGroups] = useState([]);
  const [open, setOpen] = useState(false);
  const [newGroup, setNewGroup] = useState({ name: '' });
  const navigate = useNavigate();

  useEffect(() => {
    const fetchGroups = async () => {
      try {
        const response = await axiosInstance.get('/api/groups');
        setGroups(response.data || []);
      } catch (error) {
        console.error('Error fetching groups:', error);
      }
    };

    fetchGroups();
  }, []);

  const handleDelete = async (event, id) => {
    event.stopPropagation();
    try {
      await axiosInstance.delete(`/api/groups/${id}`);
      setGroups((prevGroups) => prevGroups.filter((group) => group._id !== id));
    } catch (error) {
      console.error('Error deleting group:', error);
    }
  };

  const handleClickOpen = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
    setNewGroup({ name: '' });
  };

  const handleChange = (event) => {
    const { name, value } = event.target;
    setNewGroup((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    const token = localStorage.getItem('token');
    try {
      const response = await axiosInstance.post('/api/groups/create', newGroup, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      setGroups((prevGroups) => [...prevGroups, response.data.group]);
      handleClose();
    } catch (error) {
      console.error('Error adding group:', error);
    }
  };

  const handleGroupClick = (groupId) => {
    navigate(`/group-chat/${groupId}`);
  };

  return (
    <Box>
      <Typography variant="h6" gutterBottom>
        Manage Groups
      </Typography>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Box />
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleClickOpen}>
          Add Group
        </Button>
      </Box>

      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Group Name</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {groups.map((group) => (
              <TableRow key={group._id} onClick={() => handleGroupClick(group._id)} style={{ cursor: 'pointer' }}>
                <TableCell>{group.name}</TableCell>
                <TableCell align="right">
                  <Button variant="outlined" color="secondary" onClick={(event) => handleDelete(event, group._id)}>
                    Delete
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>

      <Dialog open={open} onClose={handleClose} fullWidth>
        <DialogTitle>Add New Group</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Group Name"
            type="text"
            fullWidth
            variant="outlined"
            value={newGroup.name}
            onChange={handleChange}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Cancel
          </Button>
          <Button onClick={handleSubmit} color="primary">
            Add
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default Groups;
