import React, { useState, useEffect } from 'react';
import { View, StyleSheet, ScrollView, RefreshControl, Alert } from 'react-native';
import { Text, FAB, Card, Chip, Surface, IconButton } from 'react-native-paper';
import { useRouter } from 'expo-router';
import { useAuth } from '../../contexts/AuthContext';
import { databaseService } from '../../services/database';
import { Program } from '../../types';

export default function AdminDashboard() {
  const [programs, setPrograms] = useState<Program[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    loadPrograms();
  }, []);

  const loadPrograms = async () => {
    try {
      const data = await databaseService.getPrograms();
      // Sort by date (newest first)
      const sorted = data.sort((a, b) =>
        new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      setPrograms(sorted);
    } catch (error) {
      console.error('Error loading programs:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    loadPrograms();
  };

  const getStatusColor = (status: string): string => {
    switch (status) {
      case 'active':
        return '#4caf50';
      case 'draft':
        return '#ff9800';
      case 'completed':
        return '#9e9e9e';
      default:
        return '#757575';
    }
  };

  const getStatusLabel = (status: string): string => {
    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  const formatDate = (dateString: string): string => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getStats = () => {
    return {
      total: programs.length,
      active: programs.filter(p => p.status === 'active').length,
      draft: programs.filter(p => p.status === 'draft').length,
      completed: programs.filter(p => p.status === 'completed').length,
    };
  };

  const handleDeleteProgram = (program: Program) => {
    Alert.alert(
      'Delete Program',
      `Are you sure you want to delete "${program.title}"? This action cannot be undone.`,
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await databaseService.deleteProgram(program.id);
              // Remove from local state
              setPrograms(programs.filter(p => p.id !== program.id));
              Alert.alert('Success', 'Program deleted successfully');
            } catch (error) {
              console.error('Error deleting program:', error);
              Alert.alert('Error', 'Failed to delete program. Please try again.');
            }
          },
        },
      ]
    );
  };

  const stats = getStats();

  if (loading) {
    return (
      <View style={styles.centerContainer}>
        <Text>Loading programs...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <Surface style={styles.header} elevation={2}>
        <Text variant="headlineMedium" style={styles.headerTitle}>
          Admin Dashboard
        </Text>
        <Text variant="bodyMedium" style={styles.headerSubtitle}>
          Welcome back, {user?.first_name}!
        </Text>
      </Surface>

      {/* Stats */}
      <Surface style={styles.statsContainer} elevation={1}>
        <View style={styles.statsRow}>
          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={styles.statNumber}>
              {stats.total}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Total Programs
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: '#4caf50' }]}>
              {stats.active}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Active
            </Text>
          </View>

          <View style={styles.statDivider} />

          <View style={styles.statItem}>
            <Text variant="headlineMedium" style={[styles.statNumber, { color: '#ff9800' }]}>
              {stats.draft}
            </Text>
            <Text variant="bodySmall" style={styles.statLabel}>
              Drafts
            </Text>
          </View>
        </View>
      </Surface>

      {/* Programs List */}
      <ScrollView
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {programs.length === 0 ? (
          <View style={styles.emptyState}>
            <Text variant="titleLarge" style={styles.emptyTitle}>
              No Programs Yet
            </Text>
            <Text variant="bodyMedium" style={styles.emptyMessage}>
              Create your first program to get started
            </Text>
          </View>
        ) : (
          programs.map((program) => (
            <Card
              key={program.id}
              style={styles.programCard}
              onPress={() => router.push(`/(admin)/programs/${program.id}/share`)}
            >
              <Card.Content>
                <View style={styles.cardHeader}>
                  <View style={styles.cardTitleRow}>
                    <Text variant="titleLarge" style={styles.programTitle}>
                      {program.title}
                    </Text>
                    <Chip
                      mode="flat"
                      style={[
                        styles.statusChip,
                        { backgroundColor: getStatusColor(program.status) + '20' },
                      ]}
                      textStyle={{ color: getStatusColor(program.status) }}
                    >
                      {getStatusLabel(program.status)}
                    </Chip>
                  </View>
                </View>

                <View style={styles.programMeta}>
                  <View style={styles.metaItem}>
                    <IconButton icon="calendar" size={16} style={styles.metaIcon} />
                    <Text variant="bodyMedium" style={styles.metaText}>
                      {formatDate(program.date)}
                    </Text>
                  </View>

                  {program.share_code && program.public_access_enabled && (
                    <View style={styles.metaItem}>
                      <IconButton icon="share-variant" size={16} style={styles.metaIcon} />
                      <Text variant="bodyMedium" style={styles.metaText}>
                        Code: {program.share_code}
                      </Text>
                    </View>
                  )}

                  {program.active_participants_count > 0 && (
                    <View style={styles.metaItem}>
                      <IconButton icon="account-group" size={16} style={styles.metaIcon} />
                      <Text variant="bodyMedium" style={styles.metaText}>
                        {program.active_participants_count} active
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>

              <Card.Actions>
                <IconButton
                  icon="pencil"
                  mode="contained-tonal"
                  onPress={() => router.push(`/(admin)/programs/${program.id}/edit`)}
                />
                <IconButton
                  icon="share-variant"
                  mode="contained-tonal"
                  onPress={() => router.push(`/(admin)/programs/${program.id}/share`)}
                />
                <IconButton
                  icon="account-multiple"
                  mode="contained-tonal"
                  onPress={() => router.push(`/(admin)/programs/${program.id}/participants`)}
                />
                <View style={{ flex: 1 }} />
                <IconButton
                  icon="delete"
                  mode="contained-tonal"
                  iconColor="#d32f2f"
                  onPress={() => handleDeleteProgram(program)}
                />
              </Card.Actions>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create Program FAB */}
      <FAB
        icon="plus"
        label="Create Program"
        style={styles.fab}
        onPress={() => router.push('/(admin)/programs/create')}
      />
    </View>
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
  header: {
    backgroundColor: '#fff',
    padding: 20,
    paddingTop: 60,
    paddingBottom: 20,
  },
  headerTitle: {
    fontWeight: 'bold',
    marginBottom: 4,
  },
  headerSubtitle: {
    opacity: 0.7,
  },
  statsContainer: {
    backgroundColor: '#fff',
    margin: 16,
    marginBottom: 8,
    borderRadius: 12,
    padding: 20,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
  },
  statItem: {
    alignItems: 'center',
    flex: 1,
  },
  statNumber: {
    fontWeight: 'bold',
    color: '#2196f3',
  },
  statLabel: {
    opacity: 0.6,
    marginTop: 4,
  },
  statDivider: {
    width: 1,
    height: 40,
    backgroundColor: '#e0e0e0',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyTitle: {
    fontWeight: 'bold',
    marginBottom: 8,
  },
  emptyMessage: {
    opacity: 0.6,
    textAlign: 'center',
  },
  programCard: {
    marginBottom: 16,
    backgroundColor: '#fff',
  },
  cardHeader: {
    marginBottom: 12,
  },
  cardTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    gap: 8,
  },
  programTitle: {
    flex: 1,
    fontWeight: '600',
  },
  statusChip: {
    height: 28,
  },
  programMeta: {
    gap: 8,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    margin: 0,
  },
  metaText: {
    opacity: 0.7,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
  },
});
