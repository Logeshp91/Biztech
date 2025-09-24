import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Dimensions,
  Animated,
  ScrollView, ImageBackground, ToastAndroid,
  LayoutAnimation,
  UIManager, Platform, BackHandler, Image
} from 'react-native';
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { postcreatevisit } from '../../../redux/action';
import { useDispatch, useSelector } from 'react-redux';
import CircularProgress from 'react-native-circular-progress-indicator';
import { BarChart, LineChart } from 'react-native-chart-kit';
import BarChartSolid from './BarChartSolid';
const Screens = () => {
  const navigation = useNavigation();
  const dispatch = useDispatch();
  const scrollY = useRef(new Animated.Value(0)).current;

  const screenWidth = Dimensions.get('window').width;
  const [selectedTab, setSelectedTab] = useState(null);

  const [todayFollowUps, setTodayFollowUps] = useState([]);
  const [totalListCount, setTotalListCount] = useState(0);
  const [completedCount, setCompletedCount] = useState(0);
  const [OutstandingCount, setOutstandingCount] = useState(0);
  const [ApprovedListCount, setApprovedListCount] = useState(0);
  const [lostlistCount, setLostlistCount] = useState(0);
  const [progressValue, setProgressValue] = useState(0);
  const [CollectionValue, setCollectionValue] = useState(0);
  const [showThirdChart, setShowThirdChart] = useState(false);
  const postcreatevisitData = useSelector(
    (state) => state.postcreatevisitReducer.data["openEnquiryList"] || []
  );
  const postcreatevisitLoading = useSelector(
    (state) => state.postcreatevisitReducer.loading["openEnquiryList"]
  );
  const { postauthendicationData} = useSelector(state => state.postauthendicationReducer);
  const user = postauthendicationData || {};

  const now = new Date();
  const hours = now.getHours();

  // Dynamic greeting based on time
  let greetingText = '';
  if (hours < 12) {
    greetingText = 'Good Morning';
  } else if (hours < 17) {
    greetingText = 'Good Afternoon';
  } else {
    greetingText = 'Good Evening';
  }

  // Format today's date (e.g., Tuesday, Sep 2)
  const options = { weekday: 'long', month: 'short', day: 'numeric' };
  const formattedDate = now.toLocaleDateString('en-US', options);

  const onScroll = Animated.event(
    [{ nativeEvent: { contentOffset: { y: scrollY } } }],
    { useNativeDriver: true }
  );

  const StatBox = ({ label, color, onPress, labelStyle }) => (
    <TouchableOpacity style={[styles.colorBox, { backgroundColor: color }]} onPress={onPress}>
      <Text style={[styles.boxText, labelStyle]}>{label}</Text>
    </TouchableOpacity>
  );
  // const StatBox = ({ label, count, color, onPress }) => (
  //   <TouchableOpacity style={[styles.colorBox, { backgroundColor: color }]} onPress={onPress}>
  //     <Text style={styles.boxText}>{label}</Text>
  //     <Text style={styles.boxNumber}>{count}</Text>
  //   </TouchableOpacity>
  // );
  const backPressRef = useRef(0);

  useFocusEffect(
    React.useCallback(() => {
      const backAction = () => {
        // Check if we are on root screen
        const state = navigation.getState();
        const currentRoute = state.routes[state.index];
        const isRootScreen = currentRoute.name === 'Screens'; // root check

        if (!isRootScreen) {
          navigation.goBack();
          return true;
        }

        const timeNow = Date.now();
        if (backPressRef.current && timeNow - backPressRef.current < 2000) {
          BackHandler.exitApp(); // exit app on second press
          return true;
        }

        backPressRef.current = timeNow;
        ToastAndroid.show('Press back again to exit', ToastAndroid.SHORT);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        'hardwareBackPress',
        backAction
      );

      return () => backHandler.remove();
    }, [navigation])
  );
  useFocusEffect(
    React.useCallback(() => {
      let animation = 0;
      const targetValue = 80; 
      const interval = setInterval(() => {
        animation += 1;
        if (animation > targetValue) {
          clearInterval(interval);
        } else {
          setCollectionValue(animation);
        }
      }, 20); 

      return () => clearInterval(interval);
    }, [])
  );
  useFocusEffect(
    React.useCallback(() => {
      let animation = 0;
      const targetValue = 52; 
      const interval = setInterval(() => {
        animation += 1;
        if (animation > targetValue) {
          clearInterval(interval);
        } else {
          setProgressValue(animation);
        }
      }, 20); 

      return () => clearInterval(interval);
    }, [])
  );
  useFocusEffect(
    React.useCallback(() => {
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
              "state",
              "followup_date",
              "name",
              "partner_id",
              "brand",
              "visit_purpose",
              "product_category",
              "required_qty",
              "remarks",
              "so_id",
              "outcome_visit",
              "create_date",
              "billing_branch_id"
            ],
          },
        },
      };

      dispatch(postcreatevisit(payload, "openEnquiryList"));
    }, [dispatch])
  );
  useEffect(() => {
    if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
      UIManager.setLayoutAnimationEnabledExperimental(true);
    }
  }, []);
  // 🔹 Process Data
  useEffect(() => {
    if (Array.isArray(postcreatevisitData)) {
      setTotalListCount(postcreatevisitData.length);

      const completedOrders = postcreatevisitData.filter(
        (item) => Array.isArray(item.so_id) && item.so_id.length > 0
      );
      const Outstanding = postcreatevisitData.filter((item) => {
        const stateValue = Array.isArray(item.state) ? item.state[1] : item.state;
        return stateValue === "visted";
      });
      const approvedList = postcreatevisitData.filter((item) => {
        const stateValue = Array.isArray(item.state) ? item.state[1] : item.state;
        return stateValue === "verify";
      });
      const lostList = postcreatevisitData.filter((item) => {
        const stateValue = Array.isArray(item.state) ? item.state[1] : item.state;
        return stateValue?.toLowerCase() === "lost";
      });
      setCompletedCount(completedOrders.length);
      setOutstandingCount(Outstanding.length);
      setApprovedListCount(approvedList.length);
      setLostlistCount(lostList.length);

      const today = new Date().toISOString().split('T')[0];
      const todaysFollowups = postcreatevisitData.filter((item) => {
        if (!item.followup_date) return false;
        return new Date(item.followup_date).toISOString().split('T')[0] === today;
      });

      setTodayFollowUps(todaysFollowups);
    }
  }, [postcreatevisitData]);

  if (postcreatevisitLoading) {
    return (
      <View style={styles.center}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleHorizontalScroll = (event) => {
    const scrollX = event.nativeEvent.contentOffset.x;
    if (scrollX > 150) {
      setShowThirdChart(true);
    }
  };

  return (
    <ImageBackground
      source={require('../../../assets/backgroundimg.png')}
      style={styles.background}
      resizeMode="cover"
    >
      <Animated.ScrollView
        onScroll={onScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 50 }}
      >
        <View style={styles.container}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{}}
          >
            <View style={{ flexDirection: "row" }}>
              <ImageBackground
                source={require('../../../assets/Rectangle.png')}
                style={styles.circleBackground1}
              >
                <View style={{ alignItems: 'flex-start', padding: 10 }}>
                  <Text style={styles.targetTextTitle}>Sales Target</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.targetTextValue}>100 {" "}</Text>
                    <Text style={styles.targetTextValue}>MT</Text>
                  </View>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.targetText}>Achieved</Text>
                    <Text style={styles.targetText1}>{" "}82</Text>
                    <Text style={styles.targetText2}>{" "}MT</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginBottom: 5, marginTop: 8 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 45,
                      height: 45,
                      borderRadius: 50,
                      backgroundColor: '#FFFFFF',
                      marginBottom: 5,
                    }}
                  >
                    <CircularProgress
                      value={CollectionValue}
                      maxValue={100}
                      radius={30}
                      activeStrokeWidth={12}
                      inActiveStrokeWidth={12}
                      activeStrokeColor="#57D6E2"
                      inActiveStrokeColor="#9c9c9cff"
                      inActiveStrokeOpacity={0.3}
                      duration={1200}
                      progressValueColor="#11033B"
                      progressValueStyle={{ fontFamily: 'Inter-Bold', fontSize: 20 }}
                      valueSuffix="%"
                      renderCap={() => <Text style={{ display: 'none' }} />}
                      innerCircleColor="#FFFFFF"
                    />
                  </View>
                </View>
              </ImageBackground>
              <ImageBackground
                source={require('../../../assets/Rectangle2.png')}
                style={styles.circleBackground2}
                resizeMode="cover"
              >
                <View style={{ alignItems: 'flex-start', marginLeft: 5, marginTop: 7 }}>
                  <Text style={styles.targetTextTitle}>Collection Target</Text>
                  <View style={{ flexDirection: "row" }}>
                    <Text style={styles.targetTextValue}>₹</Text>
                    <Text style={styles.targetTextValue}>50,00,000</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 10 }}>
                    <Text style={styles.targetText}>Collected{" "}</Text>
                    <Text style={styles.targetText1}>₹{" "}</Text>
                    <Text style={styles.targetText2}>28,00,000</Text>
                  </View>
                </View>
                <View style={{ alignItems: 'center', width: '100%', marginBottom: 5, marginTop: 8 }}>
                  <View
                    style={{
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 45,
                      height: 45,
                      borderRadius: 50,
                      backgroundColor: '#FFFFFF',
                      marginBottom: 5,
                    }}
                  >
                    <CircularProgress
                      value={progressValue}
                      maxValue={100}
                      radius={30}
                      activeStrokeWidth={12}
                      inActiveStrokeWidth={12}
                      activeStrokeColor="#57D6E2"
                      inActiveStrokeColor="#9c9c9cff"
                      inActiveStrokeOpacity={0.3}
                      duration={1200}
                      progressValueColor="#11033B"
                      progressValueStyle={{
                        fontFamily: 'Inter-Bold',
                        fontSize: 20,
                      }}
                      renderCap={() => <Text style={{ display: 'none' }} />}
                      valueSuffix="%"
                    />
                  </View>
                </View>
              </ImageBackground>

              <ImageBackground
                source={require('../../../assets/Rectangle3.png')}
                style={styles.circleBackground3}
                resizeMode="cover"
              >
                <View style={{ alignItems: 'flex-start', marginLeft: 10, marginTop: 7 }}>
                  <Text style={styles.targetTextTitleVisit}>Visit</Text>
                  <View style={{ flexDirection: "row", marginBottom: 5, }}>
                    <Text style={styles.targetText}>Planned </Text>
                    <Text style={styles.targetText1}>20</Text>
                  </View>
                  <View style={{ flexDirection: "row", marginBottom: 15, }}>
                    <Text style={styles.targetText}>completed </Text>
                    <Text style={styles.targetText1}>20</Text>
                  </View>
                </View>
                <View style={{

                  width: '80%',
                  marginTop: 10,
                  marginLeft: 10,
                  marginBottom: 10
                }}>
                  <View style={{
                    height: 8,
                    width: '90%',
                    backgroundColor: '#D9D9D9',
                    borderRadius: 5,
                    overflow: 'hidden',
                  }}>
                    <View style={{
                      height: '100%',
                      width: '40%',
                      backgroundColor: '#57D6E2',
                    }} />
                  </View>
                </View>

                <View style={{ flexDirection: "row", marginLeft: 6 }}>
                  <Text style={styles.targetTextValue}>₹</Text>
                  <Text style={styles.targetTextValue}>1,00,000</Text>
                </View>
              </ImageBackground>
            </View>


            <View>
    <TouchableOpacity
      onPress={() => navigation.navigate('ProductList')} 
      style={{
        width: 120,
        height: 165,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#cecdcdff',
        marginLeft: 10,
        marginTop: 10,
      }}
    >
      <Text style={{ color: '#fff', fontSize: 20 }}>hello</Text>
    </TouchableOpacity>
            </View>
          </ScrollView>
          <Animated.ScrollView
            onScroll={onScroll}
            scrollEventThrottle={16}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={{ paddingBottom: 50 }}
          >

            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.Visitcroll}
              contentContainerStyle={{
                flexDirection: 'row',
              }}
            >

              <View >
                <ImageBackground
                  source={require('../../../assets/Rectanglelist.png')}
                  style={{ width: 170, height: 60, justifyContent: 'center', alignItems: 'center' }}
                  imageStyle={{}}
                >
                  <View style={{ flexDirection: "row" }}>

                    <Image
                      source={require('../../../assets/allList.png')}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                    <StatBox
                      label="Visit"
                      labelStyle={{ fontSize: 15, color: '#FFFDFD', fontFamily: 'Inter', fontWeight: "500", marginTop: 2 }}
                      color="transparent"
                      onPress={() => navigation.navigate('OpenEnquiry')}

                    />
                  </View>

                </ImageBackground>
                <View style={{ marginTop: 10 }}>
                  <ImageBackground
                    source={require('../../../assets/Rectanglelist.png')}
                    style={{ width: 170, height: 60, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{ borderRadius: 8 }}
                  >
                    <View style={{ flexDirection: "row" }}>

                      <Image
                        source={require('../../../assets/pendingicon.png')}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                      <StatBox
                        label="Pending"
                        color="transparent"
                        onPress={() => navigation.navigate('Outstanding')}
                        labelStyle={{ fontSize: 15, color: '#FFFDFD', fontFamily: 'Inter', fontWeight: "500", marginTop: 2 }}
                      />
                    </View>
                  </ImageBackground>
                </View>
              </View>
              <View style={{}}>
                <ImageBackground
                  source={require('../../../assets/Rectanglelist.png')}
                  style={{ width: 175, height: 60, justifyContent: 'center', alignItems: 'center' }}
                  imageStyle={{ borderRadius: 8 }}
                >
                  <View style={{ flexDirection: "row" }}>

                    <Image
                      source={require('../../../assets/Approvedicon.png')}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                    <StatBox label="Approved" color="transparent" onPress={() => navigation.navigate('ApprovedList')} labelStyle={{ fontSize: 15, color: '#FFFDFD', fontFamily: 'Inter', fontWeight: "500", marginTop: 2 }}
                    />
                  </View>
                </ImageBackground>
                <View style={{ marginTop: 10 }}>
                  <ImageBackground
                    source={require('../../../assets/Rectanglelist.png')}
                    style={{ width: 175, height: 60, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{ borderRadius: 8 }}
                  >
                    <View style={{ flexDirection: "row" }}>

                      <Image
                        source={require('../../../assets/completed.png')}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />

                      <StatBox label="Lost" color="transparent" onPress={() => navigation.navigate('LostList')}
                        labelStyle={{ fontSize: 15, color: '#FFFDFD', fontFamily: 'Inter', fontWeight: "500", marginTop: 2 }}
                      />
                    </View>
                  </ImageBackground>
                </View>
              </View>
              <View >
                <ImageBackground
                  source={require('../../../assets/Rectanglelist.png')}
                  style={{ width: 170, height: 60, justifyContent: 'center', alignItems: 'center' }}
                  imageStyle={{ borderRadius: 8 }}
                >
                  <View style={{ flexDirection: "row" }}>

                    <Image
                      source={require('../../../assets/completed.png')}
                      style={{ width: 40, height: 40 }}
                      resizeMode="contain"
                    />
                    <StatBox label="Complete" color="transparent" onPress={() => navigation.navigate('CompletedOrder')} labelStyle={{ fontSize: 15, color: '#FFFDFD', fontFamily: 'Inter', fontWeight: "500", marginTop: 2 }}
                    />
                  </View>
                </ImageBackground>
                <View style={{ marginTop: 10 }}>
                  <ImageBackground
                    source={require('../../../assets/Rectanglelist.png')}
                    style={{ width: 170, height: 60, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{ borderRadius: 8 }}
                  >
                    <View style={{ flexDirection: "row" }}>

                      <Image
                        source={require('../../../assets/saleorder.png')}
                        style={{ width: 40, height: 40 }}
                        resizeMode="contain"
                      />
                      <StatBox label="Sale Order" color="transparent" onPress={() => navigation.navigate('SonumberList')} labelStyle={{ fontSize: 15, color: '#FFFDFD', fontFamily: 'Inter', fontWeight: "500", marginTop: 2 }}
                      />
                    </View>
                  </ImageBackground>
                </View>
              </View>
            </ScrollView>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              onScroll={handleHorizontalScroll}
              scrollEventThrottle={16}
              contentContainerStyle={{ flexDirection: 'row', }}
            >
              <View>
                <View style={{ flexDirection: 'row', marginTop: 20, backgroundColor: 'transparent' }}>
                  <ImageBackground
                    source={require('../../../assets/Chartbg.png')}
                    style={{ width: 175, height: 150, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{ borderRadius: 8 }}
                  >
                    <Text style={[styles.ChartText1, { marginRight: '60%' }]}>Sales</Text>
                    <BarChartSolid data={[30, 45, 28, 80, 99, 43, 50]} height={80} color="#0C439E" />
                    <Text style={[styles.ChartText2, { marginRight: '55%' }]}>80{" "}MT</Text>
                  </ImageBackground>
                  <ImageBackground
                    source={require('../../../assets/Chartbg.png')}
                    style={{ width: 175, height: 150, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{ borderRadius: 8 }}
                  >
                    <Text style={[styles.ChartText1, { marginRight: '45%' }]}>Collections</Text>
                    <LineChart
                      transparent={true}
                      data={{
                        labels: [],
                        datasets: [{ data: [20, 40, 35, 60, 55, 40, 70, 60, 50] }],
                      }}
                      width={screenWidth * 0.60}
                      height={90}
                      fromZero
                      withDots={false}
                      withShadow={false}
                      withInnerLines={false}
                      withHorizontalLabels={false}
                      withVerticalLabels={false}
                      chartConfig={{
                        backgroundColor: 'transparent',
                        backgroundGradientFrom: 'transparent',
                        backgroundGradientTo: 'transparent',
                        fillShadowGradient: 'transparent',
                        fillShadowGradientOpacity: 0,
                        color: () => '#0C439E',
                        strokeWidth: 2,
                        propsForBackgroundLines: {
                          stroke: 'transparent',
                        },
                        propsForLabels: {
                          fill: 'transparent',
                        },
                      }}
                      bezier
                      style={{
                        backgroundColor: 'transparent',
                        transform: [{ translateX: -30 }],
                      }}
                    />
                    <Text style={[styles.ChartText2, { marginRight: '40%' }]}>₹ 1,00,000</Text>
                  </ImageBackground>

                  <ImageBackground
                    source={require('../../../assets/Chartbg.png')}
                    style={{ width: 175, height: 150, justifyContent: 'center', alignItems: 'center' }}
                    imageStyle={{ borderRadius: 8 }}
                  >
                    <Text style={[styles.ChartText1, { marginRight: '60%', marginLeft: "3%" }]}>Sales</Text>
                    <BarChartSolid data={[30, 45, 28, 80, 99, 43, 50]} height={80} color="#0C439E" />
                    <Text style={[styles.ChartText2, { marginRight: '55%' }]}>80 MT</Text>
                  </ImageBackground>
                </View>
              </View>
            </ScrollView>
            <View style={[styles.listSection, { flexGrow: 1 }]}>
              <Text style={styles.listTitle}>Recent Visits</Text>
              {postcreatevisitData.slice(0, 5).map((item) => (
                <View key={item.id} style={styles.shadowWrapper}>
                  <View style={styles.listItem}>
                    <Text style={styles.listName}>
                      {Array.isArray(item.partner_id) ? item.partner_id[1] : 'N/A'}
                    </Text>
                    <View style={styles.listRow}>
                      <Text style={[styles.listDetail, { width: 120 }]} numberOfLines={1} ellipsizeMode="tail">
                        {item.product_category || 'N/A'}
                      </Text>
                      <Text style={[styles.listDetail, { width: 80, textAlign: 'center' }]}>
                        {item.required_qty || 0} Tons
                      </Text>
                      <Text style={[styles.listDetail, { width: 100, textAlign: 'center' }]}>
                        {item.followup_date ? new Date(item.followup_date).toLocaleDateString() : new Date().toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                </View>
              ))}
            </View>
            {/* 🔹 Pending Visits */}
            <View style={[styles.listSection, { flexGrow: 1 }]}>
              <Text style={styles.listTitle}>Pending Visits</Text>
              {postcreatevisitData
                .filter((item) => item.followup_date && new Date(item.followup_date) > new Date())
                .slice(0, 5)
                .map((item) => (
                  <View key={item.id} style={styles.pendinglistItem}>
                    <Text style={styles.listName}>
                      {Array.isArray(item.partner_id) ? item.partner_id[1] : 'N/A'}
                    </Text>
                    <View style={styles.listRow}>
                      <Text style={[styles.listDetail, { width: 120 }]} numberOfLines={1} ellipsizeMode="tail">
                        {item.product_category || 'N/A'}
                      </Text>
                      <Text style={[styles.listDetail, { width: 80, textAlign: 'center' }]}>
                        {item.required_qty || 0} Tons
                      </Text>
                      <Text style={[styles.listDetail, { width: 100, textAlign: 'center' }]}>
                        {item.followup_date ? new Date(item.followup_date).toLocaleDateString() : new Date().toLocaleDateString()}
                      </Text>
                    </View>
                  </View>
                ))}
            </View>
          </Animated.ScrollView>
        </View>
      </Animated.ScrollView>
    </ImageBackground>
  );
}



export default Screens;
const styles = StyleSheet.create({
  background: {
    flex: 1,
    width: '100%',
  },
  greeting: {
    fontFamily: 'Inter-Bold',
    fontSize: 25,
    color: '#DDDFE6',
    fontWeight: 'bold',
    marginLeft: '3%',
  },
  dateText: {
    fontFamily: 'Inter-Regular',
    fontSize: 16,
    color: '#DDDFE6',
    marginTop: 4,
    marginLeft: '3%',
  },
  circleBackground1: {
    width: 110,
    height: 170,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 5,
    marginTop: 10,
  },
  circleBackground2: {
    width: 120,
    height: 170,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 5,
    marginTop: 10,
  },
  circleBackground3: {
    width: 100,
    height: 170,
    justifyContent: 'center',
    alignItems: 'flex-start',
    marginLeft: 5,
    marginTop: 10,
  },
  targetText: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#f4f4f5ff',
    marginTop: 4,
  },
  targetTextTitle: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#f4f4f5ff',
    fontWeight: 'bold',
    marginLeft: 2
  },
  targetTextTitleVisit: {
    fontFamily: 'Inter-Bold',
    fontSize: 12,
    color: '#f4f4f5ff',
    fontWeight: 'bold',
    marginLeft: 2,
    marginBottom: 5
  },
  targetTextValue: {
    fontFamily: 'Inter-medium',
    fontSize: 20,
    color: '#f4f4f5ff',
    marginTop: 4,
    fontWeight: "500"
  },
  targetText1: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#f4f4f5ff',
    marginTop: 4,
  },
  targetText2: {
    fontFamily: 'Inter-Regular',
    fontSize: 11,
    color: '#f4f4f5ff',
    marginTop: 4,
  },
  ChartText1: {
    fontFamily: 'Inter-semibold',
    fontSize: 15,
    color: '#ffffff',
    marginTop: 2,
    fontWeight: "600"
  },
  ChartText2: {
    fontFamily: 'Inter-semibold',
    fontSize: 18,
    color: '#fff9f9',
    fontWeight: "bold"
  },

  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  Visitcroll: {
    marginTop: 20,
    paddingHorizontal: 5,
  },
  colorBox: {
    width: 70,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    elevation: 8,
  },
  boxText: {
    color: '#250588',
    fontWeight: 'bold',
    fontSize: 12,
  },
  boxNumber: {
    color: '#250588',
    fontSize: 10,
    fontWeight: 'bold',
  },
  listSection: {
    paddingHorizontal: 15,
    flexGrow: 1,
  },
  listTitle: {
    fontSize: 16,
    marginBottom: 10,
    color: '#040404ff',
    fontWeight: '600',
  },
  listItem: {
    backgroundColor: '#250588',
    padding: 12,
    elevation: 3,
    marginBottom: 5,
    borderRadius: 5,
  },
  listName: {
    fontSize: 12,
    fontWeight: '600',
    color: '#ffffffff',
    marginTop: 1,
  },
  listDetail: {
    fontSize: 12,
    color: '#ffffffff',
  },
  pendinglistItem: {
    backgroundColor: '#250588',
    padding: 12,
    elevation: 3,
    marginBottom: '5%',
  },
  listRow: {
    flexDirection: 'row',
    justifyContent: 'space-evenly',
    marginTop: 4,
  },

});
