import { useState, useEffect, useContext } from 'react';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUserCircle } from "react-icons/fa";
import { faCar, faCoins, faUser, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import {db} from "../config/firebase";
import {doc, getDoc, collection, query, where, getDocs} from 'firebase/firestore';
import UserContext from '../UserContext';
import OperatorReserve from './operatorReserve';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import {
  MDBCol,
  MDBContainer,
  MDBRow,
  MDBCard,
  MDBCardText,
  MDBCardBody,
  MDBCardImage,
  MDBBtn,
  MDBTypography,
} from 'mdb-react-ui-kit';

function Home() {
  const { user } = useContext(UserContext);
  const [agentFirst, setAgentFirstName] = useState(user.firstName || "");
  const [agentLastName, setAgentLastName] = useState(user.lastName || "");
  const agentFullName = `${agentFirst} ${agentLastName}`;
  const [data, setData] = useState([]);
  const [hourlyRevenueData, setHourlyRevenueData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [floorUsage, setFloorUsage] = useState([]);
  const navigate = useNavigate();
  const location = useLocation();
  const [managementName, setManagementName] = useState(user.managementName || "");
  const [parkingPay, setParkingPay] = useState(0);
  const [numberOfParkingLots, setNumberOfParkingLots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0); 
  const [parkingLogs, setParkingLogs] = useState([]);
  const totalRevenues = totalUsers * parkingPay;
  const [revenueData, setRevenueData] = useState([]);
  const [totalRevenueToday, setTotalRevenueToday] = useState(0);
  const styles = {
    welcomeMessage: {
      position: "absolute",
      top: "10px",
      right: "10px",
      margin: "0",
      color: "#fff",
      fontFamily: "Rockwell, sans-serif",
      textShadow: "2px 2px 4px rgba(0, 0, 0, 0.5)",
    },
    icon: {
      marginRight: "5px",
    },
  };

  useEffect(() => {
    const fetchEstablishmentData = async () => {
      try {
        const q = query(collection(db, 'establishments'), where('managementName', '==', user.managementName));
        const querySnapshot = await getDocs(q);
        console.log(`Found ${querySnapshot.docs.length} documents`); 
  
        if (!querySnapshot.empty) {
          const establishmentData = querySnapshot.docs[0].data(); 
          console.log('Establishment Data:', establishmentData); 
          setParkingPay(establishmentData.parkingPay);
          setTotalSlots(establishmentData.totalSlots);
        } else {
          console.log('No matching establishment found!');
        }
      } catch (error) {
        console.error('Error fetching establishment data:', error);
      }
    };
  
    if (user && user.managementName) {
      fetchEstablishmentData();
    }
  }, [user]);

  useEffect(() => {
    const fetchEstablishmentData = async () => {
      const q = query(collection(db, 'establishments'), where('managementName', '==', user.managementName));
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const establishmentData = querySnapshot.docs[0].data();
        setParkingPay(establishmentData.parkingPay);
        setTotalSlots(establishmentData.totalSlots);
      }
    };

    const fetchParkingLogs = async () => {
      const logsCollectionRef = collection(db, 'logs', user.managementName, 'floors');
      const q = query(logsCollectionRef, where("managementName", "==", user.managementName), where("paymentStatus", "==", "Paid"));
      const querySnapshot = await getDocs(q);

      let floorCount = {};
      let hourlyRevenue = {};
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        const floor = data.floorTitle;
        const revenue = parkingPay;
        const hour = new Date(data.timestamp.seconds * 1000).getHours();

        floorCount[floor] = (floorCount[floor] || 0) + 1;
        hourlyRevenue[hour] = (hourlyRevenue[hour] || 0) + revenue;
      });
      
      const sortedHours = Object.keys(hourlyRevenue).sort((a, b) => +a - +b);
      let cumulativeRevenue = 0;
      const cumulativeRevenueData = Object.keys(hourlyRevenue).sort((a, b) => +a - +b).map(hour => {
        cumulativeRevenue += hourlyRevenue[hour];
        return { hour, revenue: cumulativeRevenue };
      });

      setFloorUsage(Object.keys(floorCount).map(key => ({ name: key, value: floorCount[key] })));
      setHourlyRevenueData(cumulativeRevenueData);
    };

    if (user && user.managementName) {
      fetchEstablishmentData();
      fetchParkingLogs();
    }
  }, [user, db, parkingPay]);

  const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];
  return (
    <div className="gradient-custom-2" style={{ backgroundColor: 'white' }}>
    <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#132B4B" }}>
      <div className="container">
        <a className="navbar-brand" style={{padding: 20}}>
        </a>
      </div>
    </nav>
      <MDBContainer className="py-4" style={{}}>  {/* Increase top margin to avoid overlap with the navbar */}
        <MDBRow>
          <MDBCol lg="4">
            <OperatorReserve />
          </MDBCol>
          <MDBCol lg="8">
            <div className="container text-center" style={{ marginTop: '30px', fontFamily: 'Courier New', fontSize: '30px'}}>
            </div>
            <div className="row mt-3">
              <div className="col-md-3">
                <Card> 
                  <Card.Body>
                    <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}> <FontAwesomeIcon icon={faCar} color="green"/> Total Parking Slots</Card.Title>
                    <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px' }}>{totalSlots}</Card.Text>
                  </Card.Body>
                </Card>
              </div>
              <div className="col-md-3">
                <Card>
                  <Card.Body>
                    <Card.Title style={{fontFamily:'Courier New', textAlign:'center'}}><FontAwesomeIcon icon={faFileInvoiceDollar} color="orange"/> Parking Fee </Card.Title>
                    <Card.Text style={{ textAlign: 'center', margin: '0 auto', fontFamily:'Copperplate', fontSize:'20px', height: 10 }}>{parkingPay}</Card.Text>
                  </Card.Body>
                </Card>
              </div>  
            </div>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
        <hr className="divider" />
      <MDBContainer className="py-0">
        <MDBRow>
          <MDBCol lg="6">
            <div style={{ margin: '20px 0', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>Floor Usage</div>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie data={floorUsage} cx="50%" cy="50%" labelLine={false}
                     label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                     outerRadius={100} fill="#8884d8" dataKey="value">
                  {floorUsage.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </MDBCol>
          <MDBCol lg="6">
            <div style={{ margin: '20px 0', textAlign: 'center', fontSize: '18px', fontWeight: 'bold' }}>Hourly Revenue</div>
            <ResponsiveContainer width="100%" height={300}>
  <LineChart data={hourlyRevenueData}>
    <XAxis dataKey="hour" />
    <YAxis 
      type="number" 
      allowDataOverflow={true} 
      tickCount={6} 
      domain={[0, 'dataMax']}
      interval={0}
      tickFormatter={(tick) => {
        return tick.toFixed(0);
      }}
    />
    <CartesianGrid strokeDasharray="3 3" />
    <Tooltip />
    <Line type="monotone" dataKey="revenue" stroke="#8884d8" activeDot={{ r: 8 }} />
  </LineChart>
</ResponsiveContainer>
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default Home;
