import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
  ImageBackground,
  Pressable,
  BackHandler
} from "react-native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit } from "../../../redux/action";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { Modal } from "react-native";
import Icon from "react-native-vector-icons/MaterialIcons";

const OpenEnquiry = () => {
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [userGroups, setUserGroups] = useState([]);
  const [enquiries, setEnquiries] = useState([]);
  const [searchText, setSearchText] = useState("");
  const [activeTab, setActiveTab] = useState("VisitList");
  const [modalVisible, setModalVisible] = useState(false);
  const [clickedSoId, setClickedSoId] = useState(null);
  const [soProducts, setSoProducts] = useState({});
  const [loadingProducts, setLoadingProducts] = useState({});



  useFocusEffect(
    React.useCallback(() => {
      const onBackPress = () => {
        navigation.navigate('TabNavigation');
        return true;
      };

      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress
      );

      return () => subscription.remove();
    }, [navigation])
  );

  const uid = useSelector((state) => state.postauthendicationReducer.uid);
  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );
  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"]
  );
  const groupListData = useSelector(
    (state) => state.postcreatevisitReducer.data["groupList"]
  );
  const productsData = useSelector(
    (state) => state.postcreatevisitReducer.data["soProducts"]
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
            "create_date",
            "billing_branch_id",
            "billing_type",
            "incoterm_id",
            "payment_term_id",
          ],
        },
      },
    };
    dispatch(postcreatevisit(payload, "openEnquiryList"));
  }, [dispatch]);



  useEffect(() => {
    fetchEnquiries();
  }, [fetchEnquiries]);

  useEffect(() => {
    if (!productsData) return;

    const groupedProducts = {};

    const dataArray = Array.isArray(productsData) ? productsData : Object.values(productsData);

    dataArray.forEach((prod) => {
      const soId = Array.isArray(prod.order_id) ? String(prod.order_id[0]) : String(prod.order_id);
      if (!groupedProducts[soId]) groupedProducts[soId] = [];
      groupedProducts[soId].push(prod);
    });

    setSoProducts(groupedProducts);
    setLoadingProducts({}); // stop loading for all SOs

  }, [productsData]);

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
      const normalizedData = postcreatevisitData.map((item) => {
        // Get SO ID as string for lookup
        const soId = Array.isArray(item.so_id) ? String(item.so_id[0]) : String(item.so_id);

        // Get products for this SO from soProducts state
        const products = soProducts[soId] || [];

        return {
          id: item.id,
          reference: item.name || "N/A",
          purpose_of_visit: item.visit_purpose || " ",
          customer_name:
            Array.isArray(item.partner_id) && item.partner_id[1]
              ? item.partner_id[1]
              : " ",
          brand:
            Array.isArray(item.brand) && item.brand[1] ? item.brand[1] : " ",
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
            Array.isArray(item.so_id) && item.so_id[1] ? item.so_id[1] : " ",
          state: item.state || "N/A",
          billing_branch: Array.isArray(item.billing_branch_id) && item.billing_branch_id[1]
            ? item.billing_branch_id[1]
            : "-",
          billing_type: item.billing_type || "-",
          incoterm: Array.isArray(item.incoterm_id) && item.incoterm_id[1]
            ? item.incoterm_id[1]
            : "-",
          payment_term: Array.isArray(item.payment_term_id) && item.payment_term_id[1]
            ? item.payment_term_id[1]
            : "-",
          followup_date: item.followup_date
            ? new Date(item.followup_date).toLocaleDateString()
            : "Not Scheduled",
          create_date: formatDateTime(item.create_date),

          // **Add products here**
          products: products.map(prod => ({
            id: prod.id,
            name: prod.name,
            qty: prod.product_uom_qty,
            price: prod.price_unit,
            subtotal: prod.price_subtotal
          }))
        };
      });

      setEnquiries(normalizedData);
    }
  }, [postcreatevisitData, soProducts]);

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
  const getTotalCount = () => {
    if (activeTab === "VisitList") {
      return filteredEnquiries.length;
    } else if (activeTab === "CustomerList") {
      return 0;
    } else if (activeTab === "TodayFollowupList") {
      return 0;
    }
    return 0;
  };

  const renderItem = ({ item }) => {
    const status = (item.state || "").toString().trim().toLowerCase();
    const soIdNum = Array.isArray(item.so_id) ? item.so_id[0] : item.so_id;

    const handleSoPress = (itemId, soNumber) => {
      if (clickedSoId === itemId) {
        setClickedSoId(null);
      } else {
        setClickedSoId(itemId);
        setLoadingProducts(prev => ({ ...prev, [itemId]: true }));
        const payload = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "sale.order.line",
            method: "search_read",
            args: [],
            kwargs: {
              domain: [["order_id", "=", soNumber]],
              fields: [
                "id",
                "name",
                "product_template_id",
                "product_uom_qty",
                "qty_delivered",
                "qty_invoiced",
                "price_unit",
                "tax_id",
                "price_subtotal",
                "order_id",
              ],
            },
          },
        };
        dispatch(postcreatevisit(payload, "soProducts"));
      }
    };

    const handlePress = () => {
      if (status === "visited" || status === "visted") return;
      navigation.navigate("Stage1", { enquiryData: item });
    };

