import React, { useState, useEffect, useContext } from "react";
import { collection, query, where, getDocs, doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { db, auth } from "../config/firebase";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem } from "mdb-react-ui-kit";
import UserContext from "../UserContext";
import OperatorReserve from "./operatorReserve";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faBell } from '@fortawesome/free-solid-svg-icons'
import Modal from 'react-bootstrap/Modal';
import Button from 'react-bootstrap/Button';

const Reservation = () => {

    const { user } = useContext(UserContext);
    const [reservationRequests, setReservationRequests] = useState([]);
    const [historyLog, setHistoryLog] = useState([]);
    const [selectedReservation, setSelectedReservation] = useState(null);
    const [userNames, setUserNames] = useState({});
    const [selectedSlotIndex, setSelectedSlotIndex] = useState(null);
    const [currentSetIndex, setCurrentSetIndex] = useState(0);
    const [slotSets, setSlotSets] = useState([]);
    const [totalParkingSpaces, setTotalParkingSpaces] = useState(0);
    const [occupiedSpaces, setOccupiedSpaces] = useState(0);
    const [availableSpaces, setAvailableSpaces] = useState(0);
    const [activeCard, setActiveCard] = useState('');
    const [pendingAccounts, setPendingAccounts] = useState([]);
    const [establishments, setEstablishments] = useState([]);
    const [parkingSeeker, setParkingSeeker] = useState([]);
    const [summaryCardsData, setSummaryCardsData] = useState([]);
    const [agent, setAgent] = useState([]);    



    const fetchReservations = async (managementName) => {
        console.log("Fetching reservations for managementName:", managementName);
        const q = query(collection(db, "reservations"), where("managementName", "==", managementName));
        try {
            const querySnapshot = await getDocs(q);
            const reservationPromises = querySnapshot.docs.map(async (reservationDoc) => {
                const slotId = reservationDoc.data().slotId;
                const userEmail = reservationDoc.data().userEmail;
                const floorTitle = reservationDoc.data().floorTitle; 

                // Fetch the floor name from the slotData sub-document
                const slotDocRef = doc(db, "slot", managementName, "slotData", `slot_${slotId}`);
                const slotDocSnapshot = await getDoc(slotDocRef);

                // Fetch user data
                const userQuery = query(collection(db, "user"), where("email", "==", userEmail));
                const userSnapshot = await getDocs(userQuery);
                const userData = userSnapshot.docs[0]?.data();

                setUserNames((prevUserNames) => ({
                    ...prevUserNames,
                    [userEmail]: userData?.name || "N/A",
                }));

                return {
                    id: reservationDoc.id,
                    name: reservationDoc.data().name,
                    userName: userData?.name || "N/A", // Add the userName property
                    carPlateNumber: userData?.carPlateNumber || "N/A",
                    slot: typeof slotId === "string" ? slotId.slice(1) : "N/A",
                    slotId: slotId,
                    floorTitle,
                    timeOfRequest: new Date(reservationDoc.data().timestamp.seconds * 1000).toLocaleTimeString("en-US", { hour12: true, hour: "numeric", minute: "numeric" }),
                };
            });
            const reservations = await Promise.all(reservationPromises);
            console.log("Fetched reservations:", reservations);
            setReservationRequests(reservations);
        } catch (error) {
            console.error("Error fetching reservations:", error);
        }
    };

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
            if (currentUser && user?.managementName) {
                console.log("User authenticated. Fetching reservations...");
                fetchReservations(user.managementName);
            } else {
                console.log("User not authenticated or managementName is null.");
                setReservationRequests([]);
            }
        });

        return () => unsubscribe();
    }, [user?.managementName]);

    useEffect(() => {
        localStorage.setItem("reservationRequests", JSON.stringify(reservationRequests));
    }, [reservationRequests]);

    useEffect(() => {
        const storedHistoryLog = JSON.parse(localStorage.getItem("historyLog"));
        if (storedHistoryLog) {
            setHistoryLog(storedHistoryLog);
        }
    }, []);

    const getContinuousSlotNumber = (currentSetIndex, index) => {
        let previousSlots = 0;
        for (let i = 0; i < currentSetIndex; i++) {
            previousSlots += slotSets[i].slots.length;
        }
        return previousSlots + index + 1;
    };

    const handleReservation = async (accepted, reservationRequest, index) => {
        const { id, userName, carPlateNumber, slotId, timeOfRequest, floorTitle } = reservationRequest;
        const status = accepted ? "Accepted" : "Declined";

        const logEntry = {
            status,
            name: userName,
            carPlateNumber,
            slotId,
            timeOfRequest,
        };

        setHistoryLog([logEntry, ...historyLog]);
        localStorage.setItem("historyLog", JSON.stringify([logEntry, ...historyLog]));

        if (accepted) {
            try {
                console.log(`Floor Title: ${floorTitle}, Slot ID: ${slotId}`); 
                const slotDocRef = doc(db, "slot", user.managementName, "slotData", `slot_${floorTitle}_${slotId}`);

                await setDoc(slotDocRef, {
                    userDetails: {
                        name: userName,
                        carPlateNumber,
                        slotId,
                    },
                    status: "Occupied",
                    timestamp: new Date(),
                }, { merge: true });

                const reservationDocRef = doc(db, "reservations", id);
                await deleteDoc(reservationDocRef);

                console.log(`Reservation accepted for slot ${slotId}.`);
                alert(`Reservation accepted for ${userName} at slot ${slotId + 1}.`);
            } catch (error) {
                console.error("Error accepting reservation and updating slotData:", error);
                alert("Failed to accept the reservation. Please try again.");
            }
        } else {
            try {
                const reservationDocRef = doc(db, "reservations", id);
                await setDoc(reservationDocRef, { status: "Declined" }, { merge: true });

                console.log(`Reservation declined for ${userName}.`);
                alert(`Reservation declined for ${userName}.`);
            } catch (error) {
                console.error("Error updating reservation status:", error);
                alert("Failed to update the reservation status. Please try again.");
            }
        }

        const updatedRequests = reservationRequests.filter((_, i) => i !== index);
        setReservationRequests(updatedRequests);

        if (accepted) {
            localStorage.setItem("reservationRequests", JSON.stringify(updatedRequests));
        }
    };
    
    const [showNotification, setShowNotification] = useState(false);

    const HistoryLog = ({ historyLog }) => {
        const [showAccepted, setShowAccepted] = useState(false);
        const [showDeclined, setShowDeclined] = useState(false);
    
        const handleClearHistory = () => {
            localStorage.removeItem("historyLog");
        };
    
        return (
<div style={{
          border: "3px solid #7abdea",
          borderRadius: "8px",
          padding: "10px",
          margin: 'auto',
          maxWidth: '70vh',
          height: '70vh',
          boxSizing: 'border-box',
          boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
          overflowY: 'auto',
           
              
              }}>
                <h5 style={{ 
                  color: "#003851", 
                  textAlign: "left", 
                  fontSize: "1.5rem", 
                  fontWeight: "bold", 
                  marginBottom: "1.5rem",
               
                }}>
                  Reservation History
                </h5>
                <hr className="divider" />
                <div style={{ 
                  flexDirection: "row", 
                  justifyContent: "space-between", 
                  alignItems: "center", 
                  
                }}>
                 <div>
                    <button
                        className="btn btn-primary"
                        style={{ margin: "5px", width: "150px"}}
                        onClick={() => setShowAccepted(!showAccepted)}
                    >
                        {showAccepted ? "Hide Accepted" : "Show Accepted"}
                    </button>
                    <button
                        className="btn btn-primary"
                        style={{ margin: "5px", width: "150px" }}
                        onClick={() => setShowDeclined(!showDeclined)}
                    >
                        {showDeclined ? "Hide Declined" : "Show Declined"}
                    </button>
                    <button
                        className="btn btn-danger"
                        style={{ margin: "5px", width: "150px" }}
                        onClick={handleClearHistory}
                    >
                        Clear History
                    </button>
                </div>
                <hr className="divider" />
                </div>
                {showAccepted && (
                    <div>
                        <h6 className="mt-3">Accepted Reservations</h6>
                        {historyLog.map((logEntry, index) => logEntry.status === "Accepted" && (
                            <div className="alert alert-success mt-2" key={index}>
                                <strong>Accepted:</strong> {logEntry.name} requested a reservation on {logEntry.slotId}. Plate Number: {logEntry.plateNumber}, Slot: {logEntry.slotId}
                            </div>
                        ))}
                    </div>
                )}
                {showDeclined && (
                    <div>
                        <h6 className="mt-3">Declined Reservations</h6>
                        {historyLog.map((logEntry, index) => logEntry.status === "Declined" && (
                            <div className="alert alert-danger mt-2" key={index}>
                                <strong>Declined:</strong> {logEntry.name} requested a reservation on {logEntry.slotId}. Plate Number: {logEntry.plateNumber}, Slot: {logEntry.slotId}
                            </div>
                        ))}
                    </div>
                )}
            </div>
          
            
        );
    };

    const ReservationRequest = ({ request, index }) => {
        const [showMapModal, setShowMapModal] = useState(false);
      
        const toggleMapModal = () => {
          setShowMapModal(!showMapModal);
        };
      
        return (
          <div className="reservation-request mb-4 border p-3 rounded bg-light" style={{ maxWidth: '800px' }} key={request.plateNumber}>
            {/* Headers */}
            <div className="d-flex justify-content-between mb-2 text-muted">
              <div className="p-2"><strong>Name</strong></div>
              <div className="p-2"><strong>Time of Request</strong></div>
              <div className="p-2"><strong>Plate Number</strong></div>
              <div className="p-2"><strong>Floor</strong></div>
              <div className="p-2"><strong>Slot Number</strong></div>
            </div>
      
            {/* Details */}
            <div className="d-flex justify-content-between mb-2">
              <div className="p-2">{request.userName}</div>
              <div className="p-2">{request.timeOfRequest}</div>
              <div className="p-2">{request.carPlateNumber}</div>
              <div className="p-2">{request.floorTitle}</div>
              <div className="p-2">{request.slotId + 1}</div>
            </div>
      
            {/* MA CLICK NGA ICON SA MAP */}
            <Button variant="primary" onClick={toggleMapModal}>
              <i className="bi bi-geo-alt"></i> View Map
            </Button>
      
            {/* PARA SA MAP*/}
            <Modal show={showMapModal} onHide={toggleMapModal} centered>
              <Modal.Header closeButton>
                <Modal.Title>Map</Modal.Title>
              </Modal.Header>
              <Modal.Body>
                <img
                  src={`https://maps.googleapis.com/maps/api/staticmap?center=${request.latitude},${request.longitude}&zoom=14&size=600x300&maptype=roadmap&markers=color:red%7Clabel:S%7C${request.latitude},${request.longitude}&key=YOUR_API_KEY`}
                  alt="Map"
                  style={{ width: '100%', height: 'auto' }}
                />
              </Modal.Body>
              <Modal.Footer>
                <Button variant="secondary" onClick={toggleMapModal}>Close</Button>
              </Modal.Footer>
            </Modal>
      
            {/* Buttons */}
            <div className="d-flex flex-row align-items-center mt-2">
              <button className="btn btn-success mr-2" onClick={() => handleReservation(true, request, index)}>
                Accept Reservation
              </button>
              <button className="btn btn-danger" onClick={() => handleReservation(false, request, index)}>
                Decline Reservation
              </button>
            </div>
          </div>
        );
      };

      

    return (
        <div>
        <section
            style={{
                backgroundSize: "cover",
                backgroundRepeat: "no-repeat",
                minHeight: "100vh",
                backgroundColor: "white", // Set a background color in case the image is not fully loaded
            }}
        >
            <div>
                
            <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#132B4B"}}>
    <div className="container d-flex justify-content-between">
        <a className="navbar-brand" style={{padding: 35}}>
            
        </a>
        <div>
            <button className="btn" onClick={() => setShowNotification(!showNotification)} style={{ color: 'white', border: 'none', background: 'none' }}>
                <FontAwesomeIcon icon={faBell} size="lg" />
                {/* Optionally display a badge with notification count */}
                {showNotification && <span className="badge rounded-pill bg-danger">3</span>}
            </button>
        </div>
    </div>
</nav>                    
                <MDBContainer className="py-4">
                    <MDBRow>
                        <MDBCol lg="4">
                            <OperatorReserve />
                        </MDBCol>
                    
                        <MDBCol lg="4">
                    <div >
                   
                    <h3 style={{
    color: "#003851",
    textAlign: "center",
    fontSize: "1.5rem",        // Keep rem for scalable font size
    fontWeight: "bold",
    marginBottom: "1.5rem",  // Use rem to maintain scalable spacing
    marginLeft: '-50vh',         // Avoid negative margins that cause overflow
    marginTop: '0'           // Adjust this to suit your layout needs
  }}>
    Parking Reservation Management
  </h3>

  
  <div style={{
  width: "80vh",
  height: "70vh",
  overflowY: "scroll",
  padding: "1rem",
  margin: '10vh',
  background: "#132B4B",
  borderWidth: 3,
  borderRadius: 5,
  marginLeft: '-30vh',        // Adjusted marginLeft to 0
  borderStyle: 'solid',
  borderColor: '#7abdea',
  boxShadow: "0 4px 8px rgba(0, 0, 0, 0.2)",
}}>
 

 
                        {reservationRequests.length === 0 ? (
                            <p>No reservation</p>
                        ) : (
                            reservationRequests.map((request, index) => (
                                <ReservationRequest
                                    request={request}
                                    index={index}
                                    key={index}
                                    slotIndex={request.slotId} // Pass the slotId as slotIndex
                                />
                            ))
                        )}
                        
                    </div>
                </div>

                </MDBCol>
                <MDBCol lg="4">
                    <nav style={{ backgroundColor: "white", marginRight: 'auto', marginLeft: 'auto', borderWidth: 1, borderColor: "#003851", marginTop: '26%'}}>
                    <HistoryLog historyLog={historyLog} />
                    </nav>
                    </MDBCol>
                    </MDBRow>

                </MDBContainer>
              </div>            
        </section>
    
            <div>
            
            </div>
        </div>

    );
};

export default Reservation;