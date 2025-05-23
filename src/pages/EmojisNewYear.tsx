import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  TextField,
  Typography,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { NavigateBefore, NavigateNext, LastPage } from "@mui/icons-material";

const API_URL = "https://api.polisan.dev/config/emoji";

export default function Emojis() {
  const [emojis, setEmojis] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const emojisPerPage = 10;
  const displayedEmojis = emojis.slice(
    page * emojisPerPage,
    (page + 1) * emojisPerPage
  );

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then(setEmojis)
      .catch(() => setEmojis([]));
  }, []);

  const validateEmoji = (text: string) => {
    if (text.length === 0) return "Emoji cannot be empty";

    const isDuplicate = emojis.some((e, i) => e === text && i !== editingIndex);
    if (isDuplicate) return "Emoji must be unique";

    return null;
  };

  const addEmoji = () => {
    const newEmojis = [...emojis, ""];
    const newIndex = newEmojis.length - 1;
    const newPage = Math.floor(newIndex / emojisPerPage);

    setEmojis(newEmojis);
    setPage(newPage);
    setEditingIndex(newIndex);
    setEditingText("");
  };

  const deleteEmoji = (index: number) => {
    setEmojis(emojis.filter((_, i) => i !== index));
    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingText(emojis[index]);
    setError(null);
  };

  const onEditingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditingText(val);
    setError(validateEmoji(val));
  };

  const saveEdit = () => {
    if (error) return;
    if (editingIndex === null) return;

    const newEmojis = [...emojis];
    newEmojis[editingIndex] = editingText;
    setEmojis(newEmojis);
    setEditingIndex(null);
    setEditingText("");
  };

  // Save emojis to backend
  const saveEmojisToServer = async () => {
    // Make sure no edits are active
    if (editingIndex !== null) {
      alert("Finish editing before saving.");
      return;
    }

    setSaving(true);
    try {
      const response = await fetch(API_URL, {
        method: "POST", // or POST depending on your API
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ emojis }),
      });

      if (!response.ok) {
        throw new Error(`Failed to save: ${response.statusText}`);
      }

      alert("Emojis saved successfully!");
    } catch (e: unknown) {
      alert(`Error saving emojis: ${e}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: "column",
        minHeight: "80vh",
        padding: 4,
        boxSizing: "border-box",
        backgroundColor: "transparent",
        color: "white",
        "& .MuiTypography-root": { color: "white" },
        "& .MuiListItemText-primary": { color: "white" },
        "& .MuiListItem-root": { color: "white" },
        "& .MuiIconButton-root": { color: "white" },
        "& .MuiFormControlLabel-label": { color: "white" },
        "& .MuiSwitch-switchBase": { color: "white" },
        "& .MuiSwitch-track": { backgroundColor: "rgba(255,255,255,0.3)" },
        "& .MuiButton-root": { color: "white" },
        "& .MuiInputBase-root": { color: "white" },
        "& .MuiInputLabel-root": { color: "white" },
        "& .MuiFormHelperText-root": { color: "white" },
      }}
    >
      <Typography variant="h4" mb={2}>
        Emojis Configurator
      </Typography>

      <List sx={{ flexGrow: 1, width: "100%" }}>
        {displayedEmojis.map((emoji, index) => (
          <ListItem
            key={`${emoji}-${page * emojisPerPage + index}`}
            onDoubleClick={() => startEditing(page * emojisPerPage + index)}
            sx={{ cursor: "pointer" }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => deleteEmoji(page * emojisPerPage + index)}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            {editingIndex === page * emojisPerPage + index ? (
              <TextField
                value={editingText}
                onChange={onEditingChange}
                onBlur={saveEdit}
                onKeyDown={(e) => {
                  if (e.key === "Enter") saveEdit();
                  if (e.key === "Escape") {
                    setEditingIndex(null);
                    setEditingText("");
                    setError(null);
                  }
                }}
                error={!!error}
                autoFocus
                fullWidth
                multiline
                maxRows={3}
                InputProps={{ style: { color: "white" } }}
                FormHelperTextProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "white" } }}
              />
            ) : (
              <ListItemText primary={emoji} />
            )}
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={addEmoji}>
          Add Emoji
        </Button>
        <Button
          variant="contained"
          onClick={saveEmojisToServer}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Emojis"}
        </Button>
      </Box>

      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          mt: 2,
          width: 300,
          alignItems: "center",
        }}
      >
        <Button
          onClick={() => setPage((p) => Math.max(p - 1, 0))}
          disabled={page === 0}
          sx={{
            "&.Mui-disabled": {
              color: "rgba(255,255,255,0.5)",
            },
          }}
        >
          <NavigateBefore />
        </Button>

        <Typography
          sx={{
            alignSelf: "center",
            textAlign: "center",
            userSelect: "none",
          }}
        >
          Page {page + 1} /{" "}
          {Math.max(1, Math.ceil(emojis.length / emojisPerPage))}
        </Typography>

        <Button
          onClick={() =>
            setPage((p) =>
              Math.min(p + 1, Math.floor((emojis.length - 1) / emojisPerPage))
            )
          }
          disabled={page >= Math.floor((emojis.length - 1) / emojisPerPage)}
          sx={{
            "&.Mui-disabled": {
              color: "rgba(255,255,255,0.5)",
            },
          }}
        >
          <NavigateNext />
        </Button>

        <Button
          onClick={() =>
            setPage(Math.floor((emojis.length - 1) / emojisPerPage))
          }
          disabled={page >= Math.floor((emojis.length - 1) / emojisPerPage)}
          sx={{
            "&.Mui-disabled": {
              color: "rgba(255,255,255,0.5)",
            },
          }}
        >
          <LastPage />
        </Button>
      </Box>
    </Box>
  );
}
