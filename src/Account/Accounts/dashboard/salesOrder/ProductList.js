import React, { useEffect, useState } from "react";
import { View, Text, FlatList, ActivityIndicator, StyleSheet, ImageBackground, TextInput } from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit } from "../../../../redux/action";

const ProductList = () => {
  const dispatch = useDispatch();
  const partnersData = useSelector(
    (state) => state.postcreatevisitReducer.data["partners"] || []
  );
  const [partners, setPartners] = useState([]);
  const [filteredPartners, setFilteredPartners] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState("");

  const fetchAllAtOnce = () => {
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "item.master",
        method: "search_read",
        args: [],
        kwargs: {
          fields: ["id", "sku", "item_name", "item_type", "item_size", "width", "length", "grade"],
          limit: 0,
        },
      },
    };
    dispatch(postcreatevisit(payload, "partners"));
  };

  useEffect(() => {
    fetchAllAtOnce();
  }, []);

  useEffect(() => {
    if (partnersData.length > 0) {
      setPartners(partnersData);
      setFilteredPartners(partnersData);
      setLoading(false);
    }
  }, [partnersData]);

  const handleSearch = (text) => {
    setSearchText(text);
    const lowerText = text.toLowerCase();

    const filtered = partners.filter((item) => {
      // Convert all searchable fields to string safely
      const itemName = item.item_name ? item.item_name.toString().toLowerCase() : "";
      const itemType = item.item_type ? item.item_type.toString().toLowerCase() : "";
      const itemSize = item.item_size ? item.item_size.toString().toLowerCase() : "";
      const width = item.width !== undefined && item.width !== null ? item.width.toString() : "";
      const length = item.length !== undefined && item.length !== null ? item.length.toString() : "";
      const grade = item.grade ? item.grade.toString().toLowerCase() : "";
      return (
        itemName.includes(lowerText) ||
        itemType.includes(lowerText) ||
        itemSize.includes(lowerText) ||
        width.includes(lowerText) ||
        length.includes(lowerText) ||
        grade.includes(lowerText)
      );
    });
    setFilteredPartners(filtered);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#3966c2" />
        <Text>Loading all products...</Text>
      </View>
    );
  }

  return (
    <ImageBackground
      source={require("../../../../assets/backgroundimg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.searchContainer}>
        <TextInput
          placeholder="Search"
          value={searchText}
          onChangeText={handleSearch}
          style={styles.searchInput}
        />
      </View>

      <FlatList
        data={filteredPartners}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <View style={styles.card}>
            <View style={styles.headerRow}>
              <Text style={styles.headerRowText}>{item.sku || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Item Name </Text>
              <Text style={styles.label}>Item Size </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>{Array.isArray(item.item_name) ? item.item_name[1] : item.item_name || "-"}</Text>
              <Text style={styles.value}>{Array.isArray(item.item_size) ? item.item_size[1] : item.item_size || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Item Type </Text>
              <Text style={styles.label}>Item Width </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>{Array.isArray(item.item_type) ? item.item_type[1] : item.item_type || "-"}</Text>
              <Text style={styles.value}>{Array.isArray(item.width) ? item.width[1] : item.width || "-"}</Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.label}>Grade </Text>
              <Text style={styles.label}>Item Length </Text>
            </View>
            <View style={styles.row}>
              <Text style={styles.value}>{Array.isArray(item.grade) ? item.grade[1] : item.grade || "-"}</Text>
              <Text style={styles.value}>{Array.isArray(item.length) ? item.length[1] : item.length || "-"}</Text>

            </View>
          </View>
        )}
      />

    </ImageBackground>
  );
};

export default ProductList;

const styles = StyleSheet.create({
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  background: {
    flex: 1,
    padding: 10,
  },
  searchContainer: {
    marginVertical: 50,
    marginHorizontal: 5,
  },
  searchInput: {
    height: 40,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 10,
    backgroundColor: "#fff",
  },
  item: {
    padding: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 5,
  },
  headerRow: {
    justifyContent: "center",
    textAlign: "center",
    backgroundColor: "#6072C7",
    paddingVertical: 6,
    paddingHorizontal: 8,
    borderTopLeftRadius: 6,
    borderTopRightRadius: 6,
  },
  headerRowText: {
    color: "#ffffff",
    fontWeight: "bold",
    textAlign: "center",
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#f3f3f3ff",
    marginLeft: 5
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginLeft:10,
    marginRight:10
  },
  label: {
    fontWeight: "bold",
    color: "#878585ff",
    fontSize: 10
  },
  value: {
    fontWeight: "bold",
    color: "#250588",
    fontSize: 12,
    marginBottom:8
  },

});
