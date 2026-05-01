import { useEffect, useState } from "react";
import ServiceCard from "../components/ServiceCard";
import { Container, Typography, Button } from "@mui/material";
import axios from "axios";
import { apiUrl } from "../api";

interface ServiceConfig {
  name: string;
  healthCheckUrl: string;
  toggleUrl?: string;
  detailsUrl?: string;
}

interface ServiceStatus {
  name: string;
  last_update: string;
  alive: boolean;
  running?: boolean;
  toggleUrl?: string;
  subtext?: string;
}

const servicesConfig: ServiceConfig[] = [
  {
    name: "Spotify",
    healthCheckUrl: apiUrl("/services/spotify/status"),
    toggleUrl: apiUrl("/services/spotify/toggle"),
    detailsUrl: apiUrl("/spotify"),
  },
];

const Dashboard = () => {
  const [services, setServices] = useState<ServiceStatus[]>([]);
  const [loadingToggle, setLoadingToggle] = useState<string | null>(null);

  useEffect(() => {
    Promise.all(
      servicesConfig.map(async (svc) => {
        try {
          const res = await axios.get(svc.healthCheckUrl);
          let subtext: string | undefined = undefined;

          if (svc.name === "Spotify" && svc.detailsUrl) {
            try {
              const spotifyInfo = await axios.get(svc.detailsUrl);
              const { artist, song } = spotifyInfo.data;
              subtext = artist && song ? `${artist} — ${song}` : "No song info";
            } catch {
              subtext = "No song info";
            }
          }

          return {
            name: svc.name,
            last_update: res.data.last_update || "unknown",
            alive: res.data.running ?? res.data.alive ?? false,
            running: res.data.running ?? undefined,
            toggleUrl: svc.toggleUrl,
            subtext,
          };
        } catch {
          return {
            name: svc.name,
            last_update: "error",
            alive: false,
            toggleUrl: svc.toggleUrl,
          };
        }
      })
    ).then(setServices);
  }, []);

  const handleToggle = async (svc: ServiceStatus) => {
    if (!svc.toggleUrl) return;
    setLoadingToggle(svc.name);
    try {
      await axios.post(svc.toggleUrl);
      const statusRes = await axios.get(
        servicesConfig.find((s) => s.name === svc.name)!.healthCheckUrl
      );
      setServices((prev) =>
        prev.map((s) =>
          s.name === svc.name
            ? {
                ...s,
                alive: statusRes.data.running ?? s.alive,
                running: statusRes.data.running ?? s.running,
                last_update: statusRes.data.last_update ?? s.last_update,
              }
            : s
        )
      );
    } catch (e) {
      console.error(e);
    } finally {
      setLoadingToggle(null);
    }
  };

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
          subtext={svc.subtext}
          extra={
            svc.toggleUrl ? (
              <Button
                variant="outlined"
                size="small"
                onClick={() => handleToggle(svc)}
                disabled={loadingToggle === svc.name}
              >
                {svc.running ? "Stop" : "Start"}
              </Button>
            ) : null
          }
        />
      ))}
    </Container>
  );
};

export default Dashboard;
