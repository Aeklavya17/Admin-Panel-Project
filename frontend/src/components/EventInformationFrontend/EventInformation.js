import React, { useState, useEffect } from 'react';
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

  useEffect(() => {
    fetchEvents();
  }, []);

  const fetchEvents = async () => {
    try {
      const response = await axios.get('http://localhost:5001/events');
      setEvents(response.data);
    } catch (error) {
      console.error('Error fetching events:', error);
    }
  };

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
        await axios.patch(`http://localhost:5001/events/${form.id}`, formData);
      } else {
        await axios.post('http://localhost:5001/events', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });
      }

      resetForm();
      fetchEvents();
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
              label="Lowest Ticket Price (₹)"
              name="lowest_ticket_price"
              value={form.lowest_ticket_price}
              onChange={handleChange}
              type="number"
              required
              fullWidth
              InputProps={{
                inputProps: { min: 0 },
              }}
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
              fullWidth
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
            <FormControlLabel
              className={classes.formItem}
              control={
                <Checkbox
                  checked={form.tickets_available}
                  onChange={handleChange}
                  name="tickets_available"
                />
              }
              label="Tickets Available"
            />
            <input
              accept="image/*"
              style={{ display: 'none' }}
              id="contained-button-file"
              type="file"
              onChange={handleChange}
              name="photo"
            />
            <label htmlFor="contained-button-file">
              <Button
                variant="contained"
                color="primary"
                component="span"
                className={classes.formItem}
                fullWidth
              >
                Upload Thumbnail
              </Button>
            </label>
            {preview && (
              <div className={classes.preview}>
                <img src={preview} alt="Thumbnail Preview" style={{ maxWidth: '100%' }} />
              </div>
            )}
            <DialogActions>
              <Button onClick={handleClose} color="secondary">
                Cancel
              </Button>
              <Button type="submit" variant="contained" color="primary">
                {isUpdating ? 'Update' : 'Create'}
              </Button>
            </DialogActions>
          </form>
        </DialogContent>
      </Dialog>

      <Grid container spacing={3}>
        {events.map((event) => (
          <Grid item xs={12} sm={6} md={4} key={event.id}>
            <Card className={classes.eventCard}>
              <CardMedia
                className={classes.media}
                image={event.thumbnail_url}
                title={event.name}
              />
              <CardContent>
                <Typography gutterBottom variant="h5" component="div">
                  {event.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Category: {event.category}
                  <br />
                  Language: {event.language}
                  <br />
                  City: {event.city}
                  <br />
                  Duration: {event.duration} hours
                  <br />
                  Lowest Ticket Price: {formatCurrency(event.lowest_ticket_price)}
                  <br />
                  Tickets Available: {event.tickets_available ? 'Yes' : 'No'}
                  <br />
                  Age Criteria: {event.age_criteria}
                  <br />
                  Tags: {event.tags}
                </Typography>
                <Button
                  variant="contained"
                  color="primary"
                  onClick={() => handleEdit(event)}
                  fullWidth
                  size="small"
                  style={{ marginTop: '8px' }}
                >
                  Edit
                </Button>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
};

export default EventInformation;
