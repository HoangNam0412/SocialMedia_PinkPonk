import { Container, Grid, Paper, Typography } from '@mui/material';
import React from 'react';

const AdminDashboard: React.FC = () => {
  return (
    <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
      <Grid container spacing={3}>
        <Grid item xs={12}>
          <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column' }}>
            <Typography component="h1" variant="h4" color="primary" gutterBottom>
              Admin Dashboard
            </Typography>
            <Typography variant="body1">
              Welcome to the admin dashboard. Here you can manage users, content, and system settings.
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Container>
  );
};

export default AdminDashboard; 