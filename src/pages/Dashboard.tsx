import { useEffect, useState } from 'react';
import ServiceCard from '../components/ServiceCard';
import { Container, Typography } from '@mui/material';
import axios from 'axios';

interface ServiceStatus {
  name: string;
  last_update: string;
  alive: boolean;
}

const Dashboard = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);

  useEffect(() => {
    axios.get('https://api.polisan.dev/services/status')
      .then(res => setServices(res.data))
      .catch(err => console.error(err));
  }, []);

  return (
    <Container sx={{ mt: 4 }}>
      <Typography variant="h4" gutterBottom>
        Service Dashboard
      </Typography>
      {services.map((svc, i) => (
        <ServiceCard
          key={i}
          name={svc.name}
          lastUpdate={svc.last_update}
          alive={svc.alive}
        />
      ))}
    </Container>
  );
};

export default Dashboard;
