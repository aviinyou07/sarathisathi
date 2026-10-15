import React, { useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Flame,
  CheckCircle2,
  Circle,
  Volume2,
  BookmarkCheck,
  Sparkles,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useChatStore } from '../store/useChatStore';
import { MASTERPIECE_VERSES } from '../data/gitaTreasury';
import { VerseCard } from '../components/VerseCard';
import { ttsService } from '../services/tts';

const SADHANA_STEPS = [
  {
    title: '1. Mindful Prana Centering (5 min)',
    desc: 'Breathe in slowly through your nostrils; exhale the weight of anxiety. Repeat mentally: "I am the witness, not the storm."',
  },
  {
    title: '2. Svadharma Contemplation (5 min)',
    desc: 'Reflect upon your immediate duty today. Detach your ego from the fruits; dedicate your effort purely to righteousness.',
  },
  {
    title: '3. Ishvara Pranidhana • Surrender (5 min)',
    desc: 'Offer all results—praise, blame, victory, defeat—to the Divine Charioteer. Walk forward with peaceful resolve.',
  },
];

export const SadhanaScreen: React.FC = () => {
  const {
    sadhanaChecked,
    toggleSadhanaTask,
    savedVerses,
    toggleSaveVerse,
  } = useChatStore();

  // Shloka of the Day: Picks a masterpiece verse deterministically by day of year
  const dailyShloka = useMemo(() => {
    const now = new Date();
    const dayOfYear = Math.floor(
      (now.getTime() - new Date(now.getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
    );
    return MASTERPIECE_VERSES[dayOfYear % MASTERPIECE_VERSES.length];
  }, []);

  const completedCount = sadhanaChecked.filter(Boolean).length;
  const isAllCompleted = completedCount === SADHANA_STEPS.length;

  const handlePlayDailyVerse = () => {
    ttsService.speak(
      `${dailyShloka.reference}. ${dailyShloka.translation}. ${dailyShloka.commentary}`,
    );
  };

  return (
    <LinearGradient
      colors={['#08070D', '#12101C', '#090812']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <View style={styles.header}>
            <View>
              <Text style={styles.title}>Daily Sadhana</Text>
              <Text style={styles.subtitle}>Daily Sacred Practice & Inner Sanctuary</Text>
            </View>
            <View style={styles.fireBadge}>
              <Flame size={14} color={colors.saffron} />
              <Text style={styles.fireText}>{completedCount}/3 Done</Text>
            </View>
          </View>

          {/* Shloka of the Day Banner */}
          <View style={styles.shlokaCard}>
            <View style={styles.cardHeader}>
              <View style={styles.cardBadge}>
                <Sparkles size={13} color={colors.goldPrimary} />
                <Text style={styles.cardBadgeText}>SHLOKA OF THE DAY</Text>
              </View>
              <TouchableOpacity onPress={handlePlayDailyVerse} style={styles.audioBtn}>
                <Volume2 size={16} color={colors.goldPrimary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.reference}>{dailyShloka.reference}</Text>
            <Text style={styles.sanskrit}>{dailyShloka.sanskrit}</Text>
            <Text style={styles.translation}>{dailyShloka.translation}</Text>
          </View>

          {/* 15-Minute Micro-Sadhana Checklist */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <Flame size={16} color={colors.saffron} />
              <Text style={styles.sectionTitle}>15-Minute Daily Sadhana Checklist</Text>
            </View>

            {isAllCompleted && (
              <View style={styles.congratsBanner}>
                <Text style={styles.congratsText}>
                  ✨ Sadhana Completed for Today! Your mind is anchored in Svadharma.
                </Text>
              </View>
            )}

            {SADHANA_STEPS.map((step, idx) => {
              const checked = sadhanaChecked[idx];
              return (
                <TouchableOpacity
                  key={idx}
                  style={[styles.taskItem, checked && styles.taskItemChecked]}
                  onPress={() => toggleSadhanaTask(idx)}
                  activeOpacity={0.8}
                >
                  <View style={styles.checkIcon}>
                    {checked ? (
                      <CheckCircle2 size={22} color={colors.goldPrimary} />
                    ) : (
                      <Circle size={22} color={colors.textMuted} />
                    )}
                  </View>
                  <View style={styles.taskTextCol}>
                    <Text style={[styles.taskTitle, checked && styles.taskTitleChecked]}>
                      {step.title}
                    </Text>
                    <Text style={styles.taskDesc}>{step.desc}</Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Saved Verses Bookmarks Section */}
          <View style={styles.sectionContainer}>
            <View style={styles.sectionHeader}>
              <BookmarkCheck size={16} color={colors.goldPrimary} />
              <Text style={styles.sectionTitle}>Saved Shlokas & Contemplations ({savedVerses.length})</Text>
            </View>

            {savedVerses.length === 0 ? (
              <View style={styles.emptyCard}>
                <Text style={styles.emptyText}>
                  You haven't bookmarked any verses yet. Explore the Gita Treasury and tap "Save Verse" to contemplate them here.
                </Text>
              </View>
            ) : (
              savedVerses.map((v) => (
                <View key={v.reference} style={styles.savedVerseWrapper}>
                  <VerseCard
                    reference={v.reference}
                    sanskrit={v.sanskrit}
                    transliteration={v.transliteration}
                    translation={v.translation}
                    commentary={v.commentary}
                  />
                  <TouchableOpacity
                    style={styles.removeBtn}
                    onPress={() => toggleSaveVerse(v)}
                  >
                    <Text style={styles.removeText}>Remove from Sanctuary</Text>
                  </TouchableOpacity>
                </View>
              ))
            )}
          </View>
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
    paddingHorizontal: 18,
    paddingTop: 12,
    paddingBottom: 80,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderColor: colors.border,
  },
  title: {
    color: colors.goldPrimary,
    fontSize: 22,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  fireBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#261510',
    borderColor: '#542618',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
  },
  fireText: {
    color: colors.saffron,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 4,
  },
  shlokaCard: {
    backgroundColor: '#161424',
    borderColor: '#3D3455',
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    marginBottom: 20,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cardBadgeText: {
    color: colors.goldPrimary,
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  audioBtn: {
    padding: 4,
  },
  reference: {
    color: colors.goldSecondary,
    fontSize: 13,
    fontWeight: '700',
    marginBottom: 8,
  },
  sanskrit: {
    color: '#FFF8EA',
    fontSize: 16,
    lineHeight: 24,
    fontWeight: '600',
    marginBottom: 8,
  },
  translation: {
    color: colors.textPrimary,
    fontSize: 13,
    lineHeight: 20,
    fontStyle: 'italic',
  },
  sectionContainer: {
    marginBottom: 22,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  sectionTitle: {
    color: colors.textPrimary,
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  congratsBanner: {
    backgroundColor: '#17271D',
    borderColor: '#265438',
    borderWidth: 1,
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
  },
  congratsText: {
    color: '#34D399',
    fontSize: 12,
    fontWeight: '600',
    textAlign: 'center',
  },
  taskItem: {
    flexDirection: 'row',
    backgroundColor: '#13111E',
    borderColor: '#242036',
    borderWidth: 1,
    borderRadius: 12,
    padding: 14,
    marginBottom: 10,
    alignItems: 'flex-start',
  },
  taskItemChecked: {
    borderColor: '#4A3D1E',
    backgroundColor: '#1A1713',
  },
  checkIcon: {
    marginRight: 12,
    marginTop: 2,
  },
  taskTextCol: {
    flex: 1,
  },
  taskTitle: {
    color: colors.textPrimary,
    fontSize: 14,
    fontWeight: '700',
    marginBottom: 4,
  },
  taskTitleChecked: {
    color: colors.goldPrimary,
    textDecorationLine: 'line-through',
  },
  taskDesc: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  emptyCard: {
    backgroundColor: '#13111E',
    borderRadius: 12,
    padding: 20,
    alignItems: 'center',
    borderColor: '#221F33',
    borderWidth: 1,
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 13,
    textAlign: 'center',
    lineHeight: 20,
  },
  savedVerseWrapper: {
    marginBottom: 12,
  },
  removeBtn: {
    alignSelf: 'flex-end',
    marginTop: -6,
    paddingVertical: 4,
    paddingHorizontal: 8,
  },
  removeText: {
    color: colors.textMuted,
    fontSize: 11,
  },
});
