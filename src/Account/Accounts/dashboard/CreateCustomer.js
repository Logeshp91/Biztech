import React, { useState } from 'react';
import { View, Text, StyleSheet, ImageBackground, TouchableOpacity, TextInput, ScrollView, Button } from 'react-native';
import { Dropdown } from 'react-native-element-dropdown';
import * as Animatable from 'react-native-animatable';

const CreateCustomer = () => {
    const [visitType, setVisitType] = useState(null);
    const [qty, setQty] = useState('');
    const visitTypes = [
        { label: 'Visit A', value: 'A' },
        { label: 'Visit B', value: 'B' },
        { label: 'search engine', value: 'C' },];
    return (
        <ImageBackground
            source={require('../../../assets/backgroundimg.png')}
            style={{ flex: 1, resizeMode: 'cover', padding: 20 }}>
            <View >
                <Text style={styles.title}>Create Customer</Text>
                <View >
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.dropdowntitle, { justifyContent: 'flex-start' }]}>Customer Name</Text>
                    </View>
                    <Animatable.View animation="fadeInUp" duration={1000} delay={100}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput
                                style={styles.inputBoxcustomerfield}
                                placeholder="Customer Name"
                                placeholderTextColor="#c6c4c4"
                                keyboardType='number-pad'
                                value={qty}
                                onChangeText={setQty} />
                        </View>
                    </Animatable.View>
                    <View style={{ flexDirection: 'row' }}>
                        <Text style={[styles.dropdowntitle, { justifyContent: 'flex-start' }]}>Enter Mobile Number</Text>
                        <Text style={[styles.dropdowntitle, { marginLeft: '18%' }]}>Select Customer Segment</Text>
                    </View>
                    <Animatable.View animation="fadeInUp" duration={1000} delay={300}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                            <TextInput
                                style={styles.inputBox}
                                placeholder="Mobile Number"
                                placeholderTextColor="#c6c4c4"
                                keyboardType='number-pad'
                                value={qty}
                                onChangeText={setQty}/>
                            <Dropdown
                                style={[styles.dropdownmain, { marginRight: 10 }]}
                                data={visitTypes}
                                labelField="label"
                                valueField="value"
                                placeholder="Segment"
                                placeholderStyle={{ color: '#c6c4c4ff', fontSize: 11.5 }}
                                itemTextStyle={{ fontSize: 12 }}
                                selectedTextStyle={{ fontSize: 11.5 }}
                                value={visitType}
                                onChange={item => setVisitType(item.value)} />
                        </View>
                    </Animatable.View>
                </View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.dropdowntitle, { justifyContent: 'flex-start' }]}>Contact No</Text>
                    <Text style={[styles.dropdowntitle, { marginLeft: '35%' }]}>GST Number</Text>
                </View>
                <Animatable.View animation="fadeInUp" duration={1000} delay={500}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Contact No"
                            placeholderTextColor="#c6c4c4"
                            value={qty}
                            onChangeText={setQty}
                            keyboardType='number-pad'
                            maxLength={16} />
                        <TextInput
                            style={styles.inputBox}
                            placeholder="GST Number"
                            placeholderTextColor="#c6c4c4"
                            value={qty}
                            onChangeText={setQty}
                            maxLength={16} />
                    </View>
                </Animatable.View>
                <View style={{ flexDirection: 'row' }}>
                    <Text style={[styles.dropdowntitle, { justifyContent: 'flex-start' }]}>Mobile No.</Text>
                    <Text style={[styles.dropdowntitle, { marginLeft: '38%' }]}>Email</Text>
                </View>
                <Animatable.View animation="fadeInUp" duration={1000} delay={700}>
                    <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Mobile No"
                            placeholderTextColor="#c6c4c4"
                            value={qty}
                            onChangeText={setQty}
                            maxLength={10} />
                        <TextInput
                            style={styles.inputBox}
                            placeholder="Email"
                            placeholderTextColor="#c6c4c4"
                            value={qty}
                            onChangeText={setQty}/>
                    </View>
                </Animatable.View>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                    <View style={{ width: '48%' }}>
                        <Text style={styles.dropdowntitle}>Address</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={900}>
                            <View>
                                <TextInput
                                    style={styles.inputBoxMulti}
                                    placeholder="Address"
                                    placeholderTextColor="#c6c4c4"
                                    multiline={true}
                                    numberOfLines={6}
                                    value={qty}
                                    onChangeText={setQty}
                                />
                            </View>
                        </Animatable.View>
                    </View>
                    <View style={{ width: '48%' }}>
                        <Text style={styles.dropdowntitle}>Pincode</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={1200}>
                            <View>
                                <TextInput
                                    style={styles.inputBox3}
                                    placeholder="Pincode"
                                    placeholderTextColor="#c6c4c4"
                                    keyboardType="number-pad"
                                    value={qty}
                                    onChangeText={setQty}
                                    maxLength={12}
                                />
                            </View>
                        </Animatable.View>
                        <Text style={[styles.dropdowntitle, { marginTop: 10 }]}>State</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={1500}>
                            <View>
                                <TextInput
                                    style={styles.inputBox3}
                                    placeholder="State"
                                    placeholderTextColor="#c6c4c4"
                                    value={qty}
                                    onChangeText={setQty}
                                />
                            </View>
                        </Animatable.View>
                        <Text style={[styles.dropdowntitle, { marginTop: 10 }]}>City</Text>
                        <Animatable.View animation="fadeInUp" duration={1000} delay={1800}>
                            <View>
                                <TextInput
                                    style={styles.inputBox3}
                                    placeholder="City"
                                    placeholderTextColor="#c6c4c4"
                                    value={qty}
                                    onChangeText={setQty}
                                />
                            </View>
                        </Animatable.View>
                    </View>
                </View>
                <View>
                    <TouchableOpacity style={styles.button} onPress={() => console.log('Submitted')}>
                        <Text style={styles.buttonText}>Submit</Text>
                    </TouchableOpacity>
                </View>
            </View>
        </ImageBackground>
    );
};
export default CreateCustomer;
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 30,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 22,
        color: '#b816b5ff',
        marginTop: '20%',
        fontWeight: 'bold',
        textAlign: "center",
        marginBottom: '10%'
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
        width: '50%',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: '2%',
        marginLeft: 10
    },
    dropdown: {
        height: 40,
        width: '100%',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: '2%'
    },
    dropdown1: {
        height: 40,
        width: '48%',
        borderWidth: 1,
        borderRadius: 8,
        paddingHorizontal: 12,
        backgroundColor: '#fff',
        marginBottom: '2%'
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
    inputBox: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        width: '48%',
        marginBottom: '2%'
    },
    inputBoxcustomerfield: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        width: '100%',
        marginBottom: '2%'
    },
    inputBox1: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        width: '100%',
        height: 80,
        textAlignVertical: 'top',
    },
    button: {
        backgroundColor: '#020e94ff',
        width: '50%',
        height: 40,
        borderRadius: 15,
        alignItems: 'center',
        alignSelf: 'center',
        marginTop: '20%',
        justifyContent: 'center'
    },
    buttonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    inputBoxMulti: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        height: 180, 
        textAlignVertical: 'top',
        marginBottom: '2%',
    },
    inputBox3: {
        borderWidth: 1,
        borderRadius: 6,
        backgroundColor: '#fff',
        padding: 10,
        width: '100%',
        marginBottom: '2%'
    }
});
