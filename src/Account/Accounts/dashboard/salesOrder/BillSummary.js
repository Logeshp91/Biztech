import React, { useState } from "react";
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground,Image
} from "react-native";
import Icon from "react-native-vector-icons/FontAwesome";
import FontAwesome6 from "react-native-vector-icons/FontAwesome6";
const BillSummary = ({ route }) => {
  const { products = [], form = {}, taxDetails = [] } = route.params;
  const [billingShippingVisible, setBillingShippingVisible] = useState(false);
  const [expandedProducts, setExpandedProducts] = useState({});

  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }

  const toggleAddress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBillingShippingVisible(!billingShippingVisible);
  };

  const toggleProductName = (index) => {
    setExpandedProducts((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const totalDelivered = products.reduce((sum, item) => sum + (item.qty_delivered || 0), 0);
  const totalOrdered = products.reduce((sum, item) => sum + (item.product_uom_qty || 0), 0);
  const totalAmountUntaxed = form.amount_untaxed ?? 0;
  const totalGST = form.amount_tax ?? 0;
  const totalAmount = form.amount_total ?? 0;

  const taxMapDetail = Object.fromEntries(
    taxDetails.map((tax) => [tax.id, { name: tax.name, amount: tax.amount }])
  );

  const calculateGSTAmount = (product) => {
    if (!product.tax_id || !Array.isArray(product.tax_id) || product.tax_id.length === 0) return 0;
    const amount = (product.price_unit || 0) * (product.product_uom_qty || 0);
    return product.tax_id.reduce(
      (sum, taxId) => sum + (amount * (taxMapDetail[taxId]?.amount || 0)) / 100,
      0
    );
  };

  const companyName = Array.isArray(form.company_id) ? form.company_id[1] : "";
  const companyInitial = companyName ? companyName.charAt(0) : "?";

  return (
    <View style={{ flex: 1 }}>
      <ImageBackground
        source={require('../../../../assets/backgroundimg.png')}
        style={styles.background}
        resizeMode="cover"
        imageStyle={{}}
      >
        <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 20 }}>
          {/* SO Header */}
          <Text style={styles.soNumber}>{form.name}</Text>
          <View style={styles.headerRow}>
            <View style={styles.companyBox}>
              <Text style={styles.companyInitial}>{companyInitial}</Text>
            </View>
            <Text style={styles.companyName}>{companyName}</Text>
          </View>
          <Text style={styles.mobileNumber}>Mobile: {form.mobile || "-"}</Text>

          {/* Toggle Address Button */}
          <TouchableOpacity style={styles.billingShippingBox} onPress={toggleAddress}>
            <Text style={styles.billingShippingText}>
              {billingShippingVisible ? "Hide Address" : "View Address"}
            </Text>
          </TouchableOpacity>

          {/* Billing/Shipping Address */}
          {billingShippingVisible && (
            <View style={styles.addressRow}>
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>Billing Address</Text>
                <Text style={styles.addressValue}>
                  {Array.isArray(form.partner_invoice_id) ? form.partner_invoice_id[1] : "-"}
                </Text>
              </View>
              <View style={styles.addressBox}>
                <Text style={styles.addressLabel}>Shipping Address</Text>
                <Text style={styles.addressValue}>
                  {Array.isArray(form.partner_shipping_id) ? form.partner_shipping_id[1] : "-"}
                </Text>
              </View>
            </View>
          )}

          {/* Product Details + Bill Summary Combined */}
          <View style={styles.productsCard}>
            <View style={{ flexDirection: "row", marginBottom: 10 }}>
              <Icon name="product-hunt" size={20} color="#24bc99" style={{ marginRight: 8 }} />
              <Text style={styles.productsHeader}>Product Details</Text>
            </View>

            {products.length > 0 ? (
              products.map((item, index) => {
                const gstAmount = calculateGSTAmount(item);
                const taxNames = Array.isArray(item.tax_id)
                  ? item.tax_id
                    .map((taxId) => taxMapDetail[taxId]?.name || "")
                    .filter(Boolean)
                    .join(", ")
                  : "-";

                const quantity = item.product_uom_qty ?? 0;
                const unitPrice = item.price_unit ?? 0;
                const amount = quantity * unitPrice;
                const isExpanded = expandedProducts[index] || false;

                return (
                  <View key={item.id || index} style={styles.productRow}>
                    <View style={styles.leftSection}>
                      <TouchableOpacity onPress={() => toggleProductName(index)}>
                        <View style={{ flexDirection: "row", marginLeft: 5 }}>
                          <Icon
                            name="dot-circle-o"
                            size={10}
                            color="#dd36a8ff"
                            style={{ marginRight: 5, marginTop: 1 }}
                          />
                          <Text
                            style={styles.productName}
                            numberOfLines={isExpanded ? 5 : 1}
                            ellipsizeMode="tail"
                          >
                            {isExpanded
                              ? item.name
                              : item.name?.length > 25
                                ? item.name.slice(0, 25) + "..."
                                : item.name}
                          </Text>
                        </View>
                      </TouchableOpacity>
                      <Text style={styles.productDetail}>
                        {quantity} × {unitPrice.toFixed(2)}
                      </Text>
                      <Text style={styles.productDetail}>
                        {amount.toFixed(2)} + {gstAmount.toFixed(2)} ({taxNames || "No Tax"})
                      </Text>
                    </View>
                    <View style={styles.rightSection}>
                      <Text style={styles.totalValue}>
                        ₹  {((item.price_subtotal || amount) + gstAmount).toFixed(2)}
                      </Text>
                    </View>
                  </View>
                );
              })
            ) : (
              <Text style={{ textAlign: "center", marginTop: 20 }}>No products found</Text>
            )}

            {/* Bill Summary inside same card */}
            <View style={styles.summaryInsideCard}>
              {[
                { icon: "money", label: "Amount Untaxed:", value: `₹ ${totalAmountUntaxed}` },
                { icon: "shopping-cart", label: "Quantity Ordered:", value: totalOrdered },
                { icon: "truck", label: "Delivered:", value: totalDelivered },
                { icon: "percent", label: "GST (Tax):", value: `₹ ${totalGST}` },
              ].map((item, idx) => (
                <View key={idx} style={styles.summaryRow}>
                  <Text style={styles.summaryLabel}>{item.label}</Text>
                  <Text style={styles.summaryValue}>{item.value}</Text>
                </View>
              ))}
              <View style={{ borderTopWidth: 0.2, borderTopColor: "#b1b1b1ff" }}>
                <View style={[styles.summaryRow, styles.totalRow]}>
    <FontAwesome6 name="sack-dollar" size={12} color="#24bc99" style={{ marginRight: 1}} />

                  <Text style={[ styles.summaryLabel1,{ fontWeight: "700", color: "#ffffffff" ,fontFamily: 'Inter-Bold'}]}>Total Amount</Text>
                  <Text
                    style={[styles.summaryValue, { color: "#ffffffff", fontWeight: "700" ,fontFamily: 'Inter-Bold'}]}
                  >
                    ₹  {totalAmount}
                  </Text>
                </View>
              </View>
            </View>
          </View>
        </ScrollView>
      </ImageBackground>
    </View>
  );
};

