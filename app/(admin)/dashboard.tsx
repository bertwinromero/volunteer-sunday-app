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
        return '#10B981'; // Darker green for better contrast
      case 'draft':
        return '#F59E0B'; // Darker orange for better contrast
      case 'completed':
        return '#6B7280'; // Darker gray for better contrast
      default:
        return '#6B7280';
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
      {/* Header with Gradient Effect */}
      <View style={styles.headerGradient}>
        <View style={styles.header}>
          <View>
            <Text variant="displaySmall" style={styles.headerTitle}>
              Dashboard
            </Text>
            <Text variant="bodyLarge" style={styles.headerSubtitle}>
              Welcome back, {user?.first_name} 👋
            </Text>
          </View>
        </View>
      </View>

      {/* Stats Cards */}
      <View style={styles.statsContainer}>
        <Surface style={[styles.statCard, styles.statCardPrimary]} elevation={0}>
          <View style={styles.statIconContainer}>
            <IconButton icon="calendar-multiple" size={24} iconColor="#6366F1" style={styles.statIcon} />
          </View>
          <Text variant="headlineLarge" style={styles.statNumber}>
            {stats.total}
          </Text>
          <Text variant="bodyMedium" style={styles.statLabel}>
            Total Programs
          </Text>
        </Surface>

        <Surface style={[styles.statCard, styles.statCardSuccess]} elevation={0}>
          <View style={styles.statIconContainer}>
            <IconButton icon="check-circle" size={24} iconColor="#10B981" style={styles.statIcon} />
          </View>
          <Text variant="headlineLarge" style={[styles.statNumber, { color: '#10B981' }]}>
            {stats.active}
          </Text>
          <Text variant="bodyMedium" style={styles.statLabel}>
            Active
          </Text>
        </Surface>

        <Surface style={[styles.statCard, styles.statCardWarning]} elevation={0}>
          <View style={styles.statIconContainer}>
            <IconButton icon="file-document-edit" size={24} iconColor="#F59E0B" style={styles.statIcon} />
          </View>
          <Text variant="headlineLarge" style={[styles.statNumber, { color: '#F59E0B' }]}>
            {stats.draft}
          </Text>
          <Text variant="bodyMedium" style={styles.statLabel}>
            Drafts
          </Text>
        </Surface>
      </View>

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
            <IconButton icon="folder-open" size={80} iconColor="#D1D5DB" />
            <Text variant="headlineSmall" style={styles.emptyTitle}>
              No Programs Yet
            </Text>
            <Text variant="bodyLarge" style={styles.emptyMessage}>
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
              <Card.Content style={styles.cardContent}>
                <View style={styles.cardHeader}>
                  <Text variant="titleLarge" style={styles.programTitle}>
                    {program.title}
                  </Text>
                  <Chip
                    mode="flat"
                    style={[
                      styles.statusChip,
                      { backgroundColor: getStatusColor(program.status) + '25' },
                    ]}
                    textStyle={{
                      color: getStatusColor(program.status),
                      fontWeight: '700',
                      fontSize: 12,
                    }}
                  >
                    {getStatusLabel(program.status)}
                  </Chip>
                </View>

                <View style={styles.programMeta}>
                  <View style={styles.metaItem}>
                    <Text style={styles.metaIcon}>📅</Text>
                    <Text variant="bodySmall" style={styles.metaText}>
                      {formatDate(program.date)}
                    </Text>
                  </View>

                  {program.share_code && program.public_access_enabled && (
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>🔗</Text>
                      <Text variant="bodySmall" style={styles.metaText}>
                        {program.share_code}
                      </Text>
                    </View>
                  )}

                  {program.active_participants_count > 0 && (
                    <View style={styles.metaItem}>
                      <Text style={styles.metaIcon}>👥</Text>
                      <Text variant="bodySmall" style={styles.metaText}>
                        {program.active_participants_count}
                      </Text>
                    </View>
                  )}
                </View>
              </Card.Content>

              <View style={styles.cardActions}>
                <IconButton
                  icon="pencil"
                  size={18}
                  iconColor="#6366F1"
                  style={styles.actionButton}
                  onPress={() => router.push(`/(admin)/programs/${program.id}/edit`)}
                />
                <IconButton
                  icon="share-variant"
                  size={18}
                  iconColor="#8B5CF6"
                  style={styles.actionButton}
                  onPress={() => router.push(`/(admin)/programs/${program.id}/share`)}
                />
                <IconButton
                  icon="account-multiple"
                  size={18}
                  iconColor="#10B981"
                  style={styles.actionButton}
                  onPress={() => router.push(`/(admin)/programs/${program.id}/participants`)}
                />
                <View style={{ flex: 1 }} />
                <IconButton
                  icon="delete"
                  size={18}
                  iconColor="#EF4444"
                  style={styles.actionButton}
                  onPress={() => handleDeleteProgram(program)}
                />
              </View>
            </Card>
          ))
        )}
      </ScrollView>

      {/* Create Program FAB */}
      <FAB
        icon="plus"
        label="New Program"
        style={styles.fab}
        color="#FFFFFF"
        onPress={() => router.push('/(admin)/programs/create')}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#F9FAFB',
  },
  headerGradient: {
    backgroundColor: '#6366F1',
    paddingTop: 60,
    paddingBottom: 24,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  header: {
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontWeight: '700',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  headerSubtitle: {
    color: '#E0E7FF',
    fontWeight: '500',
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 20,
    gap: 12,
    marginBottom: 8,
  },
  statCard: {
    flex: 1,
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    borderWidth: 1,
  },
  statCardPrimary: {
    backgroundColor: '#EEF2FF',
    borderColor: '#E0E7FF',
  },
  statCardSuccess: {
    backgroundColor: '#F0FDF4',
    borderColor: '#D1FAE5',
  },
  statCardWarning: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FEF3C7',
  },
  statIconContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    marginBottom: 8,
  },
  statIcon: {
    margin: 0,
  },
  statNumber: {
    fontWeight: '700',
    color: '#6366F1',
    marginBottom: 4,
  },
  statLabel: {
    color: '#6B7280',
    fontSize: 12,
    fontWeight: '500',
  },
  content: {
    flex: 1,
  },
  contentContainer: {
    padding: 16,
    paddingTop: 12,
    paddingBottom: 100,
  },
  emptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 80,
  },
  emptyTitle: {
    fontWeight: '700',
    marginTop: 16,
    marginBottom: 8,
    color: '#374151',
  },
  emptyMessage: {
    color: '#6B7280',
    textAlign: 'center',
  },
  programCard: {
    marginBottom: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#F3F4F6',
    overflow: 'visible',
  },
  cardContent: {
    paddingBottom: 4,
    paddingTop: 12,
    paddingLeft: 16,
    paddingRight: 12,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  programTitle: {
    fontWeight: '700',
    color: '#111827',
    flex: 1,
    flexShrink: 1,
  },
  statusChip: {
    height: 30,
    borderRadius: 6,
    flexShrink: 0,
    marginRight: 4,
  },
  programMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaIcon: {
    fontSize: 14,
  },
  metaText: {
    color: '#6B7280',
    fontSize: 13,
  },
  cardActions: {
    flexDirection: 'row',
    paddingLeft: 4,
    paddingRight: 4,
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  actionButton: {
    margin: 0,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: '#6366F1',
    borderRadius: 16,
    shadowColor: '#6366F1',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
});
