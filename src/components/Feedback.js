import React, { useState, useEffect } from "react";
import { fetchAllFeedback, fetchFeedbackById } from "./FeedbackAPI.js";
import { MDBCol, MDBContainer, MDBRow, MDBCard, MDBCardText, MDBCardBody, MDBCardImage, MDBListGroup, MDBListGroupItem, MDBBtn, MDBTypography } from "mdb-react-ui-kit";
import { DropdownButton, Dropdown } from "react-bootstrap";
import { FaUserCircle } from "react-icons/fa";
import { useLocation, Link } from "react-router-dom";
import { auth, db } from "../config/firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, deleteDoc } from "firebase/firestore";
import Navigation from "./navigation.js";

const FeedbackPage = () => {
    const [feedbackList, setFeedbackList] = useState([]);
    const [selectedFeedback, setSelectedFeedback] = useState(null);
    const [currentPage, setCurrentPage] = useState(1);
    const [clickedFeedbackIds, setClickedFeedbackIds] = useState([]);
    const itemsPerPage = 5;

    const [managementName, setManagementName] = useState(null);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if (user) {
                const uid = user.uid;
                const userDocRef = doc(db, "establishments", uid);
                getDoc(userDocRef).then((docSnapshot) => {
                    if (docSnapshot.exists()) {
                        setManagementName(docSnapshot.data().managementName);
                    } else {
                        console.log("No such document!");
                    }
                });
            } else {
                setManagementName(null);
            }
        });

        return unsubscribe;
    }, []);

    useEffect(() => {
        if (managementName) {
            fetchAllFeedback()
                .then((data) => {
                    const relevantFeedback = data.filter((feedback) => feedback.managementName === managementName);
                    setFeedbackList(relevantFeedback);
                })
                .catch((error) => {
                    console.error("Error fetching feedback:", error);
                });
        }
    }, [managementName]);

    const handleFeedbackClick = (id) => {
        console.log(`Feedback ID clicked: ${id}`);
        fetchFeedbackById(id)
            .then((data) => {
                setSelectedFeedback(data);
            })
            .catch((error) => {
                console.error("Error fetching feedback:", error);
            });
    };

    const handleDeleteFeedback = async (id) => {
        const confirmed = window.confirm("Are you sure you want to delete this feedback?");
        if (confirmed) {
            try {
                const docRef = doc(db, "feedback", id);
                await deleteDoc(docRef);

                const updatedFeedbackList = feedbackList.filter((feedback) => feedback.id !== id);
                setFeedbackList(updatedFeedbackList);

                const updatedClickedIds = clickedFeedbackIds.filter((clickedId) => clickedId !== id);
                localStorage.setItem("clickedFeedbackIds", JSON.stringify(updatedClickedIds));
                setClickedFeedbackIds(updatedClickedIds);

                if (selectedFeedback && selectedFeedback.id === id) {
                    setSelectedFeedback(null);
                }
            } catch (error) {
                console.error("Error deleting document: ", error);
            }
        }
    };

    useEffect(() => {
        const clickedIds = JSON.parse(localStorage.getItem("clickedFeedbackIds")) || [];
        setClickedFeedbackIds(clickedIds);
    }, []);

    const totalPages = Math.ceil(feedbackList.length / itemsPerPage);
    const pageFeedbackList = feedbackList.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    const feedbackListItemStyle = {
        cursor: "pointer",
        padding: "5px 0",
        borderBottom: "1px solid #ccc",
        fontFamily: "Georgina",
        marginTop: "10px",
    };

    const navbarStyle = {
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "20px",
        backgroundColor: "rgba(4, 55,55, 0.7)",
        color: "white",
        width: "100%",
    };

    const logoStyle = {
        fontSize: "18px",
        fontFamily: "Georgina",
        marginLeft: "50px",
    };

    const styles = {
        mainContainer: {
            marginTop: "45px",
            maxWidth: "800px",
            maxLength: "800px",
            margin: "0 auto",
            padding: "20px",
            backgroundColor: "white",
            borderRadius: "10px",
            boxShadow: "0 2px 4px rgba(0, 0, 0, 0.1)",

        },
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
        feedbackContainer: {
            padding: "30px",
            backgroundColor: "#f9f9f9",
            borderRadius: "20px",
            border: "1px solid #ccc",
            marginTop: "30px",
            
        },
    };

    const para = {
        fontFamily: "Georgina",
        marginTop: "10px",
    };

    return (
        <section style={{ backgroundColor: "white", minHeight: "100vh" }}>
   
    <div className="admin-dashboard"> {/* Adjusted marginTop to account for navbar */}
        <div className="sidebar">
            <div className="admin-container">
            </div>
            <div class="wrapper">
                <div class="side">
                    <div>
                              
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
                <MDBContainer className="py-4">
                    <MDBRow>
                        <MDBCol lg="4">
                  
                        </MDBCol>
                        <MDBCol lg="8">
                        <MDBCard style={{ maxWidth: "170vh", marginLeft: '-55vh', marginTop: '20vh', height: "70vh"}}>
                                <MDBCardBody>
                                    <h1 style={{ textAlign: "center", fontFamily: "Georgina", fontSize: "32px"}}>Customer Feedback</h1>
                                    <div style={{ display: "flex" }}>
                                        <div style={{ ...styles.feedbackContainer, flex: 1}}>
                                            <div style={navbarStyle}>
                                                <div style={logoStyle}>FEEDBACK LIST</div>
                                            </div>
                                            <ul>
                                                {pageFeedbackList.map((feedback) => {
                                                    const isClicked = clickedFeedbackIds.includes(feedback.id);
                                                    const listItemStyle = {
                                                        ...feedbackListItemStyle,
                                                        backgroundColor: isClicked ? "#f0f0f0" : "transparent"
                                                    };

                                                    return (
                                                        <li key={feedback.id} onClick={() => handleFeedbackClick(feedback.id)} style={listItemStyle}>
                                                            {feedback.email}
                                                        </li>
                                                    );
                                                })}
                                            </ul>
                                            <div style={{ display: "flex", justifyContent: "center", marginTop: "30px" }}>
                                                <button onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                                                    Previous Page
                                                </button>
                                                <span style={{ margin: "5px 20px", textAlign: "center" }}>Page {currentPage}</span>
                                                <button onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === totalPages}>
                                                    Next Page
                                                </button>
                                            </div>
                                        </div>
                                        <div style={{ ...styles.feedbackContainer, flex: 1, marginLeft: "20px" }}>
                                            {selectedFeedback ? (
                                                <div>
                                                    <div style={navbarStyle}>
                                                        <div style={logoStyle}> FEEDBACK DETAILS </div>
                                                    </div>
                                                    <div style={para}>
                                                        <p>Company Address: {selectedFeedback.companyAddress}</p>
                                                        <p>Email: {selectedFeedback.email}</p>
                                                        <p>Created at: {new Date(selectedFeedback.createdAt.seconds * 1000).toLocaleDateString()}</p>
                                                        <p>Message: {selectedFeedback.message}</p>
                                                        <button onClick={() => handleDeleteFeedback(selectedFeedback.id)}>Delete Feedback</button>
                                                    </div>
                                                </div>
                                            ) : (
                                                <p style={{ fontFamily: "Georgina", textAlign: "center" }}>Select a feedback entry to view details.</p>
                                            )}
                                        </div>
                                    </div>
                                </MDBCardBody>
                            </MDBCard>
                        </MDBCol>
                    </MDBRow>
                </MDBContainer>
            </div>


        </section>
    );
};

export default FeedbackPage;