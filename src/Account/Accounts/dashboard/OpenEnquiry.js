import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ImageBackground
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit } from "../../../redux/action";
import { useNavigation } from "@react-navigation/native";

const OpenEnquiry = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [userGroups, setUserGroups] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [searchText, setSearchText] = useState("");

  const uid = useSelector((state) => state.postauthendicationReducer.uid);
  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );
  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );
  const postcreatevisitError = useSelector(
    (state) => state.postcreatevisitReducer.error["openEnquiryList"]
  );
  const groupListData = useSelector(
    (state) => state.postcreatevisitReducer.data["groupList"]
  );

  const fetchEnquiries = useCallback(() => {
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "search_read",
        args: [],
        kwargs: {
          fields: [
            "id",
            "name",
            "partner_id",
            "state",
            "followup_date",
            "brand",
            "visit_purpose",
            "product_category",
            "required_qty",
            "remarks",
            "so_id",
            "outcome_visit",
            "lost_reason",
            "create_date"
          ]
        }
      }
    };
    dispatch(postcreatevisit(payload, "openEnquiryList"));
  }, [dispatch]);

  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    if (Array.isArray(groupListData) && groupListData.length > 0) {
      const extractedGroupIds = (groupListData[0].groups_id || []).map((g) =>
        Array.isArray(g) ? g[0] : g
      );
      setUserGroups(extractedGroupIds);
    }
  }, [groupListData]);

  const formatDateTime = (dateStr) => {
    if (!dateStr) return "N/A";
    const isoStr = dateStr.replace(" ", "T");
    const dateObj = new Date(isoStr);
    if (isNaN(dateObj.getTime())) return "N/A";
    const day = String(dateObj.getDate()).padStart(2, "0");
    const month = String(dateObj.getMonth() + 1).padStart(2, "0");
    const year = dateObj.getFullYear();
    let hours = dateObj.getHours();
    const minutes = String(dateObj.getMinutes()).padStart(2, "0");
    const ampm = hours >= 12 ? "PM" : "AM";
    hours = hours % 12 || 12;
    const strHours = String(hours).padStart(2, "0");
    return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
  };

  useEffect(() => {
    if (Array.isArray(postcreatevisitData)) {
      const normalizedData = postcreatevisitData.map((item) => ({
        id: item.id,
        reference: item.name || "N/A",
        purpose_of_visit: item.visit_purpose || " ",
        customer_name:
          Array.isArray(item.partner_id) && item.partner_id[1]
            ? item.partner_id[1]
            : " ",
        brand:
          Array.isArray(item.brand) && item.brand[1]
            ? item.brand[1]
            : " ",
        outcome_visit:
          Array.isArray(item.outcome_visit) && item.outcome_visit[1]
            ? item.outcome_visit[1]
            : item.outcome_visit || " ",
        product_category:
          Array.isArray(item.product_category) && item.product_category[1]
            ? item.product_category[1]
            : item.product_category || " ",
        qty: item.required_qty ?? " ",
        remarks: item.remarks || " ",
        so_number:
          Array.isArray(item.so_id) && item.so_id[1]
            ? item.so_id[1]
            : " ",
        state: item.state || "N/A",
        followup_date: item.followup_date
          ? new Date(item.followup_date).toLocaleDateString()
          : "Not Scheduled",
        create_date: formatDateTime(item.create_date)
      }));
      setEnquiries(normalizedData);
    }
  }, [postcreatevisitData]);

  const filteredEnquiries = enquiries.filter((item) => {
    const text = searchText.toLowerCase();
    return (
      item.customer_name.toLowerCase().includes(text) ||
      item.state.toLowerCase().includes(text) ||
      item.followup_date.toLowerCase().includes(text) ||
      item.purpose_of_visit.toLowerCase().includes(text) ||
      item.outcome_visit.toLowerCase().includes(text) ||
      item.brand.toLowerCase().includes(text) ||
      item.product_category.toLowerCase().includes(text) ||
      item.so_number.toLowerCase().includes(text) ||
      item.reference.toLowerCase().includes(text)
    );
  });

  if (postcreatevisitLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3966c2" />
        <Text style={styles.loaderText}>Loading Enquiries...</Text>
      </View>
    );
  }

  if (!enquiries.length) {
    return (
      <View style={styles.center}>
        <Text>No enquiries available</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => {
        if (item.state === "visted") return;
        if (item.so_number && item.so_number !== "N/A") return;
        navigation.navigate("Stage1", { enquiryData: item });
      }}
    >
      <View style={styles.row}>
        <Text style={styles.headerText}>{item.customer_name}</Text>
        <Text style={[styles.headerText, { fontSize: 9 }]}>
          {item.followup_date}
        </Text>
      </View>

      <View style={styles.miniCard}>
        <View style={styles.row}>
          <Text style={styles.title}>{item.reference}</Text>
          <Text style={styles.title}>{item.so_number}</Text>
        </View>

        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Product</Text>
            <Text style={styles.value}>{item.product_category}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Brand</Text>
            <Text style={styles.value}>{item.brand}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Visit</Text>
            <Text style={styles.value}>{item.outcome_visit}</Text>
          </View>
          <View style={styles.infoItem}>
            <Text style={styles.label}>Status</Text>
            <Text style={styles.value}>{item.state}</Text>
          </View>
        </View>

        <View style={styles.belowrow}>
  <Text style={[styles.label, { marginHorizontal: 3, marginTop: 5, marginBottom: 5 }]}>
    Remarks:
  </Text>
  <Text style={{fontSize:12}}>{item.remarks}</Text>
</View>
      </View>
    </TouchableOpacity>
  );

  return (
    <ImageBackground
      source={require("../../../assets/backgroundimg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          value={searchText}
          onChangeText={setSearchText}
        />
        <FlatList
          data={filteredEnquiries}
          keyExtractor={(item) => String(item.id)}
          renderItem={renderItem}
          contentContainerStyle={{ paddingBottom: 20 }}
          ListEmptyComponent={
            <Text style={{ textAlign: "center", marginTop: 20 }}>
              No enquiries found.
            </Text>
          }
        />
      </View>
    </ImageBackground>
  );
};

export default OpenEnquiry;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center"
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "transparent",
    marginTop: 20
  },
  searchInput: {
    backgroundColor: "#fff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 15,
    borderColor: "purple",
    borderWidth: 1
  },
  card: {
    backgroundColor: "#250588",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 12,
    marginTop: 5,
    marginHorizontal: 5
  },
  miniCard: {
    backgroundColor: "#e8e7e7ff",
    borderRadius: 5,
    padding: 5
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#250588"
  },
  label: {
    fontWeight: "bold",
    color: "#878585ff",
    fontSize: 10
  },
  remarkslabel: {
    fontWeight: "bold",
    color: "#878585ff",
    marginLeft:10,
    fontSize: 10
  },
  value: {
    fontWeight: "bold",
    color: "#250588",
    fontSize: 12,
    textAlign: "center"
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#250588"
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center"
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 5,
    alignItems: "center",
  },
    belowrow: {
    flexDirection: "row",
    marginBottom: 5,
    alignItems: "center",
    borderTopWidth:1,
    borderTopColor:"#acaaaaff"
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8
  },
  infoItem: {
    flex: 1,
    alignItems: "center"
  }
});
