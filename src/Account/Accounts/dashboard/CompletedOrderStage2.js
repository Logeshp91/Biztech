import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground
} from 'react-native';
import { useRoute } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import { Modal } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import * as Animatable from 'react-native-animatable';
import { useDispatch, useSelector } from 'react-redux';
import { postcreatevisit } from '../../../redux/action';
import { useNavigation } from '@react-navigation/native';

const CompletedOrderStage2 = () => {
  const route = useRoute();
  const { enquiryData } = route.params || {};
  console.log('enquiryData:', enquiryData);
  const dispatch = useDispatch();
  const navigation = useNavigation();


  const [visitOutcome, setVisitOutcome] = useState('');
  const [lostReason, setLostReason] = useState('');
  const [remarks, setRemarks] = useState('');
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);


  const LostReason = [
    { label: 'Credit Days > 21 Days', value: 'above21' },
    { label: 'Delivery within 2 Days', value: 'deliverytime' },
    { label: 'No Stock', value: 'nostock' },
    { label: 'Low Price', value: 'pricelow' },
    { label: 'Customer Order on Hold', value: 'customeronhold' },
  ];

  const visitOutcomes = [
    { label: 'GM Visit Required', value: 'GMVISIT' },
    { label: 'Concall With Customer Required', value: 'CONCALL', },
    { label: 'Reminder', value: 'REMINDER', },
    { label: 'Highlight to MGMT', value: 'MDHIGHLIGHT', },
    { label: 'Order Generated', value: 'GENERATE', },
    { label: 'Lost', value: 'LOST', },
  ];

  const postcreatevisitData = useSelector(
    state => state.postcreatevisitReducer.data
  );

  const customerName = enquiryData?.customer_name || 'N/A';
  const purposeOfVisit = enquiryData?.purpose_of_visit || 'N/A';
  const brand = enquiryData?.brand || 'N/A';
  const productCategory = enquiryData?.product_category || 'N/A';
  const quantityTons = enquiryData?.qty || 'N/A';
  const remarksData = enquiryData?.remarks || 'N/A';


  const handleSubmit = () => {
    const data = {
      jsonrpc: "2.0",
      method: "call",
      params: {
        model: "customer.visit",
        method: "write",
        args: [
          [enquiryData.id],
          {
            outcome_visit: visitOutcome,
            lost_reason: lostReason,
            remarks: remarks
          }
        ],
        kwargs: {}
      }
    };

    dispatch(postcreatevisit(data));
  navigation.navigate('TabNavigation')
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <ImageBackground
        source={require('../../../assets/cardimg.png')}
        style={styles.card}
        imageStyle={{ borderRadius: 12 }}
      >
        <Modal
          animationType="slide"
          transparent={true}
          visible={showReminderModal}
          onRequestClose={() => setShowReminderModal(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>Select a reminder date:</Text>

              <TouchableOpacity
                style={[styles.dateButton, { marginBottom: 15 }]}
                onPress={() => setShowDatePicker(true)}
              >
                <Text style={styles.dateText}>
                  {reminderDate.toDateString()}
                </Text>
              </TouchableOpacity>

              {showDatePicker && (
                <DateTimePicker
                  value={reminderDate}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                  onChange={(event, selectedDate) => {
                    const currentDate = selectedDate || reminderDate;
                    setShowDatePicker(Platform.OS === 'ios'); // on Android, hide after select
                    setReminderDate(currentDate);
                  }}
                />
              )}

              <TouchableOpacity
                style={styles.button}
                onPress={() => setShowReminderModal(false)}
              >
                <Text style={styles.buttonText}>Confirm</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>

        <Text style={styles.cardTitle}>{customerName}</Text>
        <View>
          <View style={styles.row}>
            <Text style={styles.cardTextlabel}>Purpose of visit</Text>
            <Text style={styles.cardTextlabel}>Brand</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cardText}>{purposeOfVisit}</Text>
            <Text style={styles.cardText}>{brand}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cardTextlabel}>productCategory</Text>
            <Text style={styles.cardTextlabel}>Tons</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.cardText}>{productCategory}</Text>
            <Text style={styles.cardText}>{quantityTons}</Text>
          </View>
        </View>

      </ImageBackground>
      {visitOutcome === 'Reminder' && (
        <View style={styles.followUpRow}>
          <Text style={styles.followUpLabel}>Follow-up Date:</Text>
          <Text style={styles.followUpDate}>{reminderDate.toDateString()}</Text>
        </View>
      )}
      <View style={styles.inputContainer}>
        <Text style={styles.label}>Visit Outcome</Text>
        <Dropdown
          style={styles.dropdownmain}
          data={visitOutcomes}
          labelField="label"
          valueField="value"
          placeholder="Select Visit Outcome"
          value={visitOutcome}
          onChange={item => {
            setVisitOutcome(item.value);
            if (item.value === 'REMINDER') {
              setShowReminderModal(true);
            }
          }}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
        />


        <Text style={styles.label}>Lost Reason</Text>
        <Dropdown
          style={styles.dropdownmain}
          data={LostReason}
          labelField="label"
          valueField="value"
          placeholder="Select Lost Reason"
          value={lostReason}
          onChange={item => setLostReason(item.value)}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
        />

        <Text style={styles.label}>Remarks</Text>
        <TextInput
          style={styles.input}
          value={remarks}
          onChangeText={setRemarks}
          placeholder="Enter remarks"
          placeholderTextColor="#c6c4c4"

        />
      </View>

      <TouchableOpacity style={styles.button} onPress={handleSubmit}>
        <Text style={styles.buttonText}>Submit</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

export default CompletedOrderStage2;


const styles = StyleSheet.create({
  container: {
    padding: 25,
    backgroundColor: '#DFDFDF',
    flexGrow: 1,
  },
  card: {
    marginTop: '20%',
    height: 200,
    padding: 16,
    borderRadius: 12,
    marginBottom: 20,
    overflow: 'hidden',
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  cardTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#fff',
    marginBottom: 4,
    textAlign: 'center',
    marginTop: '5%'
  },
  cardTextlabel: {
    fontSize: 12,
    color: '#989898ff',
    alignSelf: 'flex-end'
  },
  cardText: {
    fontSize: 16,
    color: '#eee',
    justifyContent: 'flex-end'
  },
  inputContainer: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    marginBottom: 6,
    color: '#0452A6',
  },
  input: {
    borderWidth: 1,
    borderColor: '#0452A6',
    borderRadius: 8,
    padding: Platform.OS === 'ios' ? 12 : 10,
    marginBottom: 16,
    backgroundColor: '#ffffff',
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
  dropdowntitle: {
    fontSize: 11.5,
    color: '#fffefeff',
    marginTop: '2%',
    fontWeight: 'bold',
  },
  dropdowntitle1: {
    fontSize: 11.5,
    color: '#dcdadaff',
    fontWeight: 'bold',

  },
  dropdownmain: {
    height: 40,
    width: '100%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: '2%',
    borderColor: '#0452A6'
  },
  dateButton: {
    borderWidth: 1,
    padding: 12,
    borderRadius: 8,
    backgroundColor: '#fff',
    width: '43%',
    height: 40,
    marginBottom: '2%'

  },
  dateText: {
    fontSize: 11.5,
    color: '#333',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 20,
    width: '80%',
    alignItems: 'center',
  },
  modalText: {
    fontSize: 16,
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  followUpRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  followUpLabel: {
    fontSize: 13,
    color: '#0452A6',
    fontWeight: '600',
    marginRight: 6,
  },
  followUpDate: {
    fontSize: 13,
    color: '#333',
    fontWeight: '500',
  },

});
