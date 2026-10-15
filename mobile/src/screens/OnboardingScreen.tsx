import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Sparkles, Eye, BookOpen, Flame, Compass, ArrowRight } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useChatStore } from '../store/useChatStore';

export const OnboardingScreen: React.FC = () => {
  const { setHasCompletedOnboarding } = useChatStore();

  return (
    <LinearGradient
      colors={['#07060C', '#131020', '#090812']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Sacred Chariot Emblem */}
          <View style={styles.emblemContainer}>
            <View style={styles.glowRing}>
              <Image
                source={require('../../assets/icon.png')}
                style={styles.emblemImage}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.title}>Sarathi Sakha</Text>
            <Text style={styles.sanskritSubtitle}>सारथी सखा • कुरुक्षेत्र का मार्गदर्शक</Text>
            <Text style={styles.tagline}>
              Your Eternal Charioteer & Steadfast Friend on the Battlefield of Life
            </Text>
          </View>

          {/* Spiritual Promise Card */}
          <View style={styles.quoteCard}>
            <Compass size={18} color={colors.goldPrimary} style={styles.quoteIcon} />
            <Text style={styles.quoteText}>
              "Do not despair, Partha. When confusion, fear, grief, or duty paralyzes your will, surrender your doubt into the chariot. I am listening as your closest friend."
            </Text>
            <Text style={styles.quoteAuthor}>— Sri Krishna (Bhagavad Gita)</Text>
          </View>

          {/* 4 Pillars Overview */}
          <Text style={styles.sectionHeader}>The Four Pillars of Counsel</Text>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIcon}>
              <Eye size={16} color={colors.goldPrimary} />
            </View>
            <View style={styles.pillarTextCol}>
              <Text style={styles.pillarTitle}>1. The Mirror (आत्म-दर्शन)</Text>
              <Text style={styles.pillarDesc}>
                Reveals the hidden root of your turmoil—fear, attachment, or ego—with unconditional empathy.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIcon}>
              <Sparkles size={16} color={colors.goldPrimary} />
            </View>
            <View style={styles.pillarTextCol}>
              <Text style={styles.pillarTitle}>2. The Eternal Shloka (सनातन श्लोक)</Text>
              <Text style={styles.pillarDesc}>
                Retrieves authentic Sanskrit verses from the 700 Gita shlokas with transliteration & audio recitation.
              </Text>
            </View>
          </View>

          <View style={styles.pillarCard}>
            <View style={styles.pillarIcon}>
              <BookOpen size={16} color={colors.goldSecondary} />
            </View>
            <View style={styles.pillarTextCol}>
              <Text style={styles.pillarTitle}>3. The Living Example (महाभारत प्रसंग)</Text>
              <Text style={styles.pillarDesc}>
                Relates your modern dilemma directly to timeless episodes from Sri Krishna's life and the Mahabharata.
              </Text>
            </View>
          </View>

          <View style={[styles.pillarCard, styles.sadhanaPillar]}>
            <View style={[styles.pillarIcon, styles.sadhanaIcon]}>
              <Flame size={16} color={colors.saffron} />
            </View>
            <View style={styles.pillarTextCol}>
              <Text style={[styles.pillarTitle, { color: colors.saffron }]}>
                4. Micro-Sadhana (दैनंदिन साधना)
              </Text>
              <Text style={styles.pillarDesc}>
                Prescribes a concrete 15-minute physical, breath, or contemplative practice to center your soul right now.
              </Text>
            </View>
          </View>

          {/* Trust & Zero Token Cost Badge */}
          <View style={styles.trustBadge}>
            <Text style={styles.trustText}>
              🕉️ 100% Free Sacred Wisdom • Zero External Token Cost • Private
            </Text>
          </View>

          {/* Action CTA Button */}
          <TouchableOpacity
            style={styles.ctaButton}
            onPress={() => setHasCompletedOnboarding(true)}
            activeOpacity={0.85}
          >
            <Text style={styles.ctaText}>Enter The Chariot • आरम्भ करें</Text>
            <ArrowRight size={20} color="#000" />
          </TouchableOpacity>
        </ScrollView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradient: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 22,
    paddingTop: 16,
    paddingBottom: 40,
    alignItems: 'center',
  },
  emblemContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  glowRing: {
    width: 104,
    height: 104,
    borderRadius: 52,
    borderWidth: 2,
    borderColor: colors.goldPrimary,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 14,
    backgroundColor: '#12101E',
    shadowColor: colors.goldPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  emblemImage: {
    width: 96,
    height: 96,
    borderRadius: 48,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: colors.goldPrimary,
    letterSpacing: 0.5,
    textAlign: 'center',
  },
  sanskritSubtitle: {
    fontSize: 13,
    color: colors.goldSecondary,
    marginTop: 4,
    fontWeight: '600',
    letterSpacing: 0.4,
  },
  tagline: {
    fontSize: 13,
    color: colors.textSecondary,
    textAlign: 'center',
    marginTop: 8,
    lineHeight: 19,
    paddingHorizontal: 16,
  },
  quoteCard: {
    backgroundColor: '#141220',
    borderColor: '#2F2A48',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginVertical: 14,
    width: '100%',
  },
  quoteIcon: {
    marginBottom: 8,
  },
  quoteText: {
    color: '#F0EDF8',
    fontSize: 14,
    lineHeight: 22,
    fontStyle: 'italic',
  },
  quoteAuthor: {
    color: colors.goldSecondary,
    fontSize: 12,
    fontWeight: '700',
    marginTop: 8,
    textAlign: 'right',
  },
  sectionHeader: {
    fontSize: 16,
    fontWeight: '800',
    color: colors.textPrimary,
    alignSelf: 'flex-start',
    marginTop: 10,
    marginBottom: 12,
    letterSpacing: 0.5,
  },
  pillarCard: {
    backgroundColor: '#110F1C',
    borderColor: '#262238',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    flexDirection: 'row',
    marginBottom: 10,
    width: '100%',
    alignItems: 'flex-start',
  },
  pillarIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#1C192E',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    marginTop: 2,
  },
  pillarTextCol: {
    flex: 1,
  },
  pillarTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: colors.goldPrimary,
    marginBottom: 3,
  },
  pillarDesc: {
    fontSize: 12,
    color: colors.textSecondary,
    lineHeight: 18,
  },
  sadhanaPillar: {
    borderColor: '#4A2218',
    backgroundColor: '#181016',
  },
  sadhanaIcon: {
    backgroundColor: '#2A1612',
  },
  trustBadge: {
    marginTop: 10,
    marginBottom: 20,
    paddingHorizontal: 10,
  },
  trustText: {
    fontSize: 11,
    color: colors.textMuted,
    textAlign: 'center',
    fontWeight: '500',
  },
  ctaButton: {
    backgroundColor: colors.goldPrimary,
    borderRadius: 28,
    paddingVertical: 15,
    paddingHorizontal: 28,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    shadowColor: colors.goldPrimary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaText: {
    color: '#000',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginRight: 10,
  },
});
