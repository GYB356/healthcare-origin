import React from "react";
import { useSession, signOut } from "next-auth/react";
import { useRouter } from "next/router";
import {
  AppBar,
  Box,
  Toolbar,
  Typography,
  Button,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
} from "@mui/material";
import { styled } from "@mui/material/styles";

const Main = styled("main")(({ theme }) => ({
  flexGrow: 1,
  padding: theme.spacing(3),
  marginTop: 64,
  minHeight: "calc(100vh - 64px)",
}));

const Layout = ({ children }) => {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [anchorEl, setAnchorEl] = React.useState(null);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = async () => {
    handleClose();
    await signOut({ redirect: false });
    router.push("/login");
  };

  const handleProfile = () => {
    handleClose();
    router.push(`/${session?.user?.role}/profile`);
  };

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session) {
    return children;
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column" }}>
      <AppBar position="fixed">
        <Toolbar>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Healthcare Platform
          </Typography>
          <Box sx={{ display: "flex", alignItems: "center" }}>
            <Typography variant="body1" sx={{ mr: 2 }}>
              {session.user.name}
            </Typography>
            <IconButton
              size="large"
              aria-label="account of current user"
              aria-controls="menu-appbar"
              aria-haspopup="true"
              onClick={handleMenu}
              color="inherit"
            >
              <Avatar>{session.user.name[0]}</Avatar>
            </IconButton>
            <Menu
              id="menu-appbar"
              anchorEl={anchorEl}
              anchorOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              keepMounted
              transformOrigin={{
                vertical: "top",
                horizontal: "right",
              }}
              open={Boolean(anchorEl)}
              onClose={handleClose}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </Box>
        </Toolbar>
      </AppBar>
      <Main>{children}</Main>
    </Box>
  );
};

export default Layout; 