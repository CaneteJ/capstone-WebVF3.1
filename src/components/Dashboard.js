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
import UserContext from "../UserContext";
import { auth, db } from "../config/firebase";
import { getDocs, collection, query, where, doc, getDoc } from "firebase/firestore";
import "./sideNavigation.css"

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

const Establishment = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(UserContext);
    const [parkingLogs, setParkingLogs] = useState([]);
    const [managementName, setManagementName] = useState(user.managementName || "");
    const [address, setAddress] = useState(user.companyAddress || "");
    const [totalUsers, setTotalUsers] = useState(0);
    const [totalSlots, setTotalSlots] = useState(user.totalSlots || "");
    const [profileImageUrl, setProfileImageUrl] = useState("");
    const parkingPay = user.parkingPay;
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
                        <li><a href='AgentRegistration'><i class="fas fa-user"></i>Account Management</a></li>
                        <li><a href='TicketInfo'><i class="fas fa-address-card"></i>Ticket Management</a></li>
                        <li><a href='Tracks'><i class="fas fa-project-diagram"></i>Management Details</a></li>
                        <li><a href="AgentSchedule"><i class="fas fa-blog"></i>Schedule Management</a></li>
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
<MDBContainer className="py-5 d-flex justify-content-center align-items-center" style={{ minHeight: '100vh', marginRight: "-10%", marginTop: '-10%'}}>
                <MDBRow>
                <MDBCol lg="8">
                    <div className="row mt-3">
                        <h1 style={{ color: "black", textAlign: 'center' }}></h1>

                        <div className="col-md-3">
                        <Card className="mb-3" style={{ height: "80%", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.4)", border: "none", backgroundColor: '#00FF00', position: 'relative'}}>

                                <Card.Body>
                                    <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "black", fontStyle: 'bold' }}>
                                        <FontAwesomeIcon icon={faCar} /> Parking Availability
                                    </Card.Title>
                                    <Card.Text style={{ textAlign: "center", fontSize: "20px", color: "black", fontStyle: 'bold'}}>{user.totalSlots}</Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card className="mb-3" style={{ height: "80%", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.4)", border: "none", backgroundColor: '#FFFF00', position: 'relative'}}>
                                <Card.Body>
                                    <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "black", fontStyle: 'bold' }}>
                                        <FontAwesomeIcon icon={faCoins} /> Total Revenues
                                    </Card.Title>
                                    <Card.Text style={{ textAlign: "center", fontFamily: "Georgina", fontSize: "20px", color: "black" }}>{totalRevenues}</Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card style={{ height: "80%", boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.4)", border: "none", backgroundColor: 'white', position: 'relative'}}>
                                <Card.Body>
                                    <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "black" }}>
                                        <FontAwesomeIcon icon={faUser} /> Total Users Today
                                    </Card.Title>
                                    <Card.Text style={{ textAlign: "center", fontFamily: "Georgina", fontSize: "20px", color: "black" }}>{totalUsers}</Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                        <div className="col-md-3">
                            <Card style={{ height: '150px', boxShadow: "0px 2px 4px rgba(0, 0, 0, 0.4)", border: "none", backgroundColor: '#132B4B', position: 'relative'}}>
                                <Card.Body>
                                    <Card.Title style={{ fontFamily: "Georgina", textAlign: "center", fontSize: "16px", color: "white" }}>
                                        <FontAwesomeIcon icon={faFileInvoiceDollar} /> Parking Payment
                                    </Card.Title>
                                    <Card.Text style={{ textAlign: "center", fontFamily: "Georgina", fontSize: "20px", color: "white" }}>{user.parkingPay}</Card.Text>
                                </Card.Body>
                            </Card>
                        </div>
                    </div>
                    <MDBCard>
                    <MDBCardBody >
                            <MDBCardText className="mb-4" style={{ fontFamily: "Georgina", color: "white", fontSize: "18px"}}>
                                <FontAwesomeIcon icon={faUser} style={{ color: "black" }} />
                                <span className="font-italic me-1" style={{ color: "black", fontWeight: "bold" }}>
                                    {" "}
                                    Recent Parking User
                                </span>
                            </MDBCardText>
                            <MDBRow>
                                {parkingLogs.map((log) => (
                                    <MDBCol md="4" key={log.id}>
                                        <MDBCard>
                                            <MDBCardBody style={{ fontFamily: "Times New Roman", fontSize: "15px" }}>
                                                <MDBCardText>Name: {log.name} </MDBCardText>
                                                <MDBCardText>Address: {log.address}</MDBCardText>
                                                <MDBCardText>Vehicle: {log.car}</MDBCardText>
                                                <MDBCardText>Vehicle Plate: {log.carPlateNumber}</MDBCardText>
                                                <MDBCardText style={{ color: "green" }}>Time in: {log.timeOut && log.timeIn.toDate().toLocaleString()}</MDBCardText>
                                                <MDBCardText style={{ color: "red" }}>Time out: {log.timeOut && log.timeOut.toDate().toLocaleString()}</MDBCardText>
                                            </MDBCardBody>
                                        </MDBCard>
                                    </MDBCol>
                                ))}
                            </MDBRow>
                        </MDBCardBody>
                    </MDBCard>
                </MDBCol>
            </MDBRow>
        </MDBContainer>
    </div>
</section>
    );
};

export default Establishment;