import { View, FlatList, StyleSheet, RefreshControl, Text } from "react-native";
import { useSavedOutfits } from "../../hooks/useSavedOutfits";
import { OutfitCard } from "../../components/saved/OutfitCard";
import { EmptyOutfits } from "../../components/saved/EmptyOutfits";
import { ErrorCard } from "../../components/ui/ErrorCard";
import { SkeletonOutfitCard } from "../../components/ui/SkeletonOutfitCard";

export default function SavedScreen() {
  const {
    data: outfits = [],
    isLoading,
    isError,
    refetch,
    isRefetching,
  } = useSavedOutfits();

  return (
    <View style={styles.container}>
      {isError ? (
        <ErrorCard message="Could not load your outfits." onRetry={refetch} />
      ) : isLoading ? (
        <View style={styles.list}>
          {Array.from({ length: 2 }).map((_, i) => (
            <View key={i} style={{ marginBottom: 14 }}>
              <SkeletonOutfitCard />
            </View>
          ))}
        </View>
      ) : (
        <FlatList
          data={outfits}
          keyExtractor={(outfit) => outfit.id}
          contentContainerStyle={styles.list}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={isRefetching}
              onRefresh={refetch}
              tintColor="#1C1C1E"
            />
          }
          // Outfit count header
          ListHeaderComponent={
            outfits.length > 0 ? (
              <Text style={styles.countLabel}>
                {outfits.length} {outfits.length === 1 ? "outfit" : "outfits"}{" "}
                saved
              </Text>
            ) : null
          }
          ListEmptyComponent={!isLoading ? <EmptyOutfits /> : null}
          renderItem={({ item }) => <OutfitCard outfit={item} />}
          ItemSeparatorComponent={() => <View style={styles.separator} />}
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
  list: {
    padding: 16,
    flexGrow: 1,
  },
  countLabel: {
    fontSize: 12,
    color: "#8E8E93",
    fontWeight: "500",
    marginBottom: 14,
  },
  separator: {
    height: 14,
  },
});
