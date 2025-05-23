// src/pages/Quotes.tsx
import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Switch,
  TextField,
  Typography,
  FormControlLabel,
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import { NavigateBefore, NavigateNext, LastPage } from "@mui/icons-material";

const API_URL = "https://api.polisan.dev/config/quotes";

export default function Quotes() {
  const [quotes, setQuotes] = useState<string[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [editingText, setEditingText] = useState("");
  const [maxLength, setMaxLength] = useState(70);
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [page, setPage] = useState(0);
  const quotesPerPage = 10;
  const displayedQuotes = quotes.slice(
    page * quotesPerPage,
    (page + 1) * quotesPerPage
  );

  const [originalQuotes, setOriginalQuotes] = useState<string[]>([]);
  const [editedQuotes, setEditedQuotes] = useState<Map<number, string>>(
    new Map()
  );
  const [deletedIndices, setDeletedIndices] = useState<Set<number>>(new Set());
  const [newQuotes, setNewQuotes] = useState<string[]>([]);

  useEffect(() => {
    fetch(API_URL)
      .then((res) => res.json())
      .then((data) => {
        setQuotes(data);
        setOriginalQuotes(data);
      })
      .catch(() => {
        setQuotes([]);
        setOriginalQuotes([]);
      });
  }, []);

  useEffect(() => {
    const cachedMaxLength = localStorage.getItem("quotes_maxLength");
    if (cachedMaxLength === "70" || cachedMaxLength === "140") {
      setMaxLength(parseInt(cachedMaxLength));
    }
  }, []);

  const validateQuote = (text: string) => {
    if (text.length === 0) return "Quote cannot be empty";
    if (text.length > maxLength) return `Max length is ${maxLength} characters`;
    return null;
  };

  const addQuote = () => {
    const newIndex = quotes.length;
    const newQuotesList = [...quotes, ""];
    setQuotes(newQuotesList);
    setNewQuotes([...newQuotes, ""]);
    setEditingIndex(newIndex);
    setEditingText("");
  };

  const deleteQuote = (index: number) => {
    const newList = quotes.filter((_, i) => i !== index);
    setQuotes(newList);

    if (index < originalQuotes.length) {
      setDeletedIndices(new Set(deletedIndices).add(index));
      editedQuotes.delete(index);
    } else {
      setNewQuotes(
        newQuotes.filter((_, i) => i !== index - originalQuotes.length)
      );
    }

    if (editingIndex === index) {
      setEditingIndex(null);
      setEditingText("");
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
    setEditingText(quotes[index]);
    setError(null);
  };

  const onEditingChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEditingText(val);
    setError(validateQuote(val));
  };

  const saveEdit = () => {
    if (error || editingIndex === null) return;

    const updatedList = [...quotes];
    updatedList[editingIndex] = editingText;
    setQuotes(updatedList);

    if (
      editingIndex < originalQuotes.length &&
      originalQuotes[editingIndex] !== editingText
    ) {
      const updatedMap = new Map(editedQuotes);
      updatedMap.set(editingIndex, editingText);
      setEditedQuotes(updatedMap);
    } else if (editingIndex >= originalQuotes.length) {
      const idx = editingIndex - originalQuotes.length;
      const updatedNew = [...newQuotes];
      updatedNew[idx] = editingText;
      setNewQuotes(updatedNew);
    }

    setEditingIndex(null);
    setEditingText("");
  };

  const toggleMaxLength = () => {
    const newMax = maxLength === 70 ? 140 : 70;
    setMaxLength(newMax);
    localStorage.setItem("quotes_maxLength", newMax.toString());

    if (editingText.length > newMax) {
      setError(`Max length is ${newMax} characters`);
    } else {
      setError(null);
    }
  };

  const saveQuotesToServer = async () => {
    if (editingIndex !== null) {
      alert("Finish editing before saving.");
      return;
    }

    setSaving(true);
    try {
      // Delete removed quotes
      for (const index of deletedIndices) {
        await fetch(`${API_URL}/${index}`, { method: "DELETE" });
      }

      // Edit changed quotes
      for (const [index, value] of editedQuotes.entries()) {
        await fetch(`${API_URL}/edit`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ index, value }),
        });
      }

      // Add new quotes
      for (const value of newQuotes) {
        await fetch(`${API_URL}/add`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ value }),
        });
      }

      alert("Quotes synced successfully!");
      // Reload the data
      const res = await fetch(API_URL);
      const updated = await res.json();
      setQuotes(updated);
      setOriginalQuotes(updated);
      setEditedQuotes(new Map());
      setDeletedIndices(new Set());
      setNewQuotes([]);
    } catch (e: any) {
      alert(`Error saving quotes: ${e}`);
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
        Quotes Configurator
      </Typography>

      <FormControlLabel
        control={
          <Switch checked={maxLength === 140} onChange={toggleMaxLength} />
        }
        label={`Max length: ${maxLength} chars`}
      />

      <List sx={{ flexGrow: 1, width: "100%" }}>
        {displayedQuotes.map((quote, index) => (
          <ListItem
            key={`${quote}-${page * quotesPerPage + index}`}
            onDoubleClick={() => startEditing(page * quotesPerPage + index)}
            sx={{ cursor: "pointer" }}
            secondaryAction={
              <IconButton
                edge="end"
                onClick={() => deleteQuote(page * quotesPerPage + index)}
                aria-label="delete"
              >
                <DeleteIcon />
              </IconButton>
            }
          >
            {editingIndex === page * quotesPerPage + index ? (
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
                helperText={error || `${editingText.length}/${maxLength}`}
                autoFocus
                fullWidth
                multiline
                maxRows={3}
                InputProps={{ style: { color: "white" } }}
                FormHelperTextProps={{ style: { color: "white" } }}
                InputLabelProps={{ style: { color: "white" } }}
              />
            ) : (
              <ListItemText primary={quote} />
            )}
          </ListItem>
        ))}
      </List>

      <Box sx={{ display: "flex", gap: 2, mt: 2 }}>
        <Button variant="contained" onClick={addQuote}>
          Add Quote
        </Button>
        <Button
          variant="contained"
          onClick={saveQuotesToServer}
          disabled={saving}
        >
          {saving ? "Saving..." : "Save Quotes"}
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
          {Math.max(1, Math.ceil(quotes.length / quotesPerPage))}
        </Typography>

        <Button
          onClick={() =>
            setPage((p) =>
              Math.min(p + 1, Math.floor((quotes.length - 1) / quotesPerPage))
            )
          }
          disabled={page >= Math.floor((quotes.length - 1) / quotesPerPage)}
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
            setPage(Math.floor((quotes.length - 1) / quotesPerPage))
          }
          disabled={page >= Math.floor((quotes.length - 1) / quotesPerPage)}
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
