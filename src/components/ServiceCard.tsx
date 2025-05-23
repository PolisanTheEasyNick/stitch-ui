import React from 'react';
import { Card, CardContent, Typography, Box, Chip } from '@mui/material';
import CircleIcon from '@mui/icons-material/Circle';

interface ServiceCardProps {
  name: string;
  lastUpdate: string;
  alive: boolean;
}

const ServiceCard: React.FC<ServiceCardProps> = ({ name, lastUpdate, alive }) => {
  return (
    <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">{name}</Typography>
          <Chip
            label={alive ? 'Alive' : 'Offline'}
            icon={
              <CircleIcon sx={{ fontSize: 12, color: alive ? 'green' : 'red' }} />
            }
            color={alive ? 'success' : 'error'}
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" mt={1}>
          Last update: {lastUpdate}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
