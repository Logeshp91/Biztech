import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit, postAccessRead } from "../../../redux/action";
import { useNavigation, useFocusEffect } from "@react-navigation/native";

const ApprovalPending = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [userGroups, setUserGroups] = useState([]);
  const [verifyingId, setVerifyingId] = useState(null);
  const [enquiries, setEnquiries] = useState([]);
  const [searchText, setSearchText] = useState("");

  const uid = useSelector(
    (state) => state.postauthendicationReducer.uid
  );

  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );

  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );

  const groupListData = useSelector(
    (state) => state.postcreatevisitReducer.data["groupList"]
  );

  const fetchOpenEnquiries = useCallback(() => {
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
            "create_date",
            "partner_id",
            "state",
            "brand",
            "visit_purpose",
            "product_category",
            "required_qty",
            "remarks",
            "so_id",
            "outcome_visit",
            "lost_reason",
            "followup_date",
          ],
        },
      },
    };
    dispatch(postcreatevisit(payload, "openEnquiryList"));
  }, [dispatch]);

  const fetchUserGroups = useCallback(() => {
    if (!uid) return;
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "res.users",
        method: "read",
        args: [[uid], ["id", "name", "groups_id"]],
        kwargs: {},
      },
    };
    dispatch(postcreatevisit(payload, "groupList"));
  }, [dispatch, uid]);

  useFocusEffect(
    useCallback(() => {
      fetchOpenEnquiries();
      fetchUserGroups();
    }, [fetchOpenEnquiries, fetchUserGroups])
  );

  /** ✅ Update local state from Redux data */
  useEffect(() => {
    if (postcreatevisitData) {
      const normalizedData = postcreatevisitData.map((item) => ({
        id: item.id,
        reference: item.name || "N/A",
        purpose_of_visit: item.visit_purpose || "N/A",
        customer_name:
          Array.isArray(item.partner_id) && item.partner_id.length > 1
            ? item.partner_id[1]
            : "N/A",
        brand:
          Array.isArray(item.brand) && item.brand.length > 1
            ? item.brand[1]
            : "N/A",
        outcome_visit:
          Array.isArray(item.outcome_visit) && item.outcome_visit.length > 1
            ? item.outcome_visit[1]
            : item.outcome_visit || "N/A",
        product_category:
          Array.isArray(item.product_category) && item.product_category.length > 1
            ? item.product_category[1]
            : item.product_category || "N/A",
        qty: item.required_qty ?? "N/A",
        remarks: item.remarks || "N/A",
        so_number:
          Array.isArray(item.so_id) && item.so_id.length > 1
            ? item.so_id[1]
            : "N/A",
        state: Array.isArray(item.state) && item.state.length > 1
          ? item.state[1]
          : item.state || "N/A",
        followup_date: item.followup_date
          ? new Date(item.followup_date).toLocaleDateString()
          : "Not Scheduled",
          create_date: formatDateTime(item.create_date)

      }));

      const visitedEnquiries = normalizedData.filter(
        (item) => item.state === "visted"
      );

      setEnquiries(visitedEnquiries);
    }
  }, [postcreatevisitData]);

  /** ✅ Set user groups from Redux */
  useEffect(() => {
    if (Array.isArray(groupListData) && groupListData.length > 0) {
      setUserGroups(groupListData[0].groups_id || []);
    }
  }, [groupListData]);
  const formatDateTime = (dateStr) => {
  if (!dateStr) return "N/A";

  // Convert "YYYY-MM-DD HH:mm:ss" → "YYYY-MM-DDTHH:mm:ss" (ISO format)
  const isoStr = dateStr.replace(" ", "T");
  const dateObj = new Date(isoStr);

  if (isNaN(dateObj.getTime())) return "N/A"; // check if date is valid

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  let hours = dateObj.getHours();
  const minutes = String(dateObj.getMinutes()).padStart(2, "0");
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12; // convert 0 to 12
  const strHours = String(hours).padStart(2, "0");

  return `${day}/${month}/${year} ${strHours}:${minutes} ${ampm}`;
};

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

  /** ✅ Handle verify click */
const onHandlingVerify = async (id) => {
  // ✅ Immediately update UI
  setEnquiries((prev) =>
    prev.map((item) =>
      item.id === id ? { ...item, state: "verified" } : item
    )
  );

  // Then do the API call (optional)
  setVerifyingId(id);
  const payload = {
    jsonrpc: "2.0",
    method: "call",
    params: { visit_id: id },
  };

  try {
    const response = await dispatch(postAccessRead(payload, "verifyVisit"));
    const result = response?.data?.result;

    if (result && result.success) {
      console.log("Verified on server:", result.message);
    } else {
      console.warn("Verification failed:", result?.message || "No message");
    }
  } catch (error) {
    console.error("Verify API failed:", error);
  } finally {
    setVerifyingId(null);
  }
};

  /** ✅ Render each card */
  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { enquiryData: item }}
    >
      <Text style={styles.title}>{item.reference}</Text>
                  <Text>
              <Text style={styles.label}>Created on:</Text> {item.create_date}
            </Text>
      <Text> 
        <Text style={styles.label}>Purpose:</Text> {item.purpose_of_visit}
      </Text>
      <Text>
        <Text style={styles.label}>Customer:</Text> {item.customer_name}
      </Text>
      <Text>
        <Text style={styles.label}>Product Category:</Text> {item.product_category}
      </Text>
      <Text>
        <Text style={styles.label}>Brand:</Text> {item.brand}
      </Text>
      <Text>
        <Text style={styles.label}>Quantity:</Text> {item.qty}
      </Text>
      <Text>
        <Text style={styles.label}>Remarks:</Text> {item.remarks}
      </Text>
      <Text>
        <Text style={styles.label}>Visit Outcomes:</Text> {item.outcome_visit}
      </Text>
      <Text>
        <Text style={styles.label}>SO Number:</Text> {item.so_number}
      </Text>
      <Text>
        <Text style={styles.label}>Followup Date:</Text> {item.followup_date}
      </Text>
      <Text>
        <Text style={styles.label}>Status:</Text> {item.state}
      </Text>

      {userGroups.includes(65) && (
  <TouchableOpacity
    style={[
      styles.verifyBtn,
      item.state === "verified" && { backgroundColor: "#6c757d" },
    ]}
    onPress={() => onHandlingVerify(item.id)}
    disabled={verifyingId === item.id || item.state === "verified"}
  >
    <Text style={styles.verifyText}>
      {verifyingId === item.id
        ? "Verifying..."
        : item.state === "verified"
          ? "Verified"
          : "Verify"}
    </Text>
  </TouchableOpacity>
)}
    </TouchableOpacity>
  );

  /** ✅ Loader while fetching */
  if (postcreatevisitLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3966c2" />
      </View>
    );
  }

  return (
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
      {verifyingId && (
        <View style={styles.centerLoader}>
          <ActivityIndicator size="large" color="#3966c2" />
        </View>
      )}
    </View>
  );
};

export default ApprovalPending;

const styles = StyleSheet.create({
  container: { flex: 1, padding: 15, backgroundColor: "#f2f2f2" },
  card: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  searchInput: { backgroundColor: "#fff", padding: 10, borderRadius: 8, marginBottom: 15 },

  title: { fontSize: 16, fontWeight: "bold", marginBottom: 8, color: "#3966c2" },
  label: { fontWeight: "bold", color: "#333" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  verifyBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#28a745",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
  },
  verifyText: { color: "#fff", fontWeight: "bold" },
});
