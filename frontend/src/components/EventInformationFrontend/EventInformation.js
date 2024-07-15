import React, { useState, useEffect, useCallback } from 'react';
import axios from 'axios';
import {
  Container,
  TextField,
  Button,
  MenuItem,
  Grid,
  Typography,
  Card,
  CardContent,
  CardMedia,
  Checkbox,
  FormControlLabel,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
} from '@mui/material';
import { styled } from '@mui/system';

const useStyles = styled((theme) => ({
  container: {
    marginTop: theme.spacing(4),
  },
  formContainer: {
    marginBottom: theme.spacing(4),
  },
  form: {
    display: 'grid',
    gap: theme.spacing(2),
    gridTemplateColumns: '1fr 1fr',
  },
  formItem: {
    gridColumn: 'span 1',
  },
  preview: {
    marginTop: theme.spacing(2),
    marginBottom: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  media: {
    height: 140,
  },
  eventCard: {
    marginTop: theme.spacing(4),
  },
}));

const languageOptions = ['English', 'Hindi', 'Gujarati', 'Marathi'];
const cityOptions = ['Mumbai', 'Pune', 'Indore'];
const categoryOptions = ['Music', 'Art', 'Tech'];

const EventInformation = () => {
  const classes = useStyles();
  const [events, setEvents] = useState([]);
  const [form, setForm] = useState({
    name: '',
    category: '',
    duration: '',
    photo: null,
    language: '',
    about: '',
    city: '',
    lowest_ticket_price: '',
    age_criteria: '',
    tags: '',
    tickets_available: false,
  });
  const [preview, setPreview] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [open, setOpen] = useState(false);
  const apiUrl = process.env.REACT_BACKEND_API_URL;

  // Define fetchEvents using useCallback to avoid unnecessary re-creations
  const fetchEvents = useCallback(async () => {
    try {
      const response = await axios.get(`${apiUrl}/events`);
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  }, [apiUrl]);

  // Call fetchEvents when the component mounts or apiUrl changes
  useEffect(() => {
    fetchEvents();
  }, [fetchEvents]);

  const handleChange = (e) => {
    if (e.target.name === 'photo') {
      setForm({ ...form, photo: e.target.files[0] });
      setPreview(URL.createObjectURL(e.target.files[0]));
    } else if (e.target.name === 'tickets_available') {
      setForm({ ...form, tickets_available: e.target.checked });
    } else {
      setForm({ ...form, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData();
    for (let key in form) {
      formData.append(key, form[key]);
    }

    try {
      if (isUpdating) {
        await axios.patch(`${apiUrl}/events/${form.id}`, formData);
      } else {
        await axios.post(`${apiUrl}/events`, formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      resetForm();
      fetchEvents();  // Fetch events again after form submission
      handleClose();
    } catch (error) {
      console.error('Error submitting event:', error);
    }
  };

  const handleEdit = (event) => {
    setForm({
      id: event.id,
      name: event.name,
      category: event.category,
      duration: event.duration,
      photo: null,
      language: event.language,
      about: event.about,
      city: event.city,
      lowest_ticket_price: event.lowest_ticket_price,
      age_criteria: event.age_criteria,
      tags: event.tags,
      tickets_available: event.tickets_available,
    });
    setIsUpdating(true);
    setPreview(event.thumbnail_url);
    handleOpen();
  };

  const resetForm = () => {
    setForm({
      name: '',
      category: '',
      duration: '',
      photo: null,
      language: '',
      about: '',
      city: '',
      lowest_ticket_price: '',
      age_criteria: '',
      tags: '',
      tickets_available: false,
    });
    setPreview('');
    setIsUpdating(false);
  };

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    resetForm();
    setOpen(false);
  };

  const formatCurrency = (amount) => `₹${amount}`;

  return (
    <Container className={classes.container}>
      <Grid container spacing={3} className={classes.formContainer}>
        <Grid item xs={12}>
          <Typography variant="h4" align="center">
            {isUpdating ? 'Update Event' : 'Create Event'}
          </Typography>
        </Grid>
        <Grid item xs={12}>
          <Button
            variant="contained"
            color="primary"
            onClick={handleOpen}
            fullWidth
            size="large"
          >
            {isUpdating ? 'Update Event' : 'Create Event'}
          </Button>
        </Grid>
      </Grid>

      <Dialog open={open} onClose={handleClose} fullWidth maxWidth="sm">
        <DialogTitle>{isUpdating ? 'Update Event' : 'Create Event'}</DialogTitle>
        <DialogContent>
          <form className={classes.form} onSubmit={handleSubmit}>
            <TextField
              className={classes.formItem}
              label="Name"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              className={classes.formItem}
              label="Category"
              name="category"
              value={form.category}
              onChange={handleChange}
              select
              required
              fullWidth
            >
              {categoryOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              className={classes.formItem}
              label="Duration (hours)"
              name="duration"
              value={form.duration}
              onChange={handleChange}
              type="number"
              required
              fullWidth
            />
            <TextField
              className={classes.formItem}
              label="Language"
              name="language"
              value={form.language}
              onChange={handleChange}
              select
              required
              fullWidth
            >
              {languageOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              className={classes.formItem}
              label="City"
              name="city"
              value={form.city}
              onChange={handleChange}
              select
              required
              fullWidth
            >
              {cityOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              className={classes.formItem}
              label="Lowest Ticket Price"
              name="lowest_ticket_price"
              value={form.lowest_ticket_price}
              onChange={handleChange}
              type="number"
              required
              fullWidth
            />
            <TextField
              className={classes.formItem}
              label="Age Criteria"
              name="age_criteria"
              value={form.age_criteria}
              onChange={handleChange}
              required
              fullWidth
            />
            <TextField
              className={classes.formItem}
              label="Tags"
              name="tags"
              value={form.tags}
              onChange={handleChange}
              required
              fullWidth
            />
            <FormControlLabel
              className={classes.formItem}
              control={
                <Checkbox
                  checked={form.tickets_available}
                  onChange={handleChange}
                  name="tickets_available"
                  color="primary"
                />
              }
              label="Tickets Available"
            />
            <TextField
              className={classes.formItem}
              label="About"
              name="about"
              value={form.about}
              onChange={handleChange}
              multiline
              rows={4}
              required
              fullWidth
            />
            <div className={classes.formItem}>
              <Button
                variant="contained"
                component="label"
                fullWidth
              >
                Upload Photo
                <input
                  type="file"
                  name="photo"
                  hidden
                  onChange={handleChange}
                  required={!isUpdating}
                />
              </Button>
            </div>
            {preview && (
              <div className={classes.preview}>
                <Card>
                  <CardMedia
                    className={classes.media}
                    image={preview}
                    title="Event Photo"
                  />
                </Card>
              </div>
            )}
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button type="submit" color="primary">
                {isUpdating ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      {events.map((event) => (
        <Card className={classes.eventCard} key={event.id}>
          <CardMedia
            component="img"
            alt={event.name}
            height="140"
            image={event.thumbnail_url}
            title={event.name}
          />
          <CardContent>
            <Typography gutterBottom variant="h5" component="h2">
              {event.name}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {event.about}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`Category: ${event.category}`}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`Duration: ${event.duration} hours`}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`Language: ${event.language}`}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`City: ${event.city}`}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`Lowest Ticket Price: ${formatCurrency(event.lowest_ticket_price)}`}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`Age Criteria: ${event.age_criteria}`}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`Tags: ${event.tags}`}
            </Typography>
            <Typography variant="body2" color="textSecondary" component="p">
              {`Tickets Available: ${event.tickets_available ? 'Yes' : 'No'}`}
            </Typography>
            <Button
              variant="contained"
              color="primary"
              onClick={() => handleEdit(event)}
            >
              Edit
            </Button>
          </CardContent>
        </Card>
      ))}
    </Container>
  );
};

export default EventInformation;
