import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { postcreatevisit } from '../../../redux/action';
import { useNavigation } from '@react-navigation/native';

const LostList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [userGroups, setUserGroups] = useState([]);
  const uid = useSelector(state => state.postauthendicationReducer.uid);
  console.log("UID from postauthendicationReducer:", uid);
  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );
  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );
  console.log("postcreactwwfwgfwhchwapproval", postcreatevisitData)

  const [enquiries, setEnquiries] = useState([]);

  useEffect(() => {
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
            "brand",
            "visit_purpose",
            "product_category",
            "required_qty",
            "remarks",
            "so_id",
            "outcome_visit",
            "lost_reason",
            "followup_date"
          ],
        },
      },
    };
    dispatch(postcreatevisit(payload, "lostlist"));

  }, [dispatch]);

  useEffect(() => {
    if (!uid) return;

    const payload = {
      "jsonrpc": "2.0",
      "method": "call",
      "params": {
        "model": "res.users",
        "method": "read",
        "args": [
          [uid],
          ["id", "name", "groups_id"]
        ],
        "kwargs": {}
      }
    }
    dispatch(postcreatevisit(payload, "groupList"));
    console.log("Fetching group list for UID:", uid);
  }, [dispatch, uid]);

  const groupListData = useSelector((state) => state.postcreatevisitReducer.data["groupList"]);
  useEffect(() => {
    if (Array.isArray(groupListData) && groupListData.length > 0) {
      setUserGroups(groupListData[0].groups_id || []);
    }
  }, [groupListData])

  useEffect(() => {
    if (postcreatevisitData) {
      const normalizedData = postcreatevisitData.map((item) => ({
        id: item.id,
        reference: item.name || "N/A",
        create_date: formatDateTime(item.create_date),

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
        state: Array.isArray(item.state) && item.state.length > 1 ? item.state[1] : item.state || "N/A",
        followup_date: item.followup_date ? new Date(item.followup_date).toLocaleDateString() : "Not Scheduled",
      }));
      const visitedEnquiries = normalizedData.filter(
        (item) => item.state === "lost"
      );

      console.log("Visited Enquiries:", visitedEnquiries);
      setEnquiries(visitedEnquiries);
    }
  }, [postcreatevisitData]);

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

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={styles.card}
      onPress={() => { enquiryData: item }}
    >
      <Text style={styles.title}>{item.reference}</Text>
      <Text>
        <Text style={styles.label}>Created On:</Text> {item.create_date}
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
        <Text style={styles.label}>brand:</Text> {item.brand}
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
        <Text style={styles.label}>FollowupDate:</Text> {item.followup_date}
      </Text>
      <Text>
        <Text style={styles.label}>status:</Text> {item.state}
      </Text>
    </TouchableOpacity>
  );


  if (postcreatevisitLoading) {
    return (
      <View style={styles.loader}>
        <ActivityIndicator size="large" color="#3966c2" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={enquiries}
        keyExtractor={(item) => String(item.id)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No enquiries found.</Text>}
      />
    </View>
  );
};

export default LostList;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: '#f2f2f2',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 15,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  title: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#3966c2',
  },
  label: {
    fontWeight: 'bold',
    color: '#333',
  },
  loader: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  verifyBtn: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "#28a745",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8
  },
  verifyText: {
    color: "#fff",
    fontWeight: "bold"
  }
});
