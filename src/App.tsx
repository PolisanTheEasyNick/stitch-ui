import {
  AppBar,
  Toolbar,
  Drawer,
  List,
  ListItemButton,
  ListItemText,
  ListItemIcon,
  Box,
  Typography,
} from "@mui/material";
import DashboardIcon from "@mui/icons-material/Dashboard";
import SettingsIcon from "@mui/icons-material/Settings";
import UploadFileIcon from "@mui/icons-material/UploadFile";
import { EmojiEmotions } from "@mui/icons-material";
import { Games as GamesIcon } from "@mui/icons-material";
import AcUnitIcon from "@mui/icons-material/AcUnit";
import HotelIcon from "@mui/icons-material/Hotel";
import DirectionsWalkIcon from "@mui/icons-material/DirectionsWalk";
import LightbulbIcon from "@mui/icons-material/Lightbulb";
import Dashboard from "./pages/Dashboard";
import { useState } from "react";
import Quotes from "./pages/Quotes";
import Emojis from "./pages/Emojis";
import Games from "./pages/Games";
import Piled from "./pages/Piled";
import Imports from "./pages/Imports";
import stitchLogo from "./stitch.svg";

const drawerWidth = 240;

const emojiTypes = [
  { key: "default", label: "Default", icon: <EmojiEmotions /> },
  { key: "ny", label: "New Year", icon: <AcUnitIcon /> },
  { key: "sleep", label: "Sleep", icon: <HotelIcon /> },
  { key: "walk", label: "Walk", icon: <DirectionsWalkIcon /> },
];

type Page =
  | "dashboard"
  | "quotes_config"
  | "emojis"
  | "games"
  | "light_config"
  | "imports";

function App() {
  const [page, setPage] = useState<Page>("dashboard");
  const [emojiType, setEmojiType] = useState("default");

  const renderPage = () => {
    switch (page) {
      case "dashboard":
        return <Dashboard />;
      case "quotes_config":
        return <Quotes />;
      case "emojis":
        return <Emojis emojiType={emojiType} />;
      case "games":
        return <Games />;
      case "light_config":
        return <Piled />;
      case "imports":
        return <Imports />;
      default:
        return null;
    }
  };

  return (
    <Box sx={{ display: "flex", overflow: "hidden" }}>
      <AppBar
        position="fixed"
        sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}
      >
        <Toolbar>
          <img src={stitchLogo} alt="Stitch logo" style={{ height: 60 }} />
          <Typography variant="h6" noWrap>
            Stitch UI
          </Typography>
        </Toolbar>
      </AppBar>

      <Drawer
        variant="permanent"
        sx={{
          width: drawerWidth,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: {
            width: drawerWidth,
            boxSizing: "border-box",
            top: "64px",
          },
        }}
      >
        <List>
          <ListItemButton
            selected={page === "dashboard"}
            onClick={() => setPage("dashboard")}
          >
            <ListItemIcon>
              <DashboardIcon />
            </ListItemIcon>
            <ListItemText primary="Dashboard" />
          </ListItemButton>

          <ListItemButton
            selected={page === "quotes_config"}
            onClick={() => setPage("quotes_config")}
          >
            <ListItemIcon>
              <SettingsIcon />
            </ListItemIcon>
            <ListItemText primary="Quotes" />
          </ListItemButton>

          <ListItemButton
            selected={page === "light_config"}
            onClick={() => setPage("light_config")}
          >
            <ListItemIcon>
              <LightbulbIcon />
            </ListItemIcon>
            <ListItemText primary="Lights" />
          </ListItemButton>

          <ListItemButton
            selected={page === "imports"}
            onClick={() => setPage("imports")}
          >
            <ListItemIcon>
              <UploadFileIcon />
            </ListItemIcon>
            <ListItemText primary="Imports" />
          </ListItemButton>

          {emojiTypes.map((et) => (
            <ListItemButton
              key={et.key}
              selected={emojiType === et.key && page === "emojis"}
              onClick={() => {
                setEmojiType(et.key);
                setPage("emojis");
              }}
            >
              <ListItemIcon>{et.icon}</ListItemIcon>
              <ListItemText primary={et.label} />
            </ListItemButton>
          ))}

          <ListItemButton
            selected={page === "games"}
            onClick={() => setPage("games")}
          >
            <ListItemIcon>
              <GamesIcon />
            </ListItemIcon>
            <ListItemText primary="Games" />
          </ListItemButton>
        </List>
      </Drawer>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          mt: "64px",
          ml: `${drawerWidth}px`,
          height: "calc(100vh - 64px)",
          display: "flex",
          flexDirection: "column",
        }}
      >
        {renderPage()}
      </Box>
    </Box>
  );
}

export default App;
