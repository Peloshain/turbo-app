import { useState, useMemo, useCallback } from "react";
import { View, FlatList, StyleSheet, RefreshControl, Text } from "react-native";
import { useWardrobeItems } from "../../hooks/useWardrobe";
import { useCategories } from "../../hooks/useCategories";
import { CategoryFilter } from "../../components/wardrobe/CategoryFilter";
import { SearchBar } from "../../components/wardrobe/SearchBar";
import { ItemCard } from "../../components/wardrobe/ItemCard";
import { EmptyState } from "../../components/wardrobe/EmptyState";
import { ErrorCard } from "../../components/ui/ErrorCard";
import { SkeletonCard } from "../../components/ui/SkeletonCard";
import { useFocusEffect } from "expo-router/build/exports";

export default function WardrobeScreen() {
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [search, setSearch] = useState("");

  const { data: categories = [] } = useCategories();
  const {
    data: items = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useWardrobeItems(selectedCategory ?? undefined);

  useFocusEffect(
    useCallback(() => {
      refetch();
    }, [refetch]),
  );

  // Client-side search filter — avoids extra API calls while typing
  const filtered = useMemo(() => {
    if (!search.trim()) return items;
    const q = search.toLowerCase();
    return items.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.colorDesc.toLowerCase().includes(q),
    );
  }, [items, search]);

  const isFiltered = !!selectedCategory || !!search.trim();

  return (
    <View style={styles.container}>
      {/* Search bar — always visible at the top */}
      <SearchBar
        value={search}
        onChange={setSearch}
        onClear={() => setSearch("")}
      />

      {/* Horizontal category pills */}
      <CategoryFilter
        categories={categories}
        selected={selectedCategory}
        onSelect={(slug) => {
          setSelectedCategory(slug);
          setSearch(""); // Clear search when switching category
        }}
      />

      {/* Item count label */}
      {!isLoading && filtered.length > 0 && (
        <Text style={styles.countLabel}>
          {filtered.length} {filtered.length === 1 ? "item" : "items"}
        </Text>
      )}

      {/* Grid */}
      {isError ? (
        <ErrorCard
          message="Could not load your wardrobe. Check your connection."
          onRetry={refetch}
        />
      ) : isLoading ? (
        <View style={styles.skeletonGrid}>
          {Array.from({ length: 6 }).map((_, i) => (
            <SkeletonCard key={i} />
          ))}
        </View>
      ) : (
        <FlatList
          data={filtered}
          keyExtractor={(item) => item.id}
          numColumns={2}
          contentContainerStyle={styles.grid}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#1C1C1E"
            />
          }
          ListEmptyComponent={
            !isLoading ? <EmptyState isFiltered={isFiltered} /> : null
          }
          renderItem={({ item }) => <ItemCard item={item} />}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FAFAF9",
  },
  countLabel: {
    fontSize: 12,
    color: "#8E8E93",
    paddingHorizontal: 16,
    paddingBottom: 8,
  },
  grid: {
    paddingHorizontal: 16,
    paddingBottom: 20,
    flexGrow: 1,
  },
  row: {
    gap: 10,
    marginBottom: 10,
  },
  skeletonGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
    paddingHorizontal: 16,
    paddingTop: 8,
  },
});
