import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ChevronDown, ChevronUp, BookOpen, Volume2 } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { ttsService } from '../services/tts';

interface VerseCardProps {
  reference: string;
  sanskrit: string;
  transliteration?: string;
  translation: string;
  commentary?: string;
}

export const VerseCard: React.FC<VerseCardProps> = ({
  reference,
  sanskrit,
  transliteration,
  translation,
  commentary,
}) => {
  const [expanded, setExpanded] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleAudio = () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      const textToSpeak = `${reference}. ${translation}. ${commentary || ''}`;
      ttsService.speak(
        textToSpeak,
        () => setIsPlaying(false),
        () => setIsPlaying(false),
      );
    }
  };

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View style={styles.badge}>
          <BookOpen size={14} color={colors.goldPrimary} />
          <Text style={styles.referenceText}>{reference}</Text>
        </View>
        <TouchableOpacity onPress={handleAudio} style={styles.iconButton}>
          <Volume2 size={16} color={isPlaying ? colors.goldPrimary : colors.textMuted} />
        </TouchableOpacity>
      </View>

      {/* Sanskrit Shloka */}
      <Text style={styles.sanskritText}>{sanskrit}</Text>

      {/* Transliteration */}
      {transliteration ? (
        <Text style={styles.transliterationText}>{transliteration}</Text>
      ) : null}

      {/* Translation */}
      <Text style={styles.translationText}>{translation}</Text>

      {/* Commentary Accordion */}
      {commentary ? (
        <TouchableOpacity
          onPress={() => setExpanded(!expanded)}
          style={styles.accordionHeader}
        >
          <Text style={styles.accordionTitle}>
            {expanded ? 'Hide Shastric Commentary' : 'Read Shastric Commentary'}
          </Text>
          {expanded ? (
            <ChevronUp size={16} color={colors.goldSecondary} />
          ) : (
            <ChevronDown size={16} color={colors.goldSecondary} />
          )}
        </TouchableOpacity>
      ) : null}

      {expanded && commentary ? (
        <View style={styles.commentaryContainer}>
          <Text style={styles.commentaryText}>{commentary}</Text>
        </View>
      ) : null}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#161424',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#302A45',
    padding: 14,
    marginVertical: 10,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#231E35',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#4A3D22',
  },
  referenceText: {
    color: colors.goldPrimary,
    fontSize: 12,
    fontWeight: '700',
    marginLeft: 6,
  },
  iconButton: {
    padding: 6,
  },
  sanskritText: {
    color: '#FFE29A',
    fontSize: 16,
    lineHeight: 25,
    fontStyle: 'italic',
    textAlign: 'center',
    marginVertical: 6,
  },
  transliterationText: {
    color: '#AEA7D1',
    fontSize: 13,
    lineHeight: 19,
    textAlign: 'center',
    marginBottom: 8,
  },
  translationText: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
    borderTopWidth: 1,
    borderTopColor: '#252138',
    paddingTop: 8,
  },
  accordionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#252138',
  },
  accordionTitle: {
    color: colors.goldSecondary,
    fontSize: 12,
    fontWeight: '600',
  },
  commentaryContainer: {
    marginTop: 8,
    backgroundColor: '#0F0E17',
    padding: 10,
    borderRadius: 8,
  },
  commentaryText: {
    color: '#B6B2CD',
    fontSize: 13,
    lineHeight: 20,
  },
});
