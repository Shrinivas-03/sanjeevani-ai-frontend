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
  mode?: "landing" | "authenticated";
  showBackButton?: boolean;
  onMenuPress?: () => void;
};

export default function BrandHeader({
  subtitle,
  mode = "authenticated",
  showBackButton = false,
  onMenuPress,
}: Props) {
  const { theme } = useAppTheme();
  const { isAuthenticated, logout, user } = useAuth();
  const { width } = useWindowDimensions();
  const isMobile = width < 768;
  const isDark = theme === "dark";

  const [menuOpen, setMenuOpen] = useState(false);

  /** NAVIGATION ITEMS */
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

  const navItems = isAuthenticated ? authenticatedOnlyItems : baseNavItems;

  const handleLogoPress = () => {
    if (Platform.OS === "web") {
      router.replace("/web");
    } else {
      router.replace(isAuthenticated ? "/(tabs)/prediction" : "/signin");
    }
  };

  const handleLogout = () => {
    clearTokens();
    logout();
    Platform.OS === "web" ? router.replace("/web") : router.replace("/signin");
  };

  return (
    <View
      style={[
        styles.wrapper,
        { backgroundColor: isDark ? "#020617" : "#eef9f2" },
      ]}
    >
      {/* HEADER BAR */}
      <View
        style={[
          styles.headerBar,
          {
            backgroundColor: isDark ? "#020617" : "#eef9f2",
            shadowColor: "#000",
          },
        ]}
      >
        {/* LEFT SIDE */}
        <View style={styles.left}>
          {showBackButton ? (
            <TouchableOpacity onPress={() => router.back()}>
              <Text
                style={{
                  color: isDark ? "#e5e7eb" : "#0f172a",
                  fontSize: 18,
                  fontWeight: "600",
                }}
              >
                {"‹ Back"}
              </Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity onPress={handleLogoPress} style={styles.logoWrap}>
              <Image
                source={require("@/assets/images/logo.png")}
                style={styles.logo}
                resizeMode="contain"
              />
            </TouchableOpacity>
          )}
        </View>

        {/* CENTER TITLE */}
        <View style={styles.center}>
          <Text style={styles.title}>
            <Text style={styles.titleGreen}>SANJEEVANI</Text>
            <Text style={styles.titleGold}> AI</Text>
          </Text>

          {subtitle ? (
            <Text
              style={[
                styles.subtitle,
                { color: isDark ? "#94a3b8" : "#63726b" },
              ]}
            >
              {subtitle}
            </Text>
          ) : null}
        </View>

        {/* RIGHT SIDE */}
        <View style={styles.right}>
          {Platform.OS === "web" && !isMobile && (
            <View
              style={{ flexDirection: "row", alignItems: "center", gap: 12 }}
            >
              {/* NAV ITEMS */}
              {navItems.map((item) => (
                <TouchableOpacity
                  key={item.href}
                  onPress={() => router.replace(item.href as any)}
                  style={[
                    styles.navBtn,
                    {
                      borderColor: isDark ? "#334155" : "#d1d5db",
                      backgroundColor: isDark ? "#0f172a" : "#ffffff",
                    },
                  ]}
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

              {/* AUTH BUTTONS */}
              {!isAuthenticated && (
                <>
                  <TouchableOpacity
                    onPress={() => router.replace("/signin")}
                    style={[
                      styles.navBtn,
                      {
                        backgroundColor: isDark ? "#0f172a" : "#ffffff",
                        borderColor: isDark ? "#334155" : "#d1d5db",
                      },
                    ]}
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
                    style={styles.primaryBtn}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      Sign Up
                    </Text>
                  </TouchableOpacity>
                </>
              )}

              {/* LOGOUT + USER */}
              {isAuthenticated && (
                <>
                  <Text style={styles.userTag}>
                    {user?.full_name || user?.name || "User"}
                  </Text>
                  <ThemeToggle />
                  <TouchableOpacity
                    onPress={handleLogout}
                    style={styles.logoutBtn}
                  >
                    <Text style={{ color: "#dc2626", fontWeight: "700" }}>
                      Logout
                    </Text>
                  </TouchableOpacity>
                </>
              )}
            </View>
          )}

          {/* MOBILE MENU */}
          {Platform.OS === "web" && isMobile && (
            <TouchableOpacity
              onPress={() => setMenuOpen((v) => !v)}
              style={styles.mobileMenuBtn}
            >
              <Text
                style={{ fontSize: 22, color: isDark ? "#e5e7eb" : "#111827" }}
              >
                ☰
              </Text>
            </TouchableOpacity>
          )}

          {/* MOBILE NATIVE ONLY */}
          {Platform.OS !== "web" && <ThemeToggle />}
        </View>
      </View>

      {/* MOBILE DROPDOWN MENU */}
      {Platform.OS === "web" && isMobile && menuOpen && (
        <View style={styles.mobileDropdown}>
          {navItems.map((item, index) => (
            <TouchableOpacity
              key={item.href}
              onPress={() => {
                setMenuOpen(false);
                router.replace(item.href as any);
              }}
              style={styles.mobileDropdownItem}
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
                onPress={() => router.replace("/signin")}
                style={styles.mobileDropdownItem}
              >
                <Text style={{ color: "#22c55e", fontWeight: "700" }}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => router.replace("/signup")}
                style={[
                  styles.mobileDropdownItem,
                  { backgroundColor: "#22c55e" },
                ]}
              >
                <Text style={{ color: "#fff", fontWeight: "700" }}>
                  Sign Up
                </Text>
              </TouchableOpacity>
            </>
          )}

          {isAuthenticated && (
            <TouchableOpacity
              onPress={handleLogout}
              style={[
                styles.mobileDropdownItem,
                { backgroundColor: "#fee2e2" },
              ]}
            >
              <Text style={{ color: "#dc2626", fontWeight: "700" }}>
                Logout
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: "100%",
    paddingTop: 28,
    paddingBottom: 0,
    alignItems: "center",
  },

  headerBar: {
    width: "100%",
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingBottom: 12,
    paddingTop: 8,

    borderBottomLeftRadius: 22,
    borderBottomRightRadius: 22,
    borderBottomWidth: 2,
    borderBottomColor: "rgba(13, 199, 190, 0.85)",

    shadowOpacity: 0.18,
    shadowRadius: 10,
    shadowOffset: { width: 0, height: 6 },
    elevation: 9,
  },

  left: {
    width: 70,
    justifyContent: "center",
  },

  logoWrap: {
    justifyContent: "center",
    alignItems: "flex-start",
  },

  logo: {
    width: 60,
    height: 60,
  },

  center: {
    flex: 1,
    alignItems: "center",
  },

  title: {
    fontSize: 26,
    fontWeight: "900",
    letterSpacing: 0.6,
  },
  titleGreen: { color: "#22c55e", fontWeight: "900" },
  titleGold: { color: "#D4AF37", fontWeight: "900" },

  subtitle: {
    marginTop: 2,
    fontSize: 13,
    textAlign: "center",
  },

  right: {
    width: 70,
    alignItems: "flex-end",
    justifyContent: "center",
  },

  navBtn: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
  },

  primaryBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    backgroundColor: "#22c55e",
    borderRadius: 10,
  },

  userTag: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#22c55e",
    color: "#22c55e",
    fontWeight: "700",
  },

  logoutBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderWidth: 1,
    borderRadius: 10,
    borderColor: "#dc2626",
  },

  mobileMenuBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
  },

  mobileDropdown: {
    width: "60%",
    alignSelf: "flex-end",
    marginTop: 6,
    backgroundColor: "#fff",
    borderRadius: 12,
    borderWidth: 1,
    overflow: "hidden",
  },
  mobileDropdownItem: {
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
});