export default BillSummary;

const styles = StyleSheet.create({
  background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-start",
  },
  container: {
    flex: 1,
    padding: 15,
    backgroundColor: "transparent",
  },
  soNumber: { textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: "10%", color: "#f0eeeeff" },
  headerRow: { flexDirection: "row", alignItems: "center", color: "#f0eeeeff" },
  companyBox: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#3966c2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  companyInitial: { color: "#fff", fontWeight: "bold", fontSize: 18 },
  companyName: { fontSize: 14, fontWeight: "bold", flex: 1, color: "#f0eeeeff" },
  mobileNumber: { fontSize: 14, color: "#f0eeeeff", marginLeft: 50 },
  billingShippingBox: { marginLeft: 50 },
  billingShippingText: { fontSize: 12, fontWeight: "600", color: "#f17676ff" },
  addressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  addressBox: { flex: 1 },
  addressLabel: { fontSize: 12, fontWeight: "bold", color: "#969292ff" },
  addressValue: { fontSize: 14, color: "#f0eeeeff" },
  productsCard: {
    backgroundColor: "transparent", // fixed spelling & added quotes
    borderRadius: 1,
    padding: 15,
    marginTop: 15,
    shadowColor: "#ffffffff",
    shadowOpacity: 8,
    shadowOffset: { width: 10, height: 10 },
    shadowRadius: 8,
    elevation: 2,
  },
  productsHeader: {
    fontSize: 14,
    fontWeight: "600",
    color: "#24bc99",
    fontFamily: 'Inter-Bold',
  },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },
  leftSection: { flex: 2 },
  rightSection: { flex: 1, alignItems: "flex-end" },
  productName: { fontSize: 13, fontWeight: "600", color: "#ffffffff" ,fontFamily: 'Inter-Bold'},
  productDetail: { fontSize: 11, color: "#b1b1b1ff", marginLeft: "10%" ,fontFamily: 'Inter-Bold'},
  totalValue: { fontSize: 11, fontWeight: "700", color: "#ffffffff", marginRight: 5 },

  summaryInsideCard: {
    borderTopWidth: 0.2,
    borderTopColor: "#b1b1b1ff",
    paddingTop: 5,
  },
  summaryRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 5,
  },
  iconContainer: { width: 24, alignItems: "left" },
  summaryLabel: { flex: 1, fontSize: 12, color: "#ffffff",marginLeft:"6%" },
  summaryLabel1: { flex: 1, fontSize: 12, color: "#ffffff",fontFamily: 'Inter-Bold' },
  summaryValue: { fontSize: 12, fontWeight: "500", color: "#ffffff",marginRight:"2%" },
  totalRow: { borderTopColor: "#b1b1b1ff", paddingTop: 5, marginLeft: "2%", color: "#ffffffff" },
});