const handleProductPress = (item) => {
  navigation.navigate("BillSummary", {
    products: item.products,
    form: {
      name: item.so_number,
      company_id: item.billing_branch, 
      amount_untaxed: item.amount_untaxed,
      amount_tax: item.amount_tax,
      amount_total: item.amount_total,
      mobile: item.mobile,
      partner_invoice_id: item.billing_branch,
      partner_shipping_id: item.billing_branch,
    },
    taxDetails: [], 
  });
};
    return (
      <View>
        <View style={styles.card}>
          <View style={styles.row}>
            <Text style={styles.headerText}>{item.customer_name}</Text>
            <Text style={[styles.headerText, { fontSize: 9 }]}>{item.followup_date}</Text>
          </View>
          <Text style={styles.OutstangingText}>Os:</Text>
          <View>
          </View>
          <View style={styles.miniCard}>
            <View style={styles.row}>
              <Text style={styles.title}>{item.reference}</Text>
              <TouchableOpacity onPress={() => handleSoPress(item.id, item.so_number)}>
                <Text style={[styles.title, { textDecorationLine: "underline", color: "#250588" }]}>
                  {item.so_number}
                </Text>
              </TouchableOpacity>
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
            <View style={[styles.belowrow, { justifyContent: 'space-between', alignItems: 'center', paddingRight: 5 }]}>
              <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', alignItems: 'center' }}>
                <Text style={[styles.label, { marginRight: 5 }]}>Remarks:</Text>
                <Text style={{ fontSize: 12, flexShrink: 1 }}>{item.remarks}</Text>
              </View>
              <TouchableOpacity onPress={handlePress}>
                <Icon name="chevron-right" size={20} color="#250588" />
              </TouchableOpacity>
            </View>
          </View>
        </View>
        {clickedSoId === item.id &&
          item.so_number &&
          item.so_number.trim() !== "-" &&
          item.so_number.trim() !== "" && (
            <View style={styles.extraContainer}>
              <View style={styles.extraRowBelow}>
                <View style={styles.extraItem}>
                  <Text style={styles.extraLabel}>Billing Type</Text>
                  <Text style={styles.extraValue}>{item.billing_type || "-"}</Text>
                </View>
                <View style={styles.extraItem}>
                  <Text style={styles.extraLabel}>Billing Branch</Text>
                  <Text style={styles.extraValue}>{item.billing_branch || "-"}</Text>
                </View>
                <View style={styles.extraItem}>
                  <Text style={styles.extraLabel}>Incoterm</Text>
                  <Text style={styles.extraValue}>{item.incoterm || "-"}</Text>
                </View>
              </View>

              <View style={styles.extraRowBelow}>
                <View style={styles.extraItem}>
                  <Text style={styles.extraLabel}>Payment Terms</Text>
                  <Text style={styles.extraValue}>{item.payment_term || "-"}</Text>
                </View>
                <View style={styles.extraItem}>
                  <Text style={styles.extraLabel}>Expiration Date</Text>
                  <Text style={styles.extraValue}>{item.validity_date || "-"}</Text>
                </View>
                <View style={styles.extraItem}>
                  <Text style={styles.extraLabel}>Order Date</Text>
                  <Text style={styles.extraValue}>{item.date_order || "-"}</Text>
                </View>
              </View>

              {/* Product list with loader */}
              {loadingProducts[item.id] ? (
                <ActivityIndicator
                  size="small"
                  color="#24bc99"
                  style={{ marginVertical: 10 }}
                />
              ) : (
                item.products &&
                item.products.length > 0 && (
                  <View style={styles.summaryCard}>
                    <View style={styles.summaryHeader}>
                      <Icon
                        name="book"
                        size={20}
                        color="#24bc99"
                        style={{ marginRight: 8 }}
                      />
                      <Text style={styles.summaryHeaderText}>Product List</Text>
                      <TouchableOpacity onPress={() => handleProductPress(item)}>
                <Icon name="chevron-right" size={20} color="#250588" />
              </TouchableOpacity>
                    </View>

                    {item.products.map((prod) => (
                      <View key={prod.id} style={styles.infoRow}>
                        <Text style={styles.productName}>{prod.name}</Text>
                        <Text style={styles.productvalue}>{prod.qty}</Text>
                      </View>
                    ))}
                  </View>
                )
              )}
            </View>
          )}
      </View>
    )
  };

  const renderTabContent = () => {
    if (activeTab === "VisitList") {
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

      return (
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
      );
    } else if (activeTab === "CustomerList") {
      return (
        <View style={styles.center}>
          <Text>Customer List will be displayed here</Text>
        </View>
      );
    } else if (activeTab === "TodayFollowupList") {
      return (
        <View style={styles.center}>
          <Text>Today's Followup List will be displayed here</Text>
        </View>
      );
    }
  };

  return (
    <ImageBackground
      source={require("../../../assets/backgroundimg.png")}
      style={styles.background}
      resizeMode="cover"
    >
      <View style={styles.container}>
        <View style={styles.tabsContainer}>
          {["CustomerList", "VisitList", "TodayFollowupList"].map((tab) => (
            <TouchableOpacity
              key={tab}
              style={[
                styles.tab,
                activeTab === tab && styles.activeTab,
              ]}
              onPress={() => setActiveTab(tab)}
            >
              <Text
                style={[
                  styles.tabText,
                  activeTab === tab && styles.activeTabText,
                ]}
              >
                {tab === "CustomerList"
                  ? "Customer List"
                  : tab === "VisitList"
                    ? "Visit List"
                    : "Today Followup"}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={styles.searchRow}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search"
            value={searchText}
            onChangeText={setSearchText}
          />
          <TouchableOpacity
            style={styles.plusButton}
            onPress={() => setModalVisible(true)}
          >
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <Text style={styles.totalCountTextlabel}>
          Total List: <Text style={styles.totalCountTextValue}>{getTotalCount()}</Text>
        </Text>
        <Modal
          animationType="slide"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalContainer}>
            <View style={styles.modalContent}>
              <Pressable
                style={styles.modalcard}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('CreateVisit');
                }} >
                <Text style={styles.cardText}>Create Visit</Text>
              </Pressable>
              <Pressable
                style={styles.modalcard}
                onPress={() => {
                  setModalVisible(false);
                  navigation.navigate('CreateCustomer');
                }} >
                <Text style={styles.cardText}>Create Customer</Text>
              </Pressable>
              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}>
                <Text style={{ color: "#fff" }}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
        <View style={{ flex: 1 }}>{renderTabContent()}</View>
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
    justifyContent: "center",
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "transparent",
    marginTop: 20,
  },
  tabsContainer: {
    flexDirection: "row",
    marginBottom: 10,
  },
  tab: {
    flex: 1,
    paddingVertical: 8,
    backgroundColor: "#D9D9D9",
    marginHorizontal: 2,
    borderRadius: 5,
    marginTop: 50,
  },
  activeTab: {
    backgroundColor: "transparent",
  },
  tabText: {
    textAlign: "center",
    fontWeight: "bold",
    color: "#250588",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  activeTabText: {
    color: "#D9D9D9",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  searchRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 15,
    marginTop: 20,
    justifyContent: "space-between",
  },
  searchInput: {
    flex: 1,
    backgroundColor: "#D9D9D9",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 50,
    fontSize: 14,
  },
  plusButton: {
    backgroundColor: "#6072C7",
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: "center",
    alignItems: "center",
    marginLeft: 10,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "70%",
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  cardText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#6072C7',
    textAlign: 'center',
  },
  closeButton: {
    backgroundColor: "#6072C7",
    padding: 10,
    borderRadius: 8,
    width: '40%',
    marginTop: 10,
    alignItems: "center",
  },
  card: {
    backgroundColor: "#6072C7",
    marginBottom: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  modalcard: {
    marginBottom: 10,
    height: 50,
    shadowColor: "#000",
    borderWidth: 1,
    borderColor: "#6072C7",
    justifyContent: "center",
    alignItems: "center",
    width: "60%",
  },
  totalCountTextlabel: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#f0f0f0ff",
    marginBottom: 10,
    marginLeft: 5,
  },
  totalCountTextValue: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#ebebebff",
    marginLeft: 5,
  },
  headerText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 15,
    marginTop: 5,
    marginHorizontal: 5,
  },
  miniCard: {
    backgroundColor: "#e8e7e7ff",
    borderRadius: 5,
    padding: 5,
  },
  title: {
    fontSize: 13,
    fontWeight: "bold",
    marginBottom: 8,
    color: "#250588",
  },
  label: {
    fontWeight: "bold",
    color: "#878585ff",
    fontSize: 10,
  },
  value: {
    fontWeight: "bold",
    color: "#250588",
    fontSize: 12,
    textAlign: "center",
  },
  loader: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  loaderText: {
    marginTop: 10,
    fontSize: 16,
    color: "#250588",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    borderTopWidth: 1,
    borderTopColor: "#acaaaaff",
  },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginVertical: 8,
  },
  infoItem: {
    flex: 1,
    alignItems: "center",
  },
  extraContainer: {
    padding: 5,
    marginTop: 5,
    borderRadius: 5,
  },
  extraRowBelow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    marginBottom: 5,
  },
  extraItem: {
    flex: 1,
    alignItems: "center",
  },
  extraLabel: {
    fontSize: 10,
    color: "#E5E4E4",
    fontWeight: "bold",
  },
  extraValue: {
    fontSize: 12,
    color: "#FFFFFF",
    fontWeight: "bold",
    textAlign: "center",
  },
  summaryCard: {
    backgroundColor: "transparent", 
    borderRadius: 1,
    padding: 15,
    marginTop: 15,
    marginBottom: 15,
    shadowColor: "#ffffffff",
    shadowOpacity: 8,
    shadowOffset: { width: 10, height: 10 },
    shadowRadius: 8,
    elevation: 2,
  },
  summaryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  summaryHeaderText: { fontSize: 14, fontWeight: "600", color: "#24bc99", flex: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between", },
  summaryLabel: { fontSize: 13, color: "#ffffff" },
  productName: { fontSize: 13, fontWeight: "500", flex: 1, marginRight: 50, marginLeft: 10, color: "#ffffff", fontFamily: 'Inter-Bold' },
  productvalue: {
    fontWeight: "bold",
    color: "#eeeeeeff",
    fontSize: 12,
    textAlign: "center",
  },
});
