import { useState, useEffect, useContext } from 'react';
import Table from 'react-bootstrap/Table';
import Card from 'react-bootstrap/Card';
import Container from 'react-bootstrap/Container';
import Form from 'react-bootstrap/Form';
import { DropdownButton, Dropdown } from 'react-bootstrap';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { FaUserCircle, FaCar, FaParking, FaRegListAlt } from "react-icons/fa";
import { faCar, faCoins, faUser, faFileInvoiceDollar } from '@fortawesome/free-solid-svg-icons';
import { db } from "../config/firebase";
import { doc, getDoc, collection, query, where, getDocs } from 'firebase/firestore';
import UserContext from '../UserContext';
import OperatorReserve from './operatorReserve';
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

function OperatorDashboard() {
  const { user } = useContext(UserContext);
  const [agentFirst, setAgentFirstName] = useState(user.firstName || "");
  const [agentLastName, setAgentLastName] = useState(user.lastName || "");
  const agentFullName = `${agentFirst} ${agentLastName}`;
  const [data, setData] = useState([]);
  const [activeCard, setActiveCard] = useState('');
  const [pendingAccounts, setPendingAccounts] = useState([]);
  const [establishments, setEstablishments] = useState([]);
  const [parkingSeeker, setParkingSeeker] = useState([]);
  const [summaryCardsData, setSummaryCardsData] = useState([]);
  const [agent, setAgent] = useState([]);    
  const [totalParkingSpaces, setTotalParkingSpaces] = useState(0);
  const [totalUsers, setTotalUsers] = useState(0);
  const [occupiedSpaces, setOccupiedSpaces] = useState(0);
  const [parkingPay, setParkingPay] = useState(0);
  const [numberOfParkingLots, setNumberOfParkingLots] = useState(0);
  const [totalSlots, setTotalSlots] = useState(0); 
  const [parkingLogs, setParkingLogs] = useState([]);
  const [reserveLogs, setReserveLogs] = useState([]);
  const [availableLogs, setAvailableLogs] = useState([]);
  const [availableSpaces, setAvailableSpaces] = useState(0);
  const [reservedSpaces, setReservedSpaces] = useState(0);
  const totalRevenues = totalUsers * parkingPay;
  const navigate = useNavigate();
  const location = useLocation();

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
    nonClickableCard: {
      cursor: 'default',
      boxShadow: 'none',
    },
    occupiedSection: {
      backgroundColor: "#ffcccb", // Light red
      color: "#d63384", // Bootstrap pink
      border: "3px solid #d63384",
      borderRadius: "8px",
      marginBottom: "20px",
      padding: "10px",
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: activeCard === 'occupied' ? '0 8px 16px rgba(0, 0, 0, 0.2)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    reserveSection: {
      backgroundColor: "#b2fab4", // Light green
      color: "#0d6efd", // Bootstrap blue
      border: "3px solid #0d6efd",
      borderRadius: "8px",
      marginBottom: "20px",
      padding: "10px",
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
      boxShadow: activeCard === 'reserve' ? '0 8px 16px rgba(0, 0, 0, 0.2)' : '0 4px 8px rgba(0, 0, 0, 0.1)',
    },
    sectionHeader: {
      fontWeight: "bold",
      fontSize: "18px",
      marginBottom: "10px",
    },
    badgeOccupied: {
      backgroundColor: "#dc3545", // Bootstrap red
    },
    badgeReserved: {
      backgroundColor: "#ffc107", // Bootstrap yellow
    },
    card: {
      borderRadius: '15px',
      transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease',
      cursor: 'pointer',
      margin: '10px',
    },
    activeCard: {
      transform: 'scale(1.05)',
      boxShadow: '0 4px 8px rgba(0, 0, 0, 0.2)',
      border: '2px solid #007bff',
    },
    inactiveCard: {
      opacity: '0.7',
    },
    cardContent: {
      padding: '10px',
    },
    cardImage: {
      height: '100px',
      margin: 'auto',
      display: 'block',
    },
    cardTitle: {
      fontWeight: 'bold',
      textAlign: 'center',
      marginTop: '10px',
    },
    cardValue: {
      textAlign: 'center',
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
    if (user && user.managementName) {
      if (activeCard === 'occupied') {
        fetchOccupiedSlotData();
      } else if (activeCard === 'reserve') {
        fetchReservedSlotData();
      }
    }
  }, [user, activeCard]);

  const fetchOccupiedSlotData = async () => {
    try {
      const currentUserManagementName = user.managementName;
      const logsCollectionRef = collection(db, 'slot', currentUserManagementName, 'slotData');
      const q = query(logsCollectionRef, where("status", "==", "Occupied"));
  
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const slots = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setParkingLogs(slots);
        setOccupiedSpaces(slots.length);
        console.log(`Occupied slots fetched: ${slots.length}`);
      } else {
        console.log("No occupied slots found");
      }
    } catch (error) {
      console.error("Error fetching occupied slot data: ", error);
    }
  };

  const fetchReservedSlotData = async () => {
    try {
      const currentUserManagementName = user.managementName;
      const logsCollectionRef = collection(db, 'slot', currentUserManagementName, 'slotData');
      const q = query(logsCollectionRef, where("from", "==", "Reservation"));
  
      const querySnapshot = await getDocs(q);
      if (!querySnapshot.empty) {
        const slots = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
        setReserveLogs(slots);
        setReservedSpaces(slots.length);
        console.log(`Reserved slots fetched: ${slots.length}`);
      } else {
        console.log("No reserved slots found");
      }
    } catch (error) {
      console.error("Error fetching reserved slot data: ", error);
    }
  };

  useEffect(() => {
    const fetchEstablishments = async () => {
      const querySnapshot = await getDocs(collection(db, "establishments"));
      setEstablishments(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchEstablishments();
    const fetchPendingAccounts = async () => {
      const querySnapshot = await getDocs(query(collection(db, "pendingEstablishments")));
      setPendingAccounts(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };
    fetchPendingAccounts();
  }, []);

  useEffect(() => {
    setSummaryCardsData([
      { 
        title: 'Total Parking Spaces', 
        value: `${totalSlots} Total Parking Spaces`,
        imgSrc: 'totalPark.png', 
        cardType: 'total', 
        clickable: false 
      },
      { 
        title: 'Available Spaces', 
        value: `${totalSlots - occupiedSpaces} Available Spaces`,
        imgSrc: 'available.png', 
        cardType: 'available', 
        clickable: false 
      },
      { 
        title: 'Occupied Spaces', 
        value: `${occupiedSpaces} Occupied Spaces`,
        imgSrc: 'occupied.png', 
        cardType: 'occupied', 
        clickable: true 
      },
      { 
        title: 'Reserve Spaces', 
        value: `${reservedSpaces} Reserve Spaces`,
        imgSrc: 'reservedP.png', 
        cardType: 'reserve', 
        clickable: true 
      },
    ]);
  }, [totalSlots, occupiedSpaces, pendingAccounts, establishments, parkingSeeker, agent]);

  const handleCardClick = (cardType) => {
    console.log(`Card clicked: ${cardType}`);
    setActiveCard(activeCard === cardType ? '' : cardType);
  };

  const renderFormBasedOnCardType = () => {
    switch (activeCard) {
      case 'occupied':
        return (
          <div style={styles.occupiedSection}>
            <div style={styles.sectionHeader}><FaCar style={styles.icon} /> Occupied Slots</div>
            <table className="table align-middle mb-0 bg-white">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Plate Number</th>
                  <th>Floor</th>
                  <th>Slot Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {parkingLogs.map((log, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="ms-3">
                          <p className="fw-bold mb-1">{log.userDetails.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-muted mb-0">{log.userDetails.carPlateNumber}</p>
                    </td>
                    <td>{log.userDetails.floorTitle}</td>
                    <td>
                      <p className="fw-normal mb-1">{log.userDetails.slotId + 1}</p>
                    </td>
                    <td>
                      <span className="badge badge-success rounded-pill d-inline" style={styles.badgeOccupied}>{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      case 'reserve':
        return (
          <div style={styles.reserveSection}>
            <div style={styles.sectionHeader}><FaRegListAlt style={styles.icon} /> Reserved Slots</div>
            <table className="table align-middle mb-0 bg-white">
              <thead className="bg-light">
                <tr>
                  <th>Name</th>
                  <th>Plate Number</th>
                  <th>Floor</th>
                  <th>Slot Number</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {reserveLogs.map((log, index) => (
                  <tr key={index}>
                    <td>
                      <div className="d-flex align-items-center">
                        <div className="ms-3">
                          <p className="fw-bold mb-1">{log.userDetails.name}</p>
                        </div>
                      </div>
                    </td>
                    <td>
                      <p className="text-muted mb-0">{log.userDetails.carPlateNumber}</p>
                    </td>
                    <td>{log.userDetails.floorTitle}</td>
                    <td>
                      <p className="fw-normal mb-1">{log.userDetails.slotId + 1}</p>
                    </td>
                    <td>
                      <span className="badge badge-warning rounded-pill d-inline" style={styles.badgeReserved}>{log.status}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <div className="gradient-custom-2" style={{ backgroundColor: 'white' }}>
      <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#132B4B" }}>
        <div className="container">
          <a className="navbar-brand" style={{ padding: 20 }}>
          </a>
        </div>
      </nav>
      <MDBContainer className="py-4">
        <MDBRow>
          <MDBCol lg="4">
            <OperatorReserve />
          </MDBCol>
          <MDBCol lg="8">
            <div className="summary-cards">
              {summaryCardsData.map(card => (
                <div key={card.title} className={`card card-${card.cardType}`} 
                     onClick={() => card.clickable ? handleCardClick(card.cardType) : null} 
                     style={card.clickable ? (activeCard === card.cardType ? { ...styles.card, ...styles.activeCard } : styles.card) : styles.nonClickableCard}>
                  <img src={card.imgSrc} alt={card.title} className="card-image" />
                  <div className="card-content">
                    <div className="card-title">{card.title}</div>
                    <div className="card-value">{card.value}</div>
                  </div>
                </div>
              ))}
            </div>
            <hr className="divider" />
            {renderFormBasedOnCardType()}
          </MDBCol>
        </MDBRow>
      </MDBContainer>
    </div>
  );
}

export default OperatorDashboard;
