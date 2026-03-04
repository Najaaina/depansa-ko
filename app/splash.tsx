import React, { useEffect, useRef } from "react";
import {
  View,
  Animated,
  Dimensions,
  StyleSheet,
  Easing,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import Svg, { Circle, Path } from "react-native-svg";

const { width } = Dimensions.get("window");

const AnimatedCircle = Animated.createAnimatedComponent(Circle);

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const logoScale = useRef(new Animated.Value(0.6)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const ringProgress = useRef(new Animated.Value(0)).current;
  const titleOpacity = useRef(new Animated.Value(0)).current;
  const titleY = useRef(new Animated.Value(20)).current;
  const subtitleOpacity = useRef(new Animated.Value(0)).current;

  const CIRCUMFERENCE = 2 * Math.PI * 90;

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(logoOpacity, {
          toValue: 1,
          duration: 500,
          useNativeDriver: true,
        }),
        Animated.spring(logoScale, {
          toValue: 1,
          tension: 60,
          friction: 8,
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(ringProgress, {
        toValue: 1,
        duration: 1400,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: false,
      }),
      Animated.parallel([
        Animated.timing(titleOpacity, {
          toValue: 1,
          duration: 400,
          useNativeDriver: true,
        }),
        Animated.timing(titleY, {
          toValue: 0,
          duration: 400,
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        }),
      ]),
      Animated.timing(subtitleOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.delay(800),
    ]).start(() => {
      onFinish();
    });
  }, []);

  const strokeDashoffset = ringProgress.interpolate({
    inputRange: [0, 1],
    outputRange: [CIRCUMFERENCE, CIRCUMFERENCE * 0.12],
  });

  return (
    <LinearGradient
      colors={["#e8f5f0", "#f0eeff", "#fdf0ff"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={styles.container}
    >
      <View style={styles.mainBlock}>
        <View style={styles.ringContainer}>
          <Svg
            width={220}
            height={220}
            style={StyleSheet.absoluteFill}
            viewBox="0 0 220 220"
          >
            <Circle
              cx={110}
              cy={110}
              r={90}
              fill="none"
              stroke="#e2e0f0"
              strokeWidth={3}
            />
            <AnimatedCircle
              cx={110}
              cy={110}
              r={90}
              fill="none"
              stroke="#7c6fe0"
              strokeWidth={3}
              strokeLinecap="round"
              strokeDasharray={CIRCUMFERENCE}
              strokeDashoffset={strokeDashoffset}
              transform="rotate(-90 110 110)"
            />
          </Svg>

          <Animated.View
            style={[
              styles.logoCard,
              {
                opacity: logoOpacity,
                transform: [{ scale: logoScale }],
              },
            ]}
          >
            <LinearGradient
              colors={["#ffffff", "#f5f3ff"]}
              style={styles.logoCardInner}
            >
              <Svg width={52} height={52} viewBox="0 0 52 52">
                <Path
                  d="M8 14C8 11.8 9.8 10 12 10H40C42.2 10 44 11.8 44 14V38C44 40.2 42.2 42 40 42H12C9.8 42 8 40.2 8 38V14Z"
                  fill="#8b7ee8"
                />
                <Path d="M8 20H44V26H8V20Z" fill="#6c5ce7" opacity={0.6} />
                <Path
                  d="M32 29C32 27.9 32.9 27 34 27H42C43.1 27 44 27.9 44 29V33C44 34.1 43.1 35 42 35H34C32.9 35 32 34.1 32 33V29Z"
                  fill="#ffffff"
                  opacity={0.9}
                />
                <Circle cx={37} cy={31} r={2} fill="#8b7ee8" />
              </Svg>
            </LinearGradient>
          </Animated.View>
        </View>

        <Animated.Text
          style={[
            styles.title,
            {
              opacity: titleOpacity,
              transform: [{ translateY: titleY }],
            },
          ]}
        >
          Depansa
        </Animated.Text>
        <Animated.Text
          style={[styles.subtitle, { opacity: subtitleOpacity }]}
        >
          FINANCE TRACKER
        </Animated.Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingTop: 40,
    paddingBottom: 60,
  },
  mainBlock: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    marginTop: -60,
  },
  ringContainer: {
    width: 220,
    height: 220,
    justifyContent: "center",
    alignItems: "center",
  },
  logoCard: {
    width: 110,
    height: 110,
    borderRadius: 28,
    shadowColor: "#7c6fe0",
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.18,
    shadowRadius: 24,
    elevation: 10,
  },
  logoCardInner: {
    flex: 1,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
  },
  title: {
    fontSize: 48,
    fontWeight: "800",
    color: "#1a1a2e",
    letterSpacing: -1,
    marginTop: 28,
  },
  subtitle: {
    fontSize: 11,
    fontWeight: "600",
    color: "#9e9ab8",
    letterSpacing: 4,
    marginTop: 6,
  },
});