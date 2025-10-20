import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, Share, Alert } from 'react-native';
import { Text, Surface, Button, IconButton, Divider, Switch } from 'react-native-paper';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { shareService } from '../../../../services/shareService';
import { databaseService } from '../../../../services/database';
import { ShareLink, Program } from '../../../../types';
import * as Clipboard from 'expo-clipboard';

export default function ShareProgramScreen() {
  const [program, setProgram] = useState<Program | null>(null);
  const [shareLink, setShareLink] = useState<ShareLink | null>(null);
  const [loading, setLoading] = useState(true);
  const [regenerating, setRegenerating] = useState(false);
  const params = useLocalSearchParams();
  const router = useRouter();

  const programId = params.id as string;

  useEffect(() => {
    loadProgramAndLink();
  }, [programId]);

  const loadProgramAndLink = async () => {
    try {
      const [programData, linkData] = await Promise.all([
        databaseService.getProgram(programId),
        shareService.getShareLink(programId),
      ]);

      setProgram(programData);
      setShareLink(linkData);
    } catch (error) {
      console.error('Error loading program:', error);
      Alert.alert('Error', 'Failed to load program details');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyCode = async () => {
    if (shareLink) {
      await Clipboard.setStringAsync(shareLink.shareCode);
      Alert.alert('Copied!', 'Share code copied to clipboard');
    }
  };

  const handleCopyLink = async () => {
    if (shareLink) {
      await Clipboard.setStringAsync(shareLink.url);
      Alert.alert('Copied!', 'Share link copied to clipboard');
    }
  };

  const handleShare = async () => {
    if (!program || !shareLink) return;

    try {
      const message = shareService.formatShareMessage(shareLink, program.title);
      await Share.share({
        message,
        title: `Join ${program.title}`,
      });
    } catch (error) {
      console.error('Error sharing:', error);
    }
  };

  const handleRegenerateCode = async () => {
    Alert.alert(
      'Regenerate Code',
      'This will create a new share code. The old code will no longer work. Continue?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Regenerate',
          style: 'destructive',
          onPress: async () => {
            setRegenerating(true);
            try {
              const newLink = await shareService.regenerateShareCode(programId);
              setShareLink(newLink);
              Alert.alert('Success', 'New share code generated!');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to regenerate code');
            } finally {
              setRegenerating(false);
            }
          },
        },
      ]
    );
  };

  const handleTogglePublicAccess = async (enabled: boolean) => {
    try {
      await shareService.setPublicAccess(programId, enabled);
      if (program) {
        setProgram({ ...program, public_access_enabled: enabled });
      }
      Alert.alert(
        'Success',
        enabled
          ? 'Public access enabled. Anyone with the code can join.'
          : 'Public access disabled. The link and code are now inactive.'
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to update access settings');
    }
  };

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading...</Text>
      </View>
    );
  }

  if (!program || !shareLink) {
    return (
      <View style={styles.centerContainer}>
        <Text>Program not found</Text>
        <Button onPress={() => router.back()}>Go Back</Button>
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text variant="headlineMedium" style={styles.title}>
            Share Program
          </Text>
          <Text variant="bodyLarge" style={styles.subtitle}>
            {program.title}
          </Text>
        </View>

        {/* Public Access Toggle */}
        <Surface style={styles.section} elevation={1}>
          <View style={styles.toggleRow}>
            <View style={styles.toggleInfo}>
              <Text variant="titleMedium">Public Access</Text>
              <Text variant="bodySmall" style={styles.toggleDescription}>
                {program.public_access_enabled
                  ? 'Anyone with the code can join'
                  : 'Link and code are disabled'}
              </Text>
            </View>
            <Switch
              value={program.public_access_enabled}
              onValueChange={handleTogglePublicAccess}
            />
          </View>
        </Surface>

        {program.public_access_enabled && (
          <>
            {/* Share Code */}
            <Surface style={styles.section} elevation={1}>
              <Text variant="labelLarge" style={styles.sectionLabel}>
                SHARE CODE
              </Text>
              <View style={styles.codeContainer}>
                <Text variant="displaySmall" style={styles.code}>
                  {shareLink.shareCode}
                </Text>
              </View>
              <Text variant="bodySmall" style={styles.codeHint}>
                Volunteers can enter this code to join the program
              </Text>
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={handleCopyCode}
                  icon="content-copy"
                  style={styles.actionButton}
                >
                  Copy Code
                </Button>
                <Button
                  mode="text"
                  onPress={handleRegenerateCode}
                  loading={regenerating}
                  disabled={regenerating}
                  icon="refresh"
                >
                  Regenerate
                </Button>
              </View>
            </Surface>

            <Divider style={styles.divider} />

            {/* Share Link */}
            <Surface style={styles.section} elevation={1}>
              <Text variant="labelLarge" style={styles.sectionLabel}>
                SHARE LINK
              </Text>
              <Surface style={styles.linkContainer} elevation={0}>
                <Text variant="bodyMedium" style={styles.link} numberOfLines={2}>
                  {shareLink.url}
                </Text>
              </Surface>
              <Text variant="bodySmall" style={styles.linkHint}>
                Send this link via message, email, or social media
              </Text>
              <View style={styles.buttonRow}>
                <Button
                  mode="outlined"
                  onPress={handleCopyLink}
                  icon="content-copy"
                  style={styles.actionButton}
                >
                  Copy Link
                </Button>
                <Button
                  mode="contained"
                  onPress={handleShare}
                  icon="share-variant"
                  style={styles.actionButton}
                >
                  Share
                </Button>
              </View>
            </Surface>

            <Divider style={styles.divider} />

            {/* Preview Message */}
            <Surface style={styles.section} elevation={1}>
              <Text variant="labelLarge" style={styles.sectionLabel}>
                PREVIEW MESSAGE
              </Text>
              <Surface style={styles.previewContainer} elevation={0}>
                <Text variant="bodyMedium" style={styles.previewText}>
                  {shareService.formatShareMessage(shareLink, program.title)}
                </Text>
              </Surface>
            </Surface>
          </>
        )}

        {/* Actions */}
        <View style={styles.actions}>
          <Button
            mode="outlined"
            onPress={() => router.push(`/(admin)/programs/${programId}/participants`)}
            icon="account-multiple"
            style={styles.viewParticipantsButton}
          >
            View Participants
          </Button>

          <Button
            mode="text"
            onPress={() => router.back()}
          >
            Back to Dashboard
          </Button>
        </View>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  content: {
    padding: 20,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    opacity: 0.7,
  },
  section: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 16,
  },
  sectionLabel: {
    opacity: 0.6,
    marginBottom: 16,
  },
  toggleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  toggleInfo: {
    flex: 1,
  },
  toggleDescription: {
    opacity: 0.6,
    marginTop: 4,
  },
  codeContainer: {
    alignItems: 'center',
    paddingVertical: 24,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    marginBottom: 12,
  },
  code: {
    fontWeight: 'bold',
    letterSpacing: 4,
    fontFamily: 'monospace',
  },
  codeHint: {
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 16,
  },
  buttonRow: {
    flexDirection: 'row',
    gap: 12,
  },
  actionButton: {
    flex: 1,
  },
  divider: {
    marginVertical: 8,
  },
  linkContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
    marginBottom: 12,
  },
  link: {
    opacity: 0.7,
    fontFamily: 'monospace',
  },
  linkHint: {
    textAlign: 'center',
    opacity: 0.6,
    marginBottom: 16,
  },
  previewContainer: {
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 16,
  },
  previewText: {
    lineHeight: 22,
    opacity: 0.8,
  },
  actions: {
    marginTop: 24,
    gap: 12,
  },
  viewParticipantsButton: {
    marginBottom: 8,
  },
});
