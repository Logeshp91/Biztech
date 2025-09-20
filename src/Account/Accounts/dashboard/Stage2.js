import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
  TextInput
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { useDispatch, useSelector } from 'react-redux';
import { postcreatevisit ,postConvert,} from '../../../redux/action';

const Stage2 = ({navigation}) => {
  const route = useRoute();
  const { enquiryData } = route.params || {};
  const dispatch = useDispatch();

  // Selected values states
  const [BillingCompany, setBillingCompany] = useState(null);
  const [BillingBranch, setBillingBranch] = useState(null);
  const [DeliveryType, setDeliveryType] = useState(null);
  const [PaymentTerm, setPaymentTerm] = useState(null);
  const [BillingType, setBillingType] = useState(null);
const [isSubmitted, setIsSubmitted] = useState(false);

  // Dropdown option states
  const [billingCompanies, setBillingCompanies] = useState([]);
  const [billingBranches, setBillingBranches] = useState([]);
  const [deliveryTypes, setDeliveryTypes] = useState([]);
  const [paymentTerms, setPaymentTerms] = useState([]);
  const [billingTypes, setBillingTypes] = useState([]);

  const postcreatevisitData = useSelector(state => state.postcreatevisitReducer.data);
const convertEnquiryResult = useSelector(state => state.postConvertReducer.data);

  const customerName = enquiryData?.customer_name || 'N/A';
  const purposeOfVisit = enquiryData?.purpose_of_visit || 'N/A';
  const brand = enquiryData?.brand || 'N/A';
  const productCategory = enquiryData?.product_category || 'N/A';
  const quantityTons = enquiryData?.qty || 'N/A';


  const items = {
    company_model: 'res.company',
    company_method: 'search_read',
    company_args: [],
    company_fields: ['id', 'name'],

    billing_model: 'billing.branch',
    billing_method: 'search_read',
    billing_args: [],
    billing_fields: ['id', 'name'],

    delivery_model: 'account.incoterms',
    delivery_method: 'search_read',
    delivery_args: [],
    delivery_fields: ['id', 'name'],

    payment_model: 'account.payment.term',
    payment_method: 'search_read',
    payment_args: [],
    payment_fields: ['id', 'name'],

    billingtype_model: 'customer.visit',
    billingtype_method: 'fields_get',
    billingtype_args: ['billing_type'],
  };

  const dataParams = (name) => ({
    jsonrpc: "2.0",
    method: "call",
    params: {
      model: items[`${name}_model`],
      method: items[`${name}_method`],
      args: items[`${name}_args`],
      kwargs: {
        fields: items[`${name}_fields`]
      },
    }
  });
  const isFormValid =
  BillingCompany !== null &&
  BillingBranch !== null &&
  DeliveryType !== null &&
  PaymentTerm !== null &&
  BillingType !== null;

  const onHandlebillingcompany = () => {
    dispatch(postcreatevisit(dataParams("company"), "billingcompany"));
  };

  const onHandlebillingbranch = () => {
    dispatch(postcreatevisit(dataParams("billing"), "billingbranch"));
  };

  const onHandledeliverytype = () => {
    dispatch(postcreatevisit(dataParams("delivery"), "deliverytype"));
  };

  const onHandlepaymentterms = () => {
    dispatch(postcreatevisit(dataParams("payment"), "paymentterms"));
  };

  const onHandleBillingType = () => {
    dispatch(postcreatevisit(dataParams("billingtype"), "billingtype"));
  };

  useEffect(() => {
    if (!postcreatevisitData) return;

    if (postcreatevisitData.billingcompany) {
      setBillingCompanies(
        postcreatevisitData.billingcompany.map(item => ({
          label: item.name,
          value: item.id,
        }))
      );
    }
    if (postcreatevisitData.billingbranch) {
      setBillingBranches(
        postcreatevisitData.billingbranch.map(item => ({
          label: item.name,
          value: item.id,
        }))
      );
    }
    if (postcreatevisitData.deliverytype) {
      setDeliveryTypes(
        postcreatevisitData.deliverytype.map(item => ({
          label: item.name,
          value: item.id,
        }))
      );
    }
    if (postcreatevisitData.paymentterms) {
      setPaymentTerms(
        postcreatevisitData.paymentterms.map(item => ({
          label: item.name,
          value: item.id,
        }))
      );
    }
    if (postcreatevisitData.billingtype) {
      const selections = postcreatevisitData.billingtype.billing_type?.selection || [];
      setBillingTypes(
        selections.map(([value, label]) => ({
          label,
          value,
        }))
      );
    }
  }, [postcreatevisitData]);

const handleSubmit = async () => {
  const data = {
    jsonrpc: '2.0',
    method: 'call',
    params: {
      model: 'customer.visit',
      method: 'write',
      args: [
        [enquiryData.id],
        {
          company: BillingCompany,
          billing_branch_id: BillingBranch,
          incoterm_id: DeliveryType,
          payment_term_id: PaymentTerm,
          billing_type: BillingType,
        },
      ],
      kwargs: {},
    },
  };

  try {
    const response = await dispatch(postcreatevisit(data)); // ✅ Await the API call
    console.log('Submit API Response:', response); // ✅ Log actual response
    setIsSubmitted(true); // ✅ Only set if success
  } catch (error) {
    console.error('Submit API Error:', error); // ✅ Catch errors
    // Optionally show error to user
  }
};


const handleConvertEnquiry = async () => {
  const data = {
    jsonrpc: "2.0",
    method: "call",
    params: {
      visit_id: enquiryData.id, 
    },
  };

  dispatch(postConvert(data)); // no await needed
      navigation.navigate('TabNavigation');
};
  return (
 <ImageBackground
  source={require('../../../assets/backgroundimg.png')}
  style={styles.background}
  resizeMode="cover"
>
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require('../../../assets/Cardstage1.png')}
        style={styles.card}
        imageStyle={{ borderRadius: 12 }}
      >
        <Text style={styles.cardTitle}>{customerName}</Text>
        <View>
          <View style={styles.row}>
            <Text style={styles.cardTextlabel}>Purpose of visit</Text>
            <Text style={styles.cardTextlabel}>Brand</Text>
          </View>
          <View style={styles.row2}>
            <Text style={styles.cardText}>{purposeOfVisit}</Text>
            <Text style={styles.cardText}>{brand}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cardTextlabel}>Product Category</Text>
            <Text style={styles.cardTextlabel}>Tons</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cardText}>{productCategory}</Text>
            <Text style={styles.cardText}>{quantityTons}</Text>
          </View>
        </View>
      </ImageBackground>

      <View style={styles.inputContainer}>
        <Text style={styles.label}>Billing Company</Text>
        <Dropdown
          style={styles.dropdownmain}
          data={billingCompanies}
          labelField="label"
          valueField="value"
          placeholder="Select Billing Company"
          value={BillingCompany}
          onChange={(item) => setBillingCompany(item.value)}
          onFocus={onHandlebillingcompany}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
        />

        <Text style={styles.label}>Billing Branch</Text>
        <Dropdown
          style={styles.dropdownmain}
          data={billingBranches}
          labelField="label"
          valueField="value"
          placeholder="Select Billing Branch"
          value={BillingBranch}
          onChange={(item) => setBillingBranch(item.value)}
          onFocus={onHandlebillingbranch}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
        />

        <Text style={styles.label}>Delivery Type</Text>
        <Dropdown
          style={styles.dropdownmain}
          data={deliveryTypes}
          labelField="label"
          valueField="value"
          placeholder="Select Delivery Type"
          value={DeliveryType}
          onChange={(item) => setDeliveryType(item.value)}
          onFocus={onHandledeliverytype}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
        />

        <Text style={styles.label}>Payment Terms</Text>
        <Dropdown
          style={styles.dropdownmain}
          data={paymentTerms}
          labelField="label"
          valueField="value"
          placeholder="Select Payment Terms"
          value={PaymentTerm}
          onChange={(item) => setPaymentTerm(item.value)}
          onFocus={onHandlepaymentterms}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
        />

        <Text style={styles.label}>Billing Type</Text>
        <Dropdown
          style={styles.dropdownmain}
          data={billingTypes}
          labelField="label"
          valueField="value"
          placeholder="Select Billing Type"
          value={BillingType}
          onChange={(item) => setBillingType(item.value)}
          onFocus={onHandleBillingType}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
        />
      </View>
