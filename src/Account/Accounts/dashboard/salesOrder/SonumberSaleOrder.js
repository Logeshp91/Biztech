import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  LayoutAnimation,
  Platform,
  UIManager,
  ImageBackground
} from "react-native";
import { useRoute } from "@react-navigation/native";
import { useDispatch, useSelector } from "react-redux";
import { postcreatevisit } from "../../../../redux/action";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';


const SonumberSaleOrder = () => {
  const route = useRoute();
  const dispatch = useDispatch();
  const { soId,soN } = route.params;

  const soData = useSelector(
    (state) => state.postcreatevisitReducer.data["sonumberDetail"]
  );
  const loading = useSelector(
    (state) => state.postcreatevisitReducer.loading["sonumberDetail"]
  );
  const productsData = useSelector(
    (state) => state.postcreatevisitReducer.data["soProducts"]
  );

  const taxDetails = useSelector(
    (state) => state.postcreatevisitReducer.data["taxDetails"] || []
  );
  const partnerAddressesData = useSelector(
    (state) => state.postcreatevisitReducer.data["partnerAddresses"] || []
  );
  
const navigation = useNavigation();
  const [form, setForm] = useState({});
  const [billingShippingVisible, setBillingShippingVisible] = useState(false);
  const [products, setProducts] = useState([]);
  const [partnerAddresses, setPartnerAddresses] = useState({});
  const [showProductsClicked, setShowProductsClicked] = useState(false);
  const [expandedProductId, setExpandedProductId] = useState(null);
  const [expandedSummary, setExpandedSummary] = useState(false);

  const colWidths = [150, 80, 40, 60, 60, 100];
  const partnerAddressMap = Object.fromEntries(
    partnerAddressesData.map(addr => [addr.id, addr])
  );
  if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
    UIManager.setLayoutAnimationEnabledExperimental(true);
  }
  useEffect(() => {
    setProducts([]);
    dispatch({ type: "CLEAR_SOPRODUCTS" });
  }, [soId]);

  useEffect(() => {
    if (productsData && Array.isArray(productsData)) {
      setProducts(productsData);
    }
  }, [productsData]);
  useEffect(() => {
    if (soData && soData.length > 0) {
      const so = soData[0];
      setForm(so);

      const invoiceId = Array.isArray(so.partner_invoice_id) ? so.partner_invoice_id[0] : null;
      const shippingId = Array.isArray(so.partner_shipping_id) ? so.partner_shipping_id[0] : null;

      const idsToFetch = [invoiceId, shippingId].filter(Boolean);

      if (idsToFetch.length > 0) {
        const addressPayload = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "res.partner",
            method: "search_read",
            args: [[["id", "in", idsToFetch]]],
            kwargs: {
              fields: [
                "id",
                "name",
                "street",
                "street2",
                "city",
                "zip",
                "state_id",
                "country_id",
                "phone"
              ],
            },
          },
        };
        dispatch(postcreatevisit(addressPayload, "partnerAddresses"));
      }
    }
  }, [soData, dispatch]);

  useEffect(() => {
    if (productsData && Array.isArray(productsData)) {
      setProducts(productsData);

      // Extract unique tax IDs
      const taxIds = [
        ...new Set(
          productsData.flatMap((item) => Array.isArray(item.tax_id) ? item.tax_id : [])
        ),
      ];

      if (taxIds.length > 0) {
        const taxPayload = {
          jsonrpc: "2.0",
          method: "call",
          params: {
            model: "account.tax",
            method: "search_read",
            args: [[["id", "in", taxIds]]],
            kwargs: {
              fields: ["id", "name", "amount"],
            },
          },
        };
        dispatch(postcreatevisit(taxPayload, "taxDetails"));
      }
    }
  }, [productsData]);
  const taxMapDetail = Object.fromEntries(
    taxDetails.map(tax => [tax.id, { name: tax.name, amount: tax.amount }])
  );

  // Fetch SO details
  useEffect(() => {
    if (!soId) return;

    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "sale.order",
        method: "search_read",
        args: [[["id", "=", soId]]],
        kwargs: {
          fields: [
            "id",
            "name",
            "company_id",
            "mobile",
            "partner_invoice_id",
            "partner_shipping_id",
            "billing_branch_id",
            "billing_type",
            "goods_service",
            "category_id",
            "brand",
            "incoterm",
            "date_order",
            "payment_term_id",
            "validity_date",
            "amount_untaxed",
            "amount_tax",
            "amount_total",
          ],
        },
      },
    };

    dispatch(postcreatevisit(payload, "sonumberDetail"));
  }, [soId, dispatch]);

  // Update form when SO details are fetched
  useEffect(() => {
    if (soData && soData.length > 0) {
      setForm(soData[0]);
    }
  }, [soData]);

  const calculateGSTAmount = (product, taxMapDetail) => {
    if (!product.tax_id || !Array.isArray(product.tax_id) || product.tax_id.length === 0) return 0;

    const amount = (product.price_unit || 0) * (product.product_uom_qty || 0);
    const totalTax = product.tax_id.reduce((sum, taxId) => {
      const taxPercent = taxMapDetail[taxId]?.amount ?? 0;
      return sum + (amount * taxPercent / 100);
    }, 0);

    return totalTax;
  };

  const toggleAddress = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    setBillingShippingVisible(!billingShippingVisible);
  };

  {/* Bill Summary Card (always visible) */ }
  // Calculate totals from products
  const totalDelivered = products.reduce((sum, item) => sum + (item.qty_delivered || 0), 0);
  const totalOrdered = products.reduce((sum, item) => sum + (item.product_uom_qty || 0), 0);

  const formatDate = (dateString) => {
    if (!dateString) return "-";
    const [year, month, day] = dateString.split(" ")[0].split("-");
    return `${day}-${month}-${year}`;
  };
  const handleShowProducts = () => {
    setShowProductsClicked(true);
    const payload = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "sale.order.line",
        method: "search_read",
        args: [],
        kwargs: {
          domain: [["order_id", "=", form.id]],
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
  };
  if (loading) {
    return (
      
      <View style={styles.loader}>
        <Text>Loading...</Text>
      </View>
    );
  }
  const companyName = Array.isArray(form.company_id) ? form.company_id[1] : "";
  const companyInitial = companyName ? companyName.charAt(0) : "?";
  return (
    <View style={{flex:1}}>
            <ImageBackground
              source={require('../../../../assets/backgroundimg.png')}
              style={styles.background}
              resizeMode="cover"
              imageStyle={{}}
            >
     <ScrollView style={[styles.container, { backgroundColor: 'transparent' }]}>

      <Text style={styles.soNumber}>{form.name}</Text>

      <View style={styles.headerRow}>
        <View style={styles.companyBox}>
          <Text style={styles.companyInitial}>{companyInitial}</Text>
        </View>
        <Text style={styles.companyName}>{companyName}</Text>
      </View>

      <Text style={styles.mobileNumber}>Mobile: {form.mobile || "-"}</Text>

      <TouchableOpacity style={styles.billingShippingBox} onPress={toggleAddress}>
        <Text style={styles.billingShippingText}>
          {billingShippingVisible ? "Hide Address" : "View Address"}
        </Text>
      </TouchableOpacity>

      {billingShippingVisible && (
        <View style={styles.addressRow}>
          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Billing Address</Text>
            <Text style={styles.addressValue}>
              {Array.isArray(form.partner_invoice_id)
                ? partnerAddressMap[form.partner_invoice_id[0]]
                  ? `${partnerAddressMap[form.partner_invoice_id[0]].street || ""}, ${partnerAddressMap[form.partner_invoice_id[0]].city || ""
                  }`
                  : form.partner_invoice_id[1]
                : "-"}
            </Text>
          </View>

          <View style={styles.addressBox}>
            <Text style={styles.addressLabel}>Shipping Address</Text>
            <Text style={styles.addressValue}>
              {Array.isArray(form.partner_shipping_id)
                ? partnerAddressMap[form.partner_shipping_id[0]]
                  ? `${partnerAddressMap[form.partner_shipping_id[0]].street || ""}, ${partnerAddressMap[form.partner_shipping_id[0]].city || ""
                  }`
                  : form.partner_shipping_id[1]
                : "-"}
            </Text>
          </View>
        </View>
      )}


      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Billing Type</Text>
          <Text style={styles.Value}>{form.billing_type || "-"}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Billing Branch</Text>
          <Text style={styles.Value}>{Array.isArray(form.billing_branch_id) ? form.billing_branch_id[1] : "-"}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Goods/Service</Text>
          <Text style={styles.Value}>{form.goods_service || "-"}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Incoterm</Text>
          <Text style={styles.Value}>{Array.isArray(form.incoterm) ? form.incoterm[1] : "-"}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Category</Text>
          <Text style={styles.Value}>{Array.isArray(form.category_id) ? form.category_id[1] : "-"}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Brand</Text>
          <Text style={styles.Value}>{Array.isArray(form.brand) ? form.brand[1] : "-"}</Text>
        </View>
      </View>

      <View style={styles.row}>
        <View style={styles.col}>
          <Text style={styles.label}>Payment Terms</Text>
          <Text style={styles.Value}>{Array.isArray(form.payment_term_id) ? form.payment_term_id[1] : "-"}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Expiration</Text>
          <Text style={styles.Value}>{formatDate(form.validity_date)}</Text>
        </View>
        <View style={styles.col}>
          <Text style={styles.label}>Order Date</Text>
          <Text style={styles.Value}>{formatDate(form.date_order)}</Text>
        </View>
      </View>
      <TouchableOpacity
        style={styles.showProductsButton}
        onPress={handleShowProducts}>
        <Text style={styles.showProductsText}>Show Products</Text>
      </TouchableOpacity>

    {showProductsClicked && (

           <View style={styles.summaryCard}>
            {/* Header */}
            <View style={styles.summaryHeader}>
              <Icon name="book" size={20} color="#24bc99" style={{ marginRight: 8 }} />
              <Text style={styles.summaryHeaderText}>Product List</Text>
              <TouchableOpacity >
                <Icon name="download" size={20} color="#0b0b0bff" style={{ marginLeft: 10 ,marginRight:"9%"}} />
              </TouchableOpacity>
            </View>

    {/* Product Items */}
    {products.length > 0 ? (
      products.map((item) => {
        const isExpanded = expandedProductId === item.id;
        return (
          
          <TouchableOpacity
            key={item.id}
            style={styles.productRow}
            onPress={() => setExpandedProductId(isExpanded ? null : item.id)}
          >
            <Icon
              name="lock"
              size={14}
              color="#ad2ba8"
              style={{ marginLeft: 6 }}
            />
            <Text
              style={styles.productName}
              numberOfLines={isExpanded ? 0 : 1}
              ellipsizeMode="tail"
            >
              {item.name}
            </Text>
            <Text style={styles.productSubtotal}>{item.product_uom_qty}</Text>
          </TouchableOpacity>
        );
      })
    ) : (
      <Text style={{ textAlign: "center", marginTop: 20 }}>No products found</Text>
    )}

    {/* Total Quantity */}
    <View
      style={[
        styles.summaryRow,
        { borderTopWidth: 0.2, borderTopColor: "#bdbbbbff", paddingTop: 10,},
      ]}
    >
      <Text style={[styles.summaryLabel, { fontFamily: 'Inter-Bold',fontWeight: "700" ,marginLeft:10, marginTop:5 }]}>Total Quantity:</Text>
<TouchableOpacity
  style={{ flexDirection: "row", alignItems: "center", marginRight: 10 }}
  onPress={() =>
    navigation.navigate('BillSummary', {
      soId: form.id,
      products: products,
      form: form,
      taxDetails: taxDetails
    })
  }
>
  <Text style={{ color: "#ffffff", fontWeight: "700", fontSize: 13,fontFamily: 'Inter-Bold'}}>
    {totalOrdered}
  </Text>
  <Icon name="angle-right" size={30} color="#a3a3a5ff" style={{ marginLeft: 5}} />
</TouchableOpacity>
    </View>
  </View>
)}
    </ScrollView>
    </ImageBackground>
    </View>
  );
};

