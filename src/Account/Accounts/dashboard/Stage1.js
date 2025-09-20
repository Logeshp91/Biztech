import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Platform,
  ImageBackground,
  Modal
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { Dropdown } from 'react-native-element-dropdown';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useDispatch, useSelector } from 'react-redux';
import { postcreatevisit } from '../../../redux/action';

const Stage1 = () => {
  const route = useRoute();
  const { enquiryData } = route.params || {};
  const dispatch = useDispatch();
  const navigation = useNavigation();

  const [visitOutcome, setVisitOutcome] = useState(enquiryData?.outcome_visit || '');
  const [lostReason, setLostReason] = useState(enquiryData?.lost_reason || '');
  const [remarks, setRemarks] = useState(enquiryData?.remarks || '');
  const [followUpDate, setFollowUpDate] = useState(
    enquiryData?.followup_date ? new Date(enquiryData.followup_date) : null
  );
  const [reminderDate, setReminderDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [showReminderModal, setShowReminderModal] = useState(false);
  const [showLostReasonModal, setShowLostReasonModal] = useState(false);

  const [submittedLostReason, setSubmittedLostReason] = useState('');
  const [submittedFollowUp, setSubmittedFollowUp] = useState('');

  const LostReason = [
    { label: 'Credit Days > 21 Days', value: 'above21' },
    { label: 'Delivery within 2 Days', value: 'deliverytime' },
    { label: 'No Stock', value: 'nostock' },
    { label: 'Low Price', value: 'pricelow' },
    { label: 'Customer Order on Hold', value: 'customeronhold' },
  ];

  const visitOutcomes = [
    { label: 'GM Visit Required', value: 'GMVISIT' },
    { label: 'Concall With Customer Required', value: 'CONCALL' },
    { label: 'Reminder', value: 'REMINDER' },
    { label: 'Highlight to MGMT', value: 'MDHIGHLIGHT' },
    { label: 'Order Generated', value: 'GENERATE' },
    { label: 'Lost', value: 'LOST' },
  ];

  const customerName = enquiryData?.customer_name || 'N/A';
  const purposeOfVisit = enquiryData?.purpose_of_visit || 'N/A';
  const brand = enquiryData?.brand || 'N/A';
  const productCategory = enquiryData?.product_category || 'N/A';
  const quantityTons = enquiryData?.qty || 'N/A';

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
            remarks: remarks,
            followup_date: followUpDate
          }
        ],
        kwargs: {}
      }
    };

    dispatch(postcreatevisit(data));

    setSubmittedLostReason(lostReason ? LostReason.find(l => l.value === lostReason)?.label : '');
    setSubmittedFollowUp(visitOutcome === 'REMINDER' && followUpDate ? followUpDate.toDateString() : '');

    navigation.navigate('Stage2', { enquiryData });
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

      {/* Show Follow-up Date above dropdown */}
      {followUpDate && (
        <View style={styles.followUpRow}>
          <Text style={styles.followUpLabel}>Follow-up Date:</Text>
          <Text style={styles.followUpDate}>
            {followUpDate.toDateString()}
          </Text>
        </View>
      )}

      {/* Show Lost Reason above dropdown */}
      {lostReason && (
        <View style={styles.followUpRow}>
          <Text style={styles.followUpLabel}>Lost Reason:</Text>
          <Text style={styles.followUpDate}>
            {LostReason.find(l => l.value === lostReason)?.label}
          </Text>
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
            } else {
              setFollowUpDate(null);
            }

            if (item.value === 'LOST') {
              setShowLostReasonModal(true);
            } else {
              setLostReason('');
            }
          }}
          placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
          selectedTextStyle={styles.dropdownSelectedText} 
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

      {/* Reminder Modal */}
      <Modal
        animationType="slide"
        transparent
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
              <Text style={styles.dateText}>{followUpDate ? followUpDate.toDateString() : 'Select Date'}</Text>
            </TouchableOpacity>

            {showDatePicker && (
              <DateTimePicker
                value={reminderDate}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                onChange={(event, selectedDate) => {
                  const currentDate = selectedDate || reminderDate;
                  setShowDatePicker(Platform.OS === 'ios');
                  setReminderDate(currentDate);
                  setFollowUpDate(currentDate);
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

      {/* Lost Reason Modal */}
      <Modal
        animationType="slide"
        transparent
        visible={showLostReasonModal}
        onRequestClose={() => setShowLostReasonModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalText}>Select Lost Reason:</Text>
            {LostReason.map(reason => (
              <TouchableOpacity
                key={reason.value}
                style={{
                  padding: 10,
                  borderBottomWidth: 1,
                  borderColor: '#ccc',
                  width: '100%',
                  alignItems: 'center',
                }}
                onPress={() => {
                  setLostReason(reason.value);
                  setShowLostReasonModal(false);
                }}
              >
                <Text>{reason.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </Modal>
    </ScrollView>
    </ImageBackground>
  );
};

export default Stage1;



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
    marginBottom: 10,
  },
  label: {
    fontSize: 13,
    marginBottom: 6,
    color: '#f9f9f9ff',
  },
input: {
  borderWidth: 1,
  borderColor: '#ffffffff',
  borderRadius: 8,
  height: 40, 
  paddingHorizontal: 15, 
  marginTop:1,
  paddingVertical: Platform.OS === 'ios' ? 14 : 12, 
  marginBottom: 16,
  backgroundColor: '#ffffff',
  fontSize: 14
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
    width: '99%',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
    marginBottom: '2%',
    borderColor: '#0452A6'
  },
  dropdownSelectedText: {
  fontSize: 14,       
  color: '#000',      
  fontFamily: 'Inter-Regular', 
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
    color: '#9b9a9aff',
    fontWeight: '600',
    marginRight: 6,
  },
  followUpDate: {
    fontSize: 13,
    color: '#ffffffff',
    fontWeight: '500',
  },

});
