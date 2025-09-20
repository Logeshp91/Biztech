import React, { useEffect, useId, useState } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, ActivityIndicator, TextInput ,ImageBackground} from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { postcreatevisit, postauthendication } from '../../../redux/action';
import { useNavigation } from '@react-navigation/native';

const ApprovedList = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();
  const [userGroups, setUserGroups] = useState([]);
  const [searchText, setSearchText] = useState("");

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
             "create_date",
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
    dispatch(postcreatevisit(payload, "approvalPendingList"));
    console.log("helloooceefef", postcreatevisit);

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
            : "",
            create_date: formatDateTime(item.create_date),
        state: Array.isArray(item.state) && item.state.length > 1 ? item.state[1] : item.state || "N/A",
        followup_date: item.followup_date ? new Date(item.followup_date).toLocaleDateString() : "Not Scheduled",
      }));
      const visitedEnquiries = normalizedData.filter(
        (item) => item.state === "verify"
      );

      console.log("Visited Enquiries:", visitedEnquiries);
      setEnquiries(visitedEnquiries);
    }
  }, [postcreatevisitData]);

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

  const renderItem = ({ item }) => (
  <TouchableOpacity
    style={styles.card}
    onPress={() => navigation.navigate('Stage1', { enquiryData: item })}
  >
    {/* Header Row */}
    <View style={styles.headerRow}>
      <Text style={styles.headerText}>{item.customer_name}</Text>
      <Text style={styles.headerText}>{item.followup_date}</Text>
    </View>

    {/* Reference and SO Number */}
    <View style={styles.row}>
      <Text style={styles.title}>{item.reference}</Text>
      <Text style={styles.title}>{item.so_number}</Text>
    </View>

    {/* Info Grid */}
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

    {/* Remarks */}
    <View style={styles.belowrow}>
      <Text style={styles.remarkslabel}>Remarks: </Text>
      <Text style={styles.value}>{item.remarks}</Text>
    </View>
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
        ListEmptyComponent={<Text style={{ textAlign: 'center', marginTop: 20 }}>No enquiries found.</Text>}
      />
    </View>
    </ImageBackground>
  );
};

export default ApprovedList;

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
  headerRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  backgroundColor: "#290895",
  paddingVertical: 6,
  paddingHorizontal: 8,
  borderTopLeftRadius: 6,
  borderTopRightRadius: 6,
},
headerText: {
  color: "#fff",
  fontWeight: "bold",
  fontSize: 12,
},
card: {
  backgroundColor: "#fff", // Better contrast
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
  miniCard: {
    backgroundColor: "#e8e7e7ff",
    borderRadius: 5,
    padding: 5
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#250588",
    marginLeft:5
  },
  label: {
    fontWeight: "bold",
    color: "#878585ff",
    fontSize: 10
  },
  remarkslabel: {
    fontWeight: "bold",
    color: "#878585ff",
    fontSize: 10,
    marginLeft:5
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
    marginVertical: 5
  },
  infoItem: {
    flex: 1,
    alignItems: "center"
  }
});
