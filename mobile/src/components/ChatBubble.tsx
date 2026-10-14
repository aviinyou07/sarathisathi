import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Share } from 'react-native';
import { Sparkles, ShieldAlert, Share2, Volume2, VolumeX } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { ChatMessage } from '../store/useChatStore';
import { ttsService } from '../services/tts';

interface ChatBubbleProps {
  message: ChatMessage;
}

export const ChatBubble: React.FC<ChatBubbleProps> = ({ message }) => {
  const isUser = message.sender === 'user';
  const isCrisis = !!message.isCrisis;
  const [isPlaying, setIsPlaying] = useState(false);

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

  return (
    <View
      style={[
        styles.bubble,
        isUser ? styles.userBubble : isCrisis ? styles.crisisBubble : styles.krishnaBubble,
      ]}
    >
      {/* Sender Header */}
      {!isUser && (
        <View style={styles.headerRow}>
          <View style={styles.senderBadge}>
            {isCrisis ? (
              <ShieldAlert size={14} color={colors.crisisText} />
            ) : (
              <Sparkles size={14} color={colors.goldPrimary} />
            )}
            <Text
              style={[
                styles.senderText,
                { color: isCrisis ? colors.crisisText : colors.goldPrimary },
              ]}
            >
              {isCrisis ? 'CRISIS INTERVENTION' : 'SRI KRISHNA'}
            </Text>
          </View>

          {!isCrisis && message.text.length > 0 && (
            <View style={styles.actionsRow}>
              <TouchableOpacity onPress={handleToggleVoice} style={styles.actionBtn}>
                {isPlaying ? (
                  <VolumeX size={15} color={colors.goldPrimary} />
                ) : (
                  <Volume2 size={15} color={colors.textMuted} />
                )}
              </TouchableOpacity>
              <TouchableOpacity onPress={handleShare} style={styles.actionBtn}>
                <Share2 size={15} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
          )}
        </View>
      )}

      {/* Message Content */}
      <Text style={[styles.messageText, isUser && styles.userText]}>
        {message.text}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  bubble: {
    maxWidth: '88%',
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
  },
  crisisBubble: {
    alignSelf: 'flex-start',
    backgroundColor: colors.crisisBg,
    borderColor: colors.crisisBorder,
    borderWidth: 1,
    borderBottomLeftRadius: 4,
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  senderBadge: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  senderText: {
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.5,
    marginLeft: 6,
  },
  actionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  actionBtn: {
    padding: 4,
    marginLeft: 6,
  },
  messageText: {
    color: colors.textPrimary,
    fontSize: 15,
    lineHeight: 23,
  },
  userText: {
    color: '#FFF8EA',
  },
});
