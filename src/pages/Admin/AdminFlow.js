import React, { useState } from "react";
import AdminDashboard from "./AdminDashboard";
import AdminUserManagement from "./AdminUserManagement";
import AdminResourceManagement from "./AdminResourceManagement";
import AdminQuotesManagement from "./AdminQuotesManagement";
import { useUser } from "../../context/UserContext";

export const AdminFlow = () => {
  const { logoutUser, username } = useUser();
  const [currentScreen, setCurrentScreen] = useState("dashboard");

  const handleNavigateModule = (modId) => {
    setCurrentScreen(modId);
  };

  const handleNavigateBack = () => {
    setCurrentScreen("dashboard");
  };

  if (currentScreen === "dashboard") {
    return (
      <AdminDashboard
        onNavigateModule={handleNavigateModule}
        onSignOut={logoutUser}
        adminName={username || "Super Admin"}
      />
    );
  }

  if (currentScreen === "resources" || currentScreen === "resource_management") {
    return (
      <AdminResourceManagement
        activeModule={currentScreen}
        onNavigateBack={handleNavigateBack}
        onNavigateModule={handleNavigateModule}
        onSignOut={logoutUser}
        adminName={username || "Super Admin"}
      />
    );
  }

  if (currentScreen === "quotes" || currentScreen === "quotes_management" || currentScreen === "DailyMessages") {
    return (
      <AdminQuotesManagement
        activeModule={currentScreen}
        onNavigateBack={handleNavigateBack}
        onNavigateModule={handleNavigateModule}
        onSignOut={logoutUser}
        adminName={username || "Super Admin"}
      />
    );
  }

  return (
    <AdminUserManagement
      activeModule={currentScreen}
      onNavigateBack={handleNavigateBack}
      onNavigateModule={handleNavigateModule}
      onSignOut={logoutUser}
      adminName={username || "Super Admin"}
    />
  );
};

export default AdminFlow;
