import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Search, BookOpen, Bookmark, BookmarkCheck } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { GITA_CHAPTERS, MASTERPIECE_VERSES, TreasuryVerse } from '../data/gitaTreasury';
import { VerseCard } from '../components/VerseCard';
import { useChatStore } from '../store/useChatStore';

const CATEGORIES = [
  'All',
  'Peace & Stillness',
  'Duty & Karma',
  'Courage & Fearlessness',
  'Devotion & Grace',
  'Mind Mastery',
];

export const GitaTreasuryScreen: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedChapter, setSelectedChapter] = useState<number | null>(null);

  const { savedVerses, toggleSaveVerse, isVerseSaved } = useChatStore();

  const filteredVerses = useMemo(() => {
    return MASTERPIECE_VERSES.filter((v) => {
      // 1. Chapter Filter
      if (selectedChapter !== null && v.chapter !== selectedChapter) {
        return false;
      }
      // 2. Category Tag Filter
      if (selectedCategory !== 'All' && !v.tags.includes(selectedCategory)) {
        return false;
      }
      // 3. Search Query Filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRef = v.reference.toLowerCase().includes(q);
        const matchesTrans = v.translation.toLowerCase().includes(q);
        const matchesSanskrit = v.sanskrit.includes(q) || v.transliteration.toLowerCase().includes(q);
        const matchesTags = v.tags.some((t) => t.toLowerCase().includes(q));
        if (!matchesRef && !matchesTrans && !matchesSanskrit && !matchesTags) {
          return false;
        }
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedChapter]);

  const activeChapterInfo = useMemo(() => {
    if (selectedChapter === null) return null;
    return GITA_CHAPTERS.find((c) => c.chapter === selectedChapter);
  }, [selectedChapter]);

  return (
    <LinearGradient
      colors={['#08070D', '#100E1A', '#0B0A12']}
      style={styles.gradient}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.title}>Gita Treasury</Text>
            <Text style={styles.subtitle}>700 Verses of Eternal Transcendental Truth</Text>
          </View>
          <View style={styles.badge}>
            <Text style={styles.badgeText}>18 Chapters</Text>
          </View>
        </View>

        {/* Search Input */}
        <View style={styles.searchContainer}>
          <Search size={16} color={colors.goldPrimary} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by topic (duty, fear, karma, peace)..."
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
        </View>

        {/* Topic Filter Chips */}
        <View style={styles.filterScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filterScroll}
          >
            {CATEGORIES.map((cat) => {
              const isActive = selectedCategory === cat;
              return (
                <TouchableOpacity
                  key={cat}
                  onPress={() => {
                    setSelectedCategory(cat);
                    setSelectedChapter(null);
                  }}
                  style={[styles.chip, isActive && styles.chipActive]}
                >
                  <Text style={[styles.chipText, isActive && styles.chipTextActive]}>
                    {cat}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* 18 Chapters Quick Selector */}
        <View style={styles.chaptersScrollWrapper}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.chaptersScroll}
          >
            <TouchableOpacity
              onPress={() => setSelectedChapter(null)}
              style={[
                styles.chapterPill,
                selectedChapter === null && styles.chapterPillActive,
              ]}
            >
              <Text
                style={[
                  styles.chapterPillText,
                  selectedChapter === null && styles.chapterPillTextActive,
                ]}
              >
                All Chapters
              </Text>
            </TouchableOpacity>

            {GITA_CHAPTERS.map((ch) => {
              const isChActive = selectedChapter === ch.chapter;
              return (
                <TouchableOpacity
                  key={ch.chapter}
                  onPress={() => setSelectedChapter(isChActive ? null : ch.chapter)}
                  style={[styles.chapterPill, isChActive && styles.chapterPillActive]}
                >
                  <Text
                    style={[
                      styles.chapterPillText,
                      isChActive && styles.chapterPillTextActive,
                    ]}
                  >
                    Ch. {ch.chapter}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Chapter Overview Card (when chapter selected) */}
        {activeChapterInfo && (
          <View style={styles.chapterCard}>
            <View style={styles.chapterCardHeader}>
              <BookOpen size={14} color={colors.goldPrimary} />
              <Text style={styles.chapterCardTitle}>
                Chapter {activeChapterInfo.chapter}: {activeChapterInfo.name}
              </Text>
            </View>
            <Text style={styles.chapterMeaning}>{activeChapterInfo.meaning}</Text>
            <Text style={styles.chapterTheme}>{activeChapterInfo.theme}</Text>
          </View>
        )}

        {/* Verses List */}
        <FlatList
          data={filteredVerses}
          keyExtractor={(item) => item.reference}
          contentContainerStyle={styles.listContent}
          renderItem={({ item }) => {
            const saved = isVerseSaved(item.reference);
            return (
              <View style={styles.verseWrapper}>
                <VerseCard
                  reference={item.reference}
                  sanskrit={item.sanskrit}
                  transliteration={item.transliteration}
                  translation={item.translation}
                  commentary={item.commentary}
                />
                <TouchableOpacity
                  style={[styles.bookmarkBtn, saved && styles.bookmarkBtnSaved]}
                  onPress={() => toggleSaveVerse(item)}
                >
                  {saved ? (
                    <BookmarkCheck size={16} color={colors.goldPrimary} />
                  ) : (
                    <Bookmark size={16} color={colors.textMuted} />
                  )}
                  <Text style={[styles.bookmarkText, saved && styles.bookmarkTextSaved]}>
                    {saved ? 'Saved in Sadhana' : 'Save Verse'}
                  </Text>
                </TouchableOpacity>
              </View>
            );
          }}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Text style={styles.emptyText}>
                No verses found matching your reflection search.
              </Text>
            </View>
          }
        />
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
  header: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#0A0912',
  },
  title: {
    color: colors.goldPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  subtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  badge: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#1E1A29',
    borderWidth: 1,
    borderColor: colors.goldSecondary,
  },
  badgeText: {
    color: colors.goldSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.inputBackground,
    marginHorizontal: 16,
    marginTop: 12,
    borderRadius: 12,
    paddingHorizontal: 14,
    borderWidth: 1,
    borderColor: colors.border,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    height: 42,
    color: '#FFF',
    fontSize: 14,
  },
  filterScrollWrapper: {
    marginTop: 10,
  },
  filterScroll: {
    paddingHorizontal: 16,
  },
  chip: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: '#141220',
    borderWidth: 1,
    borderColor: '#2D2844',
    marginRight: 8,
  },
  chipActive: {
    backgroundColor: colors.goldPrimary,
    borderColor: colors.goldPrimary,
  },
  chipText: {
    color: colors.textSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  chipTextActive: {
    color: '#000',
    fontWeight: '800',
  },
  chaptersScrollWrapper: {
    marginTop: 8,
    marginBottom: 4,
  },
  chaptersScroll: {
    paddingHorizontal: 16,
  },
  chapterPill: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    backgroundColor: '#100E1A',
    borderWidth: 1,
    borderColor: '#242036',
    marginRight: 6,
  },
  chapterPillActive: {
    borderColor: colors.goldSecondary,
    backgroundColor: '#261F14',
  },
  chapterPillText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
  },
  chapterPillTextActive: {
    color: colors.goldSecondary,
    fontWeight: '700',
  },
  chapterCard: {
    backgroundColor: '#161324',
    borderColor: '#362E52',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginHorizontal: 16,
    marginTop: 8,
  },
  chapterCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  chapterCardTitle: {
    color: colors.goldPrimary,
    fontSize: 13,
    fontWeight: '700',
    marginLeft: 6,
  },
  chapterMeaning: {
    color: colors.textPrimary,
    fontSize: 12,
    fontStyle: 'italic',
    marginBottom: 4,
  },
  chapterTheme: {
    color: colors.textSecondary,
    fontSize: 12,
    lineHeight: 18,
  },
  listContent: {
    padding: 16,
    paddingBottom: 80,
  },
  verseWrapper: {
    marginBottom: 8,
  },
  bookmarkBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    marginTop: -4,
    marginBottom: 10,
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 8,
    backgroundColor: '#161422',
    borderWidth: 1,
    borderColor: '#272238',
  },
  bookmarkBtnSaved: {
    borderColor: colors.goldPrimary,
    backgroundColor: '#201B10',
  },
  bookmarkText: {
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '600',
    marginLeft: 5,
  },
  bookmarkTextSaved: {
    color: colors.goldPrimary,
    fontWeight: '700',
  },
  emptyContainer: {
    paddingVertical: 50,
    alignItems: 'center',
  },
  emptyText: {
    color: colors.textMuted,
    fontSize: 14,
  },
});
