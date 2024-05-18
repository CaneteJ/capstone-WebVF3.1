import React, { useContext, useState, useEffect } from "react";
import "bootstrap/dist/css/bootstrap.css";
import { DropdownButton, Dropdown, Button } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useLocation } from "react-router-dom";
import Card from "react-bootstrap/Card";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem } from "mdb-react-ui-kit";
import { useNavigate, Link } from "react-router-dom";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faChartColumn, faAddressCard, faPlus, faCar, faUser, faCoins, faFileInvoiceDollar } from "@fortawesome/free-solid-svg-icons";
import { FaCar,FaRegListAlt } from "react-icons/fa";
import UserContext from "../UserContext";
import { auth, db } from "../config/firebase";
import { getDocs, collection, query, where, doc, getDoc } from "firebase/firestore";

import "./sideNavigation.css"
import { width } from "@fortawesome/free-solid-svg-icons/fa0";


const listItemStyle = {
    display: "flex",
    justifyContent: "space-between",
    alignItems: "center",
    padding: "10px 15px",
    transition: "background-color 0.3s ease",
    cursor: "pointer",
    backgroundColor: "#FFFFFF",
    border: "none",
    boxShadow: "none",
};
const customListItemStyle = {
    border: "none", // Remove border from list items
    backgroundColor: "#FFFFFF",
};
const listItemHoverStyle = {
    backgroundColor: "#003851",
};
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
      padding: "20px",
      cursor: 'pointer',
      transition: 'transform 0.2s, box-shadow 0.2s',
     
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
    overviewText: {
      fontFamily:'Copperplate',
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center',
      fontSize: '18px',
      color: 'gray',
    },
    overviewText2: {
      fontFamily:'Copperplate',
      fontWeight: 'bold',
      marginBottom: '10px',
      textAlign: 'center',
      fontSize: '18px',
      color: 'green',
    }
  };