export default SonumberSaleOrder;
const styles = StyleSheet.create({
    background: {
    flex: 1,
    resizeMode: "cover",
    justifyContent: "flex-start",
  },
  container: { flex: 1, padding: 15, backgroundColor: "#f2f2f2" },
  loader: { flex: 1, justifyContent: "center", alignItems: "center" },
  soNumber: { textAlign: "center", fontSize: 20, fontWeight: "bold", marginTop: 20 },
  headerRow: { flexDirection: "row", alignItems: "center" },
  companyBox: {
    width: 40,
    height: 40,
    borderRadius: 5,
    backgroundColor: "#3966c2",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  companyInitial: { color: "#fff", fontWeight: "bold", fontSize: 18,fontFamily: 'Inter-Bold', },
   companyName: { fontSize: 14, fontWeight: "bold", flex: 1, color: "#f0eeeeff",fontFamily: 'Inter' },
  mobileNumber: { fontSize: 14, color: "#f0eeeeff", marginLeft: 50 },
  billingShippingBox: { marginLeft: 50 },
  billingShippingText: { fontSize: 12, fontWeight: "600", color: "#f17676ff" },
  addressRow: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  addressBox: { flex: 1 },
  addressLabel: { fontSize: 12, fontWeight: "bold", color: "#969292ff" },
  addressValue: { fontSize: 14, color: "#f0eeeeff" },
  row: { flexDirection: "row", justifyContent: "space-between", marginTop: 10 },
  col: { flex: 1, marginHorizontal: 5 },
  label: { fontWeight: "bold", marginBottom: 1, color: "#8e8d8dff",fontSize:12,fontFamily: 'Inter-Bold' },
  Value: { fontSize: 15, fontWeight: "500", color: "#ffffff",fontFamily: 'Inter-Bold'},
  showProductsButton: {
    backgroundColor: "#3966c2",
    padding: 12,
    borderRadius: 8,
    marginTop: 20,
    marginHorizontal: 50,
    marginBottom: 10,
  },
  showProductsText: { color: "#fff", textAlign: "center", fontWeight: "bold",fontFamily: 'Inter-Bold' },
  productRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 10,
    borderBottomColor: "#ddd",

  },
  productName: { fontSize: 13, fontWeight: "500", flex: 1, marginRight: 50, marginLeft: 10 ,color:"#ffffff",fontFamily: 'Inter-Bold'},
  productSubtotal: { fontSize: 13, fontWeight: "600", color: "#333", marginLeft: 10 ,marginRight:"8%",color:"#ffffff",fontFamily: 'Inter-Bold'},
  summaryCard: {
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
  summaryHeader: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", marginBottom: 15 },
  summaryHeaderText: { fontSize: 14, fontWeight: "600", color: "#24bc99", flex: 1 },
  summaryRow: { flexDirection: "row", justifyContent: "space-between",},
  summaryLabel: { fontSize: 13, color: "#ffffff" },
});
