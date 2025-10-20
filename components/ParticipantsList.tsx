import React from 'react';
import { View, StyleSheet, FlatList } from 'react-native';
import { List, Avatar, Badge, Text, Chip } from 'react-native-paper';
import { ProgramParticipant } from '../types';
import { formatDistanceToNow } from 'date-fns';

interface ParticipantsListProps {
  participants: ProgramParticipant[];
  showActiveStatus?: boolean;
  emptyMessage?: string;
}

export default function ParticipantsList({
  participants,
  showActiveStatus = true,
  emptyMessage = 'No participants yet',
}: ParticipantsListProps) {
  const isActive = (participant: ProgramParticipant): boolean => {
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const lastActive = new Date(participant.last_active);
    return lastActive > fiveMinutesAgo;
  };

  const getInitials = (name: string): string => {
    const parts = name.trim().split(' ');
    if (parts.length === 1) {
      return parts[0].substring(0, 2).toUpperCase();
    }
    return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
  };

  const getLastActiveText = (participant: ProgramParticipant): string => {
    try {
      return formatDistanceToNow(new Date(participant.last_active), {
        addSuffix: true,
      });
    } catch {
      return 'recently';
    }
  };

  const renderParticipant = ({ item }: { item: ProgramParticipant }) => {
    const active = isActive(item);

    return (
      <List.Item
        title={item.full_name}
        description={
          <View style={styles.descriptionContainer}>
            <Text variant="bodySmall" style={styles.role}>
              {item.role}
            </Text>
            {showActiveStatus && (
              <>
                <Text variant="bodySmall" style={styles.separator}>
                  •
                </Text>
                <Text
                  variant="bodySmall"
                  style={[
                    styles.status,
                    active ? styles.statusActive : styles.statusInactive,
                  ]}
                >
                  {active ? 'Active' : `Last seen ${getLastActiveText(item)}`}
                </Text>
              </>
            )}
          </View>
        }
        left={(props) => (
          <View style={styles.avatarContainer}>
            <Avatar.Text
              {...props}
              size={40}
              label={getInitials(item.full_name)}
              style={[
                styles.avatar,
                active && styles.avatarActive,
              ]}
            />
            {active && showActiveStatus && (
              <Badge style={styles.activeBadge} size={12} />
            )}
          </View>
        )}
        right={() => (
          <View style={styles.rightContainer}>
            {item.is_guest && (
              <Chip
                mode="outlined"
                compact
                style={styles.guestChip}
                textStyle={styles.guestChipText}
              >
                Guest
              </Chip>
            )}
          </View>
        )}
        style={styles.listItem}
      />
    );
  };

  if (participants.length === 0) {
    return (
      <View style={styles.emptyContainer}>
        <Text variant="bodyLarge" style={styles.emptyText}>
          {emptyMessage}
        </Text>
      </View>
    );
  }

  return (
    <FlatList
      data={participants}
      renderItem={renderParticipant}
      keyExtractor={(item) => item.id}
      contentContainerStyle={styles.listContent}
    />
  );
}

const styles = StyleSheet.create({
  listContent: {
    paddingBottom: 16,
  },
  listItem: {
    paddingVertical: 8,
  },
  descriptionContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  role: {
    opacity: 0.7,
  },
  separator: {
    marginHorizontal: 6,
    opacity: 0.5,
  },
  status: {
    fontSize: 12,
  },
  statusActive: {
    color: '#4caf50',
  },
  statusInactive: {
    opacity: 0.6,
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 8,
  },
  avatar: {
    backgroundColor: '#9c27b0',
  },
  avatarActive: {
    backgroundColor: '#4caf50',
  },
  activeBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    backgroundColor: '#4caf50',
  },
  rightContainer: {
    justifyContent: 'center',
  },
  guestChip: {
    height: 24,
    borderColor: '#9c27b0',
  },
  guestChipText: {
    fontSize: 11,
    color: '#9c27b0',
  },
  emptyContainer: {
    padding: 40,
    alignItems: 'center',
  },
  emptyText: {
    opacity: 0.5,
    textAlign: 'center',
  },
});
