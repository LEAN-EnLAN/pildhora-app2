import React from 'react';
import { View, ScrollView, StyleSheet } from 'react-native';
import { Chip } from '../../ui/Chip';
import { colors, spacing } from '../../../theme/tokens';

interface HistoryFilterBarProps {
  selectedFilter: 'all' | 'taken' | 'missed';
  onFilterChange: (filter: 'all' | 'taken' | 'missed') => void;
  counts?: {
    all: number;
    taken: number;
    missed: number;
  };
}

export const HistoryFilterBar: React.FC<HistoryFilterBarProps> = ({
  selectedFilter,
  onFilterChange,
  counts,
}) => {
  /**
   * Filter configuration with Spanish labels and semantic colors
   * Colors match the status indicators in HistoryRecordCard for consistency
   */
  const filters = [
    {
      id: 'all' as const,
      label: 'Todos',
      color: 'secondary' as const,
    },
    {
      id: 'taken' as const,
      label: 'Tomados',
      color: 'success' as const,
    },
    {
      id: 'missed' as const,
      label: 'Olvidados',
      color: 'error' as const,
    },
  ];

  /**
   * Constructs filter label with optional count
   * @param filter - Filter configuration object
   * @returns Label string with count if available (e.g., "Todos (45)")
   */
  const getFilterLabel = (filter: typeof filters[0]) => {
    if (counts) {
      const count = counts[filter.id];
      return `${filter.label} (${count})`;
    }
    return filter.label;
  };

  return (
    <View style={styles.container}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {filters.map((filter) => (
          <Chip
            key={filter.id}
            label={getFilterLabel(filter)}
            selected={selectedFilter === filter.id}
            onPress={() => onFilterChange(filter.id)}
            variant={selectedFilter === filter.id ? 'filled' : 'outlined'}
            color={filter.color}
            size="md"
            style={styles.chip}
            accessibilityLabel={`Filter by ${filter.label}${counts ? `, ${counts[filter.id]} records` : ''}`}
            accessibilityHint={`Shows ${filter.label.toLowerCase()} medication records`}
          />
        ))}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.background,
    paddingVertical: spacing.md,
  },
  scrollContent: {
    paddingHorizontal: spacing.lg,
    gap: spacing.sm,
  },
  chip: {
    marginRight: spacing.sm,
  },
});
