import { useState, useEffect } from "react";
import {
  Box,
  Button,
  Typography,
  TextField,
  Card,
  CardContent,
  CircularProgress,
} from "@mui/material";
import { apiUrl } from "../api";

const PILED_URL = apiUrl("/piled/default");

export default function Piled() {
  const [currentDefault, setCurrentDefault] = useState<string>("");
  const [newColor, setNewColor] = useState<string>("#ffffff");
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchDefaultColor();
  }, []);

  const fetchDefaultColor = async () => {
    setLoading(true);
    try {
      const res = await fetch(PILED_URL);
      const data = await res.json();
      setCurrentDefault(data.color);
      if (data.color.startsWith("#")) {
        setNewColor(data.color);
      } else {
        setNewColor(`#${data.color}`);
      }
    } catch (e) {
      console.error("Failed to fetch default color", e);
    } finally {
      setLoading(false);
    }
  };

  const saveColor = async () => {
    setSaving(true);
    try {
      const res = await fetch(PILED_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ color: newColor }),
      });

      if (res.ok) {
        const data = await res.json();
        setCurrentDefault(data.new_default);
        alert("Default color updated successfully!");
      } else {
        alert("Failed to update color");
      }
    } catch (e) {
      console.error("Failed to save color", e);
      alert("Error saving color");
    } finally {
      setSaving(false);
    }
  };

  const handleColorChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setNewColor(event.target.value);
  };

  return (
    <Box
      sx={{
        p: 4,
        color: "white",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        gap: 3,
      }}
    >
      <Typography variant="h4">PiLED Configuration</Typography>

      <Card sx={{ maxWidth: 500, bgcolor: "rgba(255, 255, 255, 0.1)", color: "white" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Default Startup Color
          </Typography>

          {loading ? (
            <CircularProgress />
          ) : (
            <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
              <Typography variant="body1">
                Current Default: <strong>{currentDefault}</strong>
              </Typography>

              <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
                <input
                  type="color"
                  value={newColor}
                  onChange={handleColorChange}
                  style={{
                    width: "50px",
                    height: "50px",
                    border: "none",
                    cursor: "pointer",
                    backgroundColor: "transparent",
                  }}
                />
                <TextField
                  label="Hex Color"
                  value={newColor}
                  onChange={handleColorChange}
                  sx={{
                    input: { color: "white" },
                    label: { color: "white" },
                    fieldset: { borderColor: "white" },
                  }}
                />
              </Box>

              <Button
                variant="contained"
                onClick={saveColor}
                disabled={saving}
                sx={{ mt: 2 }}
              >
                {saving ? "Saving..." : "Set as Default"}
              </Button>
            </Box>
          )}
        </CardContent>
      </Card>
    </Box>
  );
}
