import React, { useEffect, useRef } from 'react';
import { Animated, View, StyleSheet, Easing } from 'react-native';

const AnimatedTextHeader = () => {
  const text = 'Welcome Biztechnovations';
  const chars = text.split('');

  const baseColor = '#7630be';    // Purple
  const highlightColor = '#C0C0C0'; // Silver

  const animatedValues = useRef(chars.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    let isMounted = true;

    const delay = (ms) => new Promise((res) => setTimeout(res, ms));

    const runAnimation = async () => {
      while (isMounted) {
        for (let i = 0; i < chars.length; i += 3) {
          if (!isMounted) break;

          // Fade out previous 3 letters
          const prevStart = i - 3;
          if (prevStart >= 0) {
            for (let k = prevStart; k < prevStart + 3 && k < chars.length; k++) {
              Animated.timing(animatedValues[k], {
                toValue: 0,
                duration: 400,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: false,
              }).start();
            }
          }

          // Fade in next 3 letters
          for (let j = i; j < i + 3 && j < chars.length; j++) {
            Animated.timing(animatedValues[j], {
              toValue: 1,
              duration: 400,
              easing: Easing.inOut(Easing.ease),
              useNativeDriver: false,
            }).start();
          }

          await delay(500);
        }

        // 🔥 Fade out the last group ("ons") before restarting
        const lastStart = chars.length - (chars.length % 3 || 3);
        for (let k = lastStart; k < chars.length; k++) {
          Animated.timing(animatedValues[k], {
            toValue: 0,
            duration: 400,
            easing: Easing.inOut(Easing.ease),
            useNativeDriver: false,
          }).start();
        }

        await delay(500); // pause before looping again
      }
    };

    runAnimation();

    return () => {
      isMounted = false;
      animatedValues.forEach((anim) => anim.stopAnimation());
    };
  }, [animatedValues, chars.length]);

  return (
    <View style={styles.container}>
      {chars.map((char, i) => {
        const color = animatedValues[i].interpolate({
          inputRange: [0, 1],
          outputRange: [baseColor, highlightColor],
        });

        return (
          <Animated.Text key={i} style={[styles.text, { color }]}>
            {char}
          </Animated.Text>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flexDirection: 'row', flexWrap: 'nowrap' },
  text: { fontSize: 18, fontWeight: 'bold' },
});

export default AnimatedTextHeader;
