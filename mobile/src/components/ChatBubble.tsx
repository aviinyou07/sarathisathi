import React, { useState, useMemo } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import {
  Sparkles,
  ShieldAlert,
  Share2,
  Volume2,
  VolumeX,
  Flag,
  Eye,
  BookOpen,
  Flame,
} from 'lucide-react-native';
import { colors } from '../theme/colors';
import { ChatMessage } from '../store/useChatStore';
import { ttsService } from '../services/tts';
import { VerseCard } from './VerseCard';
import { parseCounsel } from '../utils/counselParser';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isCrisis = !!message.isCrisis;
  const [isPlaying, setIsPlaying] = useState(false);

  const parsed = useMemo(() => {
    if (isUser || isCrisis) return null;
    return parseCounsel(message.text);
  }, [message.text, isUser, isCrisis]);

  const handleToggleVoice = () => {
    if (isPlaying) {
      ttsService.stop();
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      ttsService.speak(
        message.text,
        () => setIsPlaying(false),
        () => setIsPlaying(false),
      );
    }
  };

  const handleShare = () => {
    Share.share({
      message: `Sri Krishna's Counsel (Sarathi Sakha):\n\n${message.text}\n\nSteer through your Kurukshetra with divine wisdom.`,
    });
  };

  const handleReport = () => {
    Alert.alert(
      'Shastric Fidelity Feedback',
      'Did this counsel contain any shastric inaccuracy or inappropriate tone? Your feedback is reviewed by Vedic scholars.',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Report to Scholars',
          style: 'destructive',
          onPress: () =>
            Alert.alert(
              'Report Recorded',
              'Thank you, Partha. Your feedback helps safeguard the purity of sacred knowledge.',
            ),
        },
      ],
    );
  };

  // 1. Render User Message
  if (isUser) {
    return (
      <View style={[styles.bubble, styles.userBubble]}>
        <Text style={[styles.messageText, styles.userText]}>{message.text}</Text>
      </View>
    );
  }

  // 2. Render Crisis Intervention Message
  if (isCrisis) {
    return (
      <View style={[styles.bubble, styles.crisisBubble]}>
        <View style={styles.headerRow}>
          <View style={styles.senderBadge}>
            <ShieldAlert size={15} color={colors.crisisText} />
            <Text style={[styles.senderText, { color: colors.crisisText }]}>
              CRISIS INTERVENTION • IMMEDIATE HELP
            </Text>
          </View>
        </View>
        <Text style={styles.messageText}>{message.text}</Text>
      </View>
    );
  }

  // 3. Render Krishna Message (Structured with VerseCard or Plain Stream)
  return (
    <View style={[styles.bubble, styles.krishnaBubble]}>
      {/* Sender Header & Tools */}
      <View style={styles.headerRow}>
        <View style={styles.senderBadge}>
          <Sparkles size={14} color={colors.goldPrimary} />
          <Text style={styles.senderText}>SRI KRISHNA (SAKHA)</Text>
        </View>

        {message.text.length > 0 && (
          <View style={styles.actionsRow}>
            <TouchableOpacity
              onPress={handleToggleVoice}
              style={styles.actionBtn}
              accessibilityLabel="Read counsel aloud"
            >
              {isPlaying ? (
                <VolumeX size={15} color={colors.goldPrimary} />
              ) : (
                <Volume2 size={15} color={colors.textMuted} />
              )}
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleShare}
              style={styles.actionBtn}
              accessibilityLabel="Share reflection"
            >
              <Share2 size={15} color={colors.textMuted} />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleReport}
              style={styles.actionBtn}
              accessibilityLabel="Report inaccurate response"
            >
              <Flag size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Structured Content or Natural Text */}
      {parsed && parsed.isStructured ? (
        <View style={styles.structuredContainer}>
          {/* Introductory Words */}
          {!!parsed.intro && (
            <Text style={styles.introText}>{parsed.intro}</Text>
          )}

          {/* Section 1: The Mirror */}
          {!!parsed.mirror && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionBadge}>
                <Eye size={13} color={colors.goldPrimary} />
                <Text style={styles.sectionTitle}>THE MIRROR • आत्म-दर्शन</Text>
              </View>
              <Text style={styles.sectionBody}>{parsed.mirror}</Text>
            </View>
          )}

          {/* Section 2: The Eternal Shloka (VerseCard) */}
          {!!parsed.shloka && (
            <VerseCard
              reference={parsed.shloka.reference}
              sanskrit={parsed.shloka.sanskrit}
              transliteration={parsed.shloka.transliteration}
              translation={parsed.shloka.translation}
              commentary={parsed.shloka.commentary}
            />
          )}

          {/* Section 3: The Living Example */}
          {!!parsed.example && (
            <View style={styles.sectionCard}>
              <View style={styles.sectionBadge}>
                <BookOpen size={13} color={colors.goldSecondary} />
                <Text style={styles.sectionTitle}>THE LIVING EXAMPLE • महाभारत प्रसंग</Text>
              </View>
              <Text style={styles.sectionBody}>{parsed.example}</Text>
            </View>
          )}

          {/* Section 4: Micro-Sadhana */}
          {!!parsed.sadhana && (
            <View style={[styles.sectionCard, styles.sadhanaCard]}>
              <View style={styles.sectionBadge}>
                <Flame size={13} color={colors.saffron} />
                <Text style={[styles.sectionTitle, { color: colors.saffron }]}>
                  15-MINUTE MICRO-SADHANA • साधना
                </Text>
              </View>
              <Text style={[styles.sectionBody, styles.sadhanaText]}>
                {parsed.sadhana}
              </Text>
            </View>
          )}
        </View>
      ) : (
        <Text style={styles.messageText}>{message.text}</Text>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '92%',
    marginVertical: 6,
    borderRadius: 16,
    padding: 14,
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: colors.userBubble,
    borderColor: colors.userBorder,
    borderWidth: 1,
    borderBottomRightRadius: 4,
  },
  krishnaBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.cardBackground,
    borderColor: colors.border,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
    width: '92%',
  },
  crisisBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.crisisBg,
    borderColor: colors.crisisBorder,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
    width: '92%',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  senderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.6,
    marginLeft: 6,
    color: colors.goldPrimary,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 4,
    marginLeft: 8,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 23,
  },
  userText: {
    color: '#FFF8EA',
  },
  structuredContainer: {
    marginTop: 2,
  },
  introText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
    fontStyle: 'italic',
  },
  sectionCard: {
    backgroundColor: '#181628',
    borderColor: '#2F2B48',
    borderWidth: 1,
    borderRadius: 12,
    padding: 12,
    marginVertical: 6,
  },
  sectionBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  sectionTitle: {
    color: colors.goldPrimary,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.5,
    marginLeft: 6,
    textTransform: 'uppercase',
  },
  sectionBody: {
    color: colors.textPrimary,
    fontSize: 14,
    lineHeight: 22,
  },
  sadhanaCard: {
    backgroundColor: '#1E1420',
    borderColor: '#542618',
  },
  sadhanaText: {
    color: '#FFE8D6',
  },
});
