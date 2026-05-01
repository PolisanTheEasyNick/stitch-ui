import { useEffect, useMemo, useState } from "react";
import {
  Alert,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  Typography,
} from "@mui/material";
import { apiUrl } from "../api";

const STATUS_URL = apiUrl("/config/import/status");

const emojiTypeOptions = [
  { value: "default", label: "Default emojis" },
  { value: "ny", label: "New Year emojis" },
  { value: "sleep", label: "Sleep emojis" },
  { value: "walk", label: "Walking emojis" },
];

type StatusResponse = {
  data_dir: string;
  files: Record<string, { exists: boolean; size?: number; modified?: number }>;
};

async function uploadFile(endpoint: string, file: File, extraParams?: Record<string, string>) {
  const formData = new FormData();
  formData.append("file", file);

  const url = new URL(endpoint, window.location.origin);
  Object.entries(extraParams || {}).forEach(([key, value]) => {
    url.searchParams.set(key, value);
  });

  const response = await fetch(url.toString(), {
    method: "POST",
    body: formData,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(payload.detail || payload.message || "Upload failed");
  }
  return payload;
}

function FileStatusChip({ exists }: { exists?: boolean }) {
  return (
    <Chip
      size="small"
      color={exists ? "success" : "default"}
      label={exists ? "present" : "missing"}
      variant={exists ? "filled" : "outlined"}
    />
  );
}

export default function Imports() {
  const [status, setStatus] = useState<StatusResponse | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busyKey, setBusyKey] = useState<string | null>(null);
  const [emojiType, setEmojiType] = useState("default");

  const sections = useMemo(
    () => [
      {
        key: "telegram-session",
        title: "Telegram session",
        description: "Upload the Telethon .session file used by stitch-core.",
        accept: ".session,application/octet-stream",
        endpoint: apiUrl("/config/import/telegram-session"),
        statusKey: "telegram_session",
      },
      {
        key: "spotify-token",
        title: "Spotify token cache",
        description: "Upload the existing sp_token cache file.",
        accept: ".txt,application/octet-stream",
        endpoint: apiUrl("/config/import/spotify-token"),
        statusKey: "spotify_token",
      },
      {
        key: "quotes",
        title: "Quotes import",
        description: "Accepts JSON array or plain text, one quote per line.",
        accept: ".json,.txt,text/plain,application/json",
        endpoint: apiUrl("/config/import/quotes"),
        statusKey: "quotes",
      },
      {
        key: "games",
        title: "Games import",
        description: "Accepts JSON exported from your games config.",
        accept: ".json,application/json",
        endpoint: apiUrl("/config/import/games"),
        statusKey: "games",
      },
    ],
    []
  );

  const refreshStatus = async () => {
    try {
      const response = await fetch(STATUS_URL);
      const payload = await response.json();
      setStatus(payload);
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    refreshStatus();
  }, []);

  const handleUpload = async (
    key: string,
    endpoint: string,
    file: File,
    extraParams?: Record<string, string>
  ) => {
    setBusyKey(key);
    setMessage(null);
    setError(null);
    try {
      const result = await uploadFile(endpoint, file, extraParams);
      setMessage(result.count ? `Imported ${result.count} entries successfully.` : `${file.name} uploaded successfully.`);
      await refreshStatus();
    } catch (e: any) {
      setError(e.message || String(e));
    } finally {
      setBusyKey(null);
    }
  };

  return (
    <Box sx={{ p: 4, color: "white", display: "flex", flexDirection: "column", gap: 3 }}>
      <Box>
        <Typography variant="h4" gutterBottom>
          Data Imports
        </Typography>
        <Typography variant="body1" sx={{ opacity: 0.8 }}>
          Runtime data now lives in the stitch-core /data volume. Use this page to import legacy files instead of poking container paths manually.
        </Typography>
      </Box>

      {message && <Alert severity="success">{message}</Alert>}
      {error && <Alert severity="error">{error}</Alert>}

      <Card sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "white" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Volume status
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Data directory: {status?.data_dir || "loading..."}
          </Typography>
          <Stack direction="row" spacing={1} useFlexGap flexWrap="wrap">
            <Chip label="quotes.json" color={status?.files.quotes?.exists ? "success" : "default"} />
            <Chip label="games.json" color={status?.files.games?.exists ? "success" : "default"} />
            <Chip label="default emojis" color={status?.files.default_emojis?.exists ? "success" : "default"} />
            <Chip label="NY emojis" color={status?.files.ny_emojis?.exists ? "success" : "default"} />
            <Chip label="sleep emojis" color={status?.files.sleep_emojis?.exists ? "success" : "default"} />
            <Chip label="walk emojis" color={status?.files.walk_emojis?.exists ? "success" : "default"} />
            <Chip label="Telegram session" color={status?.files.telegram_session?.exists ? "success" : "default"} />
            <Chip label="Spotify token" color={status?.files.spotify_token?.exists ? "success" : "default"} />
          </Stack>
        </CardContent>
      </Card>

      <Card sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "white" }}>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Emoji import
          </Typography>
          <Typography variant="body2" sx={{ mb: 2, opacity: 0.8 }}>
            Accepts JSON array or plain text, one emoji per line.
          </Typography>
          <Stack direction={{ xs: "column", sm: "row" }} spacing={2} alignItems={{ sm: "center" }}>
            <FormControl size="small" sx={{ minWidth: 220 }}>
              <InputLabel id="emoji-type-label">Emoji set</InputLabel>
              <Select
                labelId="emoji-type-label"
                value={emojiType}
                label="Emoji set"
                onChange={(e) => setEmojiType(e.target.value)}
              >
                {emojiTypeOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <FileStatusChip exists={status?.files[`${emojiType === "ny" ? "ny" : emojiType}_emojis`]?.exists} />
            <Button variant="contained" component="label" disabled={busyKey === "emoji"}>
              {busyKey === "emoji" ? "Uploading..." : "Upload emoji file"}
              <input
                hidden
                type="file"
                accept=".json,.txt,text/plain,application/json"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) {
                    void handleUpload("emoji", apiUrl("/config/import/emoji"), file, { type: emojiType });
                  }
                  e.currentTarget.value = "";
                }}
              />
            </Button>
          </Stack>
        </CardContent>
      </Card>

      {sections.map((section) => (
        <Card key={section.key} sx={{ bgcolor: "rgba(255,255,255,0.08)", color: "white" }}>
          <CardContent>
            <Stack direction={{ xs: "column", sm: "row" }} justifyContent="space-between" spacing={2}>
              <Box>
                <Typography variant="h6">{section.title}</Typography>
                <Typography variant="body2" sx={{ opacity: 0.8 }}>
                  {section.description}
                </Typography>
              </Box>
              <Stack direction="row" spacing={1} alignItems="center">
                <FileStatusChip exists={status?.files[section.statusKey]?.exists} />
                <Button variant="contained" component="label" disabled={busyKey === section.key}>
                  {busyKey === section.key ? "Uploading..." : "Choose file"}
                  <input
                    hidden
                    type="file"
                    accept={section.accept}
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) {
                        void handleUpload(section.key, section.endpoint, file);
                      }
                      e.currentTarget.value = "";
                    }}
                  />
                </Button>
              </Stack>
            </Stack>
          </CardContent>
        </Card>
      ))}
    </Box>
  );
}
