import React, { useState, useRef } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  StyleSheet,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { Send } from 'lucide-react-native';
import { colors } from '../theme/colors';
import { useChatStore, ChatMessage } from '../store/useChatStore';
import { ChatBubble } from '../components/ChatBubble';
import { streamCounselApi } from '../services/api';

export const ChatScreen: React.FC = () => {
  const {
    messages,
    isStreaming,
    dailyQuotaLeft,
    addMessage,
    appendStreamChunk,
    markCrisis,
    setIsStreaming,
    decrementQuota,
  } = useChatStore();

  const [input, setInput] = useState('');
  const flatListRef = useRef<FlatList>(null);

  const sendMessage = async () => {
    const userText = input.trim();
    if (!userText || isStreaming) return;

    setInput('');
    const userMsgId = 'user-' + Date.now();
    const botMsgId = 'bot-' + (Date.now() + 1);

    // 1. Append user message
    const userMsg: ChatMessage = {
      id: userMsgId,
      sender: 'user',
      text: userText,
      timestamp: Date.now(),
    };

    // 2. Placeholder for incoming Krishna stream
    const botMsg: ChatMessage = {
      id: botMsgId,
      sender: 'krishna',
      text: '',
      timestamp: Date.now() + 1,
    };

    addMessage(userMsg);
    addMessage(botMsg);
    setIsStreaming(true);
    decrementQuota();

    // 3. Connect to SSE stream
    await streamCounselApi(userText, 'anonymous-guest-user', {
      onChunk: (chunk: string) => {
        appendStreamChunk(botMsgId, chunk);
      },
      onCrisis: (crisisText: string) => {
        markCrisis(botMsgId, crisisText);
      },
      onError: (errMsg: string) => {
        appendStreamChunk(
          botMsgId,
          '\n\n[The connection is fragmented. Take a slow breath, and speak to me again.]',
        );
        setIsStreaming(false);
      },
      onDone: () => {
        setIsStreaming(false);
      },
    });
  };

  return (
    <LinearGradient
      colors={['#08070D', '#100E1A', '#0B0A12']}
      style={styles.gradientContainer}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Navigation Bar */}
        <View style={styles.navBar}>
          <View>
            <Text style={styles.navTitle}>Sarathi Sakha</Text>
            <Text style={styles.navSubtitle}>Divine Charioteer & Constant Friend</Text>
          </View>
          <View style={styles.quotaPill}>
            <Text style={styles.quotaText}>{dailyQuotaLeft} Free Left</Text>
          </View>
        </View>

        {/* Conversation Stream */}
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          renderItem={({ item }) => <ChatBubble message={item} />}
        />

        {/* Input Interface */}
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 10 : 0}
        >
          <View style={styles.inputBar}>
            <TextInput
              style={styles.textInput}
              placeholder="Ask about duty, sorrow, confusion, or fear..."
              placeholderTextColor={colors.textMuted}
              value={input}
              onChangeText={setInput}
              multiline
              editable={!isStreaming}
            />
            <TouchableOpacity
              onPress={sendMessage}
              disabled={isStreaming || !input.trim()}
              style={[
                styles.sendButton,
                (!input.trim() || isStreaming) && styles.sendButtonDisabled,
              ]}
            >
              {isStreaming ? (
                <ActivityIndicator size="small" color="#000" />
              ) : (
                <Send size={18} color="#000" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </LinearGradient>
  );
};

const styles = StyleSheet.create({
  gradientContainer: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  navBar: {
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderColor: colors.border,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#0A0912',
  },
  navTitle: {
    color: colors.goldPrimary,
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  navSubtitle: {
    color: colors.textSecondary,
    fontSize: 11,
    marginTop: 2,
  },
  quotaPill: {
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: '#1E1A29',
    borderWidth: 1,
    borderColor: colors.goldSecondary,
  },
  quotaText: {
    color: colors.goldSecondary,
    fontSize: 12,
    fontWeight: '700',
  },
  listContent: {
    padding: 16,
    paddingBottom: 20,
  },
  inputBar: {
    flexDirection: 'row',
    padding: 12,
    borderTopWidth: 1,
    borderColor: colors.border,
    backgroundColor: '#0F0E17',
    alignItems: 'center',
  },
  textInput: {
    flex: 1,
    backgroundColor: colors.inputBackground,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    color: '#FFF',
    fontSize: 15,
    maxHeight: 110,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sendButton: {
    marginLeft: 10,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.goldPrimary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.4,
  },
});