const Establishment = () => {
    const [agent, setAgent] = useState([]);
    const [parkingSeeker, setParkingSeeker] = useState([]);
    const [summaryCardsData, setSummaryCardsData] = useState([]);
    const [pendingAccounts, setPendingAccounts] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    const [reserveLogs, setReserveLogs] = useState([]);
    const [activeCard, setActiveCard] = useState('');
    const [reservedSpaces, setReservedSpaces] = useState(0);
    const [occupiedSpaces, setOccupiedSpaces] = useState(0);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [parkingLogs, setParkingLogs] = useState([]);
    const [managementName, setManagementName] = useState(user.managementName || "");
    const [address, setAddress] = useState(user.companyAddress || "");
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalSlots, setTotalSlots] = useState(user.totalSlots || "");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const [parkingPay, setParkingPay] = useState(0);
    
    const totalRevenues = totalUsers * parkingPay;
    const updateInterval = 1000;

    const userDocRef = auth.currentUser ? doc(db, "establishments", auth.currentUser.uid) : null;

    useEffect(() => {
        if (userDocRef) {
            const fetchImageUrl = async () => {
                const docSnap = await getDoc(userDocRef);
                if (docSnap.exists()) {
                    const userData = docSnap.data();
                    setProfileImageUrl(userData.profileImageUrl);
                } else {
                    console.log("No such document!");
                }
            };

            fetchImageUrl().catch(console.error);
        }
    }, [userDocRef]);

    useEffect(() => {
        let interval;

        const fetchParkingLogs = async () => {
            try {
                const currentUserManagementName = user.managementName;
                const logsCollectionRef = collection(db, "logs");

                const q = query(logsCollectionRef, where("managementName", "==", currentUserManagementName));

                const querySnapshot = await getDocs(q);
                const logs = [];
                querySnapshot.forEach((doc) => {
                    logs.push({ id: doc.id, ...doc.data() });
                });

                const sortedLogs = logs.sort((a, b) => new Date(b.timeIn) - new Date(a.timeIn)).slice(0, 3);
                console.log("Logs fetched:", sortedLogs);
                setParkingLogs(sortedLogs);
            } catch (error) {
                console.error("Error fetching parking logs: ", error);
            }
        };

        fetchParkingLogs();

        interval = setInterval(fetchParkingLogs, updateInterval);

        return () => {
            clearInterval(interval);
        };
    }, []);

    useEffect(() => {
        const fetchParkingLogs = async () => {
            try {
                const currentUserManagementName = user.managementName;
                const logsCollectionRef = collection(db, "logs");
                const q = query(logsCollectionRef, where("managementName", "==", currentUserManagementName));

                const querySnapshot = await getDocs(q);
                const logs = [];
                querySnapshot.forEach((doc) => {
                    logs.push({ id: doc.id, ...doc.data() });
                });
                setParkingLogs(logs);
                const totalUser = logs.length;
                setTotalUsers(totalUser);
            } catch (error) {
                console.error("Error fetching parking logs: ", error);
            }
        };

        if (user && user.managementName) {
            fetchParkingLogs();
        }
    }, [user, db]);

    useEffect(() => {
        const fetchUserData = async () => {
            try {
                if (auth.currentUser) {
                    const userId = auth.currentUser.uid;

                    const doc = await db.collection("establishments").doc(userId).get();

                    if (doc.exists) {
                        const userData = doc.data();

                        setManagementName(userData.managementName || "");
                        setAddress(userData.address || "");
                    } else {
                        console.log("No user data found!");
                    }
                }
            } catch (error) {
                console.error("Error fetching user data: ", error);
            }
        };

        fetchUserData();
    }, []);
    const establishmentData = location.state;

    const handleButtonClick = () => {
        navigate("/TicketInfo");
    };

    const handleViewProfile = () => {
        navigate("/Profiles");
    };
    const handlelogin = () => {
        navigate("/");
    };
    const handleAgentSchedule = () => {
        navigate("/AgentSchedule");
    };

    const handleRevenues = () => {
        navigate("/Tracks");
    };

    const handleRegister = () => {
        navigate("/AgentRegistration");
    };

    const handleFeed = () => {
        navigate("/Feedback");
    };

    const handleProfile = () => {
        navigate("/Profiles");
    };

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
        overviewText: {
          fontFamily:'Copperplate',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center',
          fontSize: '18px',
          color: 'gray',
        },
        overviewText2: {
          fontFamily:'Copperplate',
          fontWeight: 'bold',
          marginBottom: '10px',
          textAlign: 'center',
          fontSize: '18px',
          color: 'green',
        }
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
<section>
   
    <div className="admin-dashboard"> {/* Adjusted marginTop to account for navbar */}
        <div className="sidebar">
            <div className="admin-container">
            </div>
            <div class="wrapper">
                <div class="side">
                    <div>
                                {profileImageUrl ? <MDBCardImage src={profileImageUrl} alt="Operator Profile Logo" className="rounded-circle" style={{ width: "70px"}} fluid /> : <MDBCardImage src="default_placeholder.jpg" alt="Default Profile Logo" className="rounded-circle" style={{ width: "70px", marginTop: '-6vh' }} fluid />}
                                <p style={{ fontFamily: "Georgina", fontSize: "20px", border: "white", fontWeight: "bold", colo: 'white'}}>Administrator</p>
                                <p style={{ fontFamily: "Georgina", color: "white", fontWeight: "bold", fontSize: 12, marginTop: -15}}>
                                    {managementName}                 
                                </p>
                                </div>            
                    <h2>Menu</h2>
                    <ul>
                        <li><a href="Dashboard"><i class="fas fa-home"></i>Home</a></li>
                        <li><a href='AgentRegistration'><i class="fas fa-user"></i>Operator Registration</a></li>
                        <li><a href='Tracks'><i class="fas fa-project-diagram"></i>Management Details</a></li>
                        <li><a href="Profiles"><i class="fas fa-blog"></i>Profile</a></li>
                        <li><a href="Feedback"><i class="fas fa-blog"></i>Feedback</a></li>
                        <li><a href="/"><i className="fas fa-sign-out-alt" style={{ color: 'red' }}></i>Logout</a></li>
                    </ul>

                    
                </div>
                
            </div>
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: '#132B4B', position: "fixed", width: "500vh", marginLeft: '-150vh',height: '15%', marginTop: '-8%'}}>
<div className="container">
    <Link className="navbar-brand" to="/Dashboard" style={{ fontSize: "25px"}}>
    </Link>
</div>
</nav>
</div>
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
          
          </MDBCol>
          <MDBCol style={{marginLeft: '50vh'}}>
            <div className="mb-4">
              <p style={styles.overviewText}>Total Parking Spaces: {totalSlots}</p>
              <p style={styles.overviewText2}>Available Spaces: {totalSlots - occupiedSpaces}</p>
            </div>
            <div className="summary-cards">
              {summaryCardsData.filter(card => card.title !== 'Total Parking Spaces' && card.title !== 'Available Spaces').map(card => (
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
</div>
</section>
    );
};

export default Establishment;