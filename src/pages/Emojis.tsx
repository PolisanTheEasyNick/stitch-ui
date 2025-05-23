// src/pages/Emojis.tsx
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

interface EmojisProps {
  emojiType: string;
}

const emojiTypeLabels: Record<string, string> = {
  default: "Default",
  ny: "New Year",
  sleep: "Sleep",
  walk: "Walk",
};

export default function Emojis({ emojiType }: EmojisProps) {
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

  const [originalEmojis, setOriginalEmojis] = useState<string[]>([]);
  const [editedEmojis, setEditedEmojis] = useState<Map<number, string>>(
    new Map()
  );
  const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());
  const [newEmojis, setNewEmojis] = useState<string[]>([]);

  useEffect(() => {
    fetch(`${API_URL}?type=${emojiType}`)
      .then((res) => res.json())
      .then((data) => {
        setEmojis(data);
        setOriginalEmojis(data);
        setPage(0);
      })
      .catch(() => {
        setEmojis([]);
        setOriginalEmojis([]);
      });
  }, [emojiType]);

  const validateEmoji = (text: string) => {
    if (text.length === 0) return "Emoji cannot be empty";
    return null;
  };

  const addEmoji = () => {
    const newIndex = emojis.length;
    const newList = [...emojis, ""];
    setEmojis(newList);
    setNewEmojis([...newEmojis, ""]);
    setEditingIndex(newIndex);
    setEditingText("");
  };

  const deleteEmoji = (index: number) => {
    const newList = emojis.filter((_, i) => i !== index);
    setEmojis(newList);

    if (index < originalEmojis.length) {
      setDeletedIndices(new Set(deletedIndices).add(index));
      editedEmojis.delete(index);
    } else {
      setNewEmojis(
        newEmojis.filter((_, i) => i !== index - originalEmojis.length)
      );
    }

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
    if (error || editingIndex === null) return;

    const updatedList = [...emojis];
    updatedList[editingIndex] = editingText;
    setEmojis(updatedList);

    if (
      editingIndex < originalEmojis.length &&
      originalEmojis[editingIndex] !== editingText
    ) {
      const updatedMap = new Map(editedEmojis);
      updatedMap.set(editingIndex, editingText);
      setEditedEmojis(updatedMap);
    } else if (editingIndex >= originalEmojis.length) {
      const idx = editingIndex - originalEmojis.length;
      const updatedNew = [...newEmojis];
      updatedNew[idx] = editingText;
      setNewEmojis(updatedNew);
    }

    setEditingIndex(null);
    setEditingText("");
  };

  const saveEmojisToServer = async () => {
    if (editingIndex !== null) {
      alert("Finish editing before saving.");
      return;
    }

    setSaving(true);
    try {
      for (const index of deletedIndices) {
        await fetch(`${API_URL}/${index}?type=${emojiType}`, {
          method: "DELETE",
        });
      }

      for (const [index, value] of editedEmojis.entries()) {
        await fetch(`${API_URL}/edit?type=${emojiType}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index, value }),
        });
      }

      for (const value of newEmojis) {
        await fetch(`${API_URL}/add?type=${emojiType}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
      }

      alert("Emojis synced successfully!");
      const res = await fetch(API_URL + `?type=${emojiType}`);
      const updated = await res.json();
      setEmojis(updated);
      setOriginalEmojis(updated);
      setEditedEmojis(new Map());
      setDeletedIndices(new Set());
      setNewEmojis([]);
    } catch (e: any) {
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
        {emojiTypeLabels[emojiType] ?? emojiType} Emojis Configurator{" "}
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
                maxRows={1}
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
          sx={{ "&.Mui-disabled": { color: "rgba(255,255,255,0.5)" } }}
        >
          <NavigateBefore />
        </Button>

        <Typography
          sx={{ alignSelf: "center", textAlign: "center", userSelect: "none" }}
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
          sx={{ "&.Mui-disabled": { color: "rgba(255,255,255,0.5)" } }}
        >
          <NavigateNext />
        </Button>

        <Button
          onClick={() =>
            setPage(Math.floor((emojis.length - 1) / emojisPerPage))
          }
          disabled={page >= Math.floor((emojis.length - 1) / emojisPerPage)}
          sx={{ "&.Mui-disabled": { color: "rgba(255,255,255,0.5)" } }}
        >
          <LastPage />
        </Button>
      </Box>
    </Box>
  );
}