<View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: isFormValid ? '#0452A6' : '#a0a0a0' }, // disabled color
    ]}
    onPress={handleSubmit}
    disabled={!isFormValid} // ✅ disable until all fields filled
  >
    <Text style={styles.buttonText}>Submit</Text>
  </TouchableOpacity>

  <TouchableOpacity
    style={[
      styles.button,
      { backgroundColor: isSubmitted ? '#0452A6' : '#a0a0a0' }, 
    ]}
    onPress={handleConvertEnquiry}
    disabled={!isSubmitted} 
  >
    <Text style={styles.buttonText}>Convert Enquiry</Text>
  </TouchableOpacity>
</View>
    </ScrollView>
    </ImageBackground>
  );
};

export default Stage2;

const styles = StyleSheet.create({
    background: {
    flex: 1,
    width: "100%",
    height: "100%",
    justifyContent: "center"
  },
  container: {
    padding: 25,
    flexGrow: 1,
  },
  card: {
    marginTop: '20%',
    height: 170,
    padding: 16,
    marginBottom: 5,
    overflow: 'hidden',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',

  },
    row2: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cardTitle: {
    fontSize: 18,
    color: '#fff',
    marginBottom: 10,
    textAlign: 'center',
    marginTop: '5%',
      fontFamily: 'Inter-Regular',
  },
  cardTextlabel: {
    fontSize: 13,
    color: '#9b9a9aff',
    alignSelf: 'flex-end',
    fontFamily: 'Inter-Regular', 
  },
  cardText: {
    fontSize: 15,
    color: '#eee',
    justifyContent: 'flex-end'
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#ffffffff',
  },
  input: {
    borderWidth: 1,
    borderColor: '#0452A6',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 16,
    backgroundColor: '#ffffff',
  },
  dropdownmain: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: 16,
    borderColor: '#0452A6',
  },
  button: {
    backgroundColor: '#0452A6',
    padding: 14,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 10,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
