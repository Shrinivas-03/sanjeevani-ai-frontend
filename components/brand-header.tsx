import ThemeToggle from "@/components/theme-toggle";
import { clearTokens } from "@/constants/api";
import { useAuth } from "@/context/auth";
import { useAppTheme } from "@/context/theme";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  Image,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  useWindowDimensions,
} from "react-native";

type Props = {
  subtitle?: string;
  mode?: "landing" | "authenticated"; // landing = Features/About/Contact, authenticated = Chat/Prediction/Profile
  showBackButton?: boolean;
  onMenuPress?: () => void;
};

export default function BrandHeader({
  subtitle,
  mode = "authenticated",
  showBackButton = false,
  onMenuPress,
}: Props) {
  const [menuOpen, setMenuOpen] = useState(false);
  const { theme } = useAppTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const isDark = theme === "dark";
  const { width } = useWindowDimensions();
  const isMobile = width < 768;

  // Debug logging
  console.log("[BrandHeader] isAuthenticated:", isAuthenticated, "user:", user);

  const baseNavItems = [
    { label: "Home", href: "/web" },
    { label: "Features", href: "/web/features" },
    { label: "About", href: "/web/about" },
    { label: "Contact", href: "/web/contact" },
  ];

  const authenticatedOnlyItems = [
    { label: "Chat", href: "/web/chat" },
    { label: "Prediction", href: "/web/prediction" },
    { label: "Profile", href: "/web/profile" },
  ];

  // When authenticated, show ONLY Chat and Profile
  const navItems = isAuthenticated ? authenticatedOnlyItems : baseNavItems;

  const handleLogout = () => {
    // Clear tokens from storage
    clearTokens();
    // Update auth context
    logout();
    // Redirect to home
    if (Platform.OS === "web") {
      router.replace("/web");
    } else {
      router.replace("/signin");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#151718" : "#f5f6f7" },
      ]}
    >
      <View style={styles.row}>
        {showBackButton ? (
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={{ color: isDark ? "#fff" : "#000", fontSize: 18 }}>
              {"< Back"}
            </Text>
          </TouchableOpacity>
        ) : onMenuPress && Platform.OS !== "web" ? (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.menuButton}
            aria-label="Menu"
          >
            <Text
              style={{ color: isDark ? "#e5e7eb" : "#111827", fontSize: 24 }}
            >
              ☰
            </Text>
          </TouchableOpacity>
        ) : onMenuPress && Platform.OS === "web" ? (
          <TouchableOpacity
            onPress={onMenuPress}
            style={styles.menuButton}
            aria-label="Menu"
          >
            <Text
              style={{ color: isDark ? "#e5e7eb" : "#111827", fontSize: 24 }}
            >
              ☰
            </Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => {
              if (Platform.OS === "web") {
                router.replace("/web");
              } else {
                // On native: go to tabs if authenticated, else signin
                if (isAuthenticated) {
                  router.replace("/(tabs)/prediction" as any);
                } else {
                  router.replace("/signin");
                }
              }
            }}
            style={styles.leftRow}
          >
            <View
              style={[
                styles.logoCircle,
                { borderColor: isDark ? "#1e2022" : "#ffffff" },
              ]}
            >
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </View>
            <Text style={styles.title}>Sanjeevani AI</Text>
          </TouchableOpacity>
        )}
        <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
          {/* Desktop/tablet: show inline nav links */}
          {Platform.OS === "web" && !isMobile && (
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 12,
                marginRight: 8,
              }}
            >
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.href}
                  onPress={() => router.replace(item.href as any)}
                  style={{
                    paddingHorizontal: 12,
                    paddingVertical: 6,
                    borderRadius: 8,
                    borderWidth: 1,
                    borderColor: isDark ? "#2a2d2e" : "#e0e0e0",
                    backgroundColor: isDark ? "#1f2937" : "#ffffff",
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? "#e5e7eb" : "#111827",
                      fontWeight: "600",
                    }}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          {/* Show Sign In / Sign Up buttons when NOT authenticated */}
          {!isAuthenticated && Platform.OS === "web" && !isMobile && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <TouchableOpacity
                onPress={() => router.replace("/signin")}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: isDark ? "#2a2d2e" : "#e0e0e0",
                  backgroundColor: isDark ? "#1f2937" : "#ffffff",
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#e5e7eb" : "#111827",
                    fontWeight: "600",
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => router.replace("/signup")}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  backgroundColor: "#2ecc40",
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {/* Show user name and Logout button when authenticated */}
          {isAuthenticated && Platform.OS === "web" && !isMobile && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 8 }}
            >
              <Text
                style={{
                  color: isDark ? "#e5e7eb" : "#111827",
                  fontWeight: "600",
                  marginRight: 4,
                  borderWidth: 1,
                  borderColor: isDark ? "#2a2d2e" : "#e0e0e0",
                  paddingHorizontal: 12,
                  paddingVertical: 6,
                  borderRadius: 8,
                }}
              >
                {user?.full_name || user?.name || "User"}
              </Text>
              <ThemeToggle />
              <TouchableOpacity
                onPress={handleLogout}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 8,
                  borderRadius: 8,
                  borderWidth: 1,
                  borderColor: "#dc2626",
                  backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
                }}
              >
                <Text style={{ color: "#dc2626", fontWeight: "600" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </View>
          )}
          {isAuthenticated && Platform.OS !== "web" && <ThemeToggle />}
          {/* Mobile: show hamburger */}
          {Platform.OS === "web" && isMobile && (
            <TouchableOpacity
              onPress={() => setMenuOpen((v) => !v)}
              style={{
                paddingHorizontal: 10,
                paddingVertical: 8,
                borderRadius: 8,
                borderWidth: 1,
                borderColor: isDark ? "#2a2d2e" : "#e0e0e0",
                backgroundColor: isDark ? "#111827" : "#ffffff",
              }}
              aria-label="Menu"
            >
              <Text
                style={{ color: isDark ? "#e5e7eb" : "#111827", fontSize: 18 }}
              >
                ☰
              </Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      {/* Mobile dropdown menu */}
      {Platform.OS === "web" && isMobile && menuOpen && (
        <View
          style={{
            alignSelf: "flex-end",
            marginTop: 8,
            backgroundColor: isDark ? "#111827" : "#ffffff",
            borderWidth: 1,
            borderColor: isDark ? "#2a2d2e" : "#e0e0e0",
            borderRadius: 10,
            overflow: "hidden",
            minWidth: 150,
          }}
        >
          {navItems.map((item, index) => (
            <TouchableOpacity
              key={item.href}
              onPress={() => {
                setMenuOpen(false);
                router.replace(item.href as any);
              }}
              style={{
                paddingHorizontal: 16,
                paddingVertical: 12,
                borderTopWidth: index > 0 ? 1 : 0,
                borderTopColor: isDark ? "#1f2937" : "#f0f0f0",
              }}
            >
              <Text
                style={{
                  color: isDark ? "#e5e7eb" : "#111827",
                  fontWeight: "600",
                }}
              >
                {item.label}
              </Text>
            </TouchableOpacity>
          ))}
          {!isAuthenticated && (
            <>
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  router.replace("/signin");
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? "#1f2937" : "#f0f0f0",
                }}
              >
                <Text
                  style={{
                    color: isDark ? "#e5e7eb" : "#111827",
                    fontWeight: "600",
                  }}
                >
                  Sign In
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  router.replace("/signup");
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? "#1f2937" : "#f0f0f0",
                  backgroundColor: "#2ecc40",
                }}
              >
                <Text style={{ color: "#ffffff", fontWeight: "bold" }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </>
          )}
          {isAuthenticated && (
            <>
              {user?.full_name && (
                <View
                  style={{
                    paddingHorizontal: 16,
                    paddingVertical: 12,
                    borderTopWidth: 1,
                    borderTopColor: isDark ? "#1f2937" : "#f0f0f0",
                  }}
                >
                  <Text
                    style={{
                      color: isDark ? "#e5e7eb" : "#111827",
                      fontWeight: "600",
                    }}
                  >
                    {user.full_name}
                  </Text>
                </View>
              )}
              <TouchableOpacity
                onPress={() => {
                  setMenuOpen(false);
                  handleLogout();
                }}
                style={{
                  paddingHorizontal: 16,
                  paddingVertical: 12,
                  borderTopWidth: 1,
                  borderTopColor: isDark ? "#1f2937" : "#f0f0f0",
                  backgroundColor: isDark ? "#7f1d1d" : "#fef2f2",
                }}
              >
                <Text style={{ color: "#dc2626", fontWeight: "600" }}>
                  Logout
                </Text>
              </TouchableOpacity>
            </>
          )}
        </View>
      )}
      {subtitle ? (
        <Text style={[styles.subtitle, { color: isDark ? "#aaa" : "#687076" }]}>
          {subtitle}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: "100%",
    paddingTop: 48,
    paddingBottom: 8,
    alignItems: "center",
    paddingHorizontal: 16,
  },
  row: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    width: "100%",
  },
  leftRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  logoCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: "#2ecc40",
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 3,
    marginRight: 10,
  },
  logo: {
    width: 26,
    height: 26,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#2ecc40",
    letterSpacing: 0.5,
    flexShrink: 1,
  },
  subtitle: {
    marginTop: 4,
    fontSize: 16,
    textAlign: "center",
  },
  menuButton: {
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
});
