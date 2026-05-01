import React from "react";
import { Card, CardContent, Typography, Box, Chip } from "@mui/material";
import CircleIcon from "@mui/icons-material/Circle";

interface ServiceCardProps {
  name: string;
  lastUpdate: string;
  alive: boolean;
  extra?: React.ReactNode;
  subtext?: string;
}

const formatDate = (isoDate: string) => {
  try {
    const date = new Date(isoDate);
    return date.toLocaleString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  } catch {
    return isoDate;
  }
};

const ServiceCard: React.FC<ServiceCardProps> = ({
  name,
  lastUpdate,
  alive,
  extra,
  subtext,
}) => {
  return (
    <Card variant="outlined" sx={{ minWidth: 275, borderRadius: 2, mb: 2 }}>
      <CardContent>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="center"
          mb={1}
        >
          <Typography variant="h6">{name}</Typography>
          <Chip
            label={alive ? "Alive" : "Offline"}
            icon={
              <CircleIcon
                sx={{ fontSize: 12, color: alive ? "green" : "red" }}
              />
            }
            color={alive ? "success" : "error"}
            variant="outlined"
          />
        </Box>
        <Typography variant="body2" color="text.secondary" mb={1}>
          Last update: {formatDate(lastUpdate)}
        </Typography>

        {subtext && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {subtext}
          </Typography>
        )}

        {extra}
      </CardContent>
    </Card>
  );
};

export default ServiceCard;
